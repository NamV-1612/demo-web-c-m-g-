import React, { useState } from 'react';
import { List, Card, Typography, Button, Space, Select, message, Empty, Row, Col } from 'antd';
import { DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { Order } from '@/services/typing';
import './style.less';

const { Title, Text } = Typography;
const { Option } = Select;

const CustomerCart: React.FC = () => {
  const { cartItems, removeFromCart, clearCart } = useModel('useCartModel');
  const { submitOrder } = useModel('useOrderModel');
  const { currentUser } = useModel('useAuthModel');

  const [pickupTime, setPickupTime] = useState('Càng sớm càng tốt');
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt khi nhận');

  const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleCheckout = () => {
    if (!currentUser) return;
    
    const order: Order = {
      id: 'ORD' + Date.now().toString().slice(-6),
      customerName: currentUser.full_name,
      customerPhone: currentUser.phone,
      items: cartItems,
      totalAmount,
      status: 'pending',
      pickupTime,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    submitOrder(order);
    clearCart();
    message.success('Đặt hàng thành công! Đang chờ quán xác nhận.');
    history.push('/customer/history');
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <Empty description="Giỏ hàng của bạn đang trống" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        <Button type="primary" size="large" onClick={() => history.push('/customer/home')} style={{ marginTop: 24, borderRadius: 24 }}>
          Khám phá Thực đơn ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="customer-cart-page">
      <Title level={2} className="cart-title"><ShopOutlined /> Giỏ hàng của bạn</Title>
      
      <Row gutter={[32, 24]}>
        <Col xs={24} lg={14}>
          <List
            dataSource={cartItems}
            renderItem={item => (
              <Card className="cart-item-card" bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong className="item-name">{item.product.name} (x{item.quantity})</Text>
                    <div style={{ margin: '8px 0' }}>
                      {item.toppings.map(t => <Tag key={t}>{t}</Tag>)}
                    </div>
                    {item.note && <div className="item-note">Ghi chú: {item.note}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="item-price">{item.totalPrice.toLocaleString()}đ</div>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.cartItemId)}>
                      Xóa
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          />
        </Col>

        <Col xs={24} lg={10}>
          <div className="checkout-panel">
            <Title level={4}>Tổng kết đơn hàng</Title>
            
            <div className="form-group">
              <Text strong>Giờ đến lấy</Text>
              <Select value={pickupTime} onChange={setPickupTime} style={{ width: '100%', marginTop: 8 }} size="large">
                <Option value="Càng sớm càng tốt">Càng sớm càng tốt (15-20 phút)</Option>
                <Option value="Sau 30 phút">Sau 30 phút</Option>
                <Option value="Sau 1 tiếng">Sau 1 tiếng</Option>
                <Option value="Tối nay">Tối nay</Option>
              </Select>
            </div>

            <div className="form-group">
              <Text strong>Phương thức thanh toán</Text>
              <Select value={paymentMethod} onChange={setPaymentMethod} style={{ width: '100%', marginTop: 8 }} size="large">
                <Option value="Tiền mặt khi nhận">Thanh toán Tiền mặt</Option>
                <Option value="Chuyển khoản QR">Chuyển khoản QR (Momo/ZaloPay)</Option>
              </Select>
            </div>

            <div className="summary-row" style={{ marginTop: 32, borderTop: '1px dashed #d9d9d9', paddingTop: 24 }}>
              <Text strong>Tổng thanh toán:</Text>
              <Text strong className="total-price">{totalAmount.toLocaleString()}đ</Text>
            </div>

            <Button type="primary" block className="checkout-btn" onClick={handleCheckout}>
              Đặt đơn ngay
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerCart;
