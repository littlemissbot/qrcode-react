import React from "react";
import { Form, Input, InputNumber, Row, Col, Card } from "antd";
import "./styles.css";

const UpiForm = () => {
  return (
    <Card className="upi-form">
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="UPI ID"
            name="upiId"
            rules={[
              { required: true, message: "Please input your UPI ID!" },
              {
                pattern: /^[\w.-]{2,}@[a-zA-Z]{2,}$/,
                message: "Enter a UPI ID like name@bank",
              },
            ]}
          >
            <Input placeholder="yourname@okaxis" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Payee Name" name="payeeName">
            <Input placeholder="Your name or business name" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Amount (INR)"
            name="amount"
            tooltip="Leave empty to let the payer enter any amount"
          >
            <InputNumber
              min={1}
              precision={2}
              placeholder="Optional fixed amount"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Transaction Note" name="note">
            <Input placeholder="e.g. Invoice 1042" maxLength={50} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default UpiForm;
