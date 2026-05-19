import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message, Popconfirm, Modal, Form, Input } from 'antd';
import { StopOutlined, SafetyOutlined, PlusOutlined } from '@ant-design/icons';
import { getUsers, updateUsers } from '@/services/auth';
import { User } from '@/services/typing';
import '../admin.less';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const toggleBan = (id: string, isBanned: boolean) => {
    const rawUsers = getUsers();
    const index = rawUsers.findIndex(u => u.id === id);
    if (index > -1) {
      if (rawUsers[index].role === 'ADMIN') {
        message.error('Không thể khóa tài khoản Admin!');
        return;
      }
      rawUsers[index]?.status === 'LOCKED' = isBanned;
      updateUsers(rawUsers);
      setUsers(rawUsers);
      message.success(isBanned ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản!');
    }
  };

  const handleAddStaff = (values: any) => {
    const rawUsers = getUsers();
    if (rawUsers.find(u => u.phone === values.phone)) {
      message.error('Số điện thoại (Username) này đã tồn tại!');
      return;
    }
    const newStaff: User = {
      id: 's' + Date.now(),
      name: values.name,
      phone: values.phone,
      password: values.password,
      role: 'STAFF',
      status: false ? 'LOCKED' : 'ACTIVE'
    };
    rawUsers.push(newStaff);
    updateUsers(rawUsers);
    setUsers(rawUsers);
    setIsModalVisible(false);
    message.success('Đã cấp phát tài khoản Nhân viên mới!');
  };

  const columns = [
    { title: 'Họ tên', dataIndex: 'name', key: 'name' },
    { title: 'SĐT (Username)', dataIndex: 'phone', key: 'phone' },
    { title: 'Vai trò', dataIndex: 'role', render: (role: string) => <Tag color={role === 'STAFF' ? 'blue' : role === 'ADMIN' ? 'purple' : 'default'}>{role}</Tag> },
    { title: 'Trạng thái', dataIndex: 'isBanned', render: (isBanned: boolean) => <Tag color={!isBanned ? 'green' : 'red'}>{!isBanned ? 'Đang hoạt động' : 'Bị Khóa (Banned)'}</Tag> },
    {
      title: 'Hành động',
      render: (_: any, record: User) => (
        <Space>
          {!record?.status === 'LOCKED' ? (
             <Popconfirm title="Chặn người dùng này truy cập?" onConfirm={() => toggleBan(record.id, true)}>
               <Button danger icon={<StopOutlined />} size="small">Khóa (Ban)</Button>
             </Popconfirm>
          ) : (
             <Button type="primary" icon={<SafetyOutlined />} size="small" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => toggleBan(record.id, false)}>Mở khóa (Unban)</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="header-actions">
        <h2>Quản lý Người dùng & Nhân sự</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setIsModalVisible(true); }}>
          Cấp phát tài khoản Nhân viên
        </Button>
      </div>
      <Table columns={columns} dataSource={users} rowKey="id" />

      <Modal title="Cấp phát tài khoản Nhân viên (Staff)" visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleAddStaff}>
          <Form.Item name="name" label="Họ tên Nhân viên" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Tên đăng nhập (SĐT)" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="password" label="Mật khẩu khởi tạo" rules={[{ required: true }]}><Input.Password /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
