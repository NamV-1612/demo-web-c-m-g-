import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Button, Drawer, List, Switch, notification, message, Space, Tag, Input } from 'antd';
import { AppstoreOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import OrderCard from './components/OrderCard';
import { Order } from '@/services/typing';
import './style.less';

const { Title, Text } = Typography;

const StaffDashboard: React.FC = () => {
  const { orders, changeOrderStatus, togglePaymentStatus } = useModel('useOrderModel');
  const { products, updateProductAvailability, updateProduct } = useModel('useMenuModel');
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [prevOrdersCount, setPrevOrdersCount] = useState(orders.length);
  const [searchTerm, setSearchTerm] = useState('');

  // New order popup listener
  useEffect(() => {
    if (orders.length > prevOrdersCount) {
      const newOrdersCount = orders.length - prevOrdersCount;
      // Get the newly added orders (usually prepended to the list)
      const newOrders = orders.slice(0, newOrdersCount);
      
      newOrders.forEach(order => {
        // Play synthesizer beep sound
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
          gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.3); // beep for 300ms
        } catch (e) {
          console.log('Web Audio notification sound blocked or not supported:', e);
        }

        // Show Antd alert
        notification.open({
          message: '🔔 ĐƠN HÀNG MỚI!',
          description: `Đơn hàng ${order.id} từ ${order.customerName} (${order.customerPhone}) đang chờ duyệt. Tổng cộng: ${order.totalAmount.toLocaleString()}đ`,
          duration: 8,
          placement: 'topRight',
          style: {
            background: '#fffbe6',
            border: '2px solid #BA1A21',
            borderRadius: '8px',
          }
        });
      });
    }
    setPrevOrdersCount(orders.length);
  }, [orders, prevOrdersCount]);

  const pendingOrders = orders.filter(o => o.status?.toUpperCase() === 'PENDING');
  const cookingOrders = orders.filter(o => o.status?.toUpperCase() === 'PREPARING');
  const readyOrders = orders.filter(o => o.status?.toUpperCase() === 'READY');
  const completedOrders = orders.filter(o => o.status?.toUpperCase() === 'COMPLETED');

  const handlePaymentChange = (id: string, isPaid: boolean) => {
    togglePaymentStatus(id, isPaid);
    message.success(`Đã cập nhật trạng thái thanh toán đơn ${id}`);
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '', 'width=300,height=400');
    if (printWindow) {
      printWindow.document.write(`
        <div style="font-family: monospace; padding: 10px;">
          <h2 style="text-align: center; margin-bottom: 5px;">CƠM RANG 1307</h2>
          <h3 style="text-align: center; margin-top: 0;">MÃ ĐƠN: ${order.id}</h3>
          <hr style="border: 1px dashed #000;"/>
          <p style="margin: 4px 0;">Khách hàng: ${order.customerName}</p>
          <p style="margin: 4px 0;">Điện thoại: ${order.customerPhone}</p>
          <p style="margin: 4px 0;">Hẹn lúc: ${order.pickupTime === 'asap' ? 'Lấy ngay (15p)' : order.pickupTime}</p>
          <p style="margin: 4px 0;">Thanh toán: ${order.paymentMethod === 'transfer' ? 'Chuyển khoản QR' : 'Tiền mặt'}</p>
          <p style="margin: 4px 0;">Trạng thái: <strong>${order.isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THU TIỀN'}</strong></p>
          <hr style="border: 1px dashed #000;"/>
          ${order.items.map(item => `
            <div style="margin-bottom: 8px;">
              <strong>${item.quantity}x ${item.product.name}</strong><br/>
              ${item.selectedToppings.length > 0 ? `<small>+ Toppings: ${item.selectedToppings.join(', ')}</small><br/>` : ''}
              ${item.note ? `<small style="font-style: italic;">* Lưu ý: ${item.note}</small><br/>` : ''}
            </div>
          `).join('')}
          <hr style="border: 1px dashed #000;"/>
          <h3 style="text-align: right; margin-top: 5px;">TỔNG CỘNG: ${order.totalAmount.toLocaleString()}đ</h3>
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
        <div className="col-body" style={{ minHeight: 'calc(100vh - 250px)', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', padding: 8 }}>
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
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Kanban Điều Phối Đơn Hàng (Real-time)</Title>
        <Button type="primary" icon={<AppstoreOutlined />} onClick={() => setInventoryVisible(true)} style={{ background: '#BA1A21', borderColor: '#BA1A21' }}>
          Quản lý Tồn Kho Cấp Tốc
        </Button>
      </div>

      <Row gutter={16}>
        <KanbanColumn title="1. CHỜ DUYỆT" data={pendingOrders} className="pending" />
        <KanbanColumn title="2. ĐANG NẤU" data={cookingOrders} className="cooking" />
        <KanbanColumn title="3. CHỜ LẤY" data={readyOrders} className="ready" />
        <KanbanColumn title="4. HOÀN THÀNH" data={completedOrders} className="completed" />
      </Row>

      <Drawer 
        title="Quản lý Tồn kho cấp tốc" 
        placement="right" 
        onClose={() => setInventoryVisible(false)} 
        visible={inventoryVisible} 
        width="50vw"
      >
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Tìm kiếm món ăn theo tên hoặc danh mục..." 
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
            style={{ borderRadius: 8 }}
          />
        </div>
        <List
          dataSource={products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
          )}
          renderItem={item => (
            <List.Item
              style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ fontSize: 14 }}>{item.name}</Text>
                  <div style={{ color: '#8c8c8c', fontSize: 12 }}>{item.price.toLocaleString()}đ</div>
                </div>
                <Switch 
                  size="small"
                  checked={item.isAvailable !== false} 
                  onChange={(checked) => updateProductAvailability(item.id, checked)} 
                  checkedChildren="Còn" 
                  unCheckedChildren="Hết"
                />
              </div>

              {/* Toppings stock toggler */}
              {item.toppings && item.toppings.length > 0 && (
                <div style={{ marginTop: 6, paddingLeft: 8, borderLeft: '2px solid #BA1A21' }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Toppings:</Text>
                  <Space wrap size={[4, 4]}>
                    {item.toppings.map(topping => {
                      const isOutOfStock = (item.outOfStockToppings || []).includes(topping);
                      return (
                        <Tag 
                          key={topping}
                          color={isOutOfStock ? 'default' : 'orange'}
                          style={{ cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}
                          onClick={() => {
                            let newOutOfStock = [...(item.outOfStockToppings || [])];
                            if (isOutOfStock) {
                              newOutOfStock = newOutOfStock.filter(t => t !== topping);
                            } else {
                              newOutOfStock.push(topping);
                            }
                            // Update topping availability
                            updateProduct(item.id, { outOfStockToppings: newOutOfStock } as any);
                            message.success(`Đã đổi trạng thái topping ${topping} thành: ${isOutOfStock ? 'Còn hàng' : 'Hết hàng'}`);
                          }}
                        >
                          {topping} {isOutOfStock ? '❌ Hết' : '✅ Còn'}
                        </Tag>
                      );
                    })}
                  </Space>
                </div>
              )}
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
};

export default StaffDashboard;
