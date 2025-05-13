import React from "react";
import { Form, Input } from "antd";
import "./styles.css";

const UrlForm = () => {
  return (
    <div className="url-form">
      <Form.Item
        label="Website URL"
        name="dataUrl"
        rules={[
          {
            required: true,
            message: "Please input a website url!",
          },
          {
            pattern:
              /^(http(s):\/\/)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g,
            message:
              "Please enter valid url. Note it must be a secure url (https).",
          },
        ]}
      >
        <Input size="large" placeholder="https://example.com" />
      </Form.Item>
    </div>
  );
};

export default UrlForm;
