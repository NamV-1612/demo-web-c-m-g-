import React, { useState } from 'react';
import { Layout, Badge, Menu, Button, Row, Col, Space, Modal, Dropdown, Avatar, message, Typography } from 'antd';
import { ShoppingCartOutlined, HomeOutlined, UserOutlined, ClockCircleOutlined, LoginOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, SafetyCertificateOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import { navigateWithCartTransition } from '@/utils/transition';
import './CustomerLayout.less';
import AccountSettingsModal from '@/components/AccountSettingsModal';

const { Header, Content, Footer } = Layout;

const CustomerLayout: React.FC = ({ children }) => {
  const { cartCount } = useModel('useCartModel');
  const { currentUser, logout } = useModel('useAuthModel');
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      const isNew = localStorage.getItem('isNewlyRegistered');
      if (isNew === 'true') {
        setTimeout(() => {
          setShowWelcome(true);
        }, 1000);
      }
    }
  }, [currentUser]);

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
            <span className="logo-icon" style={{ display: 'none' }}></span>
            <span className="logo-text">DOKI FOOD</span>
          </div>

          <div className="top-navigation" style={{ flex: 1, padding: '0 24px' }}>
            <Menu 
              mode="horizontal" 
              selectedKeys={[history.location.pathname]} 
              onClick={(e) => navigateWithCartTransition(history, e.key)}
              items={menuItems}
              style={{ background: 'transparent', borderBottom: 'none', lineHeight: '72px', justifyContent: 'center', fontSize: '15px', fontWeight: 500 }}
            />
          </div>

          <div className="header-actions">
            {currentUser ? (
              <Dropdown overlay={userMenu} placement="bottomRight">
                <Space size="middle" style={{ cursor: 'pointer', padding: '4px 12px', background: 'transparent', borderRadius: 20, transition: 'all 0.3s' }} className="user-greeting">
                  <Avatar style={{ backgroundColor: '#D53E0F' }} icon={<UserOutlined />} size="small" />
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
                <h2>DOKI FOOD</h2>
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
                <p><EnvironmentOutlined /> 120 Yên Lãng, Hà Nội</p>
                <p><PhoneOutlined /> Hotline: 1900 8888</p>
                <p><MailOutlined /> cskh@dokifood.vn</p>
              </div>
            </Col>
          </Row>
          
          <div className="footer-bottom">
            <p>© 2026 Hệ thống Doki Food. All rights reserved.</p>
          </div>
        </div>
      </Footer>

      <AccountSettingsModal 
        visible={isAccountModalVisible} 
        onClose={() => setIsAccountModalVisible(false)} 
      />

      <Modal
        visible={showWelcome}
        footer={null}
        closable={false}
        centered
        width={700}
        bodyStyle={{ padding: 0, borderRadius: 20, overflow: 'hidden', display: 'flex', background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
      >
        <div style={{ 
          flex: '0 0 45%', 
          background: 'linear-gradient(135deg, #FFB75E 0%, #D53E0F 100%)', 
          padding: '40px 24px', 
          color: '#fff', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: 72, marginBottom: 16, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>🎉</div>
          <Typography.Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 900 }}>CHÀO BẠN MỚI!</Typography.Title>
          <Typography.Paragraph style={{ color: '#fff', fontSize: 16, marginTop: 16, opacity: 0.95, margin: 0 }}>
            Tặng ngay Voucher độc quyền dành riêng cho đơn hàng đầu tiên của bạn.
          </Typography.Paragraph>
        </div>
        <div style={{ 
          flex: '1', 
          padding: '40px 32px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <Typography.Text type="secondary" style={{ marginBottom: 12, fontSize: 15, fontWeight: 500 }}>
            Mã ưu đãi của bạn:
          </Typography.Text>
          <div className="coupon-ticket" style={{ fontSize: 22, padding: '12px 24px', marginBottom: 24, letterSpacing: 2, width: '100%', textAlign: 'center', background: '#fff7f0', border: '2px dashed #ff9c6e', color: '#D53E0F', fontWeight: 'bold', borderRadius: 12 }}>
            WELCOME
          </div>
          <Button 
            type="primary" 
            size="large" 
            block 
            style={{ height: 50, borderRadius: 25, fontSize: 16, fontWeight: 'bold', background: '#D53E0F', borderColor: '#D53E0F', boxShadow: '0 4px 14px rgba(213, 62, 15, 0.4)' }}
            onClick={() => {
              navigator.clipboard.writeText('WELCOME');
              message.success('Đã copy mã thành công!');
              setShowWelcome(false);
              localStorage.removeItem('isNewlyRegistered');
            }}
          >
            Copy Mã & Đặt Đơn Ngay
          </Button>
          <Button type="link" style={{ marginTop: 16, color: '#8c8c8c', fontWeight: 500 }} onClick={() => {
            setShowWelcome(false);
            localStorage.removeItem('isNewlyRegistered');
          }}>
            Để sau, tôi muốn xem menu trước
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default CustomerLayout;
