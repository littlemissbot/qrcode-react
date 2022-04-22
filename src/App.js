import logo from './logo.svg';
import './App.css';
import 'antd/dist/antd.css';

import { Layout, Form, Input, Button, Card } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const { Meta } = Card;

function App() {
  const onFinish = (values) => {
    console.log('Success:', values);
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
          <Sider className='sidebar'>
            <Form
              name="basic"
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  {
                    required: true,
                    message: 'Please input your username!',
                  },
                ]}
              >
                <Input placeholder="Username" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Please input your password!',
                  },
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>

              <Form.Item
              >
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Sider>
          <Content className='content'>
            <Card
              hoverable
              style={{ width: 300 }}
              cover={<img alt="example" src="https://samita.in/assets/image/samita-qrcode.png" />}
            >
              <Meta title="Samita Mondal" description="https://samita.in/" />
            </Card>
          </Content>
        </Layout>
        <Footer className='footer'>
          <p>&copy; Copyrights Samita M. All rights reserved.</p>
        </Footer>
      </Layout>
    </div>
  );
}

export default App;
