import "./App.css";
import React, { useState, useEffect } from "react";
import { ConfigProvider, theme, Layout, Typography } from "antd";
import TypeSelection from "./pages/TypeSelection";
import QRCodeForm from "./pages/QRCodeForm";
import QrCodeLogo from "./qrcode.png";

const { Header, Content, Footer } = Layout;
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

  const currentYear = new Date().getFullYear();

  return (
    <div className="App">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#FFF100",
            borderRadius: 8,
            colorBgContainer: "#fffde5",
          },
          algorithm: theme.lightAlgorithm,
        }}
      >
        <Layout style={{ minHeight: "100vh" }}>
          <Header
            className="header"
            style={{ display: "flex", alignItems: "center" }}
          >
            <img
              src={QrCodeLogo}
              alt="QR Code Logo"
              style={{
                height: 40,
                marginRight: 10,
                background: "#fff",
                borderRadius: 8,
                padding: 4,
              }}
            />
            <Title level={4} className="projecttitle" style={{ margin: 0 }}>
              QRx
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
          <Footer
            style={{
              textAlign: "center",
              background: "#fffde5",
              color: "#888",
            }}
          >
            Copyrights &copy; {currentYear} Samita. All right reserved
          </Footer>
        </Layout>
      </ConfigProvider>
    </div>
  );
}

export default App;
