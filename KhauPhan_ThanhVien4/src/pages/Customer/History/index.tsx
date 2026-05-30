import React, { useState, useRef } from 'react';
import { Card, Typography, Button, Tag, message, Steps, Modal, Rate, Input, Empty, Popconfirm, Form, AutoComplete, Alert } from 'antd';
import { SyncOutlined, StarOutlined, HistoryOutlined, EditOutlined, DeleteOutlined, FireOutlined, ShoppingOutlined, CheckCircleOutlined, CloseCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import moment from 'moment';
import './style.less';

const { Title, Text } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const CustomerHistory: React.FC = () => {
  const { orders, rateOrder, updateOrderInfo, cancelOrder } = useModel('useOrderModel');
  const { currentUser } = useModel('useAuthModel');
  const { addToCart } = useModel('useCartModel');

  const [form] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  // States for Map Modal
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapSearchText, setMapSearchText] = useState('');
  const [submittedSearchText, setSubmittedSearchText] = useState('21.0285,105.8542');
  const [mapOptions, setMapOptions] = useState<any[]>([]);
  const searchTimeoutRef = useRef<any>(null);

  // States for Rating Modal
  const [isRateModalVisible, setIsRateModalVisible] = useState(false);
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  const myOrders = orders.filter(o => o.customerId === currentUser?.id);

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      // Đổi ID để không trùng lặp trong giỏ
      const newItem = { ...item, cartItemId: Math.random().toString(36).substring(7) };
      addToCart(newItem);
    });
    message.success('Đã thêm lại các món vào giỏ hàng!');
    history.push('/customer/cart');
  };

  const getStatusTag = (status: string) => {
    const s = status?.toUpperCase();
    const map: any = {
      PENDING: { color: 'orange', text: 'Chờ xác nhận' },
      PREPARING: { color: 'blue', text: 'Đang chế biến' },
      READY: { color: 'green', text: 'Đã sẵn sàng' },
      COMPLETED: { color: 'gray', text: 'Hoàn thành' },
      CANCELLED: { color: 'red', text: 'Đã hủy' },
    };
    const info = map[s] || { color: 'default', text: status };
    return <Tag color={info.color} className="status-tag">{info.text}</Tag>;
  };

  const handleRateSubmit = () => {
    if (ratingOrderId) {
      rateOrder(ratingOrderId, { stars, comment });
      setIsRateModalVisible(false);
      setRatingOrderId(null);
    }
  };

  const handleEditSubmit = (values: any) => {
    if (editingOrder) {
      updateOrderInfo(editingOrder.id, { phone: values.phone, address: values.address });
      setIsEditModalVisible(false);
      setEditingOrder(null);
    }
  };

  const handleMapSearch = (value: string) => {
    if (!value.trim()) {
      setMapOptions([]);
      return;
    }
    setMapSearchText(value);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&countrycodes=vn`);
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

  const handleMapSelect = (value: string, option: any) => {
    form.setFieldsValue({ address: value });
    setSubmittedSearchText(`${option.lat},${option.lon}`);
    setIsMapModalVisible(false);
    message.success('Đã lấy vị trí từ Bản đồ!');
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <Title level={2} className="art-title">
          Lịch sử <span style={{ color: '#BA1A21' }}>Đơn hàng</span>
        </Title>
      </div>
      
      {myOrders.length === 0 ? (
        <div style={{ padding: '60px 0', background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0' }}>
          <Empty description="Bạn chưa có đơn hàng nào." />
        </div>
      ) : (
        myOrders.map(order => (
          <Card key={order.id} className="history-card" bodyStyle={{ padding: '16px' }} style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #f0f0f0', borderLeft: '6px solid #BA1A21', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
            {/* Header: ID, Time, Status */}
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 12 }}>
              <div>
                <Text strong style={{ fontSize: 16 }}>#{order.id}</Text>
                <Text type="secondary" style={{ marginLeft: 12, fontSize: 13 }}>
                  {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
            </div>
            
            {/* Customer Info (Inline) */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', background: '#fafafa', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13, border: '1px solid #f0f0f0' }}>
              <div><Text strong>Người nhận:</Text> {order.customerName} - {order.customerPhone}</div>
              <div><Text strong>Giao đến:</Text> {order.note?.replace('Giao đến: ', '')}</div>
              {order.pickupTime && (
                <div><Text strong>Hẹn lấy:</Text> {order.pickupTime}</div>
              )}
            </div>

            {/* Items Grid (Compact) */}
            <div className="item-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="item-row" style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#fff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                  <img 
                    src={item.product?.image || item.product?.imageUrl || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=150&q=80'} 
                    alt={item.product?.name || 'Food'}
                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', fontSize: 13 }}>{item.quantity}x {item.product?.name}</Text>
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>+{item.selectedToppings.join(', ')}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="card-footer" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #f0f0f0' }}>
              
              {/* Process Steps */}
              {order.status?.toUpperCase() !== 'CANCELLED' ? (
                <div style={{ margin: '8px 0 16px 0' }}>
                  <Steps 
                    current={['PENDING', 'PREPARING', 'READY', 'COMPLETED'].indexOf(order.status?.toUpperCase())} 
                    size="small"
                  >
                    <Step 
                      title="Chờ duyệt" 
                      icon={order.status?.toUpperCase() === 'PENDING' ? <SyncOutlined spin className="icon-spin-fast" /> : undefined}
                    />
                    <Step 
                      title="Đang nấu" 
                      icon={order.status?.toUpperCase() === 'PREPARING' ? <FireOutlined className="icon-shake" style={{ color: '#BA1A21' }} /> : undefined}
                    />
                    <Step 
                      title="Chờ lấy" 
                      icon={order.status?.toUpperCase() === 'READY' ? <ShoppingOutlined className="icon-pop" style={{ color: '#1890ff' }} /> : undefined}
                    />
                    <Step 
                      title="Hoàn thành" 
                      icon={order.status?.toUpperCase() === 'COMPLETED' ? <CheckCircleOutlined className="icon-pop" style={{ color: '#52c41a' }} /> : undefined}
                    />
                  </Steps>
                </div>
              ) : (
                <div style={{ margin: '8px 0 16px 0' }}>
                  <Steps current={0} size="small" status="error">
                    <Step title="Đã hủy" icon={<CloseCircleOutlined className="icon-pop" style={{ color: '#ff4d4f' }} />} />
                  </Steps>
                  {order.cancelMessage && (
                    <div style={{ marginTop: 12 }}>
                      <Alert 
                        message={<Text strong style={{ color: '#cf1322' }}>Thông báo từ quán</Text>}
                        description={
                          <div>
                            <p style={{ margin: '0 0 8px 0', color: '#cf1322' }}>{order.cancelMessage}</p>
                            {order.cancelPromoCode && (
                              <div style={{ background: '#fff1f0', padding: '8px 12px', borderRadius: '6px', display: 'inline-block', border: '1px dashed #ffa39e' }}>
                                Mã đền bù: <Text strong copyable style={{ fontSize: '16px', color: '#cf1322' }}>{order.cancelPromoCode}</Text>
                              </div>
                            )}
                          </div>
                        }
                        type="error" 
                        showIcon 
                        style={{ borderRadius: '8px', border: '1px solid #ffa39e' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Review section if completed */}
              {order.status?.toUpperCase() === 'COMPLETED' && (
                <div style={{ marginBottom: 12 }}>
                  {order.rating ? (
                    <div style={{ padding: '6px 12px', background: '#fffbe6', borderRadius: 6, border: '1px solid #ffe58f', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 'bold', color: '#faad14' }}>Đánh giá:</span>
                      <Rate disabled defaultValue={order.rating.stars} style={{ fontSize: 13 }} />
                      <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#595959', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        "{order.rating.comment || 'Không có bình luận.'}"
                      </Text>
                    </div>
                  ) : (
                    <Button 
                      type="dashed" size="small" icon={<StarOutlined />} 
                      onClick={() => { setRatingOrderId(order.id); setStars(5); setComment(''); setIsRateModalVisible(true); }}
                      style={{ color: '#faad14', borderColor: '#faad14' }}
                    >Đánh giá món ăn</Button>
                  )}
                </div>
              )}

              {/* Bottom Row: Total Price & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {order.status?.toUpperCase() === 'PENDING' && (
                    <Button size="middle" className="btn-premium-edit" icon={<EditOutlined />} onClick={() => {
                      setEditingOrder(order);
                      form.setFieldsValue({ phone: order.customerPhone, address: order.note?.replace('Giao đến: ', '') || '' });
                      setIsEditModalVisible(true);
                    }}>Sửa ĐC</Button>
                  )}
                  {order.status?.toUpperCase() === 'PENDING' && (
                    <Popconfirm 
                      title="Bạn có chắc chắn muốn hủy đơn hàng này?" 
                      onConfirm={() => cancelOrder(order.id)} okText="Có, Hủy" cancelText="Không"
                    >
                      <Button size="middle" type="primary" danger icon={<DeleteOutlined />}>Hủy Đơn</Button>
                    </Popconfirm>
                  )}
                  {order.status?.toUpperCase() === 'COMPLETED' && (
                    <Button size="middle" className="btn-premium-success" icon={<SyncOutlined />} onClick={() => handleReorder(order)}>Đặt lại</Button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  {order.discountAmount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8c8c8c' }}>
                      <Text style={{ fontSize: 13 }}>Tạm tính: {(order.totalAmount + order.discountAmount).toLocaleString()}đ</Text>
                      <Tag color="green" style={{ margin: 0 }}>Mã {order.promoCode}: -{order.discountAmount.toLocaleString()}đ</Tag>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <Text style={{ fontSize: 15, color: '#595959', fontWeight: 500 }}>Tổng thanh toán:</Text>
                    <Title level={3} style={{ margin: 0, color: '#BA1A21', fontWeight: 700 }}>{order.totalAmount.toLocaleString()}đ</Title>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* RATING MODAL */}
      <Modal
        title="Đánh giá chất lượng dịch vụ"
        visible={isRateModalVisible}
        onOk={handleRateSubmit}
        onCancel={() => setIsRateModalVisible(false)}
        okText="Gửi đánh giá"
        cancelText="Hủy"
        okButtonProps={{ disabled: stars === 0, style: { background: '#BA1A21', borderColor: '#BA1A21' } }}
      >
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <p style={{ fontWeight: 'bold' }}>Đơn hàng: {ratingOrderId}</p>
          <Rate value={stars} onChange={setStars} style={{ fontSize: 32 }} />
          <p style={{ marginTop: 8, color: '#8c8c8c' }}>
            {stars === 5 ? 'Tuyệt vời!' : stars === 4 ? 'Hài lòng' : stars === 3 ? 'Bình thường' : stars === 2 ? 'Tệ' : stars === 1 ? 'Quá tệ!' : ''}
          </p>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Bình luận / Góp ý:</label>
          <TextArea 
            rows={4} 
            placeholder="Hãy chia sẻ trải nghiệm của bạn về món ăn và dịch vụ..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        title="Sửa thông tin giao hàng"
        visible={isEditModalVisible}
        onCancel={() => { setIsEditModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#BA1A21', borderColor: '#BA1A21' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^(0[35789])[0-9]{8}$/, message: 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Địa chỉ giao hàng" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <Button type="dashed" onClick={() => setIsMapModalVisible(true)} icon={<EnvironmentOutlined />} style={{ flex: 1, borderColor: '#1890ff', color: '#1890ff' }}>
                Chọn từ Google Maps
              </Button>
            </div>
            <Form.Item name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
              <TextArea rows={3} placeholder="Hoặc điền thủ công địa chỉ nhận hàng..." />
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>

      {/* MAP MODAL */}
      <Modal 
        title={<><EnvironmentOutlined /> Chọn vị trí trên Bản đồ</>}
        visible={isMapModalVisible}
        onCancel={() => setIsMapModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ padding: 0, borderRadius: '8px', overflow: 'hidden' }}
        closeIcon={<div style={{ background: '#f5f5f5', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</div>}
      >
        <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', gap: '8px' }} className="map-search-input">
            <AutoComplete
              options={mapOptions}
              onSearch={handleMapSearch}
              onSelect={handleMapSelect}
              style={{ flex: 1 }}
            >
              <Input.Search 
                size="large" 
                placeholder="Nhập địa chỉ bạn muốn tìm (VD: Hồ Gươm)..." 
                enterButton="Tìm"
                onSearch={(val) => {
                  if (val.trim() && mapOptions.length === 0) {
                    setSubmittedSearchText(val);
                  }
                }}
              />
            </AutoComplete>
          </div>
        </div>
        <div style={{ width: '100%', height: '400px', background: '#e6e6e6', position: 'relative' }}>
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(submittedSearchText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            allowFullScreen
          />
        </div>
        <div style={{ padding: '16px 24px', background: '#fafafa', borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
          <Button onClick={() => setIsMapModalVisible(false)} style={{ borderRadius: '8px' }}>Hủy</Button>
          <Button type="primary" onClick={() => {
            const val = mapSearchText;
            if (val) {
              form.setFieldsValue({ address: val });
              message.success('Đã xác nhận địa chỉ này!');
            }
            setIsMapModalVisible(false);
          }} style={{ marginLeft: '12px', background: '#BA1A21', borderColor: '#BA1A21', borderRadius: '8px' }}>Xác nhận vị trí này</Button>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerHistory;
