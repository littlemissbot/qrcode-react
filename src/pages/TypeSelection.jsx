import React from "react";
import { Typography } from "antd";
import QRCodeTypeSelector from "../components/common/QRCodeTypeSelector";
import useSeo from "../hooks/useSeo";
import { homeSeo } from "../qrTypes";
import BannerImage from "../banner-image.png";

const { Title, Paragraph } = Typography;

const TypeSelection = () => {
  useSeo({
    title: homeSeo.title,
    description: homeSeo.description,
    path: "/",
  });

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
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
        <div style={{ flex: 1, minWidth: 260 }}>
          <Title className="display-1" level={1} style={{ margin: "0 0 8px" }}>
            Welcome to QRx!
          </Title>
          <Title level={2} style={{ margin: "0 0 8px", fontSize: "1.25rem" }}>
            The QR Experience, Reimagined!!
          </Title>
          <Paragraph style={{ fontSize: "1.1rem", color: "#555" }}>
            Instantly generate custom QR codes for websites, WiFi, UPI
            payments, WhatsApp, contacts and more. Everything runs in your
            browser, nothing is uploaded, and there is no sign-up. Choose a QR
            code type to get started!
          </Paragraph>
        </div>
        <div style={{ flex: 1, textAlign: "center", minWidth: 420 }}>
          <img
            src={BannerImage}
            alt="QR Code Banner"
            style={{
              width: "420px",
              maxWidth: "100%",
              marginBottom: "0",
              borderRadius: "16px",
            }}
          />
        </div>
      </div>
      <Title
        level={2}
        style={{
          textAlign: "center",
          marginBottom: "32px",
          marginTop: "64px",
          fontSize: "1.25rem",
        }}
      >
        Choose QR Code Type
      </Title>
      <QRCodeTypeSelector />
    </div>
  );
};

export default TypeSelection;
