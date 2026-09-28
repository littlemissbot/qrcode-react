import React, { useState } from "react";
import { Navigate, useSearchParams, Link } from "react-router-dom";
import { Card, Form, Input, Button, Typography, Result, Alert } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useAuth } from "../auth/AuthProvider";
import useSeo from "../hooks/useSeo";
import { PLANS } from "../qrTypes/registry.mjs";

const { Title, Paragraph } = Typography;

const safeNext = (value) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";

const Login = () => {
  const { enabled, session, signInWithEmail } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [sentTo, setSentTo] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useSeo({
    title: "Sign in to QRx",
    description: "Sign in to manage your dynamic QR codes and see scan analytics.",
    path: "/login",
    noindex: true,
  });

  if (!enabled) {
    return (
      <Result
        status="info"
        title="Dynamic QR codes are not enabled on this deployment"
        subTitle="The static generators work without an account. Ask the site owner to configure Supabase to turn on dynamic codes and scan analytics."
        extra={
          <Link to="/">
            <Button type="primary">Back to the generators</Button>
          </Link>
        }
      />
    );
  }

  if (session) return <Navigate to={next} replace />;

  if (sentTo) {
    return (
      <Result
        icon={<MailOutlined />}
        title="Check your email"
        subTitle={`We sent a sign-in link to ${sentTo}. Open it on this device to continue.`}
        extra={
          <Button onClick={() => setSentTo(null)}>Use a different email</Button>
        }
      />
    );
  }

  const onFinish = async ({ email }) => {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmail(email.trim(), next);
      setSentTo(email.trim());
    } catch (err) {
      setError(err.message || "Could not send the sign-in link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: "32px auto" }}>
      <Card>
        <Title level={1} style={{ fontSize: "1.5rem", marginTop: 0 }}>
          Sign in to QRx
        </Title>
        <Paragraph style={{ color: "#555" }}>
          No password needed. Enter your email and we will send you a one-time
          sign-in link. Your first {PLANS.free.maxActiveCodes} dynamic QR codes
          are free.
        </Paragraph>
        {error && (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
        )}
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "That does not look like an email address" },
            ]}
          >
            <Input size="large" placeholder="you@example.com" autoComplete="email" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
            Send sign-in link
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
