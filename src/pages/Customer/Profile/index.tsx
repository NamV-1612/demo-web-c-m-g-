import React from 'react';
import { Typography, Input, Button, Form, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import './style.less';

const { Title } = Typography;

const CustomerProfile: React.FC = () => {
  const [form] = Form.useForm();
  const { currentUser } = useModel('useAuthModel');
  
  const handleUpdate = (values: any) => {
    message.success('Cập nhật thông tin thành công!');
  };

  if (!currentUser) return null;

  return (
    <div className="profile-container">
      <Title level={4} className="profile-title">Hồ sơ của bạn</Title>
      
      <Form form={form} layout="vertical" onFinish={handleUpdate} initialValues={{ name: currentUser.name, phone: currentUser.phone }}>
        <Form.Item name="name" label="Tên hiển thị">
          <Input prefix={<UserOutlined />} size="large" />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại">
          <Input prefix={<UserOutlined />} size="large" disabled />
        </Form.Item>
        <Form.Item name="password" label="Đổi mật khẩu">
          <Input.Password prefix={<LockOutlined />} size="large" placeholder="Nhập mật khẩu mới..." />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block className="save-btn">
          LƯU THAY ĐỔI
        </Button>
      </Form>
    </div>
  );
};

export default CustomerProfile;
