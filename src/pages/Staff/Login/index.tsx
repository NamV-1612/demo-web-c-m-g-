import React from 'react';
import { Form, Input, Button, Tabs, Modal } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import './style.less';

const { TabPane } = Tabs;

const StaffLogin: React.FC = () => {
  const { login, currentUser, logout } = useModel('useAuthModel');
  const [activeTab, setActiveTab] = React.useState('1');

  React.useEffect(() => {
    if (currentUser) {
      logout();
    }
  }, []);

  const onLogin = (values: any) => {
    if (login(values.username, values.password, ['STAFF', 'ADMIN'])) {
      history.push('/staff/dashboard');
    }
  };

  const handleTabChange = (key: string) => {
    if (key === '2' && currentUser) {
      Modal.confirm({
        title: 'Yêu cầu Đăng xuất',
        content: 'Tài khoản hiện tại sẽ tự động đăng xuất, bạn có muốn tiếp tục?',
        okText: 'Đăng xuất',
        cancelText: 'Hủy',
        onOk: () => {
          logout();
          setActiveTab('2');
        },
        onCancel: () => {
          setActiveTab('1');
        }
      });
    } else {
      setActiveTab(key);
    }
  };

  return (
    <div className="login-split-container">
      <div className="login-banner staff-banner">
        <div className="banner-overlay">
          <h1>Nhân viên Cơm Rang</h1>
          <p>Hệ thống Quản lý Vận hành Bếp & Dịch vụ khách hàng chuyên nghiệp.</p>
        </div>
      </div>
      
      <div className="login-form-wrapper">
        <div className="form-container">
          <div className="logo-mobile">🧑‍🍳 Cơm Rang</div>
          <h2>Cổng Nhân Viên</h2>
          <p className="subtitle">Vui lòng đăng nhập để bắt đầu ca làm việc.</p>

          <Tabs activeKey={activeTab} onChange={handleTabChange} size="large">
            <TabPane tab="Đăng nhập" key="1">
              <Form name="staff_login" onFinish={onLogin} size="large" layout="vertical">
                <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập Tên đăng nhập / Số điện thoại!' }]}>
                  <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Tên đăng nhập / Số điện thoại" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                  <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Mật khẩu" />
                </Form.Item>
                <Form.Item style={{ marginTop: 16 }}>
                  <Button type="primary" htmlType="submit" block>VÀO BẾP</Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <a onClick={() => history.push('/login')} style={{ color: '#8c8c8c', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = '#BA1A21'} onMouseOut={(e) => e.currentTarget.style.color = '#8c8c8c'}>
              <ArrowLeftOutlined /> Quay lại Trang Khách hàng
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
