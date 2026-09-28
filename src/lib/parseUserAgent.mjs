// Tiny, dependency-free user-agent classifier. It is shared by the redirect
// Worker (which imports it directly) and the app's tests, so it must stay
// plain ESM with no imports.
//
// It deliberately buckets rather than fingerprints: OS family, device class
// and browser family are all the dashboard shows.

export const parseUserAgent = (ua = "") => {
  const s = String(ua);

  let os = "Other";
  if (/iPhone|iPad|iPod/i.test(s)) os = "iOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/Windows/i.test(s)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(s)) os = "macOS";
  else if (/CrOS/i.test(s)) os = "ChromeOS";
  else if (/Linux/i.test(s)) os = "Linux";

  let device = "Desktop";
  if (/iPad|Tablet/i.test(s) || (/Android/i.test(s) && !/Mobile/i.test(s))) {
    device = "Tablet";
  } else if (/Mobi|iPhone|iPod/i.test(s)) {
    device = "Mobile";
  }

  let browser = "Other";
  if (/Instagram/i.test(s)) browser = "Instagram";
  else if (/FBAN|FBAV/i.test(s)) browser = "Facebook";
  else if (/WhatsApp/i.test(s)) browser = "WhatsApp";
  else if (/Edg(e|A|iOS)?\//.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/.test(s)) browser = "Opera";
  else if (/SamsungBrowser/.test(s)) browser = "Samsung Internet";
  else if (/Chrome\/|CriOS\//.test(s)) browser = "Chrome";
  else if (/Firefox\/|FxiOS\//.test(s)) browser = "Firefox";
  else if (/Safari\//.test(s) && /Version\//.test(s)) browser = "Safari";

  return { os, device, browser };
};

// Link previews and crawlers hit redirect URLs constantly. They are not scans.
export const isBot = (ua = "") =>
  /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|whatsapp\/|skypeuripreview|preview|curl\/|wget\/|python-requests|go-http-client|headlesschrome|lighthouse|pingdom|uptimerobot/i.test(
    String(ua)
  );
