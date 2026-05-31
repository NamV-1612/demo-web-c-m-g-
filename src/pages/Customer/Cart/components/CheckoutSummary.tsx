import React from 'react';
import { Typography, Button, Input, Tag } from 'antd';
import { TagOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface CheckoutSummaryProps {
  subTotal: number;
  totalCartPrice: number;
  voucher: any;
  voucherInput: string;
  onVoucherInputChange: (val: string) => void;
  onApplyVoucher: () => void;
  onCheckout: () => void;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  subTotal,
  totalCartPrice,
  voucher,
  voucherInput,
  onVoucherInputChange,
  onApplyVoucher,
  onCheckout
}) => {
  return (
    <div className="checkout-panel" style={{ position: 'sticky', top: '100px', zIndex: 10 }}>
      <Title level={4}>Khuyến mãi</Title>
      <div style={{ display: 'flex', width: '100%', marginBottom: 24, gap: '12px' }}>
        <Input 
          size="large" 
          placeholder="Nhập mã khuyến mãi (VD: GIAM20K)" 
          prefix={<TagOutlined style={{color: '#BA1A21'}}/>}
          value={voucherInput}
          onChange={(e) => onVoucherInputChange(e.target.value.toUpperCase())}
          style={{ borderRadius: '8px', flex: 1 }}
        />
        <Button type="primary" size="large" onClick={onApplyVoucher} style={{ borderRadius: '8px', flexShrink: 0 }}>Áp dụng</Button>
      </div>

      <div className="qr-code-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fafafa', padding: 16, borderRadius: 8, border: '1px dashed #d9d9d9', marginBottom: 24 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 8, textAlign: 'center' }}>
          Thanh toán mã để đặt hàng:
        </Text>
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=247-MBBANK-130788889999-${totalCartPrice}-CHICKEN%20DOKI`} 
          alt="QR Code" 
          style={{ borderRadius: 8, border: '1px solid #f0f0f0', padding: 8, background: '#fff' }}
        />
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, lineHeight: '1.6' }}>
          <div>Ngân hàng: <strong>MB Bank (Ngân hàng Quân Đội)</strong></div>
          <div>STK: <strong>1307 8888 9999</strong></div>
          <div>Chủ TK: <strong>CHICKEN DOKI</strong></div>
          <div>Nội dung CK: <strong>THANH TOAN DON HANG</strong></div>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-row">
          <Text>Tạm tính:</Text>
          <Text>{subTotal.toLocaleString()}đ</Text>
        </div>
        {voucher && (
          <div className="summary-row discount-row">
            <Text>Khuyến mãi ({voucher.code}):</Text>
            <Text>-{voucher.discount.toLocaleString()}đ</Text>
          </div>
        )}
        <div className="summary-row total-row">
          <Text strong>Tổng thanh toán:</Text>
          <Text strong className="total-price">{totalCartPrice.toLocaleString()}đ</Text>
        </div>
      </div>

      <Button type="primary" block className="checkout-btn" onClick={onCheckout}>
        Đặt đơn ngay
      </Button>
    </div>
  );
};

export default CheckoutSummary;
