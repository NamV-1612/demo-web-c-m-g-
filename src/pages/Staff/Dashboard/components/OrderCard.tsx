import React from 'react';
import { Card, Typography, Button, Space, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, PrinterOutlined, DollarOutlined } from '@ant-design/icons';
import { Order } from '@/services/typing';
import moment from 'moment';

const { Text } = Typography;

interface Props {
  order: Order;
  onStatusChange: (id: string, status: Order['status']) => void;
  onPrint: (order: Order) => void;
}

const OrderCard: React.FC<Props> = ({ order, onStatusChange, onPrint }) => {
  const isUrgent = order.pickupTime !== 'asap' && moment(order.pickupTime, 'HH:mm').diff(moment(), 'minutes') < 10;
  
  return (
    <Card 
      size="small" 
      style={{ marginBottom: 12, borderLeft: isUrgent ? '4px solid #f5222d' : '4px solid #1890ff' }}
      bodyStyle={{ padding: '12px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text strong style={{ fontSize: 16 }}>{order.id}</Text>
        <Tag color="volcano">{order.pickupTime === 'asap' ? 'Lấy ngay (15p)' : order.pickupTime}</Tag>
      </div>
      <Text strong>{order.customerName}</Text> - <Text type="secondary">{order.customerPhone}</Text>
      
      <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, margin: '8px 0' }}>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ marginBottom: 4 }}>
            <Text strong>{item.quantity}x {item.product.name}</Text>
            {item.selectedToppings.length > 0 && <div style={{ fontSize: 12, color: '#666' }}>+ {item.selectedToppings.join(', ')}</div>}
            {item.note && <div style={{ fontSize: 12, color: '#f5222d', fontWeight: 'bold' }}>Lưu ý: {item.note}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="danger" strong>{order.totalAmount.toLocaleString()}đ</Text>
        <Space size="small">
          {order.status === 'PENDING' && <Button size="small" type="primary" onClick={() => onStatusChange(order.id, 'PREPARING')}>Duyệt nấu</Button>}
          {order.status === 'PREPARING' && <Button size="small" type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => onStatusChange(order.id, 'READY')}>Xong</Button>}
          {order.status === 'READY' && <Button size="small" type="primary" icon={<DollarOutlined />} onClick={() => onStatusChange(order.id, 'COMPLETED')}>Giao</Button>}
          
          <Button size="small" icon={<PrinterOutlined />} onClick={() => onPrint(order)} />
          {order.status === 'PENDING' && <Button size="small" danger icon={<CloseOutlined />} onClick={() => onStatusChange(order.id, 'CANCELLED')} />}
        </Space>
      </div>
    </Card>
  );
};

export default OrderCard;
