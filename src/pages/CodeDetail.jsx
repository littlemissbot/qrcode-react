import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Statistic,
  Table,
  Alert,
  Popconfirm,
  Spin,
  Tag,
  App as AntApp,
} from "antd";
import { ArrowLeftOutlined, CopyOutlined, LockOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuth } from "../auth/AuthProvider";
import useSeo from "../hooks/useSeo";
import QRCodePreview from "../components/common/QRCodePreview";
import QRCodeCustomization from "../components/forms/QRCodeCustomization";
import { generateQRCode, getDefaultQRCodeOptions } from "../utils/qrCodeGenerator";
import { PLANS, findTypeByKey } from "../qrTypes/registry.mjs";
import { shortUrlFor, UPGRADE_URL } from "../lib/supabase";
import { getCode, getCodeStats, listScans, updateCode, archiveCode } from "../lib/dynamicCodes";

const { Title, Paragraph, Text } = Typography;

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Never";

const mimeToExt = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

// The QR image for a dynamic code always encodes the short URL; the
// customisation form only changes how it looks.
const DynamicQrCard = ({ shortUrl, name }) => {
  const [form] = Form.useForm();
  const [image, setImage] = useState({ url: null, mime: "image/png" });
  const [loading, setLoading] = useState(true);

  const render = useCallback(
    async (values) => {
      setLoading(true);
      try {
        setImage(await generateQRCode(shortUrl, values));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [shortUrl]
  );

  useEffect(() => {
    render(getDefaultQRCodeOptions());
  }, [render]);

  const download = (uri) => {
    const link = document.createElement("a");
    link.download = `${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "qrcode"}${
      mimeToExt[image.mime] || ""
    }`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={getDefaultQRCodeOptions()}
      onValuesChange={(_, all) => render(all)}
    >
      <QRCodePreview
        dataUrl={image.url || ""}
        loading={loading || !image.url}
        onDownload={download}
        qrDataString={shortUrl}
      />
      <QRCodeCustomization />
    </Form>
  );
};

const LockedCard = ({ title, children }) => (
  <Card
    title={
      <Space>
        <LockOutlined /> {title}
      </Space>
    }
    extra={<Tag color="gold">Pro</Tag>}
  >
    <Paragraph type="secondary" style={{ marginBottom: UPGRADE_URL ? 12 : 0 }}>
      {children}
    </Paragraph>
    {UPGRADE_URL && (
      <Button type="primary" href={UPGRADE_URL}>
        Upgrade to Pro
      </Button>
    )}
  </Card>
);

const CodeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plan } = useAuth();
  const { message } = AntApp.useApp();
  const [code, setCode] = useState(null);
  const [stats, setStats] = useState(null);
  const [scans, setScans] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const isPro = plan === "pro";

  useSeo({
    title: code ? `${code.name} | QRx` : "Dynamic QR code | QRx",
    description: "Scan statistics for a dynamic QR code.",
    path: `/dashboard/codes/${id}`,
    noindex: true,
  });

  useEffect(() => {
    let active = true;
    Promise.all([getCode(id), getCodeStats(id), isPro ? listScans(id) : Promise.resolve([])])
      .then(([c, s, rows]) => {
        if (!active) return;
        setCode(c);
        setStats(s);
        setScans(rows || []);
      })
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [id, isPro]);

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message={error}
        action={
          <Link to="/dashboard">
            <Button size="small">Back to dashboard</Button>
          </Link>
        }
      />
    );
  }
  if (!code || !stats) {
    return (
      <div style={{ textAlign: "center", padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  const shortUrl = shortUrlFor(code.short_code);
  const type = findTypeByKey(code.qr_type);

  const saveDestination = async ({ destination, name }) => {
    setSaving(true);
    try {
      setCode(await updateCode(id, { destination: destination.trim(), name: name.trim() }));
      message.success("Saved. Existing printed codes now point to the new destination.");
    } catch (err) {
      message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const archive = async () => {
    try {
      await archiveCode(id);
      message.success("Code archived. Scans of it will now show a not-found page.");
      navigate("/dashboard");
    } catch (err) {
      message.error(err.message);
    }
  };

  const copyShortUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      message.success("Short link copied");
    } catch {
      message.info(shortUrl);
    }
  };

  const dailyColumns = [
    { title: "Day", dataIndex: "day" },
    { title: "Scans", dataIndex: "scans", align: "right" },
  ];

  const scanColumns = [
    { title: "When", dataIndex: "scanned_at", render: formatDate },
    {
      title: "Location",
      render: (_, r) => [r.city, r.region, r.country].filter(Boolean).join(", ") || "Unknown",
    },
    { title: "Device", render: (_, r) => [r.device, r.os].filter(Boolean).join(" · ") },
    { title: "Browser", dataIndex: "browser" },
    { title: "Referrer", dataIndex: "referrer", render: (v) => v || "Direct scan" },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Space align="start">
          <Link to="/dashboard" aria-label="Back to dashboard">
            <Button icon={<ArrowLeftOutlined />} type="text" />
          </Link>
          <Title level={1} style={{ margin: 0, fontSize: "1.6rem" }}>
            {code.name}
          </Title>
          {type && <Tag>{type.label}</Tag>}
        </Space>
        <Paragraph style={{ margin: "8px 0 0", color: "#555" }}>
          Short link <Text code>{shortUrl}</Text>{" "}
          <Button size="small" icon={<CopyOutlined />} onClick={copyShortUrl}>
            Copy
          </Button>
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Statistic title="Total scans" value={stats.total} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Unique visitors" value={stats.unique_visitors} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Last scan" value={formatDate(stats.last_scan_at)} />
        </Col>
      </Row>
      {stats.history_days && (
        <Text type="secondary">
          Showing the last {stats.history_days} days. The {PLANS.pro.label} plan keeps history
          for ever.
        </Text>
      )}

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={10}>
          <DynamicQrCard shortUrl={shortUrl} name={code.name} />
        </Col>
        <Col xs={24} lg={14}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card title="Destination">
              <Form
                layout="vertical"
                initialValues={{ destination: code.destination, name: code.name }}
                onFinish={saveDestination}
              >
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: "Name is required" }]}
                >
                  <Input maxLength={80} />
                </Form.Item>
                <Form.Item
                  label="Where scans go"
                  name="destination"
                  rules={[
                    { required: true, message: "Destination is required" },
                    { pattern: /^https?:\/\/\S+$/i, message: "Enter a full URL starting with https://" },
                  ]}
                  extra="Change this any time. Codes already printed will follow the new destination."
                >
                  <Input />
                </Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={saving}>
                    Save
                  </Button>
                  <Popconfirm
                    title="Archive this code?"
                    description="Anyone scanning it will see a not-found page. This frees a slot on your plan."
                    onConfirm={archive}
                    okText="Archive"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Archive
                    </Button>
                  </Popconfirm>
                </Space>
              </Form>
            </Card>

            <Card title="Scans per day (last 30 days)">
              <Table
                size="small"
                rowKey="day"
                columns={dailyColumns}
                dataSource={stats.daily}
                pagination={false}
                locale={{ emptyText: "No scans yet. Print the code and try it." }}
              />
            </Card>

            {isPro ? (
              <>
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Card title="Top countries" size="small">
                      <Table
                        size="small"
                        rowKey="country"
                        columns={[
                          { title: "Country", dataIndex: "country" },
                          { title: "Scans", dataIndex: "scans", align: "right" },
                        ]}
                        dataSource={stats.countries || []}
                        pagination={false}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Devices" size="small">
                      <Table
                        size="small"
                        rowKey="device"
                        columns={[
                          { title: "Device", dataIndex: "device" },
                          { title: "Scans", dataIndex: "scans", align: "right" },
                        ]}
                        dataSource={stats.devices || []}
                        pagination={false}
                      />
                    </Card>
                  </Col>
                </Row>
                <Card title="Recent scans">
                  <Table
                    size="small"
                    rowKey="id"
                    columns={scanColumns}
                    dataSource={scans}
                    pagination={{ pageSize: 20, hideOnSinglePage: true }}
                    scroll={{ x: true }}
                  />
                </Card>
              </>
            ) : (
              <LockedCard title="Where, when and on what">
                See every scan with its city and country, device, browser and the
                time it happened, plus unlimited history and up to{" "}
                {PLANS.pro.maxActiveCodes} dynamic codes.
              </LockedCard>
            )}
          </Space>
        </Col>
      </Row>
    </Space>
  );
};

export default CodeDetail;
