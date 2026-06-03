import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message, Popconfirm, Form, Input } from 'antd';
import { StopOutlined, SafetyOutlined, PlusOutlined } from '@ant-design/icons';
import { getUsers, createStaff, toggleUserStatus, updateUser, deleteUser } from '@/services/auth';
import { User } from '@/services/typing';
import '../admin.less';
import UserModal from './components/UserModal';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const loadUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    // Bỏ event listener storage vì giờ gọi API thật
  }, []);

  const toggleBan = async (id: string, isBanned: boolean) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser?.role?.toUpperCase() === 'ADMIN') {
      message.error('Không thể khóa tài khoản Admin!');
      return;
    }
    
    setLoading(true);
    const res = await toggleUserStatus(id, isBanned);
    if (res.success) {
      message.success(isBanned ? `Đã khóa tài khoản!` : `Đã mở khóa tài khoản!`);
      loadUsers(); // Refresh từ server
    } else {
      message.error(res.message);
      setLoading(false);
    }
  };

  const handleAddStaff = async (values: any) => {
    const cleanPhone = values.phone.trim();
    
    setLoading(true);
    let res;
    
    if (editingUserId) {
      res = await updateUser(editingUserId, {
        name: values.name.trim(),
        phone: cleanPhone,
        ...(values.password ? { password: values.password } : {})
      });
    } else {
      res = await createStaff({
        name: values.name.trim(),
        phone: cleanPhone,
        password: values.password,
        role: 'STAFF',
        status: 'ACTIVE'
      });
    }
    
    if (res.success) {
      message.success(editingUserId ? 'Đã cập nhật thông tin tài khoản!' : 'Đã cấp phát tài khoản Nhân viên mới thành công!');
      setIsModalVisible(false);
      setEditingUserId(null);
      form.resetFields();
      loadUsers(); // Tải lại danh sách
    } else {
      message.error(res.message);
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    const res = await deleteUser(id);
    if (res.success) {
      message.success('Đã xóa tài khoản!');
      loadUsers();
    } else {
      message.error(res.message);
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id || null);
    form.setFieldsValue({
      name: user.full_name || user.name,
      phone: user.phone,
      password: '' // Không hiện password cũ
    });
    setIsModalVisible(true);
  };

  const columns = [
    { 
      title: 'Họ tên', 
      key: 'fullName',
      render: (_: any, record: User) => {
        return <span>{record.full_name || record.name}</span>;
      },
      sorter: (a: User, b: User) => {
        const nameA = a.full_name || a.name || '';
        const nameB = b.full_name || b.name || '';
        return nameA.localeCompare(nameB);
      }
    },
    { 
      title: 'Tên đăng nhập', 
      key: 'username',
      render: (_: any, record: User) => {
        return <strong>{record.name}</strong>;
      }
    },
    { 
      title: 'Số điện thoại', 
      key: 'phone',
      render: (_: any, record: User) => {
        return <span>{record.phone}</span>;
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
            <Button size="small" onClick={() => handleEditUser(record)}>Sửa</Button>
            {s === 'ACTIVE' ? (
              <Popconfirm 
                title={`Bạn có chắc muốn KHÓA tài khoản của ${record.name}?`} 
                onConfirm={() => toggleBan(record.id!, true)}
                okText="Khóa tài khoản"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<StopOutlined />} size="small">Khóa</Button>
              </Popconfirm>
            ) : (
              <Button 
                type="primary" 
                icon={<SafetyOutlined />} 
                size="small" 
                style={{ background: '#52c41a', borderColor: '#52c41a' }} 
                onClick={() => toggleBan(record.id!, false)}
              >
                Mở khóa
              </Button>
            )}
            <Popconfirm 
              title={`Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản này?`} 
              onConfirm={() => handleDeleteUser(record.id!)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger size="small">Xóa</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="admin-page" style={{ padding: 24 }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Quản lý Người dùng & Nhân sự</h2>
        <Space>
          <Input.Search 
            placeholder="Tìm theo Tên, Username hoặc SĐT..." 
            allowClear 
            onSearch={setSearchText} 
            onChange={(e: any) => setSearchText(e.target.value)}
            style={{ width: 300 }} 
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => { setEditingUserId(null); form.resetFields(); setIsModalVisible(true); }}
            style={{ background: '#BA1A21', borderColor: '#BA1A21' }}
          >
            Cấp tài khoản Nhân viên (Staff)
          </Button>
        </Space>
      </div>
      <Table 
        columns={columns} 
        dataSource={users.filter((u: User) => 
          (u.name || '').toLowerCase().includes(searchText.toLowerCase()) || 
          (u.full_name || '').toLowerCase().includes(searchText.toLowerCase()) || 
          (u.phone || '').toLowerCase().includes(searchText.toLowerCase())
        )} 
        rowKey="id" 
        pagination={{ pageSize: 10 }} 
        loading={loading}
      />

      <UserModal 
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleAddStaff}
        form={form}
        loading={loading}
        isEdit={!!editingUserId}
      />
    </div>
  );
};

export default UserManagement;
