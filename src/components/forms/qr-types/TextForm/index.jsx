import React from "react";
import { Form, Input } from "antd";
import "./styles.css";

const TextForm = () => {
  return (
    <div className="text-form">
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
    </div>
  );
};

export default TextForm;
