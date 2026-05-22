import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
  BarChartOutlined,
  CoffeeOutlined,
  TableOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  TagOutlined
} from '@ant-design/icons';
import { history, useModel } from 'umi';
import './AdminLayout.less';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = ({ children }) => {
  const { currentUser, logout } = useModel('useAuthModel');
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = ({ key }: { key: string }) => {
    history.push(key);
  };

  const handleLogout = () => {
    logout();
    history.push('/user/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Hồ sơ cá nhân
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
          <span className="logo-icon">Bếp</span>
          {!collapsed && <span className="logo-text">Hoa Admin</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[history.location.pathname]}
          onClick={handleMenuClick}
          className="admin-menu"
          items={[
            {
              key: '/admin/dashboard',
              icon: <BarChartOutlined />,
              label: 'Tổng quan',
            },
            {
              key: '/admin/menu',
              icon: <CoffeeOutlined />,
              label: 'Quản lý Thực đơn',
            },
            {
              key: '/admin/orders',
              icon: <TableOutlined />,
              label: 'Quản lý Đơn hàng',
            },
            {
              key: '/admin/promos',
              icon: <TagOutlined />,
              label: 'Quản lý Mã Khuyến Mãi',
            },
            {
              key: '/admin/users',
              icon: <TeamOutlined />,
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
              <span className="user-dropdown-link">
                <Avatar style={{ backgroundColor: '#BA1A21' }} icon={<UserOutlined />} />
                <span className="user-name">{currentUser?.full_name || 'Quản trị viên'}</span>
              </span>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="admin-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
