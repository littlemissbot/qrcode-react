import "./App.css";
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ConfigProvider, theme, Layout, Typography, Space, App as AntApp } from "antd";
import TypeSelection from "./pages/TypeSelection";
import QRCodeForm from "./pages/QRCodeForm";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CodeDetail from "./pages/CodeDetail";
import { AuthProvider, RequireAuth, useAuth } from "./auth/AuthProvider";
import { findTypeBySlug, findTypeByKey, pathForType } from "./qrTypes";
import QrCodeLogo from "./qrcode.png";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const TypePage = () => {
  const { slug } = useParams();
  const type = findTypeBySlug(slug);
  if (!type) return <Navigate to="/" replace />;
  // key forces a fresh form when navigating between type pages
  return <QRCodeForm key={type.key} type={type} />;
};

// Pre-routing links looked like /form?type=wifi. Keep them working.
const LegacyFormRedirect = () => {
  const [params] = useSearchParams();
  const type = findTypeByKey(params.get("type"));
  return <Navigate to={type ? pathForType(type) : "/"} replace />;
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<TypeSelection />} />
    <Route path="/form" element={<LegacyFormRedirect />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/dashboard"
      element={
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      }
    />
    <Route
      path="/dashboard/codes/:id"
      element={
        <RequireAuth>
          <CodeDetail />
        </RequireAuth>
      }
    />
    <Route path="/:slug" element={<TypePage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// Rendered client-side only after auth resolves, so the prerendered HTML is
// identical whether or not the visitor is signed in.
const HeaderNav = () => {
  const { enabled, loading, session } = useAuth();
  if (!enabled || loading) return null;
  return (
    <Space size="middle" className="header-nav">
      {session ? (
        <Link to="/dashboard">Dashboard</Link>
      ) : (
        <Link to="/login">Sign in</Link>
      )}
    </Space>
  );
};

function App() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="App">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#392B58",
            borderRadius: 8,
          },
          components: {
            Layout: {
              bodyBg: "#ffffff",
            },
          },
          algorithm: theme.lightAlgorithm,
        }}
      >
        <AntApp>
          <BrowserRouter>
            <AuthProvider>
              <Layout style={{ minHeight: "100vh" }}>
                <Header
                  className="header"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <Link
                    to="/"
                    style={{ display: "flex", alignItems: "center" }}
                    aria-label="QRx home"
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
                  </Link>
                  <HeaderNav />
                </Header>
                <Content
                  className="content"
                  style={{ padding: "24px", position: "relative" }}
                >
                  <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <AppRoutes />
                  </div>
                </Content>
                <Footer
                  style={{
                    textAlign: "center",
                    background: "#ebe9ee",
                    color: "#888",
                  }}
                >
                  Copyrights &copy; {currentYear} Samita. All right reserved
                </Footer>
              </Layout>
            </AuthProvider>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </div>
  );
}

export default App;
