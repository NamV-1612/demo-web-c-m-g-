import React, { useState } from 'react';
import { List, Card, Typography, Button, Tag, Select, message, Empty, Row, Col, Input, Radio, Space, Form, Modal, Tooltip, Segmented } from 'antd';
import { DeleteOutlined, ShopOutlined, EnvironmentOutlined, TagOutlined, QrcodeOutlined, DollarOutlined, PlusOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { Order } from '@/services/typing';
import './style.less';

const { Title, Text } = Typography;
const { Option } = Select;

const PICKUP_OPTIONS = [
  { value: 'asap', label: 'Lấy ngay (Khoảng 15 phút)' },
  { value: '11:00-11:30', label: 'Hẹn từ 11:00 - 11:30' },
  { value: '11:30-12:00', label: 'Hẹn từ 11:30 - 12:00' },
  { value: '12:00-12:30', label: 'Hẹn từ 12:00 - 12:30' },
  { value: '12:30-13:00', label: 'Hẹn từ 12:30 - 13:00' },
  { value: '13:00-13:30', label: 'Hẹn từ 13:00 - 13:30' },
  { value: '18:00-18:30', label: 'Hẹn từ 18:00 - 18:30' },
  { value: '18:30-19:00', label: 'Hẹn từ 18:30 - 19:00' },
  { value: '19:00-19:30', label: 'Hẹn từ 19:00 - 19:30' },
  { value: '19:30-20:00', label: 'Hẹn từ 19:30 - 20:00' },
];

const CustomerCart: React.FC = () => {
  const { cartItems, removeFromCart, clearCart, subTotal, totalCartPrice, voucher, applyVoucher, updateQuantity } = useModel('useCartModel');
  const { submitOrder, addresses, addAddress } = useModel('useOrderModel');
  const { currentUser } = useModel('useAuthModel');
  const { decreasePromoQuantity } = useModel('usePromoModel');

  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id || '');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [pickupTime, setPickupTime] = useState('asap');
  const [voucherInput, setVoucherInput] = useState('');
  
  // Modal Thêm địa chỉ mới
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleApplyVoucher = () => {
    applyVoucher(voucherInput);
  };

  const handleAddAddress = (values: any) => {
    const newAddr = addAddress(values);
    setSelectedAddressId(newAddr.id);
    setIsAddressModalVisible(false);
    form.resetFields();
  };

  const handleCheckout = () => {
    if (!currentUser) return;
    
    const isDelivery = deliveryMethod === 'delivery';
    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    
    if (isDelivery && !selectedAddr) {
      message.error('Vui lòng chọn hoặc thêm địa chỉ nhận hàng!');
      return;
    }

    const orderId = 'ORD' + Date.now().toString().slice(-6);
    
    const order: Order = {
      id: orderId,
      customerId: currentUser.id,
      customerName: isDelivery ? selectedAddr!.name : (currentUser.full_name || currentUser.name || 'Khách hàng'),
      customerPhone: isDelivery ? selectedAddr!.phone : currentUser.phone || '',
      items: cartItems,
      totalAmount: totalCartPrice,
      note: isDelivery ? `Giao đến: ${selectedAddr!.address}` : 'Khách tự đến lấy',
      status: 'PENDING',
      isPaid: false,
      paymentMethod: 'transfer',
      pickupTime: pickupTime,
      createdAt: Date.now(),
      promoCode: voucher?.code,
      discountAmount: voucher?.discount
    };

    if (voucher) {
      decreasePromoQuantity(voucher.code);
    }

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
        {/* CỘT TRÁI: DANH SÁCH MÓN ĂN VÀ ĐỊA CHỈ */}
        <Col xs={24} lg={14}>
          <Card className="checkout-section-card" title={<><EnvironmentOutlined /> Thông tin nhận hàng & Hẹn giờ</>} bordered={false}>
            <div style={{ marginBottom: 24 }}>
              <Segmented 
                block
                size="large"
                className="custom-segmented"
                options={[
                  { label: '🛵 Nhờ quán ship (Giao tận nơi)', value: 'delivery' },
                  { label: '🏪 Tự đến lấy tại quán', value: 'pickup' }
                ]}
                value={deliveryMethod}
                onChange={(val) => setDeliveryMethod(val as string)}
              />
            </div>

            {deliveryMethod === 'delivery' && (
              <>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: 16 }}>
                  <Select 
                    value={selectedAddressId} 
                    onChange={setSelectedAddressId} 
                    style={{ flex: 1 }} 
                    size="large"
                    className="premium-select"
                    dropdownClassName="premium-dropdown"
                  >
                    {addresses.map(addr => (
                      <Option key={addr.id} value={addr.id}>
                        <strong>{addr.name}</strong> - {addr.phone} ({addr.address})
                      </Option>
                    ))}
                  </Select>
                  <Tooltip title="Thêm địa chỉ mới">
                    <Button 
                      type="dashed" 
                      size="large" 
                      icon={<PlusOutlined />}
                      onClick={() => setIsAddressModalVisible(true)}
                      style={{ 
                        borderColor: '#BA1A21', 
                        color: '#BA1A21', 
                        backgroundColor: '#fff7e6',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        boxShadow: '0 2px 0 rgba(186, 26, 33, 0.05)',
                        flexShrink: 0
                      }}
                    />
                  </Tooltip>
                </div>
                {selectedAddressId && (
                  <div className="selected-address-preview" style={{ marginBottom: 16 }}>
                    <strong>Địa chỉ:</strong> {addresses.find(a => a.id === selectedAddressId)?.address}
                  </div>
                )}
              </>
            )}
            
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 12, fontSize: '15px' }}>Hẹn khoảng thời gian đến lấy đồ:</Text>
              <Select 
                value={pickupTime} 
                onChange={setPickupTime} 
                style={{ width: '100%' }} 
                size="large"
                className="premium-select"
                dropdownClassName="premium-dropdown"
              >
                {PICKUP_OPTIONS.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24, marginTop: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 16, fontSize: '16px', color: '#BA1A21' }}>
                <ShopOutlined /> Danh sách món ăn
              </Text>
              <List
              dataSource={cartItems}
              renderItem={item => (
                <Card className="cart-item-card" bordered={false}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <img 
                      src={item.product?.image || item.product?.imageUrl || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=150&q=80'} 
                      alt={item.product?.name || 'Food'}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text strong className="item-name" style={{ fontSize: 16 }}>{item.product.name}</Text>
                      
                      <div className="quantity-control" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 12 }}>
                        <Button 
                          size="small" 
                          shape="circle" 
                          onClick={() => updateQuantity(item.cartItemId, -1)} 
                          disabled={item.quantity <= 1}
                        >-</Button>
                        <Text strong style={{ fontSize: '15px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</Text>
                        <Button 
                          size="small" 
                          shape="circle" 
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                        >+</Button>
                      </div>
                      <div style={{ margin: '8px 0' }}>
                        {(item.selectedToppings || []).map((t: string) => <Tag key={t} color="orange" style={{ borderRadius: 12 }}>{t}</Tag>)}
                      </div>
                      {item.note && <div className="item-note" style={{ fontSize: 13, color: '#BA1A21', fontStyle: 'italic' }}>* Ghi chú: {item.note}</div>}
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 80 }}>
                      <div className="item-price" style={{ fontSize: 16, fontWeight: 'bold', color: '#BA1A21' }}>{item.totalPrice.toLocaleString()}đ</div>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.cartItemId)} style={{ marginTop: 'auto' }}>
                        Xóa
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            />
            </div>
          </Card>
        </Col>
 
        {/* CỘT PHẢI: TỔNG KẾT VÀ THANH TOÁN */}
        <Col xs={24} lg={10}>
          <div className="checkout-panel">
            <Title level={4}>Khuyến mãi</Title>
            <div style={{ display: 'flex', width: '100%', marginBottom: 24 }}>
              <Input 
                size="large" 
                placeholder="Nhập mã khuyến mãi (VD: GIAM20K)" 
                prefix={<TagOutlined style={{color: '#BA1A21'}}/>}
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                style={{ borderRadius: '8px 0 0 8px' }}
              />
              <Button type="primary" size="large" onClick={handleApplyVoucher} style={{ borderRadius: '0 8px 8px 0', background: '#BA1A21', borderColor: '#BA1A21' }}>Áp dụng</Button>
            </div>
 
            <div style={{ marginBottom: 24, padding: 12, background: '#e6f7ff', borderRadius: 8, border: '1px solid #91d5ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <QrcodeOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 12 }} />
                <Text strong style={{ color: '#1890ff', fontSize: 16 }}>Thanh toán tại đây</Text>
              </div>
              <ArrowDownOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            </div>
 
            <div className="qr-code-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fafafa', padding: 16, borderRadius: 8, border: '1px dashed #d9d9d9', marginBottom: 24 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8, textAlign: 'center' }}>
                Quét mã QR dưới đây để thực hiện chuyển khoản:
              </Text>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=247-MBBANK-130788889999-${totalCartPrice}-COM%20RANG%201307`} 
                alt="QR Code" 
                style={{ borderRadius: 8, border: '1px solid #f0f0f0', padding: 8, background: '#fff' }}
              />
              <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, lineHeight: '1.6' }}>
                <div>Ngân hàng: <strong>MB Bank (Ngân hàng Quân Đội)</strong></div>
                <div>STK: <strong>1307 8888 9999</strong></div>
                <div>Chủ TK: <strong>COM RANG 1307</strong></div>
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
 
            <Button type="primary" block className="checkout-btn" onClick={handleCheckout}>
              Đặt đơn ngay
            </Button>
          </div>
        </Col>
      </Row>
 
      {/* Modal Thêm Địa chỉ */}
      <Modal title="Thêm địa chỉ giao hàng" visible={isAddressModalVisible} onCancel={() => setIsAddressModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleAddAddress}>
          <Form.Item name="name" label="Tên người nhận" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label="Địa chỉ cụ thể" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerCart;
