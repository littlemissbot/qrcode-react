import "./App.css";
import QrCode from "./qrcode.png";

import React, { useState } from "react";
import QRCode from "qrcode";

import {
  BarcodeOutlined,
  DownloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  ConfigProvider,
  theme,
  Layout,
  Form,
  Input,
  InputNumber,
  Slider,
  Select,
  Button,
  Card,
  Spin,
  Row,
  Col,
  Typography,
  ColorPicker,
} from "antd";
const { Header, Footer, Sider, Content } = Layout;
const { Meta } = Card;
const { Option } = Select;
const { Title } = Typography;

const LoaderTemplate = <LoadingOutlined style={{ fontSize: 32 }} spin />;

function App() {
  const [dataUrl, setDataUrl] = useState(QrCode);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    console.log("Success:", values);

    setLoading(true);
    const options = {
      version: values.optionVersion,
      type: values.optionImageType,
      quality: values.optionQuality,
      margin: values.optionMargin,
      color: {
        dark:
          typeof values.optionDarkColor === "string"
            ? values.optionDarkColor
            : values.optionDarkColor.toHexString(), // lines
        light:
          typeof values.optionLightColor === "string"
            ? values.optionLightColor
            : values.optionLightColor.toHexString(), // background
      },
      scale: values.optionScale,
      maskPattern: values.optionMaskPattern,
      width: values.optionWidth,
    };

    QRCode.toDataURL(values.dataUrl, options)
      .then((url) => {
        setTimeout(() => {
          console.log(url);
          setDataUrl(url);
          setLoading(false);
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const isValidURL = (str) => {
    if (
      /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(
        str
      )
    ) {
      return true;
    } else {
      return false;
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onDownloadImage = (uri, name) => {
    var link = document.createElement("a");
    link.download = "qrcode";
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="App">
      <ConfigProvider
        theme={{
          token: {
            // Seed Token
            colorPrimary: "#a0d911",
            borderRadius: 8,

            // Alias Token
            colorBgContainer: "#fcffe6",
          },
          algorithm: theme.lightAlgorithm,
        }}
      >
        <Layout className="layout">
          <Header className="header">
            <Title level={4} className="projecttitle">
              QR Code Generator <small>Powered By Samita Mondal</small>
            </Title>
          </Header>
          <Layout>
            <Content className="content">
              <Card className="card">
                <Form
                  name="basic"
                  layout="vertical"
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                  initialValues={{
                    optionImageType: "image/png",
                    optionMargin: 2,
                    optionQuality: 1,
                    optionDarkColor: "#a0d911",
                    optionLightColor: "#fcffe6",
                    optionMaskPattern: 2,
                    optionWidth: 600,
                  }}
                >
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
                    <Input placeholder="Website URL" size="large" />
                  </Form.Item>
                  <Form.Item label="Image Type" name="optionImageType">
                    <Select size="large">
                      <Option value="image/png">PNG</Option>
                      <Option value="image/jpeg">JPEG</Option>
                      <Option value="image/webp">WebP</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Margin" name="optionMargin">
                    <Slider min={1} max={20} step={1} />
                  </Form.Item>
                  <Form.Item label="Quality" name="optionQuality">
                    <Slider min={0} max={1} step={0.1} />
                  </Form.Item>
                  <br />
                  <Row>
                    <Col flex={2}>
                      <Form.Item
                        label="QR Code Color (HEX)"
                        name="optionDarkColor"
                        style={{ paddingRight: "15px" }}
                      >
                        <ColorPicker showText />
                      </Form.Item>
                    </Col>
                    <Col flex={2}>
                      <Form.Item
                        label="Background Color (HEX)"
                        name="optionLightColor"
                        style={{ paddingLeft: "15px" }}
                      >
                        <ColorPicker showText />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row>
                    <Col flex={2}>
                      <Form.Item
                        label="Mask Pattern"
                        name="optionMaskPattern"
                        style={{ paddingRight: "15px" }}
                      >
                        <InputNumber
                          min={0}
                          max={7}
                          placeholder="Mask Pattern"
                          size="large"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col flex={2}>
                      <Form.Item
                        label="Width (px)"
                        name="optionWidth"
                        style={{ paddingLeft: "15px" }}
                      >
                        <InputNumber
                          min={200}
                          max={1200}
                          placeholder="Width"
                          size="large"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* <Row>
                    <Col flex={2}>
                      <Form.Item
                        label="Version"
                        name="optionVersion"
                        style={{ paddingRight: "15px" }}
                      >
                        <InputNumber
                          min={1}
                          max={40}
                          placeholder="Version"
                          size="large"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col flex={2}>
                      <Form.Item
                        label="Scale (px)"
                        name="optionScale"
                        style={{ paddingLeft: "15px" }}
                      >
                        <InputNumber
                          min={1}
                          max={40}
                          placeholder="Scale"
                          size="large"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row> */}
                  <br />
                  <Form.Item>
                    <Button
                      type="primary"
                      block
                      shape="round"
                      icon={<BarcodeOutlined />}
                      size="large"
                      htmlType="submit"
                    >
                      Generate Code
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      shape="round"
                      block
                      icon={<DownloadOutlined />}
                      size="large"
                      onClick={onDownloadImage}
                      disabled={
                        dataUrl ===
                        "https://samita.in/assets/image/samita-qrcode.png"
                      }
                    >
                      Download
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
              <Spin indicator={LoaderTemplate} spinning={loading}>
                <Card
                  className="card"
                  cover={<img alt="qrcode" src={dataUrl} />}
                >
                  <Meta
                    title="Samita Mondal"
                    description="Professional website developer, based in Bangalore."
                  />
                </Card>
              </Spin>
            </Content>
            {/* <Sider className="sidebar">
            <p>Advertisements</p>
          </Sider> */}
          </Layout>
          {/* <Footer className='footer'>
          <p>&copy; Copyrights Samita M. All rights reserved.</p>
        </Footer> */}
        </Layout>
      </ConfigProvider>
    </div>
  );
}

export default App;
