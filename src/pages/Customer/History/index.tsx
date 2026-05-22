import React, { useState } from 'react';
import { Card, Typography, Button, Tag, message, Steps, Modal, Rate, Input, Empty, Popconfirm, Form } from 'antd';
import { SyncOutlined, StarOutlined, HistoryOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import moment from 'moment';
import './style.less';

const { Title, Text } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const CustomerHistory: React.FC = () => {
  const { orders, rateOrder, updateOrderInfo, deleteOrder } = useModel('useOrderModel');
  const { currentUser } = useModel('useAuthModel');
  const { addToCart } = useModel('useCartModel');

  const [form] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

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

  return (
    <div className="history-container">
      <div className="history-header-title">
        <HistoryOutlined style={{ fontSize: 28 }} />
        <Title level={3} style={{ margin: 0, color: 'inherit' }}>Lịch sử Đơn hàng</Title>
      </div>
      
      {myOrders.length === 0 ? (
        <div style={{ padding: '60px 0', background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0' }}>
          <Empty description="Bạn chưa có đơn hàng nào." />
        </div>
      ) : (
        myOrders.map(order => (
          <Card key={order.id} className="history-card" bodyStyle={{ padding: 16 }}>
            <div className="card-header">
              <Text strong style={{ fontSize: 16 }}>Đơn hàng: {order.id}</Text>
              <div>
                {getStatusTag(order.status)}
              </div>
            </div>
            
            <Text style={{ display: 'block', marginBottom: 8, color: '#595959' }}>
              Đặt lúc: {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
            </Text>
            
            <div style={{ background: '#fafafa', padding: '8px 12px', borderRadius: 8, marginBottom: 16, fontSize: 13, border: '1px solid #f0f0f0' }}>
              <div style={{ marginBottom: 4 }}><Text strong>Người nhận:</Text> {order.customerName} - {order.customerPhone}</div>
              <div><Text strong>Giao đến:</Text> {order.note?.replace('Giao đến: ', '')}</div>
            </div>

            <div className="item-list">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="item-row" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <img 
                    src={item.product?.image || item.product?.imageUrl || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=150&q=80'} 
                    alt={item.product?.name || 'Food'}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{item.quantity}x {item.product?.name}</Text>
                    </div>
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <div style={{ fontSize: 13, color: '#595959', marginTop: 4 }}>
                        + {item.selectedToppings.join(', ')}
                      </div>
                    )}
                    {item.note && (
                      <div style={{ fontSize: 13, color: '#BA1A21', fontStyle: 'italic', marginTop: 4 }}>
                        * Ghi chú: {item.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* Removed the generic note rendering here since it's now displayed as Delivery Address above */}
            </div>

            <div className="card-footer">
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <Steps 
                  current={['PENDING', 'PREPARING', 'READY', 'COMPLETED'].indexOf(order.status?.toUpperCase())} 
                  size="small"
                  status={order.status?.toUpperCase() === 'CANCELLED' ? 'error' : 'process'}
                >
                  <Step title="Chờ duyệt" />
                  <Step title="Đang nấu" />
                  <Step title="Chờ lấy" />
                  <Step title="Hoàn thành" />
                </Steps>
              </div>

              {/* Hẹn giờ & hình thức thanh toán */}
              <div style={{ marginBottom: 12, fontSize: 13 }}>
                {order.pickupTime && (
                  <div>
                    <Text strong>Thời gian nhận: </Text>
                    <Text>{order.pickupTime}</Text>
                  </div>
                )}
                <div>
                  <Text strong>Thanh toán: </Text>
                  <Text>{order.paymentMethod === 'transfer' ? 'Chuyển khoản QR' : 'Tiền mặt khi nhận'}</Text>
                  <Tag color={order.isPaid ? 'green' : 'red'} className="status-tag" style={{ marginLeft: 8 }}>
                    {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Tag>
                </div>
              </div>

              {/* Review section */}
              {order.status?.toUpperCase() === 'COMPLETED' && (
                <div style={{ margin: '16px 0', borderTop: '1px dashed #f0f0f0', paddingTop: 12 }}>
                  {order.rating ? (
                    <div style={{ padding: '8px 12px', background: '#fafafa', borderRadius: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ marginRight: 8, fontSize: 13, fontWeight: 'bold' }}>Đánh giá của bạn:</span>
                        <Rate disabled defaultValue={order.rating.stars} style={{ fontSize: 14 }} />
                      </div>
                      <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#595959' }}>
                        "{order.rating.comment || 'Không có bình luận.'}"
                      </Text>
                    </div>
                  ) : (
                    <Button 
                      type="dashed" 
                      size="middle" 
                      icon={<StarOutlined />} 
                      onClick={() => {
                        setRatingOrderId(order.id);
                        setStars(5);
                        setComment('');
                        setIsRateModalVisible(true);
                      }}
                      style={{ color: '#BA1A21', borderColor: '#BA1A21' }}
                    >
                      Đánh giá món ăn
                    </Button>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Title level={5} style={{ margin: 0, color: '#f5222d' }}>{order.totalAmount.toLocaleString()}đ</Title>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {order.status?.toUpperCase() === 'PENDING' && (
                    <Button type="default" icon={<EditOutlined />} className="action-btn" onClick={() => {
                      setEditingOrder(order);
                      form.setFieldsValue({
                        phone: order.customerPhone,
                        address: order.note?.replace('Giao đến: ', '') || ''
                      });
                      setIsEditModalVisible(true);
                    }}>
                      Sửa ĐC/SĐT
                    </Button>
                  )}
                  {['COMPLETED', 'CANCELLED', 'PENDING'].includes(order.status?.toUpperCase()) && (
                    <Popconfirm 
                      title={order.status?.toUpperCase() === 'PENDING' ? "Bạn có chắc chắn muốn hủy và xóa đơn hàng này không?" : "Bạn có chắc chắn muốn xóa lịch sử đơn hàng này?"} 
                      onConfirm={() => deleteOrder(order.id)} 
                      okText={order.status?.toUpperCase() === 'PENDING' ? "Hủy & Xóa" : "Xóa"} 
                      cancelText="Đóng"
                    >
                      <Button danger icon={<DeleteOutlined />} className="danger-action-btn">
                        {order.status?.toUpperCase() === 'PENDING' ? "Hủy Đơn" : "Xóa"}
                      </Button>
                    </Popconfirm>
                  )}
                  {order.status?.toUpperCase() === 'COMPLETED' && (
                    <Button type="primary" icon={<SyncOutlined />} className="reorder-btn" onClick={() => handleReorder(order)}>
                      Đặt lại đơn này
                    </Button>
                  )}
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
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#BA1A21', borderColor: '#BA1A21' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ giao hàng" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerHistory;
