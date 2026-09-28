import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Alert,
  Empty,
  App as AntApp,
} from "antd";
import { PlusOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "../auth/AuthProvider";
import useSeo from "../hooks/useSeo";
import { PLANS, findTypeByKey } from "../qrTypes/registry.mjs";
import { shortUrlFor, UPGRADE_URL } from "../lib/supabase";
import { listCodes, createCode, takePendingCode } from "../lib/dynamicCodes";

const { Title, Paragraph, Text } = Typography;

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Never";

const Dashboard = () => {
  const { user, plan, signOut } = useAuth();
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [codes, setCodes] = useState(null);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useSeo({
    title: "Your dynamic QR codes | QRx",
    description: "Manage your dynamic QR codes and see how often they are scanned.",
    path: "/dashboard",
    noindex: true,
  });

  const limits = PLANS[plan] || PLANS.free;
  const activeCount = codes ? codes.length : 0;
  const atLimit = activeCount >= limits.maxActiveCodes;

  const refresh = useCallback(async () => {
    try {
      setCodes(await listCodes());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const create = useCallback(
    async (values) => {
      setCreating(true);
      try {
        const code = await createCode(values);
        message.success("Dynamic QR code created");
        navigate(`/dashboard/codes/${code.id}`);
      } catch (err) {
        message.error(err.message, 6);
        setCreating(false);
        return false;
      }
      return true;
    },
    [message, navigate]
  );

  // First load, plus any code parked by a type page before sign-in.
  useEffect(() => {
    const pending = takePendingCode();
    if (pending) {
      create(pending).then((ok) => {
        if (!ok) refresh();
      });
    } else {
      refresh();
    }
  }, [create, refresh]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (name, row) => (
        <Space direction="vertical" size={0}>
          <Link to={`/dashboard/codes/${row.id}`}>
            <Text strong>{name}</Text>
          </Link>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {findTypeByKey(row.qr_type)?.label || row.qr_type}
          </Text>
        </Space>
      ),
    },
    {
      title: "Short link",
      dataIndex: "short_code",
      render: (code) => <Text code>{shortUrlFor(code)}</Text>,
      responsive: ["md"],
    },
    {
      title: "Destination",
      dataIndex: "destination",
      ellipsis: true,
      responsive: ["lg"],
    },
    {
      title: "Scans",
      dataIndex: ["stats", "total"],
      align: "right",
      sorter: (a, b) => a.stats.total - b.stats.total,
    },
    {
      title: "Unique",
      dataIndex: ["stats", "unique_visitors"],
      align: "right",
      responsive: ["sm"],
    },
    {
      title: "Last scan",
      dataIndex: ["stats", "last_scan_at"],
      render: formatDate,
      responsive: ["md"],
    },
  ];

  return (
    <div>
      <Space
        style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}
        align="start"
      >
        <div>
          <Title level={1} style={{ fontSize: "1.6rem", margin: 0 }}>
            Your dynamic QR codes
          </Title>
          <Paragraph style={{ color: "#555", margin: "8px 0 0" }}>
            Signed in as {user?.email}.{" "}
            <Tag color={plan === "pro" ? "gold" : "default"}>{limits.label} plan</Tag>
            {activeCount}/{limits.maxActiveCodes} active codes
            {limits.historyDays ? `, ${limits.historyDays} days of history` : ", unlimited history"}.
          </Paragraph>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            disabled={atLimit}
          >
            New dynamic code
          </Button>
          <Button icon={<LogoutOutlined />} onClick={signOut}>
            Sign out
          </Button>
        </Space>
      </Space>

      {atLimit && (
        <Alert
          type="info"
          showIcon
          style={{ marginTop: 16 }}
          message={`You are using all ${limits.maxActiveCodes} dynamic codes on the ${limits.label} plan.`}
          description={
            UPGRADE_URL ? (
              <a href={UPGRADE_URL}>Upgrade to Pro</a>
            ) : (
              "Archive a code to free a slot. Pro plans with more codes and per-scan detail are coming soon."
            )
          }
        />
      )}

      {error && <Alert type="error" showIcon message={error} style={{ marginTop: 16 }} />}

      <Table
        style={{ marginTop: 24 }}
        rowKey="id"
        columns={columns}
        dataSource={codes || []}
        loading={codes === null}
        pagination={false}
        locale={{
          emptyText: (
            <Empty description="No dynamic codes yet">
              <Paragraph type="secondary">
                Create one here, or open any <Link to="/">link-type generator</Link> and
                choose "Make it dynamic".
              </Paragraph>
            </Empty>
          ),
        }}
        onRow={(row) => ({
          onClick: () => navigate(`/dashboard/codes/${row.id}`),
          style: { cursor: "pointer" },
        })}
      />

      <Modal
        title="New dynamic QR code"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        okText="Create"
        confirmLoading={creating}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Paragraph type="secondary">
          The QR code will point to a short link you can redirect anywhere later,
          and every scan is counted.
        </Paragraph>
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          onFinish={(values) =>
            create({ name: values.name.trim(), qrType: "url", destination: values.destination.trim() }).then(
              (ok) => ok && setModalOpen(false)
            )
          }
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Give the code a name you will recognise" }]}
          >
            <Input placeholder="Shop window poster" maxLength={80} />
          </Form.Item>
          <Form.Item
            label="Destination URL"
            name="destination"
            rules={[
              { required: true, message: "Where should the code send people?" },
              { pattern: /^https?:\/\/\S+$/i, message: "Enter a full URL starting with https://" },
            ]}
          >
            <Input placeholder="https://example.com/menu" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;
