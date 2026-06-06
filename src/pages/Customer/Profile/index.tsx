import React from 'react';
import { Typography, Input, Button, Form, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import './style.less';

const { Title } = Typography;

const CustomerProfile: React.FC = () => {
  const [form] = Form.useForm();
  const { currentUser } = useModel('useAuthModel');
  
  React.useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        name: currentUser.name || currentUser.full_name,
        phone: currentUser.phone
      });
    }
  }, [currentUser, form]);

  const handleUpdate = (values: any) => {
    if (!currentUser) return;
    const rawUsers = localStorage.getItem('users');
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      const index = users.findIndex((u: any) => u.phone === currentUser.phone);
      if (index > -1) {
        // check pass cu neu muon doi
        if (values.password) {
          if (values.oldPassword !== currentUser.password) {
            message.error('Mật khẩu cũ không chính xác!');
            return;
          }
          users[index].password = values.password;
        }

        users[index].full_name = values.name;
        users[index].name = values.name;
        localStorage.setItem('users', JSON.stringify(users));
        
        // update user hien tai
        const updatedUser = { ...currentUser, full_name: values.name, name: values.name };
        if (values.password) {
          updatedUser.password = values.password;
        }
        localStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
        
        message.success('Cập nhật thông tin thành công!');
        // xoa input pass sau khi luu
        form.setFieldsValue({ oldPassword: '', password: '' });
      } else {
        message.error('Không tìm thấy tài khoản để cập nhật!');
      }
    }
  };

  if (!currentUser) return null;

  return (
    <div className="profile-container">
      <Title level={4} className="profile-title">Hồ sơ của bạn</Title>
      
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Form.Item name="name" label="Tên hiển thị" rules={[{ required: true, message: 'Họ tên không được trống!' }]}>
          <Input prefix={<UserOutlined />} size="large" />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại">
          <Input prefix={<UserOutlined />} size="large" disabled />
        </Form.Item>
        
        <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Đổi mật khẩu</Title>
        <Form.Item name="oldPassword" label="Mật khẩu cũ">
          <Input.Password prefix={<LockOutlined />} size="large" placeholder="Nhập mật khẩu hiện tại..." />
        </Form.Item>
        <Form.Item 
          name="password" 
          label="Mật khẩu mới"
          rules={[
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: 'Mật khẩu phải từ 8 ký tự, gồm chữ hoa, chữ thường và số!' }
          ]}
        >
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
