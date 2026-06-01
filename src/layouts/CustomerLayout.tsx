// Fix: S?a l?i responsive Header tr�n mobile cho kh�ch h�ng
import React, { useState } from 'react';
import { Layout, Badge, Menu, Button, Row, Col, Space, Modal, Dropdown, Avatar } from 'antd';
import { ShoppingCartOutlined, HomeOutlined, UserOutlined, ClockCircleOutlined, LoginOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, SafetyCertificateOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import './CustomerLayout.less';
import AccountSettingsModal from '@/components/AccountSettingsModal';

const { Header, Content, Footer } = Layout;

const CustomerLayout: React.FC = ({ children }) => {
  const { cartCount } = useModel('useCartModel');
  const { currentUser, logout } = useModel('useAuthModel');
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);

  const handlePortalNavigation = (path: string, targetRole: string) => {
    if (currentUser) {
      Modal.confirm({
        title: 'Yêu cầu Đăng xuất',
        content: 'Tài khoản hiện tại sẽ tự động đăng xuất, bạn có muốn tiếp tục?',
        okText: 'Đăng xuất & Tiếp tục',
        cancelText: 'Hủy',
        onOk: () => {
          logout();
          history.push(path);
        }
      });
    } else {
      history.push(path);
    }
  };

  // Menu mặc định cho Guest
  let menuItems: any[] = [
    { key: '/customer/home', icon: <HomeOutlined />, label: 'Trang chủ' },
    { key: '/login', icon: <LoginOutlined />, label: 'Đăng nhập' },
  ];

  // Menu mở rộng cho User
  if (currentUser && (currentUser.role?.toLowerCase() === 'customer' || currentUser.role?.toLowerCase() === 'admin')) {
    menuItems = [
      { key: '/customer/home', icon: <HomeOutlined />, label: 'Trang chủ' },
      { key: '/customer/cart', icon: <ShoppingCartOutlined />, label: <Badge count={cartCount} offset={[10, 0]} style={{ backgroundColor: '#FADB14', color: '#262626', fontWeight: 'bold', boxShadow: '0 0 0 1px #fff' }}>Giỏ hàng</Badge> },
      { key: '/customer/history', icon: <ClockCircleOutlined />, label: 'Lịch sử' },
    ];
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => setIsAccountModalVisible(true)}>
        Cài đặt tài khoản
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => { logout(); history.push('/login'); }} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="customer-layout">
      <Header className="glass-header">
        <div className="header-content">
          <div className="logo" onClick={() => history.push('/customer/home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <span className="logo-icon">🍗</span>
            <span className="logo-text">CHICKEN DOKI</span>
          </div>

          <div className="top-navigation" style={{ flex: 1, padding: '0 24px' }}>
            <Menu 
              mode="horizontal" 
              selectedKeys={[history.location.pathname]} 
              onClick={(e) => history.push(e.key)}
              items={menuItems}
              style={{ background: 'transparent', borderBottom: 'none', lineHeight: '72px', justifyContent: 'center', fontSize: '15px', fontWeight: 500 }}
            />
          </div>

          <div className="header-actions">
            {currentUser ? (
              <Dropdown overlay={userMenu} placement="bottomRight">
                <Space size="middle" style={{ cursor: 'pointer', padding: '4px 12px', background: 'transparent', borderRadius: 20, transition: 'all 0.3s' }} className="user-greeting">
                  <Avatar style={{ backgroundColor: '#BA1A21' }} icon={<UserOutlined />} size="small" />
                  <span className="welcome-text" style={{ fontWeight: 600 }}>Xin chào, {currentUser.full_name}</span>
                </Space>
              </Dropdown>
            ) : (
              <Button type="primary" className="login-btn" onClick={() => history.push('/login')}>
                Đăng nhập ngay
              </Button>
            )}
          </div>
        </div>
      </Header>
      
      <Content className="main-content">
        {children}
      </Content>

      <Footer className="premium-footer">
        <div className="footer-container">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className="footer-brand">
                <h2>🍗 CHICKEN DOKI</h2>
                <p>Hệ thống Cơm rang Độc quyền lớn nhất Vịnh Bắc Bộ. Cam kết nguyên liệu sạch, tươi ngon 100%. Nóng hổi giao ngay!</p>
                <div className="security-badges">
                  <SafetyCertificateOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <span>Chứng nhận VSATTP</span>
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              <div className="footer-links">
                <h3>Về chúng tôi</h3>
                <ul>
                  <li><a href="#">Giới thiệu</a></li>
                  <li><a href="#">Thực đơn nổi bật</a></li>
                  <li><a href="#">Chính sách giao hàng</a></li>
                  <li><a href="#">Điều khoản bảo mật</a></li>
                </ul>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              <div className="footer-contact">
                <h3>Tổng đài Hỗ trợ</h3>
                <p><EnvironmentOutlined /> Tầng 6, Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</p>
                <p><PhoneOutlined /> Hotline: 1900 8888</p>
                <p><MailOutlined /> cskh@chickendoki.vn</p>
              </div>
            </Col>
          </Row>
          
          <div className="footer-bottom">
            <p>© 2026 Hệ thống Chicken Doki. All rights reserved.</p>
          </div>
        </div>
      </Footer>

      <AccountSettingsModal 
        visible={isAccountModalVisible} 
        onClose={() => setIsAccountModalVisible(false)} 
      />
    </Layout>
  );
};

export default CustomerLayout;

