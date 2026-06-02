import React, { useState } from 'react';
import { Typography, Button, message, Modal, Input, Empty, Form, Space } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import './style.less';

import OrderCard from './components/OrderCard';
import RatingModal from './components/RatingModal';
import MapModal from './components/MapModal';

const { Title } = Typography;
const { TextArea } = Input;

const CustomerHistory: React.FC = () => {
  const { orders, rateOrder, updateOrderInfo, cancelOrder } = useModel('useOrderModel');
  const { currentUser } = useModel('useAuthModel');
  const { addToCart } = useModel('useCartModel');

  const [form] = Form.useForm();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Edit Address Modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  // Map Modal
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  // Rating Modal
  const [isRateModalVisible, setIsRateModalVisible] = useState(false);
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const removeAccents = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  const myOrders = orders.filter(o => o.customerId === currentUser?.id);
  const filteredOrders = myOrders.filter(o => {
    const search = removeAccents(searchQuery.toLowerCase());
    const idMatch = removeAccents(o.id?.toString().toLowerCase() || '').includes(search);
    const itemMatch = o.items?.some((item: any) => removeAccents((item.name || item.product?.name)?.toString().toLowerCase() || '').includes(search));
    return idMatch || itemMatch;
  });

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      const newItem = { ...item, cartItemId: Math.random().toString(36).substring(7) };
      addToCart(newItem);
    });
    message.success('Đã thêm lại các món vào giỏ hàng!');
    history.push('/customer/cart');
  };

  const handleRateSubmit = (stars: number, comment: string) => {
    if (ratingOrderId) {
      rateOrder(ratingOrderId, { stars, comment });
      setIsRateModalVisible(false);
      setRatingOrderId(null);
    }
  };

  const handleEditSubmit = (values: any) => {
    if (editingOrder) {
      updateOrderInfo(editingOrder.id, { phone: values.phone, address: values.address });
      setIsEditModalVisible(false);
      setEditingOrder(null);
    }
  };

  const openRateModal = (orderId: string) => {
    setRatingOrderId(orderId);
    setIsRateModalVisible(true);
  };

  const openEditModal = (order: any) => {
    setEditingOrder(order);
    form.setFieldsValue({ 
      phone: order.customerPhone, 
      address: order.note?.replace('Giao đến: ', '') || '' 
    });
    setIsEditModalVisible(true);
  };

  const handleMapConfirm = (address: string) => {
    form.setFieldsValue({ address });
    setIsMapModalVisible(false);
  };

  return (
    <div className="history-container">
      <div className="history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Title level={2} className="art-title" style={{ margin: 0 }}>
          Lịch sử <span style={{ color: '#D53E0F' }}>Đơn hàng</span>
        </Title>
        <div className="history-search-wrapper">
          <Input.Search 
            placeholder="Tìm theo mã đơn hoặc tên món..." 
            allowClear
            enterButton
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
            size="large"
          />
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div style={{ padding: '60px 0', background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0' }}>
          <Empty description="Bạn chưa có đơn hàng nào." />
        </div>
      ) : (
        filteredOrders.map(order => (
          <OrderCard 
            key={order.id}
            order={order}
            onReorder={handleReorder}
            onCancel={cancelOrder}
            onEditAddress={openEditModal}
            onRateOrder={openRateModal}
          />
        ))
      )}

      {/* RATING MODAL */}
      <RatingModal
        visible={isRateModalVisible}
        orderId={ratingOrderId}
        onCancel={() => setIsRateModalVisible(false)}
        onSubmit={handleRateSubmit}
      />

      {/* EDIT MODAL */}
      <Modal
        title="Sửa thông tin giao hàng"
        visible={isEditModalVisible}
        onCancel={() => { setIsEditModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#D53E0F', borderColor: '#D53E0F' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^(0[35789])[0-9]{8}$/, message: 'Số điện thoại không hợp lệ' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Địa chỉ giao hàng" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <Button type="dashed" onClick={() => setIsMapModalVisible(true)} icon={<EnvironmentOutlined />} style={{ flex: 1, borderColor: '#D53E0F', color: '#D53E0F' }}>
                Chọn từ Google Maps
              </Button>
            </div>
            <Form.Item name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
              <TextArea rows={3} placeholder="Hoặc điền thủ công địa chỉ nhận hàng..." />
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>

      {/* MAP MODAL */}
      <MapModal 
        visible={isMapModalVisible}
        onCancel={() => setIsMapModalVisible(false)}
        onConfirm={handleMapConfirm}
      />
    </div>
  );
};

export default CustomerHistory;

