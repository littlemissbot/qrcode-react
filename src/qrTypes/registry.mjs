// Single source of truth for every QR code type QRx offers.
//
// This file is plain ESM with no imports on purpose: the build-time scripts
// in scripts/ (prerender, sitemap) load it directly in Node, so it must not
// pull in React, antd or anything that needs the webpack pipeline. Icons and
// form components are attached in ./index.js.

export const SITE_URL = "https://qrx.samita.in";
export const SITE_NAME = "QRx";

// vCard 3.0 and WiFi payloads use ; , : and \ as delimiters, so user input
// containing them has to be escaped.
const escapeVCard = (value = "") =>
  String(value).replace(/\\/g, "\\\\").replace(/([;,])/g, "\\$1");

const escapeWifi = (value = "") =>
  String(value).replace(/([\\;,:"])/g, "\\$1");

const digitsOnly = (value = "") => String(value).replace(/\D/g, "");

export const buildVCardPayload = (data) => {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(data.lastName)};${escapeVCard(data.firstName)}`,
    `FN:${[data.firstName, data.lastName].filter(Boolean).join(" ")}`,
  ];

  if (data.organization) lines.push(`ORG:${escapeVCard(data.organization)}`);
  if (data.jobTitle) lines.push(`TITLE:${escapeVCard(data.jobTitle)}`);

  (data.phones || []).forEach((phone) => {
    if (!phone || !phone.number) return;
    const type = (phone.type || "cell").toUpperCase();
    lines.push(`TEL;TYPE=${type}:${phone.number}`);
  });

  (data.emails || []).forEach((email) => {
    if (!email || !email.address) return;
    const type = (email.type || "internet").toUpperCase();
    lines.push(`EMAIL;TYPE=${type}:${email.address}`);
  });

  if (data.website) lines.push(`URL:${data.website}`);

  if (data.address) {
    const { street, city, state, postalCode, country } = data.address;
    if ([street, city, state, postalCode, country].some(Boolean)) {
      lines.push(
        `ADR;TYPE=WORK:;;${[street, city, state, postalCode, country]
          .map(escapeVCard)
          .join(";")}`
      );
    }
  }

  if (data.notes) lines.push(`NOTE:${escapeVCard(data.notes)}`);

  lines.push("END:VCARD");
  return lines.join("\n");
};

export const buildWifiPayload = ({ ssid, password, encryption, hidden }) => {
  const type = encryption || "WPA";
  let payload = `WIFI:S:${escapeWifi(ssid)};T:${type};`;
  if (type !== "nopass" && password) payload += `P:${escapeWifi(password)};`;
  if (hidden === true) payload += "H:true;";
  return `${payload};`;
};

export const buildEmailPayload = ({ email, subject, body }) => {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${params.length ? `?${params.join("&")}` : ""}`;
};

export const buildSmsPayload = ({ phone, message }) =>
  `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ""}`;

export const buildPhonePayload = ({ phone }) => `tel:${phone}`;

export const buildTextPayload = ({ text }) => text || "";

export const buildUrlPayload = ({ dataUrl }) => dataUrl || "";

// NPCI UPI deep link. Only the payee address is mandatory; everything else
// is added when present so the paying app pre-fills it.
export const buildUpiPayload = ({ upiId, payeeName, amount, note }) => {
  const params = [`pa=${encodeURIComponent((upiId || "").trim())}`];
  if (payeeName) params.push(`pn=${encodeURIComponent(payeeName.trim())}`);
  if (amount !== undefined && amount !== null && amount !== "") {
    const value = Number(amount);
    if (!Number.isNaN(value) && value > 0) params.push(`am=${value.toFixed(2)}`);
  }
  params.push("cu=INR");
  if (note) params.push(`tn=${encodeURIComponent(note.trim())}`);
  return `upi://pay?${params.join("&")}`;
};

export const buildWhatsAppPayload = ({ phone, message }) => {
  const number = digitsOnly(phone);
  return `https://wa.me/${number}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
};

export const buildMapsPayload = ({ location }) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    (location || "").trim()
  )}`;

export const qrTypes = [
  {
    key: "url",
    slug: "url-qr-code-generator",
    label: "Website URL",
    shortDescription: "Generate a QR code for any website link",
    isReady: (v) => !!v.dataUrl,
    buildPayload: buildUrlPayload,
    seo: {
      title: "Free URL QR Code Generator: Link to Any Website",
      description:
        "Create a free QR code for any website URL. Customise colours, size and format, then download it as PNG, JPEG, WebP or SVG. No sign-up required.",
      h1: "URL QR Code Generator",
      intro:
        "Turn any web address into a scannable QR code in seconds. Paste the link, adjust the colours and size to match your brand, and download a print-ready image. Everything runs in your browser, so the link never leaves your device.",
      steps: [
        "Paste the full address, including https://, into the Website URL field.",
        "Pick the image format, colours, margin and size under the customisation options.",
        "Scan the live preview with your phone to confirm it opens the right page.",
        "Click Download QR Code to save the file.",
      ],
      faq: [
        {
          q: "Does a URL QR code expire?",
          a: "No. The address is encoded directly into the pattern, so the code keeps working for as long as the page exists. There is no account and nothing to renew.",
        },
        {
          q: "Why does QRx require an https:// link?",
          a: "Modern phones warn users about insecure links, and many QR readers block plain http. Requiring https keeps your code scannable everywhere.",
        },
        {
          q: "Which format should I download?",
          a: "Use SVG for print and anything you might resize later. Use PNG for websites, documents and presentations. JPEG and WebP are smaller but lose the crisp edges a scanner prefers.",
        },
      ],
    },
  },
  {
    key: "vcard",
    slug: "vcard-qr-code-generator",
    label: "vCard",
    shortDescription: "Share your contact details in one scan",
    isReady: (v) => !!(v.firstName || v.lastName),
    buildPayload: buildVCardPayload,
    seo: {
      title: "Free vCard QR Code Generator: Contact Card QR Codes",
      description:
        "Generate a vCard QR code with your name, phone numbers, email, company and address. Scanning saves the contact straight to the phone. Free, no sign-up.",
      h1: "vCard QR Code Generator",
      intro:
        "A vCard QR code lets someone save your full contact card with one scan instead of typing it in. Put it on business cards, email signatures, conference badges or a shop counter. QRx encodes a standard vCard 3.0 record that every iPhone and Android contacts app understands.",
      steps: [
        "Enter your first and last name. Everything else is optional.",
        "Add phone numbers, email addresses, your organisation, website and postal address as needed.",
        "Adjust the appearance, then scan the preview to check how the contact card looks on your phone.",
        "Download the image and add it to your business card, signature or signage.",
      ],
      faq: [
        {
          q: "Is my contact data stored anywhere?",
          a: "No. The vCard is built in your browser and encoded straight into the image. QRx has no server and never sees what you type.",
        },
        {
          q: "Why is the vCard QR code so dense?",
          a: "A full contact card is a lot of text, and every character adds modules to the pattern. Keep notes short, leave out fields you do not need, and download at a larger width so it stays easy to scan.",
        },
        {
          q: "Can I update the details after printing?",
          a: "Not with a static code. The data is baked into the image, so a new phone number means a new QR code. Editable codes are on the QRx roadmap.",
        },
      ],
    },
  },
  {
    key: "wifi",
    slug: "wifi-qr-code-generator",
    label: "WiFi",
    shortDescription: "Let guests join your WiFi without typing a password",
    isReady: (v) => !!v.ssid,
    buildPayload: buildWifiPayload,
    seo: {
      title: "Free WiFi QR Code Generator: Share Your Network Password",
      description:
        "Create a WiFi QR code so guests can join your network with one scan. Supports WPA, WEP, open and hidden networks. Free, private and no sign-up.",
      h1: "WiFi QR Code Generator",
      intro:
        "Stop spelling out your WiFi password. A WiFi QR code carries the network name, security type and password, and both iPhone and Android connect automatically when the camera scans it. Ideal for cafés, guest rooms, offices, Airbnb listings and home visitors.",
      steps: [
        "Type the network name exactly as it appears in your WiFi settings.",
        "Enter the password and choose the security type. Most home and business routers use WPA/WPA2.",
        "Mark the network as hidden only if you have disabled SSID broadcast on your router.",
        "Download the code and print it where guests will see it.",
      ],
      faq: [
        {
          q: "Is it safe to put my WiFi password in a QR code?",
          a: "The password is stored in plain text inside the code, so anyone who scans it can read it. Treat the printed code like the password itself and only display it where you would happily share the password.",
        },
        {
          q: "Which phones can join WiFi from a QR code?",
          a: "iPhones running iOS 11 or later and Android phones running Android 10 or later connect directly from the camera app. Older phones need a QR reader app that supports WiFi codes.",
        },
        {
          q: "What if my password contains special characters?",
          a: "QRx escapes semicolons, commas, colons, quotes and backslashes as required by the WiFi QR standard, so any password works.",
        },
      ],
    },
  },
  {
    key: "email",
    slug: "email-qr-code-generator",
    label: "Email",
    shortDescription: "Open a pre-filled email with one scan",
    isReady: (v) => !!v.email,
    buildPayload: buildEmailPayload,
    seo: {
      title: "Free Email QR Code Generator: Pre-filled Mailto Links",
      description:
        "Generate an email QR code that opens a new message with the address, subject and body already filled in. Free to use with no sign-up.",
      h1: "Email QR Code Generator",
      intro:
        "An email QR code opens the scanner's mail app with your address, and optionally a subject line and message, already in place. Use it on flyers, packaging, invoices and support desks to make getting in touch effortless.",
      steps: [
        "Enter the email address that should receive the message.",
        "Optionally add a subject and a starting message to save the sender some typing.",
        "Customise the look, then scan the preview to see the draft open on your phone.",
        "Download the image and place it wherever people might want to email you.",
      ],
      faq: [
        {
          q: "Will the email send automatically when scanned?",
          a: "No. Scanning opens a draft in the person's mail app. They still review it and press send, which is what you want for consent and spam reasons.",
        },
        {
          q: "Can I use this for a support or sales inbox?",
          a: "Yes. Pre-filling the subject, for example with an order number placeholder, makes incoming mail much easier to route.",
        },
      ],
    },
  },
  {
    key: "sms",
    slug: "sms-qr-code-generator",
    label: "SMS",
    shortDescription: "Start a text message with a pre-written body",
    isReady: (v) => !!v.phone,
    buildPayload: buildSmsPayload,
    seo: {
      title: "Free SMS QR Code Generator: Pre-written Text Messages",
      description:
        "Create an SMS QR code that opens the messaging app with your number and a ready-made message. Great for opt-ins, competitions and quick enquiries. Free.",
      h1: "SMS QR Code Generator",
      intro:
        "An SMS QR code opens the phone's messaging app with your number and, if you like, a pre-written text. It is a low-friction way to collect opt-ins, run text-to-win campaigns or let customers ask a question without dialling.",
      steps: [
        "Enter the phone number in international format, for example +91 98765 43210.",
        "Add the message you want pre-filled, such as a keyword for a campaign.",
        "Style the code and test the preview on your phone.",
        "Download and print or embed the image.",
      ],
      faq: [
        {
          q: "Does the person get charged for the SMS?",
          a: "Standard messaging rates from their carrier apply, exactly as if they typed the message themselves.",
        },
        {
          q: "Should I include the country code?",
          a: "Yes. Without it the code only works for people whose phones are set to your country, and it may fail for travellers or dual-SIM users.",
        },
      ],
    },
  },
  {
    key: "phone",
    slug: "phone-qr-code-generator",
    label: "Phone",
    shortDescription: "Dial a phone number with one scan",
    isReady: (v) => !!v.phone,
    buildPayload: buildPhonePayload,
    seo: {
      title: "Free Phone Number QR Code Generator: Tap to Call",
      description:
        "Generate a phone QR code that dials your number when scanned. Perfect for business cards, vehicle signage and shop fronts. Free, no sign-up required.",
      h1: "Phone Number QR Code Generator",
      intro:
        "A phone QR code puts your number into the dialler the moment it is scanned, so a customer only has to tap call. It removes typos and works well on vans, shop windows, posters and packaging where people are already holding their phone.",
      steps: [
        "Enter the phone number with its country code.",
        "Adjust colours and size to suit where the code will be displayed.",
        "Scan the preview and confirm the correct number appears in your dialler.",
        "Download and add the image to your printed or digital material.",
      ],
      faq: [
        {
          q: "Does scanning call the number straight away?",
          a: "No. It opens the dialler with the number filled in. The person still taps the call button.",
        },
        {
          q: "Can I use an extension?",
          a: "Extensions are not part of the tel: standard that phones understand reliably, so use the main line and mention the extension in the surrounding text.",
        },
      ],
    },
  },
  {
    key: "text",
    slug: "text-qr-code-generator",
    label: "Text",
    shortDescription: "Encode any plain text, no internet needed",
    isReady: (v) => !!v.text,
    buildPayload: buildTextPayload,
    seo: {
      title: "Free Text QR Code Generator: Plain Text QR Codes",
      description:
        "Turn any plain text into a QR code that displays when scanned, with no website or internet connection needed. Free, private and instant.",
      h1: "Text QR Code Generator",
      intro:
        "A text QR code shows a message, serial number, instruction or note directly on the scanner's screen. Nothing is downloaded and no connection is required, which makes it useful for asset labels, product information, scavenger hunts and offline environments.",
      steps: [
        "Type or paste the text you want to encode.",
        "Keep it as short as you can. Longer text produces a denser code that is harder to scan.",
        "Style the code, then scan the preview to check readability.",
        "Download in your preferred format.",
      ],
      faq: [
        {
          q: "How much text fits in a QR code?",
          a: "Technically up to a few thousand characters, but anything past a couple of hundred becomes hard for phone cameras to read. Use a URL QR code that points to a page if you need more.",
        },
        {
          q: "Does the text QR code support other languages?",
          a: "Yes. QRx encodes text as UTF-8, so Hindi, Kannada, Tamil, emoji and any other script all work.",
        },
      ],
    },
  },
  {
    key: "upi",
    slug: "upi-qr-code-generator",
    label: "UPI Payment",
    shortDescription: "Accept payments to your UPI ID with any app",
    isReady: (v) => !!v.upiId,
    buildPayload: buildUpiPayload,
    seo: {
      title: "Free UPI QR Code Generator: Accept Payments to Your UPI ID",
      description:
        "Create a UPI payment QR code for your UPI ID that works with Google Pay, PhonePe, Paytm, BHIM and every other UPI app. Optional fixed amount and note. Free.",
      h1: "UPI QR Code Generator",
      intro:
        "Generate a payment QR code for any UPI ID, such as yourname@okaxis or shop@ybl. Customers scan it with Google Pay, PhonePe, Paytm, BHIM or their bank's app and the payee is filled in automatically. You can leave the amount open for a shop counter or fix it for an invoice, a donation drive or a specific product.",
      steps: [
        "Enter your UPI ID exactly as shown in your payment app.",
        "Add your name or business name so the payer sees who they are paying.",
        "Optionally set a fixed amount in rupees and a transaction note.",
        "Test the preview with a small payment from another phone, then download and print.",
      ],
      faq: [
        {
          q: "Is this an official NPCI QR code?",
          a: "It follows the public UPI deep-link specification (upi://pay) that all UPI apps understand. It is not a merchant QR issued by a bank, so it does not include a merchant category code or signature, which is fine for individuals and small businesses.",
        },
        {
          q: "Can the payer change the amount?",
          a: "If you set a fixed amount, most apps show it pre-filled and let the payer confirm. Leave the amount empty if you want them to enter their own.",
        },
        {
          q: "Is my UPI ID safe to print?",
          a: "Yes. A UPI ID can only receive money, never send it. Never share your UPI PIN, and be wary of anyone asking you to scan a code to receive a payment.",
        },
      ],
    },
  },
  {
    key: "whatsapp",
    slug: "whatsapp-qr-code-generator",
    label: "WhatsApp",
    shortDescription: "Open a WhatsApp chat with your number",
    isReady: (v) => !!v.phone,
    buildPayload: buildWhatsAppPayload,
    seo: {
      title: "Free WhatsApp QR Code Generator: Click to Chat Codes",
      description:
        "Generate a WhatsApp QR code that opens a chat with your number, with an optional pre-filled message. Works with WhatsApp and WhatsApp Business. Free, no sign-up.",
      h1: "WhatsApp QR Code Generator",
      intro:
        "A WhatsApp QR code opens a chat with your number as soon as it is scanned, without the customer having to save your contact first. Put it on packaging, menus, shop fronts, delivery slips and Instagram bios to turn foot traffic and print into conversations.",
      steps: [
        "Enter your WhatsApp number with the country code, for example +91 98765 43210.",
        "Optionally add an opening message, such as 'Hi, I would like to know more about...'.",
        "Style the code, scan the preview and check that the chat opens correctly.",
        "Download and place it wherever customers see your brand.",
      ],
      faq: [
        {
          q: "Does this work with WhatsApp Business?",
          a: "Yes. The code uses the standard wa.me link, which opens whichever WhatsApp app is installed, including WhatsApp Business.",
        },
        {
          q: "Will people see my number?",
          a: "Yes. The number is part of the link, so anyone who scans can see it, the same as if you printed it.",
        },
      ],
    },
  },
  {
    key: "maps",
    slug: "google-maps-qr-code-generator",
    label: "Google Maps",
    shortDescription: "Send people straight to a location or address",
    isReady: (v) => !!v.location,
    buildPayload: buildMapsPayload,
    seo: {
      title: "Free Google Maps QR Code Generator: Location QR Codes",
      description:
        "Create a Google Maps QR code for an address, place name or GPS coordinates. Scanning opens the location ready for directions. Free, no sign-up required.",
      h1: "Google Maps QR Code Generator",
      intro:
        "A location QR code opens Google Maps at your address, shop or venue with one scan, so visitors can get directions without typing. Use it on invitations, event posters, business cards, brochures and delivery instructions.",
      steps: [
        "Enter a full address, a place name as it appears on Google Maps, or coordinates such as 12.9716, 77.5946.",
        "Style the code to match your material.",
        "Scan the preview and confirm the pin lands in the right spot.",
        "Download and print or share the image.",
      ],
      faq: [
        {
          q: "Does it open in Apple Maps on iPhone?",
          a: "It opens the Google Maps app if installed, otherwise Google Maps in the browser. Both work on iPhone and Android.",
        },
        {
          q: "Should I use an address or coordinates?",
          a: "Use coordinates when the address is ambiguous or the building is inside a large complex. Otherwise a full address with city and postcode is easiest to check.",
        },
      ],
    },
  },
];

export const findTypeBySlug = (slug) => qrTypes.find((t) => t.slug === slug);
export const findTypeByKey = (key) => qrTypes.find((t) => t.key === key);

export const homeSeo = {
  title: "QRx | Free QR Code Generator for URLs, WiFi, UPI, vCards and More",
  description:
    "Generate free, customisable QR codes for websites, WiFi, UPI payments, WhatsApp, contact cards, email, SMS and more. Download as PNG, JPEG, WebP or SVG. No sign-up.",
};
