export const generateWifiString = (data) => {
  const { ssid, password, encryption, hidden } = data;
  return `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden};`;
};

export const generateEmailString = (data) => {
  const { email, subject, body } = data;
  let mailto = `mailto:${email}`;
  const params = [];

  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);

  if (params.length > 0) {
    mailto += `?${params.join("&")}`;
  }

  return mailto;
};

export const generateSmsString = (data) => {
  const { phone, message } = data;
  let sms = `sms:${phone}`;

  if (message) {
    sms += `?body=${encodeURIComponent(message)}`;
  }

  return sms;
};

export const generatePhoneString = (data) => {
  const { phone } = data;
  return `tel:${phone}`;
};

export const generateTextString = (data) => {
  return data.text;
};
