import React, { useState, useRef, useEffect } from 'react';
import { List, Card, Typography, Button, Tag, Select, message, Empty, Row, Col, Input, Radio, Space, Form, Modal, Tooltip, Segmented, AutoComplete, TimePicker } from 'antd';
import moment from 'moment';
import { DeleteOutlined, ShopOutlined, EnvironmentOutlined, EnvironmentFilled, TagOutlined, QrcodeOutlined, DollarOutlined, PlusOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { Order } from '@/services/typing';
import './style.less';

const { Title, Text } = Typography;
const { Option } = Select;



const CustomerCart: React.FC = () => {
  const { cartItems, removeFromCart, clearCart, subTotal, totalCartPrice, voucher, applyVoucher, updateQuantity } = useModel('useCartModel');
  const { submitOrder, addresses, addAddress } = useModel('useOrderModel');
  const { currentUser } = useModel('useAuthModel');
  const { decreasePromoQuantity } = useModel('usePromoModel');

  const timeOptions = [1, 2, 3, 4].map(h => {
    const time = moment().add(h, 'hours').add(moment().minute() > 0 ? 1 : 0, 'hours').startOf('hour').format('hh:00 A');
    return {
      value: time,
      label: time.replace('AM', 'SA').replace('PM', 'CH')
    };
  });
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id || '');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [pickupTimeType, setPickupTimeType] = useState('asap');
  const [pickupTimeText, setPickupTimeText] = useState(timeOptions[0].value);
  const [voucherInput, setVoucherInput] = useState('');
  
  // Modal Thêm địa chỉ mới
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapSearchText, setMapSearchText] = useState('');
  const [submittedSearchText, setSubmittedSearchText] = useState('21.0285,105.8542'); // Hoan Kiem coords
  const [mapOptions, setMapOptions] = useState<any[]>([]);
  const [form] = Form.useForm();
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (isAddressModalVisible && currentUser) {
      form.setFieldsValue({
        phone: form.getFieldValue('phone') || currentUser.phone,
        name: form.getFieldValue('name') || currentUser.full_name || currentUser.name
      });
    }
  }, [isAddressModalVisible, currentUser, form]);

  const handleMapSearch = (value: string) => {
    if (!value.trim()) {
      setMapOptions([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&countrycodes=vn`);
        const data = await res.json();
        const newOptions = data.map((item: any) => ({
          value: item.display_name,
          label: item.display_name,
          lat: item.lat,
          lon: item.lon
        }));
        setMapOptions(newOptions);
      } catch (err) {
        console.error('Map search error:', err);
      }
    }, 600);
  };

  const handleApplyVoucher = () => {
    applyVoucher(voucherInput);
  };

  const handleAddAddress = (values: any) => {
    const newAddr = addAddress(values);
    setSelectedAddressId(newAddr.id);
    setIsAddressModalVisible(false);
    form.resetFields();
  };

  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const pollingRef = useRef<any>(null);

  const startPaymentPolling = (sessionId: string, pendingOrder: Order) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/session/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'PAID') {
            clearInterval(pollingRef.current);
            setIsPaymentModalVisible(false);
            
            // Thực hiện đặt đơn hàng với trạng thái đã thanh toán
            pendingOrder.isPaid = true;
            pendingOrder.paymentMethod = 'transfer';
            
            if (voucher) {
              decreasePromoQuantity(voucher.code);
            }

            submitOrder(pendingOrder);
            clearCart();
            message.success('Thanh toán thành công! Đơn hàng đã được tạo.');
            history.push('/customer/history');
          }
        }
      } catch (err) {
        console.error('Polling payment status error:', err);
      }
    }, 3000);
  };

  const handleCheckout = async () => {
    if (!currentUser) return;
    
    const isDelivery = deliveryMethod === 'delivery';
    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    
    if (isDelivery && (!selectedAddr || !selectedAddr.address.trim())) {
      message.error('Vui lòng chọn hoặc điền thêm địa chỉ nhận hàng!');
      return;
    }

    if (isDelivery && pickupTimeType === 'specific') {
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(pickupTimeText)) {
        message.error('Vui lòng nhập đúng định dạng giờ (VD: 14:30)');
        return;
      }
      const selectedTime = moment(pickupTimeText, 'hh:00 A');
      const minTime = moment().add(1, 'hours');
      if (selectedTime.isBefore(minTime)) {
        message.error(`Vui lòng tải lại trang hoặc chọn giờ khác (giờ hiện tại đã vượt qua giờ bạn chọn)`);
        return;
      }
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
      pickupTime: deliveryMethod === 'pickup' ? 'asap' : (pickupTimeType === 'asap' ? 'asap' : pickupTimeText),
      createdAt: Date.now(),
      promoCode: voucher?.code,
      discountAmount: voucher?.discount
    };

    // Khởi tạo session thanh toán
    try {
      const res = await fetch('/api/payment/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalCartPrice })
      });
      const data = await res.json();
      
      setPaymentSessionId(data.sessionId);
      setIsPaymentModalVisible(true);
      startPaymentPolling(data.sessionId, order);
      
    } catch (err) {
      message.error('Có lỗi xảy ra khi tạo mã thanh toán.');
    }
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

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
    <div className="cart-container">
      <div className="cart-header">
        <Title level={2} className="art-title"><ShopOutlined /> Giỏ hàng của bạn</Title>
      </div>
      
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
                    {addresses.map(addr => {
                      const safeAddress = addr?.address || '';
                      const shortAddr = safeAddress.length > 35 ? safeAddress.substring(0, 35) + '...' : safeAddress;
                      return (
                        <Option key={addr.id} value={addr.id}>
                          <strong>{addr.name}</strong> - {addr.phone} ({shortAddr || 'Chưa điền địa chỉ'})
                        </Option>
                      );
                    })}
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
                    <strong>Địa chỉ:</strong> {addresses.find(a => a.id === selectedAddressId)?.address || <span style={{color: 'red'}}>Chưa điền địa chỉ, vui lòng cập nhật!</span>}
                  </div>
                )}
              </>
            )}
            
            {deliveryMethod === 'pickup' ? (
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginBottom: 24 }}>
                <div style={{ background: '#fff7e6', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ffd591' }}>
                  <Text style={{ color: '#d46b08', fontSize: '14px' }}>
                    <EnvironmentFilled style={{ marginRight: 8 }} />
                    <Text strong style={{ color: '#d46b08' }}>Lưu ý:</Text> Quý khách vui lòng tới quán nhận đồ trong khoảng 1 tiếng sau khi nhận được thông báo món ăn đã hoàn thành.
                  </Text>
                </div>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 16, fontSize: '15px' }}>Giờ giao hàng</Text>
                <Radio.Group value={pickupTimeType} onChange={e => setPickupTimeType(e.target.value)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Radio value="asap" style={{ fontSize: '15px' }}>Giao ngay khi xong</Radio>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Radio value="specific" style={{ fontSize: '15px' }}>
                      Giao vào giờ
                    </Radio>
                    <Select
                      value={pickupTimeText}
                      onChange={setPickupTimeText}
                      disabled={pickupTimeType !== 'specific'}
                      size="large"
                      style={{ width: '140px' }}
                      className="premium-select"
                      dropdownClassName="premium-dropdown"
                    >
                        {timeOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                        ))}
                    </Select>
                  </div>
                </Radio.Group>
              </div>
            )}

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
            <div className="checkout-panel" style={{ position: 'sticky', top: '100px', zIndex: 10 }}>
              <Title level={4}>Khuyến mãi</Title>
              <div style={{ display: 'flex', width: '100%', marginBottom: 24, gap: '12px' }}>
                <Input 
                  size="large" 
                  placeholder="Nhập mã khuyến mãi (VD: GIAM20K)" 
                  prefix={<TagOutlined style={{color: '#BA1A21'}}/>}
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  style={{ borderRadius: '8px', flex: 1 }}
                />
                <Button type="primary" size="large" onClick={handleApplyVoucher} style={{ borderRadius: '8px', flexShrink: 0 }}>Áp dụng</Button>
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
              Thanh toán & Đặt đơn
            </Button>
          </div>
        </Col>
      </Row>

      {/* Modal Thanh Toán QR */}
      <Modal
        title={<><QrcodeOutlined /> Quét mã để thanh toán</>}
        visible={isPaymentModalVisible}
        onCancel={() => {
          setIsPaymentModalVisible(false);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }}
        footer={null}
        centered
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Vui lòng sử dụng điện thoại quét mã QR dưới đây để tiến hành thanh toán. Đơn hàng sẽ tự động được tạo sau khi thanh toán thành công.
          </Text>
          {paymentSessionId && (
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/customer/pay-qr?sessionId=' + paymentSessionId + '&amount=' + totalCartPrice)}`} 
              alt="Payment QR"
              style={{ borderRadius: 12, padding: 12, background: '#fff', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          )}
          <div style={{ marginTop: 24, padding: 16, background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
            <Text strong style={{ color: '#d46b08', fontSize: 16 }}>{totalCartPrice.toLocaleString()}đ</Text>
            <br/>
            <Text style={{ color: '#d46b08', fontSize: 13 }}>Hệ thống đang chờ bạn quét mã...</Text>
          </div>
        </div>
      </Modal>
 
      {/* Modal Thêm Địa chỉ */}
      <Modal 
        title="Thêm địa chỉ giao hàng" 
        visible={isAddressModalVisible} 
        onCancel={() => setIsAddressModalVisible(false)} 
        onOk={() => form.submit()}
        okButtonProps={{ style: { background: '#BA1A21', backgroundImage: 'none', borderColor: '#BA1A21', borderRadius: '8px', color: 'white' } }}
        cancelButtonProps={{ style: { borderRadius: '8px' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAddress}>
          <Form.Item name="name" label="Tên người nhận" rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }, { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Tên chỉ chứa chữ cái (có thể 1 từ)' }]}>
            <Input placeholder="VD: Nam" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b/, message: 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)' }]}>
            <Input placeholder="VD: 0987654321" />
          </Form.Item>
          <Form.Item label="Địa chỉ cụ thể" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <Button type="dashed" onClick={() => setIsMapModalVisible(true)} icon={<EnvironmentOutlined />} style={{ flex: 1, borderColor: '#1890ff', color: '#1890ff' }}>
                Chọn từ Google Maps
              </Button>
            </div>
            <Form.Item name="address" rules={[{ required: true, message: 'Vui lòng nhập hoặc chọn địa chỉ' }]}>
              <Input.TextArea rows={3} placeholder="Hoặc điền thủ công địa chỉ nhận hàng..." />
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Google Map */}
      <Modal 
        title={<><EnvironmentOutlined /> Chọn vị trí trên Bản đồ</>}
        visible={isMapModalVisible} 
        onCancel={() => setIsMapModalVisible(false)} 
        onOk={() => {
          const finalAddress = mapSearchText.trim() ? mapSearchText : 'Hồ Hoàn Kiếm, Hà Nội';
          form.setFieldsValue({ address: finalAddress });
          setIsMapModalVisible(false);
          message.success('Đã chọn vị trí từ bản đồ!');
        }}
        okText="Xác nhận vị trí này"
        cancelText="Hủy"
        width={700}
        zIndex={1001}
        bodyStyle={{ padding: 0 }}
        okButtonProps={{ style: { background: '#BA1A21', backgroundImage: 'none', borderColor: '#BA1A21', borderRadius: '8px', color: 'white', fontWeight: 'bold' } }}
        cancelButtonProps={{ style: { borderRadius: '8px' } }}
      >
        <div style={{ position: 'relative', width: '100%', height: '450px', overflow: 'hidden' }}>
          
          {/* SEARCH BAR OVERLAY */}
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '500px', zIndex: 20 }}>
            <AutoComplete
              options={mapOptions}
              style={{ width: '100%' }}
              onSearch={handleMapSearch}
              onSelect={(value, option: any) => {
                setMapSearchText(value);
                // Dùng tọa độ lat/lon để map load chuẩn 100% thay vì text
                if (option.lat && option.lon) {
                  setSubmittedSearchText(`${option.lat},${option.lon}`);
                } else {
                  setSubmittedSearchText(value);
                }
                message.loading({ content: 'Đang tải vị trí...', key: 'map-search', duration: 1 }).then(() => message.success({ content: 'Đã tìm thấy vị trí!', key: 'map-search' }));
              }}
              value={mapSearchText}
              onChange={setMapSearchText}
            >
              <Input.Search 
                className="map-search-input"
                placeholder="Tìm kiếm trên Google Maps (Mô phỏng)..." 
                enterButton="Tìm"
                size="large"
                style={{ 
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)', 
                  borderRadius: 8 
                }}
                onSearch={(value) => {
                  const newSearch = value.trim() || 'Hồ Hoàn Kiếm, Hà Nội';
                  setSubmittedSearchText(newSearch);
                  message.loading({ content: 'Đang tìm kiếm...', key: 'map-search', duration: 1 }).then(() => message.success({ content: 'Đã di chuyển tới vị trí!', key: 'map-search' }));
                }}
              />
            </AutoComplete>
          </div>

          {/* MAP IFRAME */}
          <iframe 
            src={`https://maps.google.com/maps?q=${encodeURIComponent(submittedSearchText)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
          ></iframe>

          {/* CENTER PIN */}
          <EnvironmentFilled 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -100%)', 
              fontSize: 42, 
              color: '#BA1A21', 
              pointerEvents: 'none', 
              zIndex: 10, 
              filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))' 
            }} 
          />
        </div>
        <div style={{ padding: '12px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EnvironmentOutlined style={{ color: '#BA1A21' }} />
          <Text type="secondary">Kéo bản đồ để ghim chính xác vào vị trí nhận hàng của bạn.</Text>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerCart;
