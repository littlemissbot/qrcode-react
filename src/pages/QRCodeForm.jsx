import React, { useState } from "react";
import { Form, Row, Col, Button, Typography, Space } from "antd";
import { BarcodeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import VCardForm from "../components/forms/VCardForm";
import WifiForm from "../components/forms/qr-types/WifiForm";
import EmailForm from "../components/forms/qr-types/EmailForm";
import SmsForm from "../components/forms/qr-types/SmsForm";
import UrlForm from "../components/forms/qr-types/UrlForm";
import PhoneForm from "../components/forms/qr-types/PhoneForm";
import TextForm from "../components/forms/qr-types/TextForm";
import QRCodePreview from "../components/common/QRCodePreview";
import QRCodeCustomization from "../components/forms/QRCodeCustomization";
import { generateVCardString } from "../types/vCard";
import {
  generateWifiString,
  generateEmailString,
  generateSmsString,
  generatePhoneString,
  generateTextString,
  generateQRCode,
  getDefaultQRCodeOptions,
} from "../utils/qrCodeGenerator";
import QrCode from "../qrcode.png";

const { Title } = Typography;

const getTypeTitle = (type) => {
  const titles = {
    url: "Website URL QR Code",
    vcard: "vCard QR Code",
    wifi: "WiFi QR Code",
    email: "Email QR Code",
    sms: "SMS QR Code",
    phone: "Phone QR Code",
    text: "Text QR Code",
  };
  return titles[type] || "QR Code Generator";
};

const QRCodeForm = ({ qrType, onBack }) => {
  const [dataUrl, setDataUrl] = useState(QrCode);
  const [loading, setLoading] = useState(false);
  const [qrDataString, setQrDataString] = useState("");
  const [form] = Form.useForm();

  const generateQRCodeFromValues = async (values) => {
    if (!values) return;

    setLoading(true);
    let qrData = values.dataUrl;

    switch (qrType) {
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

  const renderForm = () => {
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
  };

  if (!qrType) {
    onBack();
    return null;
  }

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Back to Types
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {getTypeTitle(qrType)}
          </Title>
        </Space>

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
                qrType,
                ...getDefaultQRCodeOptions(),
              }}
            >
              {renderForm()}

              <QRCodeCustomization />

              <Form.Item style={{ marginTop: 32 }}>
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
      </Space>
    </div>
  );
};

export default QRCodeForm;
