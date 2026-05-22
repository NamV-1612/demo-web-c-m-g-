import React from 'react';
import { Layout, Button } from 'antd';
import { useModel, history } from 'umi';
import './StaffLayout.less';

const { Header, Content } = Layout;

const StaffLayout: React.FC = ({ children }) => {
  const { currentUser, logout } = useModel('useAuthModel');

  const handleLogout = () => {
    logout();
    history.push('/staff/login');
  };

  return (
    <Layout className="staff-layout">
      <Header className="staff-header">
        <div className="logo">
          <span className="logo-icon">Bếp</span>
          <span className="logo-text">Hoa POS</span>
        </div>
        {currentUser && (
          <Button type="primary" onClick={handleLogout} style={{ background: '#BA1A21', borderColor: '#BA1A21', borderRadius: '20px', fontWeight: 'bold' }}>Thoát Ca (Đăng xuất)</Button>
        )}
      </Header>
      <Content className="staff-content">
        {children}
      </Content>
    </Layout>
  );
};

export default StaffLayout;
