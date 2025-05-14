import React from "react";
import { Form, Input, Card } from "antd";
import "./styles.css";

const PhoneForm = () => {
  return (
    <Card className="phone-form">
      <Form.Item
        label="Phone Number"
        name="phone"
        rules={[
          {
            required: true,
            message: "Please input phone number!",
          },
          {
            pattern: /^\+?[\d\s-]+$/,
            message: "Please enter a valid phone number!",
          },
        ]}
      >
        <Input size="large" placeholder="+1234567890" />
      </Form.Item>
    </Card>
  );
};

export default PhoneForm;
