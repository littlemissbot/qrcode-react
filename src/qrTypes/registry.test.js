import {
  qrTypes,
  buildVCardPayload,
  buildWifiPayload,
  buildEmailPayload,
  buildSmsPayload,
  buildUpiPayload,
  buildWhatsAppPayload,
  buildMapsPayload,
  findTypeBySlug,
} from "./registry.mjs";

describe("registry", () => {
  test("slugs and keys are unique and URL-safe", () => {
    const slugs = qrTypes.map((t) => t.slug);
    const keys = qrTypes.map((t) => t.key);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(keys).size).toBe(keys.length);
    slugs.forEach((s) => expect(s).toMatch(/^[a-z0-9-]+$/));
  });

  test("every type has the SEO fields the pages render", () => {
    qrTypes.forEach((t) => {
      expect(t.seo.title.length).toBeGreaterThan(20);
      expect(t.seo.description.length).toBeLessThanOrEqual(170);
      expect(t.seo.h1).toBeTruthy();
      expect(t.seo.steps.length).toBeGreaterThan(0);
      expect(t.seo.faq.length).toBeGreaterThan(0);
      expect(typeof t.isReady).toBe("function");
      expect(typeof t.buildPayload).toBe("function");
    });
  });

  test("only link-type codes are dynamic-capable (a 302 must land on http(s))", () => {
    const dynamic = qrTypes.filter((t) => t.dynamicCapable).map((t) => t.key);
    expect(dynamic.sort()).toEqual(["maps", "url", "whatsapp"]);
    expect(buildWhatsAppPayload({ phone: "+911" })).toMatch(/^https:\/\//);
    expect(buildMapsPayload({ location: "x" })).toMatch(/^https:\/\//);
  });

  test("findTypeBySlug", () => {
    expect(findTypeBySlug("wifi-qr-code-generator").key).toBe("wifi");
    expect(findTypeBySlug("nope")).toBeUndefined();
  });
});

describe("payload builders", () => {
  test("wifi escapes special characters and omits password for open networks", () => {
    expect(
      buildWifiPayload({ ssid: "Cafe;Net", password: 'p"a:s,s', encryption: "WPA" })
    ).toBe('WIFI:S:Cafe\\;Net;T:WPA;P:p\\"a\\:s\\,s;;');
    expect(buildWifiPayload({ ssid: "Open", encryption: "nopass", hidden: true })).toBe(
      "WIFI:S:Open;T:nopass;H:true;;"
    );
  });

  test("vcard includes FN and skips empty optional fields", () => {
    const out = buildVCardPayload({
      firstName: "Samita",
      lastName: "Mondal",
      phones: [{ type: "mobile", number: "+919876543210" }, { number: "" }],
      emails: [],
    });
    expect(out).toContain("N:Mondal;Samita");
    expect(out).toContain("FN:Samita Mondal");
    expect(out).toContain("TEL;TYPE=MOBILE:+919876543210");
    expect(out).not.toContain("ORG:");
    expect(out).not.toContain("ADR;");
    expect(out.startsWith("BEGIN:VCARD")).toBe(true);
    expect(out.endsWith("END:VCARD")).toBe(true);
  });

  test("email and sms encode optional parts", () => {
    expect(buildEmailPayload({ email: "a@b.c" })).toBe("mailto:a@b.c");
    expect(buildEmailPayload({ email: "a@b.c", subject: "Hi there" })).toBe(
      "mailto:a@b.c?subject=Hi%20there"
    );
    expect(buildSmsPayload({ phone: "+911", message: "a b" })).toBe("sms:+911?body=a%20b");
  });

  test("upi builds an NPCI deep link with INR and optional amount", () => {
    expect(buildUpiPayload({ upiId: "shop@ybl" })).toBe("upi://pay?pa=shop%40ybl&cu=INR");
    expect(
      buildUpiPayload({ upiId: " shop@ybl ", payeeName: "My Shop", amount: 150, note: "Bill 7" })
    ).toBe("upi://pay?pa=shop%40ybl&pn=My%20Shop&am=150.00&cu=INR&tn=Bill%207");
    expect(buildUpiPayload({ upiId: "shop@ybl", amount: "abc" })).not.toContain("am=");
  });

  test("whatsapp strips formatting from the number", () => {
    expect(buildWhatsAppPayload({ phone: "+91 98765-43210", message: "Hi!" })).toBe(
      "https://wa.me/919876543210?text=Hi!"
    );
  });

  test("maps encodes the query", () => {
    expect(buildMapsPayload({ location: "MG Road, Bengaluru" })).toBe(
      "https://www.google.com/maps/search/?api=1&query=MG%20Road%2C%20Bengaluru"
    );
  });
});
