import React from "react";
import { Form, Select } from "antd";

const { Option } = Select;

const QRCodeTypeSelector = () => {
  return (
    <Form.Item
      label="QR Code Type"
      name="qrType"
      rules={[
        {
          required: true,
          message: "Please select QR code type!",
        },
      ]}
    >
      <Select size="large">
        <Option value="url">Website URL</Option>
        <Option value="vcard">vCard</Option>
        <Option value="wifi">WiFi</Option>
        <Option value="email">Email</Option>
        <Option value="sms">SMS</Option>
        <Option value="phone">Phone Number</Option>
        <Option value="text">Plain Text</Option>
      </Select>
    </Form.Item>
  );
};

export default QRCodeTypeSelector;
