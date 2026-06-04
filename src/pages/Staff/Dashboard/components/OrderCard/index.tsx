import React, { useState, useEffect } from 'react';
import { Typography, Button, Tag, Popconfirm, Modal, Radio, Input, message } from 'antd';
import { CloseOutlined, PrinterOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Order } from '@/services/typing';
import moment from 'moment';
import './style.less';

const { Text } = Typography;

interface Props {
  order: Order;
  onStatusChange: (id: string, status: Order['status'], cancelMessage?: string) => void;
  onPrint: (order: Order) => void;
  onPaymentChange: (id: string, isPaid: boolean) => void;
}

const OrderCard: React.FC<Props> = ({ order, onStatusChange, onPrint, onPaymentChange }) => {
  const isUrgent = order.pickupTime !== 'asap' && moment(order.pickupTime, ['HH:mm', 'hh:mm A']).diff(moment(), 'minutes') < 10;
  const isNewOrder = order.status === 'PENDING' && moment().diff(moment(order.createdAt), 'minutes') < 5;
  
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isCancelModalVisible, setIsCancelModalVisible] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Hết nguyên liệu / Hết món');
  const [otherReason, setOtherReason] = useState<string>('');

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
    <div className={`ticket-card ${isUrgent ? 'urgent' : 'normal'} ${isNewOrder ? 'new-order-highlight' : ''}`}>
      {isNewOrder && <div className="new-badge">MỚI</div>}
      {isUrgent && <div className="urgent-pulse"></div>}
      
      {/* HEADER: ID & TIMER */}
      <div className="ticket-header">
        <div className="order-id">{order.id}</div>
        {order.status === 'PENDING' && timeLeft && (
          <div className={`countdown-timer ${timeLeft === '00:00' ? 'expired' : ''}`}>
            Tự hủy: {timeLeft}
          </div>
        )}
      </div>
      
      {/* CUSTOMER INFO */}
      <div className="ticket-info">
        <div className="customer-row">
          <Text strong className="customer-name">{order.customerName}</Text>
          <Text type="secondary" className="customer-phone">{order.customerPhone}</Text>
        </div>
        <div className="delivery-row">
          {order.note === 'Khách tự đến lấy' ? (
            <Tag color="volcano" className="method-tag">🏪 Tự lấy ({order.pickupTime === 'asap' ? 'Ngay' : order.pickupTime})</Tag>
          ) : (
            <Tag color="geekblue" className="method-tag">🛵 Nhờ ship ({order.pickupTime === 'asap' ? 'Ngay' : order.pickupTime})</Tag>
          )}
        </div>
        {order.note !== 'Khách tự đến lấy' && (
          <div className="address-row">
            📍 {order.customerAddress || order.note?.replace('Giao đến: ', '')}
          </div>
        )}
      </div>

      <div className="ticket-divider"></div>

      {/* ITEMS LIST (RECEIPT STYLE) */}
      <div className="ticket-items">
        {order.items.map((item, idx) => (
          <div key={idx} className="item-row">
            <div className="item-main">
              <span className="item-qty">{item.quantity}x</span> 
              <span className="item-name">{item.product.name}</span>
            </div>
            {item.selectedToppings.length > 0 && (
              <div className="topping-text">+ {item.selectedToppings.join(', ')}</div>
            )}
            {item.note && (
              <div className="note-text">* {item.note}</div>
            )}
          </div>
        ))}
      </div>

      <div className="ticket-divider"></div>

      {/* FOOTER: TOTAL & PAYMENT */}
      <div className="ticket-footer">
        <div className="total-price">{order.totalAmount.toLocaleString()}đ</div>
        <div className="payment-status">
          {order.paymentMethod === 'cash' ? '💵 T/mặt' : '💳 C/k'}
        </div>
      </div>

      {/* ACTIONS (MODERN FULL-WIDTH) */}
      <div className="ticket-actions">
        {order.status === 'PENDING' && (
          <div className="action-row">
            {(!order.isPaid && order.paymentMethod === 'transfer') ? (
              <Popconfirm
                overlayClassName="custom-popconfirm"
                title="Khách thanh toán đơn này chưa?"
                onConfirm={() => {
                  onPaymentChange(order.id, true);
                  onStatusChange(order.id, 'PREPARING');
                }}
                okText="Đã thanh toán"
                cancelText="Hủy"
              >
                <Button className="action-btn btn-accept" type="primary">
                  NẤU MÓN NÀY
                </Button>
              </Popconfirm>
            ) : (
              <Button className="action-btn btn-accept" type="primary" onClick={() => onStatusChange(order.id, 'PREPARING')}>
                NẤU MÓN NÀY
              </Button>
            )}
            <div className="action-group">
              <Button className="action-btn btn-icon btn-print" onClick={() => onPrint(order)} icon={<PrinterOutlined />} />
              <Button className="action-btn btn-icon btn-reject" onClick={() => setIsCancelModalVisible(true)} icon={<CloseOutlined />} />
            </div>
          </div>
        )}

        {order.status === 'PREPARING' && (
          <div className="action-row">
            <Button className="action-btn btn-ready" type="primary" onClick={() => onStatusChange(order.id, 'READY')}>
              XONG, BÁO KHÁCH
            </Button>
          </div>
        )}

        {order.status === 'READY' && (
          <div className="action-row column-layout">
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <Popconfirm overlayClassName="custom-popconfirm custom-popconfirm-green" title="Xác nhận giao hàng thành công?" onConfirm={() => onStatusChange(order.id, 'COMPLETED')} okText="Đã giao" cancelText="Hủy">
                <Button className="action-btn btn-complete" type="primary" icon={<CheckCircleFilled />} style={{ flex: 1 }}>
                  GIAO KHÁCH
                </Button>
              </Popconfirm>
              <Button className="action-btn btn-icon btn-print" onClick={() => onPrint(order)} icon={<PrinterOutlined />} />
            </div>
            {!order.isPaid && (
              <Popconfirm overlayClassName="custom-popconfirm" title="Xác nhận khách đã thanh toán?" onConfirm={() => onPaymentChange(order.id, true)} okText="Đã thu tiền" cancelText="Hủy">
                <Button className="action-btn btn-collect">
                  THU TIỀN
                </Button>
              </Popconfirm>
            )}
          </div>
        )}

        {order.status === 'COMPLETED' && (
          <div className="action-row">
            <Button className="action-btn" onClick={() => onPrint(order)} icon={<PrinterOutlined />} block style={{ color: '#666', borderColor: '#d9d9d9' }}>
              IN LẠI PHIẾU
            </Button>
          </div>
        )}
      </div>



      <Modal
        title="Lý do hủy đơn hàng"
        visible={isCancelModalVisible}
        onCancel={() => {
          setIsCancelModalVisible(false);
          setCancelReason('Hết nguyên liệu / Hết món');
          setOtherReason('');
        }}
        onOk={() => {
          const finalReason = cancelReason === 'Lý do khác' ? otherReason : cancelReason;
          if (cancelReason === 'Lý do khác' && !finalReason.trim()) {
            message.error('Vui lòng nhập lý do hủy cụ thể!');
            return;
          }
          onStatusChange(order.id, 'CANCELLED', finalReason);
          setIsCancelModalVisible(false);
        }}
        okText="Xác nhận hủy"
        cancelText="Bỏ qua"
        okButtonProps={{ danger: true, disabled: cancelReason === 'Lý do khác' && !otherReason.trim() }}
      >
        <Radio.Group onChange={(e) => setCancelReason(e.target.value)} value={cancelReason} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Radio value="Hết nguyên liệu / Hết món">Hết nguyên liệu / Hết món</Radio>
          <Radio value="Quán đang quá tải, không thể phục vụ kịp">Quán đang quá tải, không thể phục vụ kịp</Radio>
          <Radio value="Không liên lạc được với khách hàng">Không liên lạc được với khách hàng</Radio>
          <Radio value="Khách hàng chủ động yêu cầu hủy">Khách hàng chủ động yêu cầu hủy</Radio>
          <Radio value="Lý do khác">Lý do khác...</Radio>
        </Radio.Group>
        
        {cancelReason === 'Lý do khác' && (
          <Input.TextArea 
            rows={3}
            placeholder="Nhập lý do hủy..."
            value={otherReason}
            onChange={e => setOtherReason(e.target.value)}
            style={{ marginTop: 12 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default OrderCard;
