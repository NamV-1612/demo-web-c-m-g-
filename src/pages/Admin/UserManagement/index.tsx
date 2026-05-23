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

  const loadUsers = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    loadUsers();
    window.addEventListener('storage', loadUsers);
    return () => window.removeEventListener('storage', loadUsers);
  }, []);

  const toggleBan = (id: string, isBanned: boolean) => {
    const rawUsers = getUsers();
    const index = rawUsers.findIndex(u => u.id === id);
    if (index > -1) {
      const targetUser = rawUsers[index];
      if (targetUser.role?.toUpperCase() === 'ADMIN') {
        message.error('Không thể khóa tài khoản Admin!');
        return;
      }
      
      rawUsers[index].status = isBanned ? 'LOCKED' : 'ACTIVE';
      updateUsers(rawUsers);
      loadUsers(); // refresh local state
      message.success(isBanned ? `Đã khóa tài khoản của ${targetUser.name}!` : `Đã mở khóa tài khoản của ${targetUser.name}!`);
    }
  };

  const handleAddStaff = (values: any) => {
    const rawUsers = getUsers();
    const cleanPhone = values.phone.trim();
    if (rawUsers.find(u => u.phone === cleanPhone)) {
      message.error('Số điện thoại (Tên đăng nhập) này đã tồn tại!');
      return;
    }
    
    const newStaff: User = {
      id: 's' + Date.now(),
      name: values.name.trim(),
      phone: cleanPhone,
      password: values.password,
      role: 'STAFF',
      status: 'ACTIVE'
    };
    
    rawUsers.push(newStaff);
    updateUsers(rawUsers);
    loadUsers(); // refresh local state
    setIsModalVisible(false);
    message.success('Đã cấp phát tài khoản Nhân viên mới thành công!');
  };

  const columns = [
    { 
      title: 'Họ tên', 
      key: 'fullName',
      render: (_: any, record: User) => {
        // Khách hàng lưu họ tên ở full_name, Staff lưu ở name
        const fullName = record.role?.toUpperCase() === 'CUSTOMER' ? record.full_name : record.name;
        return <span>{fullName}</span>;
      },
      sorter: (a: User, b: User) => {
        const nameA = (a.role?.toUpperCase() === 'CUSTOMER' ? a.full_name : a.name) || '';
        const nameB = (b.role?.toUpperCase() === 'CUSTOMER' ? b.full_name : b.name) || '';
        return nameA.localeCompare(nameB);
      }
    },
    { 
      title: 'Tên đăng nhập', 
      key: 'username',
      render: (_: any, record: User) => {
        // Khách hàng lưu username ở name, Staff lưu ở phone
        const username = record.role?.toUpperCase() === 'CUSTOMER' ? record.name : record.phone;
        return <strong>{username}</strong>;
      }
    },
    { 
      title: 'Vai trò', 
      dataIndex: 'role', 
      render: (role: string) => {
        const r = role?.toUpperCase();
        const color = r === 'ADMIN' ? 'purple' : r === 'STAFF' ? 'blue' : 'orange';
        const label = r === 'ADMIN' ? 'Quản trị viên' : r === 'STAFF' ? 'Nhân viên bếp' : 'Khách hàng';
        return <Tag color={color}>{label}</Tag>;
      },
      filters: [
        { text: 'Quản trị viên', value: 'ADMIN' },
        { text: 'Nhân viên bếp', value: 'STAFF' },
        { text: 'Khách hàng', value: 'CUSTOMER' },
      ],
      onFilter: (value: any, record: User) => record.role?.toUpperCase() === value
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (status: string) => {
        const s = status?.toUpperCase() || 'ACTIVE';
        const color = s === 'ACTIVE' ? 'green' : 'red';
        const label = s === 'ACTIVE' ? 'Đang hoạt động' : 'Bị Khóa';
        return <Tag color={color}>{label}</Tag>;
      },
      filters: [
        { text: 'Đang hoạt động', value: 'ACTIVE' },
        { text: 'Bị Khóa', value: 'LOCKED' },
      ],
      onFilter: (value: any, record: User) => (record.status?.toUpperCase() || 'ACTIVE') === value
    },
    {
      title: 'Hành động',
      render: (_: any, record: User) => {
        const r = record.role?.toUpperCase();
        const s = record.status?.toUpperCase() || 'ACTIVE';
        if (r === 'ADMIN') return null; // No actions for Admin
        return (
          <Space>
            {s === 'ACTIVE' ? (
              <Popconfirm 
                title={`Bạn có chắc muốn KHÓA tài khoản của ${record.name}?`} 
                onConfirm={() => toggleBan(record.id, true)}
                okText="Khóa tài khoản"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<StopOutlined />} size="small">Khóa tài khoản</Button>
              </Popconfirm>
            ) : (
              <Button 
                type="primary" 
                icon={<SafetyOutlined />} 
                size="small" 
                style={{ background: '#52c41a', borderColor: '#52c41a' }} 
                onClick={() => toggleBan(record.id, false)}
              >
                Mở khóa
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="admin-page" style={{ padding: 24 }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Quản lý Người dùng & Nhân sự</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => { form.resetFields(); setIsModalVisible(true); }}
          style={{ background: '#BA1A21', borderColor: '#BA1A21' }}
        >
          Cấp tài khoản Nhân viên (Staff)
        </Button>
      </div>
      <Table columns={columns} dataSource={users} rowKey="id" pagination={{ pageSize: 10 }} />

      <Modal 
        title="Cấp phát tài khoản Nhân viên (Staff)" 
        visible={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        onOk={() => form.submit()}
        okText="Tạo tài khoản"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#BA1A21', borderColor: '#BA1A21' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddStaff}>
          <Form.Item 
            name="name" 
            label="Họ tên Nhân viên" 
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="VD: Nguyễn Văn Hùng" />
          </Form.Item>
          <Form.Item 
            name="phone" 
            label="Tên đăng nhập (Số điện thoại)" 
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9A-Za-z]+$/, message: 'Chỉ chứa số hoặc chữ viết liền không dấu!' }
            ]}
          >
            <Input placeholder="VD: 0912345678 hoặc STAFF2" />
          </Form.Item>
          <Form.Item 
            name="password" 
            label="Mật khẩu khởi tạo" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu khởi tạo!' }]}
          >
            <Input.Password placeholder="VD: 123456" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
