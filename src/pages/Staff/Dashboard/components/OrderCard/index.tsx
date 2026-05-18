import React from 'react';
import { Card, Typography, Button, Space, Tag, Switch } from 'antd';
import { CheckOutlined, CloseOutlined, PrinterOutlined, DollarOutlined } from '@ant-design/icons';
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
  const isUrgent = order.pickupTime !== 'asap' && moment(order.pickupTime, 'HH:mm').diff(moment(), 'minutes') < 10;
  
  return (
    <Card 
      size="small" 
      className={`order-card ${isUrgent ? 'urgent' : 'normal'}`}
      bodyStyle={{ padding: '12px' }}
    >
      <div className="card-header">
        <Text strong style={{ fontSize: 16 }}>{order.id}</Text>
        <Tag color="volcano">{order.pickupTime === 'asap' ? 'Lấy ngay (15p)' : order.pickupTime}</Tag>
      </div>
      <Text strong>{order.customerName}</Text> - <Text type="secondary">{order.customerPhone}</Text>
      
      <div className="payment-status">
        <Text>{order.paymentMethod === 'cash' ? '💵 Tiền mặt' : '💳 Chuyển khoản'}</Text>
        <Switch 
          checkedChildren="Đã thu" 
          unCheckedChildren="Chưa thu" 
          checked={order.isPaid}
          onChange={(checked) => onPaymentChange(order.id, checked)}
        />
      </div>

      <div className="item-list">
        {order.items.map((item, idx) => (
          <div key={idx} className="item-row">
            <Text strong>{item.quantity}x {item.product.name}</Text>
            {item.selectedToppings.length > 0 && <div className="topping-text">+ {item.selectedToppings.join(', ')}</div>}
            {item.note && <div className="note-text">Lưu ý: {item.note}</div>}
          </div>
        ))}
      </div>

      <div className="card-footer">
        <Text className="price">{order.totalAmount.toLocaleString()}đ</Text>
        <Space size="small">
          {order.status === 'PENDING' && <Button size="small" type="primary" onClick={() => onStatusChange(order.id, 'PREPARING')}>Duyệt nấu</Button>}
          {order.status === 'PREPARING' && <Button size="small" type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => onStatusChange(order.id, 'READY')}>Xong</Button>}
          {order.status === 'READY' && <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => onStatusChange(order.id, 'COMPLETED')}>Giao</Button>}
          
          <Button size="small" icon={<PrinterOutlined />} onClick={() => onPrint(order)} />
          {order.status === 'PENDING' && <Button size="small" danger icon={<CloseOutlined />} onClick={() => onStatusChange(order.id, 'CANCELLED')} />}
        </Space>
      </div>
    </Card>
  );
};

export default OrderCard;
