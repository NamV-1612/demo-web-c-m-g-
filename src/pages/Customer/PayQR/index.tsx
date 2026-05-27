import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, message, Result, Spin } from 'antd';
import { CheckCircleOutlined, WalletOutlined } from '@ant-design/icons';
import { history } from 'umi';
import api from '@/services/api';
const { Title, Text } = Typography;

const PayQRPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);

  useEffect(() => {
    // Get query params manually since Umi hook might need specific imports
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get('sessionId'));
    setAmount(params.get('amount'));
  }, []);

  const handleConfirmPayment = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const res = await api.post(`/payment/session/${sessionId}/confirm`);
      if (res.data) {
        setSuccess(true);
        message.success('Thanh toán thành công!');
      } else {
        message.error('Lỗi khi xác nhận thanh toán.');
      }
    } catch (err) {
      message.error('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <Card style={{ width: '100%', maxWidth: 400, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Result
            status="success"
            title="Thanh toán thành công!"
            subTitle="Hệ thống đã ghi nhận thanh toán. Bạn có thể xem trạng thái trên màn hình web chính."
            extra={[
              <Button type="primary" key="home" onClick={() => history.push('/customer/home')} style={{ background: '#BA1A21', borderColor: '#BA1A21' }}>
                Quay lại Trang chủ
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: '100%', maxWidth: 400, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <WalletOutlined style={{ fontSize: 64, color: '#BA1A21', marginBottom: 16 }} />
          <Title level={3} style={{ margin: 0, color: '#BA1A21' }}>Xác nhận Thanh toán</Title>
          <Text type="secondary">Ứng dụng Chicken Doki (Demo)</Text>
        </div>

        <div style={{ background: '#fffbe6', padding: 16, borderRadius: 8, border: '1px solid #ffe58f', marginBottom: 24, textAlign: 'center' }}>
          <Text style={{ fontSize: 14 }}>Số tiền cần thanh toán:</Text>
          <br/>
          <Title level={2} style={{ margin: 0, color: '#d46b08' }}>
            {amount ? Number(amount).toLocaleString() : '0'}đ
          </Title>
        </div>

        <Button 
          type="primary" 
          size="large" 
          block 
          icon={<CheckCircleOutlined />} 
          loading={loading}
          onClick={handleConfirmPayment}
          style={{ background: '#BA1A21', borderColor: '#BA1A21', height: 50, borderRadius: 8, fontSize: 16, fontWeight: 'bold' }}
        >
          Tôi đã chuyển khoản thành công
        </Button>
      </Card>
    </div>
  );
};

export default PayQRPage;
