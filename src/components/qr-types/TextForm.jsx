import React from "react";
import { Form, Input } from "antd";

const TextForm = () => {
  return (
    <Form.Item
      label="Text"
      name="text"
      rules={[
        {
          required: true,
          message: "Please input text!",
        },
      ]}
    >
      <Input.TextArea
        size="large"
        placeholder="Enter your text here"
        rows={4}
      />
    </Form.Item>
  );
};

export default TextForm;
