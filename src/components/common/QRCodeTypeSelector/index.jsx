import React from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col } from "antd";
import { qrTypes, pathForType } from "../../../qrTypes";
import "./styles.css";

// Real anchor links so crawlers discover every generator page from the home page.
const QRCodeTypeSelector = () => {
  return (
    <nav className="qr-type-selector" aria-label="QR code types">
      <Row gutter={[16, 16]}>
        {qrTypes.map((type) => (
          <Col xs={24} sm={12} md={8} key={type.key}>
            <Link to={pathForType(type)} className="qr-type-link">
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
                  {type.shortDescription}
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </nav>
  );
};

export default QRCodeTypeSelector;
