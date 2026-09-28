import React from "react";
import {
  LinkOutlined,
  UserOutlined,
  WifiOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  FileTextOutlined,
  WalletOutlined,
  WhatsAppOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import UrlForm from "../components/forms/qr-types/UrlForm";
import VCardForm from "../components/forms/qr-types/VCardForm";
import WifiForm from "../components/forms/qr-types/WifiForm";
import EmailForm from "../components/forms/qr-types/EmailForm";
import SmsForm from "../components/forms/qr-types/SmsForm";
import PhoneForm from "../components/forms/qr-types/PhoneForm";
import TextForm from "../components/forms/qr-types/TextForm";
import UpiForm from "../components/forms/qr-types/UpiForm";
import WhatsAppForm from "../components/forms/qr-types/WhatsAppForm";
import MapsForm from "../components/forms/qr-types/MapsForm";
import {
  qrTypes as registry,
  findTypeBySlug as findBySlug,
  findTypeByKey as findByKey,
} from "./registry.mjs";

export {
  SITE_URL,
  SITE_NAME,
  homeSeo,
} from "./registry.mjs";

const iconStyle = { fontSize: "24px" };

const ui = {
  url: { icon: <LinkOutlined style={iconStyle} />, Form: UrlForm },
  vcard: { icon: <UserOutlined style={iconStyle} />, Form: VCardForm },
  wifi: { icon: <WifiOutlined style={iconStyle} />, Form: WifiForm },
  email: { icon: <MailOutlined style={iconStyle} />, Form: EmailForm },
  sms: { icon: <MessageOutlined style={iconStyle} />, Form: SmsForm },
  phone: { icon: <PhoneOutlined style={iconStyle} />, Form: PhoneForm },
  text: { icon: <FileTextOutlined style={iconStyle} />, Form: TextForm },
  upi: { icon: <WalletOutlined style={iconStyle} />, Form: UpiForm },
  whatsapp: { icon: <WhatsAppOutlined style={iconStyle} />, Form: WhatsAppForm },
  maps: { icon: <EnvironmentOutlined style={iconStyle} />, Form: MapsForm },
};

export const qrTypes = registry.map((type) => ({ ...type, ...ui[type.key] }));

export const findTypeBySlug = (slug) => {
  const type = findBySlug(slug);
  return type ? { ...type, ...ui[type.key] } : undefined;
};

export const findTypeByKey = (key) => {
  const type = findByKey(key);
  return type ? { ...type, ...ui[type.key] } : undefined;
};

export const pathForType = (type) => `/${type.slug}`;
