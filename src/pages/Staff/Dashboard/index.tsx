import React, { useState } from 'react';
import { Row, Col, Typography, Button, Drawer, List, Switch } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import OrderCard from './components/OrderCard';
import { Order } from '@/services/typing';
import { updateOrderStatus } from '@/services/order';
import { getOrders } from '@/services/order';
import './style.less';

const { Title, Text } = Typography;

const StaffDashboard: React.FC = () => {
  const { orders, refreshOrders, changeOrderStatus } = useModel('useOrderModel');
  const { menu, toggleProductAvailability } = useModel('useMenuModel');
  const [inventoryVisible, setInventoryVisible] = useState(false);

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const cookingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');

  const handlePaymentChange = (id: string, isPaid: boolean) => {
    const rawOrders = getOrders();
    const orderIndex = rawOrders.findIndex(o => o.id === id);
    if (orderIndex > -1) {
      rawOrders[orderIndex].isPaid = isPaid;
      localStorage.setItem('ORDER_DATA', JSON.stringify(rawOrders));
      refreshOrders();
    }
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '', 'width=300,height=400');
    if (printWindow) {
      printWindow.document.write(`
        <div style="font-family: monospace; padding: 10px;">
          <h2 style="text-align: center;">QUÁN CƠM RANG 1307</h2>
          <h3 style="text-align: center;">MÃ ĐƠN: ${order.id}</h3>
          <hr/>
          <p>Khách hàng: ${order.customerName}</p>
          <p>Điện thoại: ${order.customerPhone}</p>
          <p>Giờ lấy: ${order.pickupTime}</p>
          <p>Thanh toán: ${order.isPaid ? 'Đã thu tiền' : 'CHƯA THU TIỀN'}</p>
          <hr/>
          ${order.items.map(item => `
            <div>
              <strong>${item.quantity}x ${item.product.name}</strong><br/>
              ${item.selectedToppings.length > 0 ? `<small>+ ${item.selectedToppings.join(', ')}</small><br/>` : ''}
              ${item.note ? `<strong>Ghi chú: ${item.note}</strong><br/>` : ''}
            </div>
          `).join('')}
          <hr/>
          <h3 style="text-align: right;">TỔNG: ${order.totalAmount.toLocaleString()}đ</h3>
        </div>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const KanbanColumn = ({ title, data, className }: { title: string, data: Order[], className: string }) => (
    <Col span={6}>
      <div className={`kanban-col ${className}`}>
        <div className="col-header">
          <Title level={5} className="col-title">{title}</Title>
          <span className="badge">{data.length}</span>
        </div>
        <div className="col-body">
          {data.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onStatusChange={changeOrderStatus} 
              onPrint={handlePrint}
              onPaymentChange={handlePaymentChange}
            />
          ))}
        </div>
      </div>
    </Col>
  );

  return (
    <div className="kanban-container">
      <div className="header-actions">
        <Title level={3} style={{ margin: 0 }}>Kanban Điều Phối Đơn Hàng (Real-time)</Title>
        <Button type="primary" icon={<AppstoreOutlined />} onClick={() => setInventoryVisible(true)}>
          Quản lý Tồn Kho
        </Button>
      </div>

      <Row gutter={16}>
        <KanbanColumn title="1. CHỜ DUYỆT" data={pendingOrders} className="pending" />
        <KanbanColumn title="2. ĐANG NẤU" data={cookingOrders} className="cooking" />
        <KanbanColumn title="3. CHỜ LẤY" data={readyOrders} className="ready" />
        <KanbanColumn title="4. HOÀN THÀNH" data={completedOrders} className="completed" />
      </Row>

      <Drawer title="Quản lý Tồn kho cấp tốc" placement="right" onClose={() => setInventoryVisible(false)} visible={inventoryVisible} width={320}>
        <List
          dataSource={menu}
          renderItem={item => (
            <List.Item
              actions={[
                <Switch 
                  checked={item.isAvailable} 
                  onChange={(checked) => toggleProductAvailability(item.id, checked)} 
                  checkedChildren="Còn" 
                  unCheckedChildren="Hết"
                />
              ]}
            >
              <List.Item.Meta title={item.name} description={<Text type="secondary">{item.price.toLocaleString()}đ</Text>} />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
};

export default StaffDashboard;
