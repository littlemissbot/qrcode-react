-- Dynamic QR codes with scan analytics.
--
-- Apply with `supabase db push` (Supabase CLI) or paste into the SQL editor of
-- the project. Everything is idempotent-ish for a fresh project; rerunning on
-- an existing schema will fail on the CREATE TABLE statements, which is the
-- safe outcome.
--
-- Access model
--   * Signed-in users own rows in dynamic_codes and may read their own profile.
--   * scan_events are written only by the redirect Worker using the service
--     role key (bypasses RLS). Per-scan rows are readable only by Pro owners;
--     Free owners get aggregates through the SECURITY DEFINER functions below,
--     limited to plan_limits.history_days.
--   * Plan limits live in plan_limits and are enforced by a trigger, so a
--     modified client cannot exceed them.

-- ---------------------------------------------------------------------------
-- Plans
-- ---------------------------------------------------------------------------
create table public.plan_limits (
  plan text primary key,
  max_active_codes integer not null,
  history_days integer -- null = unlimited
);

insert into public.plan_limits (plan, max_active_codes, history_days) values
  ('free', 3, 90),
  ('pro', 100, null);

alter table public.plan_limits enable row level security;
create policy "plan_limits are public" on public.plan_limits
  for select using (true);

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'free' references public.plan_limits (plan),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles: owner can read" on public.profiles
  for select using (auth.uid() = id);
-- No insert/update policies on purpose: rows are created by the trigger
-- below and plan changes are made with the service role (billing webhook or
-- the dashboard), never by the client.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Plan of the calling user ('free' when the profile is missing).
create or replace function public.current_plan()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select plan from public.profiles where id = auth.uid()), 'free');
$$;

-- History window for the calling user; null means unlimited.
create or replace function public.current_history_days()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select history_days from public.plan_limits where plan = public.current_plan();
$$;

-- ---------------------------------------------------------------------------
-- Dynamic codes
-- ---------------------------------------------------------------------------
create or replace function public.gen_short_code(len integer default 7)
returns text
language sql
volatile
as $$
  select string_agg(
    substr('abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789',
           (floor(random() * 56))::integer + 1, 1),
    '')
  from generate_series(1, len);
$$;

create table public.dynamic_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  short_code text not null unique default public.gen_short_code(),
  name text not null check (char_length(name) between 1 and 80),
  qr_type text not null,
  destination text not null check (destination ~* '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index dynamic_codes_user_idx on public.dynamic_codes (user_id, created_at desc);

alter table public.dynamic_codes enable row level security;
create policy "codes: owner select" on public.dynamic_codes
  for select using (auth.uid() = user_id);
create policy "codes: owner insert" on public.dynamic_codes
  for insert with check (auth.uid() = user_id);
create policy "codes: owner update" on public.dynamic_codes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "codes: owner delete" on public.dynamic_codes
  for delete using (auth.uid() = user_id);

create or replace function public.enforce_code_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_max integer;
  v_count integer;
begin
  select coalesce(p.plan, 'free') into v_plan
    from (select 1) x left join public.profiles p on p.id = new.user_id;
  select max_active_codes into v_max from public.plan_limits where plan = v_plan;
  select count(*) into v_count
    from public.dynamic_codes
    where user_id = new.user_id and archived_at is null;
  if v_count >= v_max then
    raise exception 'CODE_LIMIT_REACHED'
      using errcode = 'P0001',
            hint = format('The %s plan allows %s active dynamic codes. Archive one or upgrade.', v_plan, v_max);
  end if;
  return new;
end;
$$;

create trigger dynamic_codes_enforce_limit
  before insert on public.dynamic_codes
  for each row execute function public.enforce_code_limit();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger dynamic_codes_touch_updated_at
  before update on public.dynamic_codes
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Scan events (written by the Worker with the service role)
-- ---------------------------------------------------------------------------
create table public.scan_events (
  id bigint generated always as identity primary key,
  code_id uuid not null references public.dynamic_codes (id) on delete cascade,
  scanned_at timestamptz not null default now(),
  -- sha256(ip | user agent | code | day). Lets us count unique visitors per
  -- day without storing an IP address.
  visitor_hash text,
  country text,
  region text,
  city text,
  device text,
  browser text,
  os text,
  referrer text
);

create index scan_events_code_time_idx on public.scan_events (code_id, scanned_at desc);

alter table public.scan_events enable row level security;
-- Per-scan detail is a Pro feature. Free owners only ever see aggregates.
create policy "scans: pro owner select" on public.scan_events
  for select using (
    exists (
      select 1
      from public.dynamic_codes c
      join public.profiles p on p.id = c.user_id
      where c.id = scan_events.code_id
        and c.user_id = auth.uid()
        and p.plan = 'pro'
    )
  );
-- No insert/update/delete policies: only the service role writes here.

-- ---------------------------------------------------------------------------
-- Aggregates available on every plan (within the plan's history window)
-- ---------------------------------------------------------------------------
create or replace function public.list_code_stats()
returns table (
  code_id uuid,
  total bigint,
  unique_visitors bigint,
  last_scan_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select c.id,
         count(s.id),
         count(distinct s.visitor_hash),
         max(s.scanned_at)
  from public.dynamic_codes c
  left join public.scan_events s
    on s.code_id = c.id
   and (public.current_history_days() is null
        or s.scanned_at >= now() - make_interval(days => public.current_history_days()))
  where c.user_id = auth.uid()
  group by c.id;
$$;

create or replace function public.get_code_stats(p_code_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days integer;
  v_since timestamptz;
  v_pro boolean;
  result json;
begin
  if not exists (
    select 1 from public.dynamic_codes where id = p_code_id and user_id = auth.uid()
  ) then
    raise exception 'CODE_NOT_FOUND' using errcode = 'P0002';
  end if;

  v_days := public.current_history_days();
  v_pro := v_days is null;
  v_since := case when v_pro then '-infinity'::timestamptz
                  else now() - make_interval(days => v_days) end;

  select json_build_object(
    'total', count(*),
    'unique_visitors', count(distinct visitor_hash),
    'last_scan_at', max(scanned_at),
    'history_days', v_days,
    'daily', (
      select coalesce(json_agg(json_build_object('day', to_char(d, 'YYYY-MM-DD'), 'scans', n) order by d), '[]'::json)
      from (
        select date_trunc('day', scanned_at) as d, count(*) as n
        from public.scan_events
        where code_id = p_code_id
          and scanned_at >= greatest(v_since, now() - interval '30 days')
        group by 1
      ) daily
    ),
    'countries', case when v_pro then (
      select coalesce(json_agg(json_build_object('country', country, 'scans', n) order by n desc), '[]'::json)
      from (
        select coalesce(country, 'Unknown') as country, count(*) as n
        from public.scan_events
        where code_id = p_code_id
        group by 1 order by 2 desc limit 8
      ) countries
    ) else null end,
    'devices', case when v_pro then (
      select coalesce(json_agg(json_build_object('device', device, 'scans', n) order by n desc), '[]'::json)
      from (
        select coalesce(device, 'Unknown') as device, count(*) as n
        from public.scan_events
        where code_id = p_code_id
        group by 1 order by 2 desc
      ) devices
    ) else null end
  )
  into result
  from public.scan_events
  where code_id = p_code_id and scanned_at >= v_since;

  return result;
end;
$$;

-- Only signed-in users may call the aggregate functions.
revoke execute on function public.list_code_stats() from anon, public;
revoke execute on function public.get_code_stats(uuid) from anon, public;
grant execute on function public.list_code_stats() to authenticated;
grant execute on function public.get_code_stats(uuid) to authenticated;
