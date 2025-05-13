import React from "react";
import { Typography } from "antd";
import QRCodeTypeSelector from "../components/common/QRCodeTypeSelector";
import BannerImage from "../banner-image.png"; // Adjust path if needed

const { Title, Paragraph } = Typography;

const TypeSelection = ({ onTypeSelect }) => {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      {/* Flex container for text and image */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "32px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        {/* Text Section */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <Title className="display-1" level={1} style={{ margin: "0 0 8px" }}>
            Welcome to QRx!
          </Title>
          <Paragraph style={{ fontSize: "1.1rem", color: "#555" }}>
            Instantly generate custom QR codes for websites, WiFi, contacts, and
            more. Choose a QR code type to get started!
          </Paragraph>
        </div>
        {/* Image Section */}
        <div style={{ flex: 1, textAlign: "center", minWidth: 420 }}>
          <img
            src={BannerImage}
            alt="QR Code Banner"
            style={{
              width: "420px",
              maxWidth: "100%",
              marginBottom: "0",
              borderRadius: "16px",
              // boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          />
        </div>
      </div>
      {/* QR Type Selection */}
      <Title
        level={4}
        style={{ textAlign: "center", marginBottom: "32px", marginTop: "64px" }}
      >
        Choose QR Code Type
      </Title>
      <QRCodeTypeSelector onTypeSelect={onTypeSelect} />
    </div>
  );
};

export default TypeSelection;
