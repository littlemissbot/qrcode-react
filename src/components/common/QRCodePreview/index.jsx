import React, { useState } from "react";
import { Card, Button, Spin, Collapse } from "antd";
import {
  DownloadOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import "./styles.css";

const LoaderTemplate = <LoadingOutlined style={{ fontSize: 32 }} spin />;

const QRCodePreview = ({ dataUrl, loading, onDownload, qrDataString }) => {
  const [showQRData, setShowQRData] = useState(false);
  return (
    <Card
      className="qr-code-preview-card"
      style={{
        width: "100%",
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {loading ? (
          <Spin indicator={LoaderTemplate} />
        ) : (
          <img
            src={dataUrl}
            alt="QR Code"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        )}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => onDownload(dataUrl)}
            disabled={loading}
          >
            Download QR Code
          </Button>
          {qrDataString && (
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => setShowQRData((prev) => !prev)}
              disabled={loading}
            >
              {showQRData ? "Hide QR Data" : "Show QR Data"}
            </Button>
          )}
        </div>
        {qrDataString && showQRData && (
          <div style={{ marginTop: 24 }}>
            <pre
              style={{
                textAlign: "left",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                background: "#f6f6f6",
                padding: 12,
                borderRadius: 4,
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {qrDataString}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QRCodePreview;
