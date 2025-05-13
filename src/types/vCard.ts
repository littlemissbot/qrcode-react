export interface VCardData {
  firstName: string;
  lastName: string;
  organization?: string;
  jobTitle?: string;
  phones: {
    type: "mobile" | "work" | "home";
    number: string;
  }[];
  emails: {
    type: "work" | "personal";
    address: string;
  }[];
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  notes?: string;
}

export const generateVCardString = (data: VCardData): string => {
  const lines: string[] = [
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
