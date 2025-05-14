import React from "react";
import { Form, Input, Row, Col, Card } from "antd";
import "./styles.css";

const EmailForm = () => {
  return (
    <Card className="email-form" style={{ marginTop: 32 }}>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please input email address!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Subject" name="subject">
            <Input placeholder="Email Subject" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Message" name="body">
        <Input.TextArea placeholder="Email Body" rows={4} />
      </Form.Item>
    </Card>
  );
};

export default EmailForm;
