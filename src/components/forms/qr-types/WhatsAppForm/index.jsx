import React from "react";
import { Form, Input, Row, Col, Card } from "antd";
import "./styles.css";

const WhatsAppForm = () => {
  return (
    <Card className="whatsapp-form">
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="WhatsApp Number"
            name="phone"
            tooltip="Include the country code, e.g. +91 for India"
            rules={[
              { required: true, message: "Please input your WhatsApp number!" },
              {
                pattern: /^\+?[\d\s-]{8,}$/,
                message: "Please enter a valid phone number with country code!",
              },
            ]}
          >
            <Input placeholder="+91 98765 43210" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Pre-filled Message" name="message">
            <Input.TextArea
              placeholder="Hi! I'd like to know more about..."
              rows={4}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default WhatsAppForm;
