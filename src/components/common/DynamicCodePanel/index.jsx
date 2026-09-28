import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Typography, Space, App as AntApp } from "antd";
import { ThunderboltOutlined, LineChartOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "../../../auth/AuthProvider";
import { createCode, stashPendingCode } from "../../../lib/dynamicCodes";
import { PLANS } from "../../../qrTypes/registry.mjs";
import "./styles.css";

const { Text, Paragraph } = Typography;

/**
 * Upsell shown under the preview on link-type generators. Turns the current
 * payload into a dynamic code: signed-in users get one immediately, others
 * are sent through the magic-link flow and the code is created on return.
 */
const DynamicCodePanel = ({ type, payload, ready }) => {
  const { enabled, session } = useAuth();
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [busy, setBusy] = useState(false);

  if (!enabled) return null;

  const onClick = async () => {
    const draft = {
      name: `${type.label} code`,
      qrType: type.key,
      destination: payload,
    };
    if (!session) {
      stashPendingCode(draft);
      navigate("/login?next=/dashboard");
      return;
    }
    setBusy(true);
    try {
      const code = await createCode(draft);
      navigate(`/dashboard/codes/${code.id}`);
    } catch (err) {
      message.error(err.message, 6);
      setBusy(false);
    }
  };

  return (
    <Card className="dynamic-code-panel" size="small">
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <Text strong>
          <ThunderboltOutlined /> Make it dynamic
        </Text>
        <ul className="dynamic-code-benefits">
          <li>
            <LineChartOutlined /> Count scans, unique visitors and see them by day
          </li>
          <li>
            <EditOutlined /> Change where the code points after printing
          </li>
        </ul>
        <Button type="primary" block onClick={onClick} disabled={!ready || !payload} loading={busy}>
          {session ? "Save as dynamic QR code" : "Sign in and save as dynamic"}
        </Button>
        <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
          {PLANS.free.maxActiveCodes} dynamic codes free, no card needed. The static
          code above stays free for ever.
        </Paragraph>
      </Space>
    </Card>
  );
};

export default DynamicCodePanel;
