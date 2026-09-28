import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Form, Row, Col, Button, Typography, Space } from "antd";
import { BarcodeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import QRCodePreview from "../components/common/QRCodePreview";
import SeoContent from "../components/common/SeoContent";
import QRCodeCustomization from "../components/forms/QRCodeCustomization";
import useSeo from "../hooks/useSeo";
import { pathForType } from "../qrTypes";
import {
  generateQRCode,
  getDefaultQRCodeOptions,
} from "../utils/qrCodeGenerator";
import QrCode from "../qrcode.png";

const { Title, Paragraph } = Typography;

const faqJsonLd = (type) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: type.seo.faq.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

const QRCodeForm = ({ type }) => {
  const [dataUrl, setDataUrl] = useState(QrCode);
  const [dataMime, setDataMime] = useState("image/png");
  const [loading, setLoading] = useState(false);
  const [qrDataString, setQrDataString] = useState("");
  const [form] = Form.useForm();
  const TypeForm = type.Form;

  useSeo({
    title: type.seo.title,
    description: type.seo.description,
    path: pathForType(type),
    jsonLd: faqJsonLd(type),
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [type.key]);

  const generateQRCodeFromValues = async (values) => {
    if (!values) return;

    setLoading(true);
    const qrData = type.buildPayload(values);
    setQrDataString(qrData);

    try {
      const result = await generateQRCode(qrData, values);
      setDataUrl(result.url);
      setDataMime(result.mime);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    await generateQRCodeFromValues(values);
  };

  const onValuesChange = (changedValues, allValues) => {
    // Only auto-generate once the type's minimum required data is present
    if (type.isReady(allValues)) {
      generateQRCodeFromValues(allValues);
    }
  };

  const onDownloadImage = (uri) => {
    const mimeToExt = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
    };
    const ext = mimeToExt[dataMime] || "";
    const link = document.createElement("a");
    link.download = `qrcode${ext}`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Space style={{ width: "100%" }} align="start">
            <Link to="/" aria-label="Back to all QR code types">
              <Button icon={<ArrowLeftOutlined />} type="text" />
            </Link>
            <Title level={1} style={{ margin: 0, fontSize: "1.6rem" }}>
              {type.seo.h1}
            </Title>
          </Space>
          <Paragraph
            style={{ marginTop: 12, marginBottom: 0, color: "#555", maxWidth: 820 }}
          >
            {type.seo.intro}
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} md={14}>
            <Form
              form={form}
              name="basic"
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={onValuesChange}
              autoComplete="off"
              initialValues={{
                qrType: type.key,
                ...getDefaultQRCodeOptions(),
              }}
            >
              <TypeForm />

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

        <SeoContent type={type} />
      </Space>
    </div>
  );
};

export default QRCodeForm;
