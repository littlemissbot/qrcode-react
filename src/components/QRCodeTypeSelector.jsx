import React from "react";
import { Form, Card, Row, Col, Radio } from "antd";
import {
  LinkOutlined,
  UserOutlined,
  WifiOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "./QRCodeTypeSelector.css";

const QRCodeTypeSelector = () => {
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

  return (
    <Form.Item
      label="QR Code Type"
      name="qrType"
      rules={[
        {
          required: true,
          message: "Please select QR code type!",
        },
      ]}
    >
      <Radio.Group className="qr-type-selector">
        <Row gutter={[16, 16]}>
          {qrTypes.map((type) => (
            <Col xs={24} sm={12} md={8} key={type.value}>
              <Radio.Button
                value={type.value}
                className="qr-type-radio"
                style={{ width: "100%", height: "100%" }}
              >
                <Card
                  hoverable
                  className="qr-type-card"
                  style={{
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
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
              </Radio.Button>
            </Col>
          ))}
        </Row>
      </Radio.Group>
    </Form.Item>
  );
};

export default QRCodeTypeSelector;
