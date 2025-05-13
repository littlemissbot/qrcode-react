import React from "react";
import { Typography } from "antd";
import QRCodeTypeSelector from "../components/common/QRCodeTypeSelector";

const { Title } = Typography;

const TypeSelection = ({ onTypeSelect }) => {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: "32px" }}>
        Choose QR Code Type
      </Title>
      <QRCodeTypeSelector onTypeSelect={onTypeSelect} />
    </div>
  );
};

export default TypeSelection;
