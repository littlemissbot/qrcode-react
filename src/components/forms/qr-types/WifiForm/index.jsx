import React from "react";
import { Form, Input, Select, Row, Col, Card } from "antd";
import "./styles.css";

const { Option } = Select;

const WifiForm = () => {
  return (
    <Card className="wifi-form" style={{ marginTop: 32 }}>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Network Name (SSID)"
            name="ssid"
            rules={[{ required: true, message: "Please input network name!" }]}
          >
            <Input placeholder="Network Name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input password!" }]}
          >
            <Input.Password placeholder="Network Password" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Encryption Type"
            name="encryption"
            initialValue="WPA"
          >
            <Select>
              <Option value="WPA">WPA/WPA2</Option>
              <Option value="WEP">WEP</Option>
              <Option value="nopass">No Password</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Hidden Network"
            name="hidden"
            valuePropName="checked"
            initialValue={false}
          >
            <Select>
              <Option value={false}>No</Option>
              <Option value={true}>Yes</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default WifiForm;
