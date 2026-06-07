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
    const printWindow = window.open('', '', 'width=350,height=500');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <style>
              body { font-family: 'Courier New', Courier, monospace; color: #000; width: 300px; margin: 0 auto; padding: 20px 10px; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .bold { font-weight: bold; }
              .title { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
              .subtitle { font-size: 16px; font-weight: bold; margin-bottom: 8px; border: 1px solid #000; padding: 4px; display: inline-block; }
              .divider { border-top: 1px dashed #000; margin: 10px 0; }
              .row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; }
              .item-row { display: flex; align-items: flex-start; margin-bottom: 4px; font-size: 14px; }
              .item-qty { font-weight: bold; margin-right: 8px; min-width: 24px; }
              .item-name { flex: 1; font-weight: bold; }
              .item-price { margin-left: 8px; }
              .topping-list { font-size: 12px; margin-left: 32px; font-style: italic; margin-bottom: 2px; }
              .note { font-size: 12px; margin-left: 32px; font-weight: bold; margin-bottom: 2px; }
              .total-row { font-size: 18px; font-weight: bold; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="text-center">
              <div class="title">DOKI FOOD</div>
              <div class="subtitle">ĐƠN HÀNG #${order.id}</div>
              <div style="font-size: 12px; margin-bottom: 8px;">${moment(order.createdAt).format('DD/MM/YYYY HH:mm')}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="row"><span class="bold">Khách hàng:</span> <span>${order.customerName}</span></div>
            <div class="row"><span class="bold">Điện thoại:</span> <span>${order.customerPhone}</span></div>
            ${order.note === 'Khách tự đến lấy' 
              ? `<div class="row"><span class="bold">Hình thức:</span> <span>Tự đến lấy</span></div>
                 <div class="row"><span class="bold">Hẹn lấy:</span> <span>${order.pickupTime === 'asap' ? 'Ngay' : order.pickupTime}</span></div>` 
              : `<div class="row"><span class="bold">Hình thức:</span> <span>Giao hàng (Nhờ ship)</span></div>
                 <div style="font-size: 13px; margin-bottom: 4px;"><span class="bold">Giao đến:</span> ${order.customerAddress || order.note?.replace('Giao đến: ', '')}</div>
                 <div class="row"><span class="bold">Hẹn giao:</span> <span>${order.pickupTime === 'asap' ? 'Ngay' : order.pickupTime}</span></div>`
            }
            <div class="row"><span class="bold">Thanh toán:</span> <span>${order.paymentMethod === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}</span></div>
            <div class="row"><span class="bold">Trạng thái:</span> <span style="font-weight: 800; font-size: 14px;">${order.isPaid ? 'ĐÃ THU TIỀN' : 'CHƯA THU TIỀN'}</span></div>
            
            <div class="divider"></div>
            
            <div class="bold" style="margin-bottom: 8px; font-size: 15px;">DANH SÁCH MÓN:</div>
            ${order.items.map(item => `
              <div class="item-row">
                <span class="item-qty">${item.quantity}x</span>
                <span class="item-name">${item.product.name}</span>
                <span class="item-price">${(item.product.price * item.quantity).toLocaleString()}đ</span>
              </div>
              ${item.selectedToppings.length > 0 ? `<div class="topping-list">+ ${item.selectedToppings.join(', ')}</div>` : ''}
              ${item.note ? `<div class="note">* Lưu ý: ${item.note}</div>` : ''}
            `).join('')}
            
            <div class="divider"></div>
            
            ${order.discountAmount ? `
            <div class="row" style="margin-bottom: 8px;">
              <span>Mã giảm giá (${order.promoCode || 'Voucher'}):</span>
              <span style="font-weight: bold;">-${order.discountAmount.toLocaleString()}đ</span>
            </div>
            <div class="divider"></div>
            ` : ''}

            <div class="row total-row">
              <span>TỔNG CỘNG:</span>
              <span>${order.totalAmount.toLocaleString()}đ</span>
            </div>
            
            <div class="divider"></div>
            <div class="text-center" style="font-size: 12px; margin-top: 16px;">
              <p style="margin: 4px 0;">Chúc quý khách ngon miệng!</p>
              <p style="margin: 4px 0;">Hẹn gặp lại</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 200);
    }
  };

  return (
    <div className="kanban-container">
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontFamily: "'Dancing Script', cursive", fontSize: 36, color: '#D53E0F' }}>Khách đói rồi nè</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>Xin chào, <strong>{currentUser?.name || currentUser?.full_name || 'Nhân viên'}</strong></Text>
        </div>
        <Button type="primary" icon={<AppstoreOutlined />} onClick={() => setInventoryVisible(true)} style={{ background: '#D53E0F', borderColor: '#D53E0F' }}>
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

