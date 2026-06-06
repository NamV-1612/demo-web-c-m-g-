import React from 'react';
import { Typography, Button, Input, Popconfirm } from 'antd';
import { TagOutlined, DeleteOutlined, CheckCircleFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

interface CheckoutSummaryProps {
  subTotal: number;
  totalCartPrice: number;
  voucher: any;
  voucherInput: string;
  onVoucherInputChange: (val: string) => void;
  onApplyVoucher: () => void;
  onCheckout: () => void;
  onClearCart: () => void;
  checkoutSuccess?: boolean;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  subTotal,
  totalCartPrice,
  voucher,
  voucherInput,
  onVoucherInputChange,
  onApplyVoucher,
  onCheckout,
  onClearCart,
  checkoutSuccess
}) => {
  return (
    <div className="checkout-panel" style={{ position: 'sticky', top: '100px', zIndex: 10 }}>
      <div style={{ display: 'flex', width: '100%', marginBottom: 16, gap: '12px' }}>
        <Input 
          size="large" 
          placeholder="Nhập mã khuyến mãi (VD: GIAM20K)" 
          prefix={<TagOutlined style={{color: '#D53E0F'}}/>}
          value={voucherInput}
          onChange={(e) => onVoucherInputChange(e.target.value.toUpperCase())}
          onPressEnter={onApplyVoucher}
          style={{ borderRadius: '8px', flex: 1 }}
        />
        <Button type="primary" size="large" onClick={onApplyVoucher} style={{ borderRadius: '8px', flexShrink: 0 }}>Áp dụng</Button>
      </div>

      <div className="qr-code-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fafafa', padding: 12, borderRadius: 8, border: '1px dashed #d9d9d9', marginBottom: 16 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 8, textAlign: 'center', fontSize: '13px' }}>
          Thanh toán mã để đặt hàng:
        </Text>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=247-MBBANK-130788889999-${totalCartPrice}-CHICKEN%20DOKI`} 
            alt="QR Code" 
            style={{ borderRadius: 8, border: '1px solid #f0f0f0', padding: 6, background: '#fff', width: 120, height: 120 }}
          />
          {checkoutSuccess && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 8 }}>
               <svg className="success-checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                 <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                 <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
               </svg>
            </div>
          )}
        </div>
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, lineHeight: '1.6' }}>
          <div>Ngân hàng: <strong>MB Bank (Ngân hàng Quân Đội)</strong></div>
          <div>STK: <strong>1307 8888 9999</strong></div>
          <div>Chủ TK: <strong>DOKI FOOD</strong></div>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button type="primary" className="checkout-btn" onClick={onCheckout} style={{ height: '40px', borderRadius: '8px', background: '#D53E0F', borderColor: '#D53E0F' }}>
          Đặt đơn ngay
        </Button>
        <Popconfirm 
          title="Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?" 
          onConfirm={onClearCart} 
          okText="Xóa giỏ hàng" 
          cancelText="Không"
          placement="top"
        >
          <Button style={{ height: '40px', borderRadius: '8px', background: '#f5f5f5', color: '#000', borderColor: '#d9d9d9' }}>
            Xóa giỏ hàng
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default CheckoutSummary;
