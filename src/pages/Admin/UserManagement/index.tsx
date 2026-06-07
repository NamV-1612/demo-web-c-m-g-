import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message, Popconfirm, Form, Input, Tooltip } from 'antd';
import { StopOutlined, SafetyOutlined, PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
    // doi sang call api that roi
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
      loadUsers(); // load lai api
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
      loadUsers(); // load lai list
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
      password: '' // ko hien pass cu
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
      align: 'center',
      render: (role: string) => {
        const r = role?.toUpperCase();
        const isAdmin = r === 'ADMIN';
        const isStaff = r === 'STAFF';
        
        let customStyle: React.CSSProperties = { borderRadius: '12px', padding: '2px 12px', fontWeight: 600, fontSize: '13px', border: '1px solid' };
        if (isAdmin) {
          customStyle = { ...customStyle, background: '#f9f0ff', color: '#531dab', borderColor: '#d3adf7' }; // tim
        } else if (isStaff) {
          customStyle = { ...customStyle, background: '#e6f7ff', color: '#0958d9', borderColor: '#91caff' }; // xanh
        } else {
          customStyle = { ...customStyle, background: '#fff2e8', color: '#D53E0F', borderColor: '#ffbb96' }; // cam
        }

        const label = isAdmin ? 'Quản trị viên' : isStaff ? 'Nhân viên bếp' : 'Khách hàng';
        return <Tag style={customStyle}>{label}</Tag>;
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
      align: 'center',
      render: (status: string) => {
        const s = status?.toUpperCase() || 'ACTIVE';
        const isActive = s === 'ACTIVE';
        const customStyle: React.CSSProperties = {
          borderRadius: '12px',
          padding: '2px 12px',
          fontWeight: 600,
          fontSize: '13px',
          border: '1px solid',
          background: isActive ? '#f6ffed' : '#fff2f0',
          color: isActive ? '#389e0d' : '#cf1322',
          borderColor: isActive ? '#b7eb8f' : '#ffa39e'
        };
        const label = isActive ? 'Đang hoạt động' : 'Bị Khóa';
        return <Tag style={customStyle}>{label}</Tag>;
      },
      filters: [
        { text: 'Đang hoạt động', value: 'ACTIVE' },
        { text: 'Bị Khóa', value: 'LOCKED' },
      ],
      onFilter: (value: any, record: User) => (record.status?.toUpperCase() || 'ACTIVE') === value
    },
    {
      title: 'Hành động',
      align: 'center',
      render: (_: any, record: User) => {
        const r = record.role?.toUpperCase();
        const s = record.status?.toUpperCase() || 'ACTIVE';
        if (r === 'ADMIN') return null; // admin thi ko lam gi
        return (
          <Space size="small">
            {r === 'STAFF' && (
              <Tooltip title="Sửa nhân viên">
                <Button type="text" icon={<EditOutlined style={{ color: '#262626', fontSize: 16 }} />} onClick={() => handleEditUser(record)} />
              </Tooltip>
            )}
            {s === 'ACTIVE' ? (
              <Popconfirm 
                title={`Bạn có chắc muốn KHÓA tài khoản của ${record.name}?`} 
                onConfirm={() => toggleBan(record.id!, true)}
                okText="Khóa tài khoản"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Khóa tài khoản">
                  <Button type="primary" shape="circle" icon={<StopOutlined style={{ fontSize: 16, color: '#fff' }} />} style={{ background: '#262626', borderColor: '#262626' }} />
                </Tooltip>
              </Popconfirm>
            ) : (
              <Tooltip title="Mở khóa tài khoản">
                <Button 
                  type="text" 
                  icon={<SafetyOutlined style={{ fontSize: 16 }} />} 
                  style={{ color: '#52c41a' }} 
                  onClick={() => toggleBan(record.id!, false)}
                />
              </Tooltip>
            )}
            <Popconfirm 
              title={`Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản này?`} 
              onConfirm={() => handleDeleteUser(record.id!)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa tài khoản">
                <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 16 }} />} />
              </Tooltip>
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
          <Input 
            placeholder="Tìm theo Tên, Username hoặc SĐT..." 
            allowClear 
            onChange={(e: any) => setSearchText(e.target.value)}
            prefix={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 16, marginRight: 6 }} />}
            style={{ 
              width: 320, 
              borderRadius: 24, 
              padding: '6px 20px',
              border: '1px solid #d9d9d9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              fontSize: 14
            }} 
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => { setEditingUserId(null); form.resetFields(); setIsModalVisible(true); }}
            style={{ background: '#D53E0F', borderColor: '#D53E0F' }}
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
