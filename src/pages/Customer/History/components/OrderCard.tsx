import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Steps, Alert, Button, Rate, Popconfirm } from 'antd';
import { SyncOutlined, FireOutlined, ShoppingOutlined, CheckCircleOutlined, CloseCircleOutlined, StarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text, Title } = Typography;
const { Step } = Steps;

interface OrderCardProps {
  order: any;
  onReorder: (order: any) => void;
  onCancel: (orderId: string) => void;
  onEditAddress: (order: any) => void;
  onRateOrder: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onReorder, onCancel, onEditAddress, onRateOrder }) => {
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

  return (
    <Card className="history-card" bodyStyle={{ padding: '16px' }} style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #f0f0f0', borderLeft: '6px solid #BA1A21', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
      {/* Header: ID, Time, Status */}
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 12 }}>
        <div>
          <Text strong style={{ fontSize: 16 }}>#{order.id}</Text>
          <Text type="secondary" style={{ marginLeft: 12, fontSize: 13 }}>
            {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
        {order.status?.toUpperCase() === 'PENDING' && timeLeft && (
          <Tag color="error" style={{ margin: 0, fontWeight: 'bold' }}>Tự hủy sau: {timeLeft}</Tag>
        )}
      </div>
      
      {/* Customer Info (Inline) */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', background: '#fafafa', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13, border: '1px solid #f0f0f0' }}>
        <div><Text strong>Người nhận:</Text> {order.customerName} - {order.customerPhone}</div>
        <div><Text strong>Giao đến:</Text> {order.note?.replace('Giao đến: ', '')}</div>
        {order.pickupTime && (
          <div><Text strong>Hẹn lấy:</Text> {order.pickupTime === 'asap' ? 'Lấy ngay' : order.pickupTime}</div>
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
                onClick={() => onRateOrder(order.id)}
                style={{ color: '#faad14', borderColor: '#faad14' }}
              >Đánh giá món ăn</Button>
            )}
          </div>
        )}

        {/* Bottom Row: Total Price & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {order.status?.toUpperCase() === 'PENDING' && (
              <Button size="middle" className="btn-premium-edit" icon={<EditOutlined />} onClick={() => onEditAddress(order)}>
                Sửa ĐC
              </Button>
            )}
            {order.status?.toUpperCase() === 'PENDING' && (
              <Popconfirm 
                title="Bạn có chắc chắn muốn hủy đơn hàng này?" 
                onConfirm={() => onCancel(order.id)} okText="Có, Hủy" cancelText="Không"
              >
                <Button size="middle" type="primary" danger>Hủy đơn hàng</Button>
              </Popconfirm>
            )}
            {order.status?.toUpperCase() === 'COMPLETED' && (
              <Button size="middle" className="btn-premium-success" icon={<SyncOutlined />} onClick={() => onReorder(order)}>Đặt lại</Button>
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
  );
};

export default OrderCard;
