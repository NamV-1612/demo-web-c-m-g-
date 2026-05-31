import React from 'react';
import { Form, Input, Button, Tabs, Typography, Divider, Modal, message, Collapse } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, DownOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import './style.less';

const { TabPane } = Tabs;
const { Text } = Typography;
const { Panel } = Collapse;

const CustomerLogin: React.FC = () => {
  const { login, register, logout, currentUser } = useModel('useAuthModel');
  const [activeTab, setActiveTab] = React.useState('1');
  const [isForgotModalVisible, setIsForgotModalVisible] = React.useState(false);
  const [form] = Form.useForm();
  const [forgotForm] = Form.useForm();

  React.useEffect(() => {
    if (currentUser) {
      logout();
    }
  }, []);

  const handleSubmit = async (values: any) => {
    if (activeTab === '1') {
      const success = await login(values.username.trim(), values.password, ['CUSTOMER', 'ADMIN']);
      if (success) {
        history.push('/customer/home');
      }
    } else {
      const success = await register(values.name, values.username.trim(), values.phone, values.password);
      if (success) {
        setActiveTab('1');
        form.resetFields();
      }
    }
  };

  const handleForgotPassword = () => {
    forgotForm.validateFields().then(values => {
      // Giả lập reset mật khẩu thành công trực tiếp không cần gửi SMS
      message.success('Mật khẩu của bạn đã được đặt lại thành công! Hãy đăng nhập bằng mật khẩu mới.');
      setIsForgotModalVisible(false);
      forgotForm.resetFields();
      setActiveTab('1');
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <div className="login-split-container">
      <div className="login-banner">
        <div className="banner-overlay">
          <h1>Chicken Doki</h1>
          <p>Trải nghiệm đặt món nhanh chóng, tiện lợi. Hạt cơm giòn rụm, topping ngập tràn đang chờ đón bạn.</p>
        </div>
      </div>
      
      <div className="login-form-wrapper">
        <div className="form-container">
          <div className="logo-mobile">🍗 Doki</div>
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
                { pattern: /^(0[35789])[0-9]{8}$/, message: 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)' }
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

            {activeTab === '1' && (
              <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
                <Text type="secondary" style={{ cursor: 'pointer' }} onClick={() => setIsForgotModalVisible(true)}>
                  Quên mật khẩu?
                </Text>
              </div>
            )}
            
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
          
          <Collapse ghost expandIconPosition="end">
            <Panel header={<Text type="secondary" strong>▾ Dành cho Nội bộ Hệ thống</Text>} key="1" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button type="default" size="large" onClick={() => history.push('/staff/login')} style={{ borderRadius: '8px', flex: 1, fontWeight: 500 }}>
                  Đăng nhập Nhân viên
                </Button>
                <Button type="default" size="large" onClick={() => history.push('/user/login')} style={{ borderRadius: '8px', flex: 1, fontWeight: 500 }}>
                  Cổng Quản trị viên
                </Button>
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>

      <Modal
        title="Quên mật khẩu"
        visible={isForgotModalVisible}
        onCancel={() => setIsForgotModalVisible(false)}
        onOk={handleForgotPassword}
        okText="Đặt lại mật khẩu"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#BA1A21', borderColor: '#BA1A21' } }}
      >
        <p style={{ marginBottom: 16 }}>Vui lòng nhập thông tin để đổi mật khẩu mới (áp dụng cho Khách hàng & Nội bộ).</p>
        <Form form={forgotForm} layout="vertical">
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên đã đăng ký" />
          </Form.Item>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^(0[35789])[0-9]{8}$/, message: 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)' }
          ]}>
            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: 'Mật khẩu phải từ 8 ký tự, gồm chữ hoa, thường và số!' }
          ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerLogin;
