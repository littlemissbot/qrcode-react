import React from "react";
import {
  Form,
  Input,
  Button,
  Space,
  Select,
  Row,
  Col,
  Divider,
  Typography,
  Card,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import "./styles.css";

const { Option } = Select;
const { Title } = Typography;

const VCardForm = ({ form }) => {
  return (
    <Card className="vcard-form">
      <Title level={5} style={{ marginTop: 0 }}>
        Basic Info
      </Title>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Please input first name!" }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please input last name!" }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="Organization" name="organization">
            <Input placeholder="Organization" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Job Title" name="jobTitle">
            <Input placeholder="Job Title" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Contact</Divider>
      <Row gutter={16}>
        <Col xs={24} sm={24}>
          <Form.List name="phones">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "type"]}
                      rules={[{ required: true, message: "Missing type" }]}
                    >
                      <Select style={{ width: 120 }} placeholder="Type">
                        <Option value="mobile">Mobile</Option>
                        <Option value="work">Work</Option>
                        <Option value="home">Home</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "number"]}
                      rules={[{ required: true, message: "Missing number" }]}
                    >
                      <Input placeholder="Phone Number" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Phone
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={24}>
          <Form.List name="emails">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "type"]}
                      rules={[{ required: true, message: "Missing type" }]}
                    >
                      <Select style={{ width: 120 }} placeholder="Type">
                        <Option value="work">Work</Option>
                        <Option value="personal">Personal</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "address"]}
                      rules={[
                        { required: true, message: "Missing email" },
                        { type: "email", message: "Invalid email" },
                      ]}
                    >
                      <Input placeholder="Email Address" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Email
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Col>
      </Row>

      <Form.Item label="Website" name="website">
        <Input placeholder="Website URL" />
      </Form.Item>

      <Divider orientation="left">Address</Divider>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="Street" name={["address", "street"]}>
            <Input placeholder="Street Address" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="City" name={["address", "city"]}>
            <Input placeholder="City" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item label="State" name={["address", "state"]}>
            <Input placeholder="State" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Postal Code" name={["address", "postalCode"]}>
            <Input placeholder="Postal Code" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Country" name={["address", "country"]}>
            <Input placeholder="Country" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Notes</Divider>
      <Form.Item label="Notes" name="notes">
        <Input.TextArea placeholder="Additional Notes" />
      </Form.Item>
    </Card>
  );
};

export default VCardForm;
