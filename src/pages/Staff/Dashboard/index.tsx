import React, { useState } from 'react';
import { Row, Typography, Button, message } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { Order } from '@/services/typing';
import moment from 'moment';
import './style.less';

import KanbanColumn from './components/KanbanColumn';
import QuickInventoryDrawer from './components/QuickInventoryDrawer';

const { Title, Text } = Typography;

const StaffDashboard: React.FC = () => {
  const { orders, changeOrderStatus, togglePaymentStatus } = useModel('useOrderModel');
  const { products, updateProductAvailability, updateProduct } = useModel('useMenuModel');
  const { currentUser } = useModel('useAuthModel');
  const [inventoryVisible, setInventoryVisible] = useState(false);

  const pendingOrders = orders.filter(o => o.status?.toUpperCase() === 'PENDING').sort((a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf());
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
          <h2 style="text-align: center; margin-bottom: 5px; font-weight: 900; color: #BA1A21;">CHICKEN DOKI</h2>
          <h3 style="text-align: center; margin-top: 0;">MÃ VẬN ĐƠN: ${order.id}</h3>
          <hr style="border: 1px dashed #000;"/>
          <p style="margin: 4px 0;">Khách hàng: ${order.customerName}</p>
          <p style="margin: 4px 0;">Điện thoại: ${order.customerPhone}</p>
          ${
            order.note === 'Khách tự đến lấy' 
              ? `<p style="margin: 4px 0;">Hình thức: <strong>Tự đến lấy tại quán</strong></p>
                 <p style="margin: 4px 0;">Hẹn lấy: ${order.pickupTime === 'asap' ? 'Lấy ngay' : order.pickupTime}</p>` 
              : `<p style="margin: 4px 0;">Hình thức: <strong>Nhờ ship</strong></p>
                 <p style="margin: 4px 0;">Địa chỉ nhận: <strong>${order.customerAddress || order.note?.replace('Giao đến: ', '') || 'Chưa cập nhật'}</strong></p>
                 <p style="margin: 4px 0;">Hẹn giao: ${order.pickupTime === 'asap' ? 'Giao ngay' : order.pickupTime}</p>`
          }
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

  return (
    <div className="kanban-container">
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Kanban Điều Phối Đơn Hàng (Real-time)</Title>
          <Text type="secondary">Xin chào, <strong>{currentUser?.name || currentUser?.full_name || 'Nhân viên'}</strong></Text>
        </div>
        <Button type="primary" icon={<AppstoreOutlined />} onClick={() => setInventoryVisible(true)} style={{ background: '#BA1A21', borderColor: '#BA1A21' }}>
          Quản lý Tồn Kho Cấp Tốc
        </Button>
      </div>

      <Row gutter={16}>
        <KanbanColumn 
          title="1. CHỜ DUYỆT" 
          data={pendingOrders} 
          className="pending" 
          onStatusChange={changeOrderStatus}
          onPrint={handlePrint}
          onPaymentChange={handlePaymentChange}
        />
        <KanbanColumn 
          title="2. ĐANG NẤU" 
          data={cookingOrders} 
          className="cooking" 
          onStatusChange={changeOrderStatus}
          onPrint={handlePrint}
          onPaymentChange={handlePaymentChange}
        />
        <KanbanColumn 
          title="3. SẴN SÀNG" 
          data={readyOrders} 
          className="ready" 
          onStatusChange={changeOrderStatus}
          onPrint={handlePrint}
          onPaymentChange={handlePaymentChange}
        />
        <KanbanColumn 
          title="4. HOÀN THÀNH" 
          data={completedOrders} 
          className="completed" 
          onStatusChange={changeOrderStatus}
          onPrint={handlePrint}
          onPaymentChange={handlePaymentChange}
        />
      </Row>

      <QuickInventoryDrawer 
        visible={inventoryVisible}
        onClose={() => setInventoryVisible(false)}
        products={products}
        updateProductAvailability={updateProductAvailability}
        updateProduct={updateProduct}
      />
    </div>
  );
};

export default StaffDashboard;

