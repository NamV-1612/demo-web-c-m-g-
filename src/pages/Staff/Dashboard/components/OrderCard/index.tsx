import React from 'react';
import { Card, Typography, Button, Space, Tag, Switch, Popconfirm } from 'antd';
import { CheckOutlined, CloseOutlined, PrinterOutlined } from '@ant-design/icons';
import { Order } from '@/services/typing';
import moment from 'moment';
import './style.less';

const { Text } = Typography;

interface Props {
  order: Order;
  onStatusChange: (id: string, status: Order['status']) => void;
  onPrint: (order: Order) => void;
  onPaymentChange: (id: string, isPaid: boolean) => void;
}

const OrderCard: React.FC<Props> = ({ order, onStatusChange, onPrint, onPaymentChange }) => {
  const isUrgent = order.pickupTime !== 'asap' && moment(order.pickupTime, ['HH:mm', 'hh:mm A']).diff(moment(), 'minutes') < 10;
  const isNewOrder = order.status === 'PENDING' && moment().diff(moment(order.createdAt), 'minutes') < 5;
  
  return (
    <Card 
      size="small" 
      className={`order-card ${isUrgent ? 'urgent' : 'normal'} ${isNewOrder ? 'new-order-highlight' : ''}`}
      bodyStyle={{ padding: '8px' }}
    >
      {isNewOrder && <div className="new-badge">MỚI</div>}
      <div className="card-header" style={{ marginBottom: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 14 }}>#{order.id}</Text>
        <div style={{ fontSize: 12, textAlign: 'right' }}>
          <Text strong>{order.customerName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{order.customerPhone}</Text>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, borderBottom: '1px dashed #f0f0f0', paddingBottom: 4 }}>
        <Tag color="volcano" style={{ margin: 0, fontSize: 11, lineHeight: '18px', padding: '0 4px' }}>
          {order.pickupTime === 'asap' ? 'Ngay (15p)' : order.pickupTime}
        </Tag>
        <div className="payment-status" style={{ margin: 0, gap: 4, display: 'flex', alignItems: 'center' }}>
          <Text style={{ fontSize: 12 }}>{order.paymentMethod === 'cash' ? '💵 Tiền mặt' : '💳 Chuyển khoản'}</Text>
        </div>
      </div>

      <div className="item-list" style={{ padding: '4px 6px', margin: '4px 0', background: '#fffbe6', borderRadius: 4, border: '1px solid #ffe58f' }}>
        {order.items.map((item, idx) => (
          <div key={idx} className="item-row" style={{ display: 'flex', flexDirection: 'column', marginBottom: idx < order.items.length - 1 ? 4 : 0, borderBottom: idx < order.items.length - 1 ? '1px dashed #ffe58f' : 'none', paddingBottom: idx < order.items.length - 1 ? 4 : 0 }}>
            <div style={{ fontSize: 13, lineHeight: '1.2' }}><Text strong>{item.quantity}x</Text> {item.product.name}</div>
            {item.selectedToppings.length > 0 && <div className="topping-text" style={{ fontSize: 11, color: '#8c8c8c', lineHeight: '1.2', marginTop: 2 }}>+ {item.selectedToppings.join(', ')}</div>}
            {item.note && <div className="note-text" style={{ fontSize: 11, color: '#BA1A21', fontWeight: 'bold', lineHeight: '1.2', marginTop: 2 }}>* Lưu ý: {item.note}</div>}
          </div>
        ))}
      </div>

      <div className="card-footer">
        <Text className="price">{order.totalAmount.toLocaleString()}đ</Text>
        <Space size="small">
          {order.status === 'PENDING' && (
            <Popconfirm overlayClassName="custom-popconfirm" title="Xác nhận duyệt đơn cho bếp nấu?" onConfirm={() => onStatusChange(order.id, 'PREPARING')} okText="Duyệt" cancelText="Hủy">
              <Button size="small" className="custom-action-btn btn-primary-red">Duyệt nấu</Button>
            </Popconfirm>
          )}
          {order.status === 'PREPARING' && (
            <Popconfirm overlayClassName="custom-popconfirm custom-popconfirm-green" title="Món ăn đã sẵn sàng?" onConfirm={() => onStatusChange(order.id, 'READY')} okText="Xong" cancelText="Chưa">
              <Button size="small" className="custom-action-btn btn-primary-green">Xong</Button>
            </Popconfirm>
          )}
          {order.status === 'READY' && (
            <Popconfirm overlayClassName="custom-popconfirm" title="Xác nhận giao hàng thành công?" onConfirm={() => onStatusChange(order.id, 'COMPLETED')} okText="Giao" cancelText="Chưa">
              <Button size="small" icon={<CheckOutlined />} className="custom-action-btn btn-primary-red">Giao</Button>
            </Popconfirm>
          )}
          
          <Button size="small" icon={<PrinterOutlined />} className="custom-icon-btn" onClick={() => onPrint(order)} />
          {order.status === 'PENDING' && (
            <Popconfirm overlayClassName="custom-popconfirm" title="Bạn có chắc chắn muốn hủy đơn này?" onConfirm={() => onStatusChange(order.id, 'CANCELLED')} okText="Hủy đơn" cancelText="Không" okButtonProps={{ danger: true }}>
              <Button size="small" className="custom-icon-btn btn-danger" icon={<CloseOutlined />} />
            </Popconfirm>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default OrderCard;
