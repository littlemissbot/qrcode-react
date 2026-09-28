import { parseUserAgent, isBot } from "./parseUserAgent.mjs";

const UA = {
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  androidTablet:
    "Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  windowsEdge:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  instagramIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0",
  googlebot:
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  whatsappPreview: "WhatsApp/2.23.20.0 A",
};

test("classifies common phones and browsers", () => {
  expect(parseUserAgent(UA.iphoneSafari)).toEqual({ os: "iOS", device: "Mobile", browser: "Safari" });
  expect(parseUserAgent(UA.androidChrome)).toEqual({ os: "Android", device: "Mobile", browser: "Chrome" });
  expect(parseUserAgent(UA.androidTablet)).toEqual({ os: "Android", device: "Tablet", browser: "Chrome" });
  expect(parseUserAgent(UA.windowsEdge)).toEqual({ os: "Windows", device: "Desktop", browser: "Edge" });
  expect(parseUserAgent(UA.instagramIos)).toEqual({ os: "iOS", device: "Mobile", browser: "Instagram" });
});

test("handles empty and unknown agents without throwing", () => {
  expect(parseUserAgent("")).toEqual({ os: "Other", device: "Desktop", browser: "Other" });
  expect(parseUserAgent(undefined)).toEqual({ os: "Other", device: "Desktop", browser: "Other" });
});

test("recognises crawlers and link previews as bots", () => {
  expect(isBot(UA.googlebot)).toBe(true);
  expect(isBot(UA.whatsappPreview)).toBe(true);
  expect(isBot(UA.iphoneSafari)).toBe(false);
  expect(isBot(UA.androidChrome)).toBe(false);
});
