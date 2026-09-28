import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({
  enabled: false,
  loading: false,
  session: null,
  user: null,
  profile: null,
  plan: "free",
  signInWithEmail: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const enabled = supabase !== null;
  const [loading, setLoading] = useState(enabled);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [enabled]);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!enabled || !userId) {
      setProfile(null);
      return undefined;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("id, email, plan")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data);
      });
    return () => {
      active = false;
    };
  }, [enabled, userId]);

  const value = useMemo(
    () => ({
      enabled,
      loading,
      session,
      user: session?.user || null,
      profile,
      plan: profile?.plan || "free",
      signInWithEmail: async (email, next = "/dashboard") => {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}${next}` },
        });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [enabled, loading, session, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// Wraps dashboard routes. Sends signed-out visitors to /login and brings them
// back to the page they wanted after the magic link.
export const RequireAuth = ({ children }) => {
  const { enabled, loading, session } = useAuth();
  const location = useLocation();

  if (!enabled) return <Navigate to="/login" replace />;
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
};
