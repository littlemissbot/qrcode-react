import "./App.css";
import QrCode from "./qrcode.png";
import React, { useState } from "react";
import {
  ConfigProvider,
  theme,
  Layout,
  Form,
  Row,
  Col,
  Typography,
  Input,
  Button,
} from "antd";
import { BarcodeOutlined } from "@ant-design/icons";
import VCardForm from "./components/VCardForm";
import WifiForm from "./components/qr-types/WifiForm";
import EmailForm from "./components/qr-types/EmailForm";
import SmsForm from "./components/qr-types/SmsForm";
import UrlForm from "./components/qr-types/UrlForm";
import PhoneForm from "./components/qr-types/PhoneForm";
import TextForm from "./components/qr-types/TextForm";
import QRCodePreview from "./components/QRCodePreview";
import QRCodeTypeSelector from "./components/QRCodeTypeSelector";
import QRCodeCustomization from "./components/QRCodeCustomization";
import { generateVCardString } from "./types/vCard";
import {
  generateWifiString,
  generateEmailString,
  generateSmsString,
  generatePhoneString,
  generateTextString,
  generateQRCode,
  getDefaultQRCodeOptions,
} from "./utils/qrCodeGenerator";

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [dataUrl, setDataUrl] = useState(QrCode);
  const [loading, setLoading] = useState(false);
  const [qrDataString, setQrDataString] = useState("");
  const [form] = Form.useForm();

  const generateQRCodeFromValues = async (values) => {
    if (!values) return;

    setLoading(true);
    let qrData = values.dataUrl;

    switch (values.qrType) {
      case "vcard":
        qrData = generateVCardString({
          firstName: values.firstName,
          lastName: values.lastName,
          organization: values.organization,
          jobTitle: values.jobTitle,
          phones: values.phones || [],
          emails: values.emails || [],
          website: values.website,
          address: values.address,
          notes: values.notes,
        });
        break;
      case "wifi":
        qrData = generateWifiString({
          ssid: values.ssid,
          password: values.password,
          encryption: values.encryption,
          hidden: values.hidden,
        });
        break;
      case "email":
        qrData = generateEmailString({
          email: values.email,
          subject: values.subject,
          body: values.body,
        });
        break;
      case "sms":
        qrData = generateSmsString({
          phone: values.phone,
          message: values.message,
        });
        break;
      case "phone":
        qrData = generatePhoneString({
          phone: values.phone,
        });
        break;
      case "text":
        qrData = generateTextString({
          text: values.text,
        });
        break;
      default:
        qrData = values.dataUrl;
    }

    setQrDataString(qrData);

    try {
      const url = await generateQRCode(qrData, values);
      setDataUrl(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    await generateQRCodeFromValues(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onValuesChange = (changedValues, allValues) => {
    // Only auto-generate if we have the minimum required data
    const qrType = allValues.qrType;
    let shouldGenerate = false;

    switch (qrType) {
      case "url":
        shouldGenerate = !!allValues.dataUrl;
        break;
      case "vcard":
        shouldGenerate = !!(allValues.firstName || allValues.lastName);
        break;
      case "wifi":
        shouldGenerate = !!allValues.ssid;
        break;
      case "email":
        shouldGenerate = !!allValues.email;
        break;
      case "sms":
      case "phone":
        shouldGenerate = !!allValues.phone;
        break;
      case "text":
        shouldGenerate = !!allValues.text;
        break;
      default:
        shouldGenerate = false;
    }

    if (shouldGenerate) {
      generateQRCodeFromValues(allValues);
    }
  };

  const onDownloadImage = (uri) => {
    const link = document.createElement("a");
    link.download = "qrcode";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <Row gutter={[32, 32]}>
                <Col xs={24} md={14}>
                  <Form
                    form={form}
                    name="basic"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    onValuesChange={onValuesChange}
                    autoComplete="off"
                    initialValues={{
                      qrType: "url",
                      ...getDefaultQRCodeOptions(),
                    }}
                  >
                    <QRCodeTypeSelector />

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.qrType !== currentValues.qrType
                      }
                    >
                      {({ getFieldValue }) => {
                        const qrType = getFieldValue("qrType");
                        switch (qrType) {
                          case "url":
                            return <UrlForm />;
                          case "vcard":
                            return <VCardForm />;
                          case "wifi":
                            return <WifiForm />;
                          case "email":
                            return <EmailForm />;
                          case "sms":
                            return <SmsForm />;
                          case "phone":
                            return <PhoneForm />;
                          case "text":
                            return <TextForm />;
                          default:
                            return null;
                        }
                      }}
                    </Form.Item>

                    <QRCodeCustomization />

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        icon={<BarcodeOutlined />}
                      >
                        Generate QR Code
                      </Button>
                    </Form.Item>
                  </Form>
                </Col>
                <Col xs={24} md={10}>
                  <div style={{ position: "sticky", top: "88px" }}>
                    <QRCodePreview
                      dataUrl={dataUrl}
                      loading={loading}
                      onDownload={onDownloadImage}
                      qrDataString={qrDataString}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Content>
        </Layout>
      </ConfigProvider>
    </div>
  );
}

export default App;
