import React from "react";
import { Card, Row, Col } from "antd";
import {
  LinkOutlined,
  UserOutlined,
  WifiOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "./styles.css";

const QRCodeTypeSelector = ({ onTypeSelect }) => {
  const qrTypes = [
    {
      value: "url",
      label: "Website URL",
      icon: <LinkOutlined style={{ fontSize: "24px" }} />,
      description: "Generate QR code for website links",
    },
    {
      value: "vcard",
      label: "vCard",
      icon: <UserOutlined style={{ fontSize: "24px" }} />,
      description: "Create QR code for contact information",
    },
    {
      value: "wifi",
      label: "WiFi",
      icon: <WifiOutlined style={{ fontSize: "24px" }} />,
      description: "Share WiFi network credentials",
    },
    {
      value: "email",
      label: "Email",
      icon: <MailOutlined style={{ fontSize: "24px" }} />,
      description: "Generate QR code for email addresses",
    },
    {
      value: "sms",
      label: "SMS",
      icon: <MessageOutlined style={{ fontSize: "24px" }} />,
      description: "Create QR code for text messages",
    },
    {
      value: "phone",
      label: "Phone",
      icon: <PhoneOutlined style={{ fontSize: "24px" }} />,
      description: "Generate QR code for phone numbers",
    },
    {
      value: "text",
      label: "Text",
      icon: <FileTextOutlined style={{ fontSize: "24px" }} />,
      description: "Create QR code for plain text",
    },
  ];

  const handleCardClick = (type) => {
    if (onTypeSelect) {
      onTypeSelect(type);
    }
  };

  return (
    <div className="qr-type-selector">
      <Row gutter={[16, 16]}>
        {qrTypes.map((type) => (
          <Col xs={24} sm={12} md={8} key={type.value}>
            <Card
              hoverable
              className="qr-type-card"
              onClick={() => handleCardClick(type.value)}
              style={{
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: "#ebe9ee",
              }}
            >
              <div style={{ marginBottom: "8px" }}>{type.icon}</div>
              <div style={{ fontWeight: "bold" }}>{type.label}</div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(0, 0, 0, 0.45)",
                  marginTop: "4px",
                }}
              >
                {type.description}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default QRCodeTypeSelector;
