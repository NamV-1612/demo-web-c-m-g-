import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
  PieChartOutlined,
  AppstoreOutlined,
  ContainerOutlined,
  ContactsOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { history, useModel } from 'umi';
import './AdminLayout.less';

import AccountSettingsModal from '@/components/AccountSettingsModal';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = ({ children }) => {
  const { currentUser, logout } = useModel('useAuthModel');
  const [collapsed, setCollapsed] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);

  const handleMenuClick = ({ key }: { key: string }) => {
    history.push(key);
  };

  const handleLogout = () => {
    logout();
    history.push('/user/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => setIsAccountModalVisible(true)}>
        Cài đặt tài khoản
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="admin-layout-container">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="admin-sider"
        width={250}
      >
        <div className="admin-logo">
          <span className="logo-icon">🍗</span>
          {!collapsed && <span className="logo-text">Doki Admin</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[history.location.pathname]}
          onClick={handleMenuClick}
          className="admin-menu"
          items={[
            {
              key: '/admin/dashboard',
              icon: <PieChartOutlined />,
              label: 'Tổng quan',
            },
            {
              key: '/admin/menu',
              icon: <AppstoreOutlined />,
              label: 'Quản lý Thực đơn',
            },
            {
              key: '/admin/orders',
              icon: <ContainerOutlined />,
              label: 'Quản lý Đơn hàng',
            },
            {
              key: '/admin/promos',
              icon: <GiftOutlined />,
              label: 'Quản lý Mã Khuyến Mãi',
            },
            {
              key: '/admin/users',
              icon: <ContactsOutlined />,
              label: 'Quản lý Người dùng',
            },
          ]}
        />
      </Sider>
      
      <Layout className="site-layout">
        <Header className="admin-header">
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            })}
            <h2 className="header-title">Hệ thống Quản trị</h2>
          </div>
          <div className="header-right">
            <Dropdown overlay={userMenu} placement="bottomRight">
              <span className="user-dropdown-link" style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#BA1A21' }} icon={<UserOutlined />} />
                <span className="user-name" style={{ marginLeft: 8 }}>{currentUser?.full_name || 'Quản trị viên'}</span>
              </span>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="admin-content">
          {children}
        </Content>
      </Layout>

      <AccountSettingsModal 
        visible={isAccountModalVisible} 
        onClose={() => setIsAccountModalVisible(false)} 
      />
    </Layout>
  );
};

export default AdminLayout;
