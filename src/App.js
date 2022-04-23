import logo from './logo.svg';

import './App.css';
import 'antd/dist/antd.css';

import React, { useState } from 'react';
import QRCode from 'qrcode'

import { BarcodeOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Layout, Form, Input, InputNumber, Slider, Select, Button, Card, Spin, Row, Col } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const { Meta } = Card;
const { Option } = Select;
const LoaderTemplate = <LoadingOutlined style={{ fontSize: 32 }} spin />;

function App() {
  const [dataUrl, setDataUrl] = useState("https://samita.in/assets/image/samita-qrcode.png");
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    console.log('Success:', values);

    setLoading(true)
    const options = {
      type: values.optionImageType,
      quality: values.optionQuality,
      margin: values.optionMargin,
      color: {
        dark: values.optionDarkColor, // lines
        light: values.optionLightColor // background
      }
    }
    
    QRCode.toDataURL(values.dataUrl, options)
      .then(url => {
        setTimeout(() => {
          console.log(url)
          setDataUrl(url)
          setLoading(false)
        }, 3000)
      })
      .catch(err => {
        console.error(err)
      })
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className='App'>
      <Layout className='layout'>
        <Header className='header'>
          <img src={logo} alt="qrcodereact" className='logo' />
          QR Code Generator | React
        </Header>
        <Layout>
          <Content className='content'>
            <Card
              className='card'
            >
              <p>The Free QR Code Generator for High Quality QR Codes</p>
              <Form
                name="basic"
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                initialValues={{
                  optionImageType: "image/png",
                  optionMargin: 5,
                  optionQuality: 0.5,
                  optionDarkColor: "#000000",
                  optionLightColor: "#FFFFFF"
                }}
              >
                <Form.Item
                  label="Website URL"
                  name="dataUrl"
                  rules={[
                    {
                      required: true,
                      message: 'Please input a website url!',
                    },
                  ]}
                >
                  <Input placeholder="Website URL" size="large" />
                </Form.Item>
                <Form.Item
                  label="Image Type"
                  name="optionImageType">
                  <Select size="large">
                    <Option value="image/png">PNG</Option>
                    <Option value="image/jpeg">JPEG</Option>
                    <Option value="image/webp">WebP</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Margin"
                  name="optionMargin"
                >
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                  />
                </Form.Item>
                <Form.Item
                  label="Quality"
                  name="optionQuality"
                >
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </Form.Item>
                <br />
                <Row>
                  <Col flex={2}>
                    <Form.Item
                      label="Background Color"
                      name="optionDarkColor"
                      style={{ paddingRight: '15px' }}
                    >
                      <Input placeholder="Background Color" size="large" disabled />
                    </Form.Item>
                  </Col>
                  <Col flex={2}>
                    <Form.Item
                      label="QR Code Color"
                      name="optionLightColor"
                      style={{ paddingLeft: '15px' }}
                    >
                      <Input placeholder="QR Code Color" size="large" disabled />
                    </Form.Item>
                  </Col>
                </Row>
                <br/>
                <Form.Item>
                  <Button type="primary" block shape="round" icon={<BarcodeOutlined />} size="large" htmlType="submit">
                    Generate Code
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button shape="round" block icon={<DownloadOutlined />} size="large">
                    Download
                  </Button>
                </Form.Item>
              </Form>
            </Card>
            <Spin indicator={LoaderTemplate} spinning={loading}>
              <Card
                className='card'
                cover={<img alt="qrcode" src={dataUrl} />}
              >
                <Meta title="Samita Mondal" description="Professional website developer, based in Bangalore." />
              </Card>
            </Spin>
          </Content>
          <Sider className='sidebar'>
            <p>Advertisements</p>
          </Sider>
        </Layout>
        <Footer className='footer'>
          <p>&copy; Copyrights Samita M. All rights reserved.</p>
        </Footer>
      </Layout>
    </div>
  );
}

export default App;
