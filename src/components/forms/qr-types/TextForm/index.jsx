import React from "react";
import { Form, Input, Card } from "antd";
import "./styles.css";

const TextForm = () => {
  return (
    <Card className="text-form">
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
    </Card>
  );
};

export default TextForm;
