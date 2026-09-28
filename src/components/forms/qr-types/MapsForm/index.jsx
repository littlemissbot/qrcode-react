import React from "react";
import { Form, Input, Card } from "antd";
import "./styles.css";

const MapsForm = () => {
  return (
    <Card className="maps-form">
      <Form.Item
        label="Address, place name or coordinates"
        name="location"
        tooltip="Anything you would type into the Google Maps search box"
        rules={[{ required: true, message: "Please input a location!" }]}
      >
        <Input
          size="large"
          placeholder="MG Road, Bengaluru  or  12.9716, 77.5946"
        />
      </Form.Item>
    </Card>
  );
};

export default MapsForm;
