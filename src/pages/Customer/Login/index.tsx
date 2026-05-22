import React from 'react';
import { Form, Input, Button, Tabs, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import './style.less';

const { TabPane } = Tabs;
const { Text } = Typography;

const CustomerLogin: React.FC = () => {
  const { login, register } = useModel('useAuthModel');
  const [activeTab, setActiveTab] = React.useState('1');
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    if (activeTab === '1') {
      if (login(values.username.trim(), values.password)) {
        history.push('/customer/home');
      }
    } else {
      if (register(values.name, values.username.trim(), values.phone, values.password)) {
        setActiveTab('1');
        form.resetFields();
      }
    }
  };

  return (
    <div className="login-split-container">
      <div className="login-banner">
        <div className="banner-overlay">
          <h1>Cơm Rang 1307</h1>
          <p>Trải nghiệm đặt món nhanh chóng, tiện lợi. Hạt cơm giòn rụm, topping ngập tràn đang chờ đón bạn.</p>
        </div>
      </div>
      
      <div className="login-form-wrapper">
        <div className="form-container">
          <div className="logo-mobile">🍚 1307</div>
          <h2>Xin chào!</h2>
          <p className="subtitle">Vui lòng đăng nhập hoặc tạo tài khoản để đặt món.</p>

          <Tabs activeKey={activeTab} onChange={(key) => { setActiveTab(key); form.resetFields(); }} size="large">
            <TabPane tab="Đăng nhập" key="1" />
            <TabPane tab="Đăng ký" key="2" />
          </Tabs>

          <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
            <div className={`expandable-field ${activeTab === '2' ? 'expanded' : ''}`}>
              <Form.Item name="name" rules={activeTab === '2' ? [
                { required: true, message: 'Vui lòng nhập họ tên!' },
                { pattern: /^[\p{L}\s]{2,50}$/u, message: 'Họ tên chỉ được chứa chữ cái, khoảng trắng và dài từ 2-50 ký tự!' }
              ] : []}>
                <Input prefix={<UserOutlined />} placeholder="Họ và tên" tabIndex={activeTab === '1' ? -1 : 0} />
              </Form.Item>
            </div>
            
            <Form.Item name="username" rules={[
              { required: true, message: activeTab === '1' ? 'Vui lòng nhập Tên đăng nhập / Số điện thoại!' : 'Vui lòng nhập Tên đăng nhập!' },
              ...(activeTab === '2' ? [{ min: 3, message: 'Tên đăng nhập (từ 3 ký tự trở lên)!' } as any] : [])
            ]}>
              <Input prefix={<UserOutlined />} placeholder={activeTab === '1' ? "Tên đăng nhập / Số điện thoại" : "Tên đăng nhập"} />
            </Form.Item>
            
            <div className={`expandable-field ${activeTab === '2' ? 'expanded' : ''}`}>
              <Form.Item name="phone" rules={activeTab === '2' ? [
                { required: true, message: 'Vui lòng nhập Số điện thoại!' },
                { pattern: /^\d{10}$/, message: 'Số điện thoại phải gồm 10 chữ số!' }
              ] : []}>
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" tabIndex={activeTab === '1' ? -1 : 0} />
              </Form.Item>
            </div>
            
            <Form.Item name="password" rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              ...(activeTab === '2' ? [{ pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: 'Mật khẩu phải từ 8 ký tự, gồm chữ hoa, thường và số!' } as any] : [])
            ]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" block style={{ marginTop: 0 }}>
                {activeTab === '1' ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
              </Button>
            </Form.Item>
            
            <div className={`expandable-field ${activeTab === '1' ? 'expanded' : ''}`} style={{ textAlign: 'center', marginTop: activeTab === '1' ? 16 : 0 }}>
              <Text type="secondary" style={{ cursor: 'pointer' }} onClick={() => history.push('/customer/home')}>
                Tiếp tục dưới tư cách Khách vãng lai
              </Text>
            </div>
          </Form>

          <Divider style={{ margin: '32px 0 24px' }} />
          
          <div className="partner-staff-cta" style={{ textAlign: 'center' }}>
            <p style={{ color: '#595959', marginBottom: 16 }}>
              Dành cho Nội bộ Hệ thống
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button type="default" size="large" onClick={() => history.push('/staff/login')} style={{ borderRadius: '8px', flex: 1, fontWeight: 500 }}>
                Đăng nhập Nhân viên
              </Button>
              <Button type="default" size="large" onClick={() => history.push('/user/login')} style={{ borderRadius: '8px', flex: 1, fontWeight: 500 }}>
                Cổng Quản trị viên
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
