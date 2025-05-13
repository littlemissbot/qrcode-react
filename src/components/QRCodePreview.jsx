import React from "react";
import { Card, Button, Spin, Collapse } from "antd";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const LoaderTemplate = <LoadingOutlined style={{ fontSize: 32 }} spin />;

const QRCodePreview = ({ dataUrl, loading, onDownload, qrDataString }) => {
  return (
    <Card
      className="card"
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
        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => onDownload(dataUrl)}
            disabled={loading}
          >
            Download QR Code
          </Button>
        </div>
      </div>
      {qrDataString && (
        <Collapse style={{ marginTop: 24 }}>
          <Panel header="Show QR Code Data" key="1">
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
          </Panel>
        </Collapse>
      )}
    </Card>
  );
};

export default QRCodePreview;
