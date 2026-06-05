import React from 'react';
import { Form, Input, Button, Tabs, Modal } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, ArrowLeftOutlined, SwapOutlined } from '@ant-design/icons';
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

  const triggerAdminTransition = () => {
    const overlay = document.createElement('div');
    overlay.className = 'role-login-transition';
    overlay.id = 'admin-login-transition';
    overlay.innerHTML = `
      <svg class="admin-animated-chart" viewBox="0 0 100 100" width="120" height="120">
        <path d="M 10 90 L 90 90 M 10 90 L 10 10" stroke="rgba(255,255,255,0.5)" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path class="chart-line" d="M 10 90 L 30 65 L 50 75 L 70 30 L 90 10" stroke="#FFD700" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <polygon class="chart-arrow" points="80,5 95,5 95,20" fill="#FFD700" />
      </svg>
      <h2>Đang tải dữ liệu quản trị...</h2>
    `;
    document.body.appendChild(overlay);
    
    // Trigger fade in
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);

    setTimeout(() => {
      history.push('/admin/dashboard');
      // After navigation, fade out
      setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 500);
      }, 500);
    }, 1000);
  };

  const onLogin = async (values: any) => {
    const success = await login(values.username.trim(), values.password, ['ADMIN']);
    if (success) {
      triggerAdminTransition();
    }
  };

  const onRegister = async (values: any) => {
    const success = await register(values.name, values.username.trim(), values.phone, values.password, 'ADMIN');
    if (success) {
      triggerAdminTransition();
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
                { pattern: /^(0[35789])[0-9]{8}$/, message: 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)' }
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

          <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
            <a onClick={() => history.push('/staff/login')} style={{ color: '#D53E0F', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 16px', border: '1px dashed #D53E0F', borderRadius: '8px' }}>
              <SwapOutlined /> Chuyển sang Cổng Nhân Viên
            </a>
            <a onClick={() => history.push('/login')} style={{ color: '#8c8c8c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = '#D53E0F'} onMouseOut={(e) => e.currentTarget.style.color = '#8c8c8c'}>
              <ArrowLeftOutlined /> Quay lại Trang Khách hàng
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
