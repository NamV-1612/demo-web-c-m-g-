import React from 'react';
import { Card, Typography, Button, Tag, Space, message, Steps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import moment from 'moment';
import './style.less';

const { Title, Text } = Typography;
const { Step } = Steps;

const CustomerHistory: React.FC = () => {
  const { orders } = useModel('useOrderModel');
  const { currentUser } = useModel('useAuthModel');
  const { addToCart } = useModel('useCartModel');

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
    const map: any = {
      pending: { color: 'orange', text: 'Chờ duyệt' },
      cooking: { color: 'blue', text: 'Đang nấu' },
      ready: { color: 'green', text: 'Chờ lấy' },
      completed: { color: 'gray', text: 'Hoàn thành' },
      cancelled: { color: 'red', text: 'Đã hủy' },
    };
    return <Tag color={map[status].color}>{map[status].text}</Tag>;
  };

  return (
    <div className="history-container">
      <Title level={4}>Lịch sử Đơn hàng</Title>
      
      {myOrders.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>Bạn chưa có đơn hàng nào.</div>
      ) : (
        myOrders.map(order => (
          <Card key={order.id} className="history-card" bodyStyle={{ padding: 16 }}>
            <div className="card-header">
              <Text strong>{order.id}</Text>
              {getStatusTag(order.status)}
            </div>
            
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              Đặt lúc: {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
            </Text>

            <div className="item-list">
              {order.items.map((item, idx) => (
                <div key={idx}>
                  <Text strong>{item.quantity}x {item.product.name}</Text>
                  {item.selectedToppings.length > 0 && <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>({item.selectedToppings.join(', ')})</span>}
                </div>
              ))}
            </div>

            <div className="card-footer">
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <Steps 
                  current={['PENDING', 'PREPARING', 'READY', 'COMPLETED'].indexOf(order.status)} 
                  size="small"
                  status={order.status === 'CANCELLED' ? 'error' : 'process'}
                >
                  <Step title="Chờ duyệt" />
                  <Step title="Đang nấu" />
                  <Step title="Chờ lấy" />
                  <Step title="Hoàn thành" />
                </Steps>
              </div>

              <Title level={5} style={{ margin: 0, color: '#f5222d' }}>{order.totalAmount.toLocaleString()}đ</Title>
              <Button type="primary" size="small" icon={<SyncOutlined />} className="reorder-btn" onClick={() => handleReorder(order)}>
                Đặt lại đơn này
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default CustomerHistory;
