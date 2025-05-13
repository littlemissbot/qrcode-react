import "./App.css";
import QrCode from "./qrcode.png";
import React, { useState } from "react";
import QRCode from "qrcode";
import VCardForm from "./components/VCardForm";
import WifiForm from "./components/qr-types/WifiForm";
import EmailForm from "./components/qr-types/EmailForm";
import SmsForm from "./components/qr-types/SmsForm";
import { generateVCardString } from "./types/vCard";
import {
  generateWifiString,
  generateEmailString,
  generateSmsString,
  generatePhoneString,
  generateTextString,
} from "./utils/qrCodeGenerator";

import {
  BarcodeOutlined,
  DownloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  ConfigProvider,
  theme,
  Layout,
  Form,
  Input,
  InputNumber,
  Slider,
  Select,
  Button,
  Card,
  Spin,
  Row,
  Col,
  Typography,
  ColorPicker,
  Collapse,
  Divider,
} from "antd";
import QRCodeCustomization from "./components/QRCodeCustomization";

const { Header, Footer, Sider, Content } = Layout;
const { Meta } = Card;
const { Option } = Select;
const { Title } = Typography;
const { Panel } = Collapse;

const LoaderTemplate = <LoadingOutlined style={{ fontSize: 32 }} spin />;

function App() {
  const [dataUrl, setDataUrl] = useState(QrCode);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [qrDataString, setQrDataString] = useState("");

  const onFinish = async (values) => {
    console.log("Success:", values);
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

    const options = {
      version: values.optionVersion,
      type: values.optionImageType,
      quality: values.optionQuality,
      margin: values.optionMargin,
      color: {
        dark:
          typeof values.optionDarkColor === "string"
            ? values.optionDarkColor
            : values.optionDarkColor.toHexString(),
        light:
          typeof values.optionLightColor === "string"
            ? values.optionLightColor
            : values.optionLightColor.toHexString(),
      },
      scale: values.optionScale,
      maskPattern: values.optionMaskPattern,
      width: values.optionWidth,
      errorCorrectionLevel: values.errorCorrectionLevel || "M",
    };

    QRCode.toDataURL(qrData, options)
      .then((url) => {
        setTimeout(() => {
          console.log(url);
          setDataUrl(url);
          setLoading(false);
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onDownloadImage = (uri, name) => {
    var link = document.createElement("a");
    link.download = "qrcode";
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
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
        <Layout className="layout">
          <Header className="header">
            <Title level={4} className="projecttitle">
              QR Code Generator <small>Powered By Samita Mondal</small>
            </Title>
          </Header>
          <Layout>
            <Content className="content" style={{ margin: "32px 0" }}>
              <Row gutter={[32, 32]} justify="center" align="top">
                <Col xs={24} md={14}>
                  <Card
                    className="card"
                    style={{ maxWidth: 600, margin: "0 auto" }}
                  >
                    <Form
                      form={form}
                      name="basic"
                      layout="vertical"
                      onFinish={onFinish}
                      onFinishFailed={onFinishFailed}
                      autoComplete="off"
                      initialValues={{
                        qrType: "url",
                        optionImageType: "image/png",
                        optionMargin: 2,
                        optionQuality: 1,
                        optionDarkColor: "#a0d911",
                        optionLightColor: "#fcffe6",
                        optionMaskPattern: 2,
                        optionWidth: 600,
                        errorCorrectionLevel: "M",
                      }}
                    >
                      <Form.Item
                        label="QR Code Type"
                        name="qrType"
                        rules={[
                          {
                            required: true,
                            message: "Please select QR code type!",
                          },
                        ]}
                      >
                        <Select size="large">
                          <Option value="url">Website URL</Option>
                          <Option value="vcard">vCard</Option>
                          <Option value="wifi">WiFi</Option>
                          <Option value="email">Email</Option>
                          <Option value="sms">SMS</Option>
                          <Option value="phone">Phone Number</Option>
                          <Option value="text">Plain Text</Option>
                        </Select>
                      </Form.Item>

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
                              return (
                                <Form.Item
                                  label="Website URL"
                                  name="dataUrl"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please input a website url!",
                                    },
                                    {
                                      pattern:
                                        /^(http(s):\/\/)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g,
                                      message:
                                        "Please enter valid url. Note it must be a secure url (https).",
                                    },
                                  ]}
                                >
                                  <Input
                                    placeholder="Website URL"
                                    size="large"
                                  />
                                </Form.Item>
                              );
                            case "vcard":
                              return <VCardForm form={form} />;
                            case "wifi":
                              return <WifiForm />;
                            case "email":
                              return <EmailForm />;
                            case "sms":
                              return <SmsForm />;
                            case "phone":
                              return (
                                <Form.Item
                                  label="Phone Number"
                                  name="phone"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please input phone number!",
                                    },
                                    {
                                      pattern: /^\+?[\d\s-]+$/,
                                      message:
                                        "Please enter a valid phone number!",
                                    },
                                  ]}
                                >
                                  <Input
                                    placeholder="+1234567890"
                                    size="large"
                                  />
                                </Form.Item>
                              );
                            case "text":
                              return (
                                <Form.Item
                                  label="Text"
                                  name="text"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please input text!",
                                    },
                                  ]}
                                >
                                  <Input.TextArea
                                    placeholder="Enter your text"
                                    rows={4}
                                  />
                                </Form.Item>
                              );
                            default:
                              return null;
                          }
                        }}
                      </Form.Item>

                      <Divider orientation="left">
                        QR Code Customization
                      </Divider>
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
                  </Card>
                </Col>
                <Col xs={24} md={10}>
                  <Card
                    className="card"
                    style={{
                      textAlign: "center",
                      maxWidth: 400,
                      margin: "0 auto",
                    }}
                  >
                    <div className="qrcode-container">
                      <Spin spinning={loading} indicator={LoaderTemplate}>
                        <img
                          src={dataUrl}
                          alt="QR Code"
                          style={{ maxWidth: "100%", height: "auto" }}
                        />
                      </Spin>
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<DownloadOutlined />}
                        onClick={onDownloadImage}
                        style={{ marginTop: "20px" }}
                      >
                        Download QR Code
                      </Button>
                    </div>
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
                          }}
                        >
                          {qrDataString}
                        </pre>
                      </Panel>
                    </Collapse>
                  </Card>
                </Col>
              </Row>
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </div>
  );
}

export default App;
