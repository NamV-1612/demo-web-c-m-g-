import React from 'react';
import { Layout, Badge, Menu, Button, Space } from 'antd';
import { ShoppingCartOutlined, HomeOutlined, UserOutlined, ClockCircleOutlined, LoginOutlined, ShoppingOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import './CustomerLayout.less';

const { Header, Content, Footer } = Layout;

const CustomerLayout: React.FC = ({ children }) => {
  const { cartCount } = useModel('useCartModel');
  const { currentUser, logout } = useModel('useAuthModel');

  // Menu mặc định cho Guest
  let menuItems = [
    { key: '/customer/home', icon: <HomeOutlined />, label: 'Trang chủ' },
    { key: '/login', icon: <LoginOutlined />, label: 'Đăng ký/Đăng nhập' },
  ];

  // Menu mở rộng cho User
  if (currentUser && currentUser.role === 'customer') {
    menuItems = [
      { key: '/customer/home', icon: <HomeOutlined />, label: 'Trang chủ' },
      { key: '/customer/cart', icon: <ShoppingCartOutlined />, label: <Badge count={cartCount} offset={[10, 0]}>Giỏ hàng</Badge> },
      { key: '/customer/history', icon: <ClockCircleOutlined />, label: 'Lịch sử' },
      { key: '/customer/profile', icon: <UserOutlined />, label: 'Hồ sơ' },
    ];
  }

  return (
    <Layout className="customer-layout">
      <Header className="premium-header">
        <div className="logo" onClick={() => history.push('/customer/home')}>
          🍚 CƠM RANG 1307
        </div>
        <div className="auth-buttons">
          {currentUser ? (
            <Button type="primary" danger onClick={() => { logout(); history.push('/customer/home'); }}>Đăng xuất</Button>
          ) : (
            <Button type="default" onClick={() => history.push('/login')}>Đăng nhập</Button>
          )}
        </div>
      </Header>
      
      <Content className="main-content">
        {children}
      </Content>

      <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f0f0f0', padding: '16px 50px' }}>
        <p style={{ marginBottom: 8 }}>Cơm Rang 1307 ©2026 Thực hiện bởi Nhóm 5</p>
        <Space>
          <a onClick={() => history.push('/staff/login')} style={{ color: '#8c8c8c', fontWeight: 500 }}>👨‍🍳 Cổng cho Đầu Bếp (Staff)</a>
          <span style={{ color: '#d9d9d9' }}>|</span>
          <a onClick={() => history.push('/user/login')} style={{ color: '#8c8c8c', fontWeight: 500 }}>👑 Cổng cho Quản Lý (Admin)</a>
        </Space>
      </Footer>

      {/* Menu dưới đáy cho Mobile */}
      <Footer className="glass-footer">
        <Menu 
          className="footer-menu"
          mode="horizontal" 
          selectedKeys={[history.location.pathname]} 
          onClick={(e) => history.push(e.key)}
          items={menuItems}
        />
      </Footer>
    </Layout>
  );
};

export default CustomerLayout;
