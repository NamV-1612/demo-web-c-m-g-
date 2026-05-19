import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import './style.less';

const { Title } = Typography;

const StaffLogin: React.FC = () => {
  const { login } = useModel('useAuthModel');

  const onFinish = (values: any) => {
    if (login(values.username, values.password)) {
      history.push('/staff/dashboard');
    }
  };

  return (
    <div className="staff-login-container">
      <Card className="login-card">
        <div className="header-text">
          <Title level={3}>ĐĂNG NHẬP POS</Title>
          <p>Dành riêng cho Nhân viên</p>
        </div>
        
        <Form name="staff_login" onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: 'Nhập SĐT / Username!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập (VD: staff)" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu (VD: staff)" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className="submit-btn">ĐĂNG NHẬP</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default StaffLogin;
