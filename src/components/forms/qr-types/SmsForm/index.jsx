import React from "react";
import { Form, Input, Row, Col } from "antd";
import "./styles.css";

const SmsForm = () => {
  return (
    <div className="sms-form">
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: true, message: "Please input phone number!" },
              {
                pattern: /^\+?[\d\s-]+$/,
                message: "Please enter a valid phone number!",
              },
            ]}
          >
            <Input placeholder="+1234567890" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Message" name="message">
            <Input.TextArea placeholder="SMS Message" rows={4} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default SmsForm;
