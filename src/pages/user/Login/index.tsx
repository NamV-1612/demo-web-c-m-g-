import React from 'react';
import { Form, Input, Button, Tabs, Modal } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import './style.less';

const { TabPane } = Tabs;

const AdminLogin: React.FC = () => {
  const { login, register, currentUser, logout } = useModel('useAuthModel');
  const [activeTab, setActiveTab] = React.useState('1');
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (currentUser) {
      logout();
    }
  }, []);

  const onLogin = async (values: any) => {
    const success = await login(values.username.trim(), values.password, ['ADMIN']);
    if (success) {
      history.push('/admin/dashboard');
    }
  };

  const onRegister = async (values: any) => {
    const success = await register(values.name, values.username.trim(), values.phone, values.password, 'ADMIN');
    if (success) {
      history.push('/admin/dashboard');
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
      <div className="login-banner admin-banner">
        <div className="banner-overlay">
          <h1>Quản Trị Viên</h1>
          <p>Hệ thống Quản trị Doanh thu, Thực đơn & Chuỗi cung ứng toàn diện.</p>
        </div>
      </div>
      
      <div className="login-form-wrapper">
        <div className="form-container">
          <div className="logo-mobile">💼 Quản Trị</div>
          <h2>Cổng Quản Trị</h2>
          <p className="subtitle">Đăng nhập để vào bảng điều khiển quản trị.</p>

          <Tabs activeKey={activeTab} onChange={(key) => { handleTabChange(key); form.resetFields(); }} size="large">
            <TabPane tab="Đăng nhập" key="1" />
            <TabPane tab="Đăng ký Admin" key="2" />
          </Tabs>

          <Form form={form} layout="vertical" onFinish={activeTab === '1' ? onLogin : onRegister} size="large">
            <div className={`expandable-field ${activeTab === '2' ? 'expanded' : ''}`}>
              <Form.Item name="name" rules={activeTab === '2' ? [
                { required: true, message: 'Vui lòng nhập họ tên!' },
                { pattern: /^[\p{L}\s]{2,50}$/u, message: 'Họ tên chỉ được chứa chữ cái, khoảng trắng và dài từ 2-50 ký tự!' }
              ] : []}>
                <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Họ và tên" tabIndex={activeTab === '1' ? -1 : 0} />
              </Form.Item>
            </div>
            
            <Form.Item name="username" rules={[
              { required: true, message: activeTab === '1' ? 'Vui lòng nhập Tên đăng nhập / Số điện thoại!' : 'Vui lòng nhập Tên đăng nhập!' },
              ...(activeTab === '2' ? [{ min: 3, message: 'Tên đăng nhập (từ 3 ký tự trở lên)!' } as any] : [])
            ]}>
              <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder={activeTab === '1' ? "Tên đăng nhập / Số điện thoại" : "Tên đăng nhập"} />
            </Form.Item>
            
            <div className={`expandable-field ${activeTab === '2' ? 'expanded' : ''}`}>
              <Form.Item name="phone" rules={activeTab === '2' ? [
                { required: true, message: 'Vui lòng nhập Số điện thoại!' },
                { pattern: /^\d{10}$/, message: 'Số điện thoại phải gồm 10 chữ số!' }
              ] : []}>
                <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Số điện thoại" tabIndex={activeTab === '1' ? -1 : 0} />
              </Form.Item>
            </div>
            
            <Form.Item name="password" rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              ...(activeTab === '2' ? [{ pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: 'Mật khẩu phải từ 8 ký tự, gồm chữ hoa, thường và số!' } as any] : [])
            ]}>
              <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Mật khẩu" />
            </Form.Item>
            
            <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" block>
                {activeTab === '1' ? 'TRUY CẬP' : 'TẠO TÀI KHOẢN QUẢN TRỊ'}
              </Button>
            </Form.Item>
          </Form>

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

export default AdminLogin;
