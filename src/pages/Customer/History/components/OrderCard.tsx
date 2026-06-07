import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Steps, Alert, Button, Rate, Popconfirm, Divider, Space, Modal, Radio, Input } from 'antd';
import Icon, { 
  SyncOutlined, 
  FireOutlined, 
  ShoppingOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  StarOutlined, 
  EditOutlined, 
  UserOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Text, Title } = Typography;
const { Step } = Steps;

const MotorbikeSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M19.44,9.03L15.41,5H11V7H14.59L17.18,9.59C15.93,10.29 15.06,11.53 14.86,13H11V11.5C11,10.67 10.33,10 9.5,10H5V12H9.5V13H8C5.79,13 4,14.79 4,17C4,19.21 5.79,21 8,21C10.12,21 11.85,19.34 11.99,17.25L15.34,18.06C15.65,19.74 17.17,21 19,21C21.21,21 23,19.21 23,17C23,14.88 21.35,13.15 19.28,13L19.44,9.03M8,19C6.9,19 6,18.1 6,17C6,15.9 6.9,15 8,15C9.1,15 10,15.9 10,17C10,18.1 9.1,19 8,19M19,19C17.9,19 17,18.1 17,17C17,15.9 17.9,15 19,15C20.1,15 21,15.9 21,17C21,18.1 20.1,19 19,19Z" />
  </svg>
);

interface Props {
  order: any;
  onRateOrder: (id: string) => void;
  onEditAddress: (order: any) => void;
  onCancel: (id: string, reason?: string) => void;
  onReorder: (order: any) => void;
  isNew?: boolean;
}

