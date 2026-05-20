import React from 'react';
import { Form, Input, Button, Tabs, Typography } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import './style.less';

const { TabPane } = Tabs;
const { Text } = Typography;

const CustomerLogin: React.FC = () => {
  const { login, register } = useModel('useAuthModel');

  const onLogin = (values: any) => {
    if (login(values.phone, values.password)) {
      history.push('/customer/home');
    }
  };

  const onRegister = (values: any) => {
    if (register(values.name, values.phone, values.password)) {
      history.push('/customer/home');
    }
  };

  return (
    <div className="login-split-container">
      <div className="login-banner">
        <div className="banner-overlay">
          <h1>Cơm Rang 1307</h1>
          <p>Trải nghiệm đặt món nhanh chóng, tiện lợi. Hạt cơm giòn rụm, topping ngập tràn đang chờ đón bạn.</p>
        </div>
      </div>
      
      <div className="login-form-wrapper">
        <div className="form-container">
          <div className="logo-mobile">🍚 1307</div>
          <h2>Xin chào!</h2>
          <p className="subtitle">Vui lòng đăng nhập hoặc tạo tài khoản để đặt món.</p>

          <Tabs defaultActiveKey="1" size="large">
            <TabPane tab="Đăng nhập" key="1">
              <Form layout="vertical" onFinish={onLogin} size="large">
                <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                  <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>Đăng nhập ngay</Button>
                </Form.Item>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Text type="secondary" style={{ cursor: 'pointer' }} onClick={() => history.push('/customer/home')}>
                    Tiếp tục dưới tư cách Khách vãng lai
                  </Text>
                </div>
              </Form>
            </TabPane>
            <TabPane tab="Đăng ký" key="2">
              <Form layout="vertical" onFinish={onRegister} size="large">
                <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                  <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
                </Form.Item>
                <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                  <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>Tạo tài khoản</Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
