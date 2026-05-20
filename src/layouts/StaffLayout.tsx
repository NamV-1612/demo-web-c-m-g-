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
        <div className="logo">STAFF POS - QUÁN CƠM RANG</div>
        {currentUser && (
          <Button type="primary" danger onClick={handleLogout}>Đăng xuất</Button>
        )}
      </Header>
      <Content className="staff-content">
        {children}
      </Content>
    </Layout>
  );
};

export default StaffLayout;
