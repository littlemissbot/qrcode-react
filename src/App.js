import "./App.css";
import React, { useState, useEffect } from "react";
import { ConfigProvider, theme, Layout, Typography } from "antd";
import TypeSelection from "./pages/TypeSelection";
import QRCodeForm from "./pages/QRCodeForm";

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [currentPage, setCurrentPage] = useState("type-selection");
  const [qrType, setQrType] = useState(null);

  useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const type = params.get("type");
      if (type) {
        setCurrentPage("form");
        setQrType(type);
      } else {
        setCurrentPage("type-selection");
        setQrType(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleTypeSelect = (type) => {
    console.log("Type selected:", type); // Debug log
    setQrType(type);
    setCurrentPage("form");
    window.history.pushState({}, "", `/form?type=${type}`);
  };

  const handleBack = () => {
    setCurrentPage("type-selection");
    setQrType(null);
    window.history.pushState({}, "", "/");
  };

  return (
    <div className="App">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#a0d911",
            borderRadius: 8,
            colorBgContainer: "#fcffe6",
          },
          algorithm: theme.lightAlgorithm,
        }}
      >
        <Layout style={{ minHeight: "100vh" }}>
          <Header className="header">
            <Title level={4} className="projecttitle">
              QR Code Generator <small>Powered By Samita Mondal</small>
            </Title>
          </Header>
          <Content style={{ padding: "24px", position: "relative" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              {currentPage === "type-selection" ? (
                <TypeSelection onTypeSelect={handleTypeSelect} />
              ) : (
                <QRCodeForm qrType={qrType} onBack={handleBack} />
              )}
            </div>
          </Content>
        </Layout>
      </ConfigProvider>
    </div>
  );
}

export default App;
