/**
 * @typedef {Object} Phone
 * @property {'mobile'|'work'|'home'} type
 * @property {string} number
 */

/**
 * @typedef {Object} Email
 * @property {'work'|'personal'} type
 * @property {string} address
 */

/**
 * @typedef {Object} Address
 * @property {string} [street]
 * @property {string} [city]
 * @property {string} [state]
 * @property {string} [postalCode]
 * @property {string} [country]
 */

/**
 * @typedef {Object} VCardData
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [organization]
 * @property {string} [jobTitle]
 * @property {Phone[]} phones
 * @property {Email[]} emails
 * @property {string} [website]
 * @property {Address} [address]
 * @property {string} [notes]
 */

/**
 * Generates a vCard string from the provided data
 * @param {VCardData} data - The vCard data
 * @returns {string} The formatted vCard string
 */
export const generateVCardString = (data) => {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${data.lastName};${data.firstName}`,
  ];

  if (data.organization) {
    lines.push(`ORG:${data.organization}`);
  }

  if (data.jobTitle) {
    lines.push(`TITLE:${data.jobTitle}`);
  }

  data.phones.forEach((phone) => {
    lines.push(`TEL;TYPE=${phone.type.toUpperCase()}:${phone.number}`);
  });

  data.emails.forEach((email) => {
    lines.push(`EMAIL;TYPE=${email.type.toUpperCase()}:${email.address}`);
  });

  if (data.website) {
    lines.push(`URL:${data.website}`);
  }

  if (data.address) {
    const addressParts = [
      data.address.street,
      data.address.city,
      data.address.state,
      data.address.postalCode,
      data.address.country,
    ].filter(Boolean);

    if (addressParts.length > 0) {
      lines.push(`ADR;TYPE=WORK:;;${addressParts.join(";")}`);
    }
  }

  if (data.notes) {
    lines.push(`NOTE:${data.notes}`);
  }

  lines.push("END:VCARD");
  return lines.join("\n");
};