const OrderCard: React.FC<Props> = ({ order, onRateOrder, onEditAddress, onCancel, onReorder, isNew }) => {
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('Tôi muốn thay đổi món');
  const [otherReason, setOtherReason] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (order.status?.toUpperCase() !== 'PENDING') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const createdAtMs = moment(order.createdAt).valueOf();
      const expiresAt = createdAtMs + 15 * 60 * 1000;
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt, order.status]);

  const getStatusTag = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'PENDING': return <Tag color="orange" className="status-tag">Chờ duyệt</Tag>;
      case 'PREPARING': return <Tag color="processing" className="status-tag">Đang nấu</Tag>;
      case 'READY': return <Tag color="cyan" className="status-tag">{order.note?.includes('Giao đến') ? 'Đang giao' : 'Chờ lấy'}</Tag>;
      case 'COMPLETED': return <Tag color="success" className="status-tag">Hoàn thành</Tag>;
      case 'CANCELLED': return <Tag color="error" className="status-tag">Đã hủy</Tag>;
      default: return null;
    }
  };

  return (
    <Card 
      className={`order-card ${isNew ? 'running-border-animation' : ''}`}
      bodyStyle={{ padding: '24px' }} 
      style={{ 
        marginBottom: 20, 
        borderRadius: 16, 
        backgroundColor: '#fffdfa', // Màu nền hơi ngả kem ấm để nổi lên trên nền trắng
        border: '1px solid #ffecd4', 
        borderLeft: '6px solid #D53E0F', 
        boxShadow: '0 6px 24px rgba(213, 62, 15, 0.06)' // Shadow hơi ám cam cho hợp tone
      }}
    >
      {/* Header: ID, Time, Status */}
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 16, marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'inline-block', marginRight: 12 }}>{order.id}</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {order.status?.toUpperCase() === 'PENDING' && timeLeft && (
            <Tag color="warning" style={{ margin: 0, fontWeight: 'bold', padding: '4px 8px', fontSize: 14 }}>Chờ xác nhận: {timeLeft}</Tag>
          )}
        </div>
      </div>
      
      {/* Customer Info (Icon List Horizontal) */}
      <div style={{ background: '#fafafa', padding: '16px', borderRadius: 12, marginBottom: 20, border: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: '1 1 200px', background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
            <UserOutlined style={{ color: '#D53E0F', fontSize: 18, marginTop: 4 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Người nhận</Text>
              <Text strong style={{ fontSize: 14 }}>{order.customerName} - {order.customerPhone}</Text>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: '2 1 300px', background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
            <EnvironmentOutlined style={{ color: '#1890ff', fontSize: 18, marginTop: 4 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Giao đến</Text>
              <Text strong style={{ fontSize: 14 }}>{order.note?.replace('Giao đến: ', '')}</Text>
            </div>
          </div>
          
          {order.pickupTime && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: '1 1 150px', background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
              <ClockCircleOutlined style={{ color: '#52c41a', fontSize: 18, marginTop: 4 }} />
              <div>
                <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Hẹn lấy</Text>
                <Text strong style={{ fontSize: 14 }}>{order.pickupTime === 'asap' ? 'Lấy ngay' : order.pickupTime}</Text>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items List (Vertical) */}
      <div className="item-list" style={{ marginBottom: 20 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>Danh sách món ăn</Text>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="item-row" style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
              <img 
                src={item.product?.image || item.product?.imageUrl || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=150&q=80'} 
                alt={item.product?.name || 'Food'}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ fontSize: 16, display: 'block' }}>{item.product?.name}</Text>
                {item.selectedToppings && item.selectedToppings.length > 0 && (
                  <Text type="secondary" style={{ fontSize: 14, fontStyle: 'italic', display: 'block', marginTop: 4 }}>
                    +{item.selectedToppings.join(', ')}
                  </Text>
                )}
              </div>
              <div style={{ textAlign: 'right', minWidth: 80 }}>
                <Text strong style={{ fontSize: 16 }}>x{item.quantity}</Text>
              </div>
            </div>
          ))}
        </Space>
      </div>

      {/* Footer */}
      <div className="card-footer" style={{ paddingTop: 16, borderTop: '2px dashed #f0f0f0' }}>
        
        {/* Process Steps */}
        {order.status?.toUpperCase() !== 'CANCELLED' ? (
          <div style={{ margin: '16px 0 24px 0' }}>
            <Steps 
              current={['PENDING', 'PREPARING', 'READY', 'COMPLETED'].indexOf(order.status?.toUpperCase())} 
              size="default"
              responsive={true}
            >
              <Step 
                title={<span style={{ fontSize: 15, fontWeight: 500 }}>Chờ duyệt</span>} 
                icon={order.status?.toUpperCase() === 'PENDING' ? <SyncOutlined spin className="icon-spin-fast" /> : undefined}
              />
              <Step 
                title={<span style={{ fontSize: 15, fontWeight: 500 }}>Đang nấu</span>} 
                icon={order.status?.toUpperCase() === 'PREPARING' ? <FireOutlined className="icon-shake" style={{ color: '#D53E0F' }} /> : undefined}
              />
              <Step 
                title={<span style={{ fontSize: 15, fontWeight: 500 }}>{order.note?.includes('Giao đến') ? "Đang giao" : "Chờ lấy"}</span>} 
                icon={order.status?.toUpperCase() === 'READY' ? (
                  order.note?.includes('Giao đến') ? <Icon component={MotorbikeSvg} className="icon-pop" style={{ color: '#1890ff', fontSize: '1.2em' }} /> : <ShoppingOutlined className="icon-pop" style={{ color: '#1890ff' }} />
                ) : undefined}
              />
              <Step 
                title={<span style={{ fontSize: 15, fontWeight: 500 }}>Hoàn thành</span>} 
                icon={order.status?.toUpperCase() === 'COMPLETED' ? <CheckCircleOutlined className="icon-pop" style={{ color: '#52c41a' }} /> : undefined}
              />
            </Steps>
          </div>
        ) : (
          <div style={{ margin: '16px 0 24px 0' }}>
            <Steps current={0} size="default" status="error">
              <Step 
                title={
                  <span style={{ fontSize: 15, fontWeight: 500 }}>
                    Đã hủy {order.cancelMessage && <span style={{ color: '#cf1322', fontWeight: 'normal', marginLeft: 8 }}>- {order.cancelMessage}</span>}
                  </span>
                } 
                icon={<CloseCircleOutlined className="icon-pop" style={{ color: '#ff4d4f' }} />} 
              />
            </Steps>
            {order.cancelPromoCode && (
              <div style={{ marginTop: 16 }}>
                <Alert 
                  message={<Text strong style={{ color: '#cf1322', fontSize: 15 }}>Mã đền bù từ quán</Text>}
                  description={
                    <div style={{ background: '#fff1f0', padding: '12px 16px', borderRadius: '8px', display: 'inline-block', border: '1px dashed #ffa39e' }}>
                      Nhập mã: <Text strong copyable style={{ fontSize: '18px', color: '#cf1322' }}>{order.cancelPromoCode}</Text>
                    </div>
                  }
                  type="error" 
                  showIcon 
                  style={{ borderRadius: '12px', border: '1px solid #ffa39e' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Review section if completed */}
        {order.status?.toUpperCase() === 'COMPLETED' && (
          <div style={{ marginBottom: 20 }}>
            {order.rating ? (
              <div style={{ padding: '12px 16px', background: '#fffbe6', borderRadius: 12, border: '1px solid #ffe58f', display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 'bold', color: '#faad14' }}>Đánh giá:</span>
                <Rate disabled defaultValue={order.rating.stars} style={{ fontSize: 16 }} />
                <Text style={{ fontSize: 15, fontStyle: 'italic', color: '#595959', flex: 1 }}>
                  "{order.rating.comment || 'Không có bình luận.'}"
                </Text>
              </div>
            ) : (
              <Button 
                type="dashed" size="large" icon={<StarOutlined />} 
                onClick={() => onRateOrder(order.id)}
                style={{ color: '#faad14', borderColor: '#faad14', borderRadius: 12, fontWeight: 600 }}
              >Đánh giá món ăn</Button>
            )}
          </div>
        )}

        {/* Bottom Row: Total Price & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginTop: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            {order.status?.toUpperCase() === 'PENDING' && order.note?.includes('Giao đến') && (
              <Button size="large" className="action-btn" icon={<EditOutlined />} onClick={() => onEditAddress(order)}>
                Sửa địa chỉ
              </Button>
            )}
            {order.status?.toUpperCase() === 'PENDING' && (
              <Button size="large" className="danger-action-btn" onClick={() => setIsCancelModalVisible(true)}>Hủy đơn hàng</Button>
            )}
            {order.status?.toUpperCase() === 'COMPLETED' && (
              <Button size="large" className="reorder-btn" icon={<SyncOutlined />} onClick={() => onReorder(order)} style={{ color: 'white' }}>Đặt lại đơn này</Button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            {order.discountAmount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Text style={{ fontSize: 15, textDecoration: 'line-through', color: '#8c8c8c' }}>
                  {(order.totalAmount + order.discountAmount).toLocaleString()}đ
                </Text>
                <div className="coupon-ticket">
                  Mã {order.promoCode}: -{order.discountAmount.toLocaleString()}đ
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Text style={{ fontSize: 16, color: '#595959', fontWeight: 500 }}>Tổng thanh toán:</Text>
              <Title level={2} style={{ margin: 0, color: '#D53E0F', fontWeight: 800 }}>{order.totalAmount.toLocaleString()}đ</Title>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Lý do hủy đơn hàng"
        visible={isCancelModalVisible}
        onCancel={() => {
          setIsCancelModalVisible(false);
          setCancelReason('Tôi muốn thay đổi món');
          setOtherReason('');
        }}
        onOk={() => {
          const finalReason = cancelReason === 'Lý do khác' ? otherReason : cancelReason;
          if (cancelReason === 'Lý do khác' && !finalReason.trim()) {
            return;
          }
          onCancel(order.id, finalReason);
          setIsCancelModalVisible(false);
        }}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true, disabled: cancelReason === 'Lý do khác' && !otherReason.trim() }}
      >
        <div style={{ padding: '10px 0' }}>
          <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>Vui lòng chọn lý do hủy đơn:</Text>
          <Radio.Group onChange={(e) => setCancelReason(e.target.value)} value={cancelReason} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Radio value="Tôi muốn thay đổi món">Tôi muốn thay đổi món</Radio>
            <Radio value="Tôi muốn đổi địa chỉ / SĐT nhận hàng">Tôi muốn đổi địa chỉ / SĐT nhận hàng</Radio>
            <Radio value="Thời gian chờ quá lâu">Thời gian chờ quá lâu</Radio>
            <Radio value="Lý do khác">Lý do khác</Radio>
          </Radio.Group>
          
          {cancelReason === 'Lý do khác' && (
            <Input.TextArea
              rows={3}
              placeholder="Nhập lý do của bạn..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default OrderCard;
