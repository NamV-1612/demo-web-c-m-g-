import React, { useState } from 'react';
import { Typography, Button, message, Modal, Input, Empty, Form } from 'antd';
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
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  // Map Modal
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  // Rating Modal
  const [isRateModalVisible, setIsRateModalVisible] = useState(false);
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);

  const myOrders = orders.filter(o => o.customerId === currentUser?.id);

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      const newItem = { ...item, cartItemId: Math.random().toString(36).substring(7) };
      addToCart(newItem);
    });
    message.success('ÄÃ£ thÃªm láº¡i cÃ¡c mÃ³n vÃ o giá» hÃ ng!');
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
      address: order.note?.replace('Giao Ä‘áº¿n: ', '') || '' 
    });
    setIsEditModalVisible(true);
  };

  const handleMapConfirm = (address: string) => {
    form.setFieldsValue({ address });
    setIsMapModalVisible(false);
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <Title level={2} className="art-title">
          Lá»‹ch sá»­ <span style={{ color: '#BA1A21' }}>ÄÆ¡n hÃ ng</span>
        </Title>
      </div>
      
      {myOrders.length === 0 ? (
        <div style={{ padding: '60px 0', background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0' }}>
          <Empty description="Báº¡n chÆ°a cÃ³ Ä‘Æ¡n hÃ ng nÃ o." />
        </div>
      ) : (
        myOrders.map(order => (
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
        title="Sá»­a thÃ´ng tin giao hÃ ng"
        visible={isEditModalVisible}
        onCancel={() => { setIsEditModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="LÆ°u thay Ä‘á»•i"
        cancelText="Há»§y"
        okButtonProps={{ style: { background: '#BA1A21', borderColor: '#BA1A21' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="phone" label="Sá»‘ Ä‘iá»‡n thoáº¡i" rules={[{ required: true, message: 'Vui lÃ²ng nháº­p sá»‘ Ä‘iá»‡n thoáº¡i' }, { pattern: /^(0[35789])[0-9]{8}$/, message: 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Äá»‹a chá»‰ giao hÃ ng" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <Button type="dashed" onClick={() => setIsMapModalVisible(true)} icon={<EnvironmentOutlined />} style={{ flex: 1, borderColor: '#1890ff', color: '#1890ff' }}>
                Chá»n tá»« Google Maps
              </Button>
            </div>
            <Form.Item name="address" rules={[{ required: true, message: 'Vui lÃ²ng nháº­p Ä‘á»‹a chá»‰' }]}>
              <TextArea rows={3} placeholder="Hoáº·c Ä‘iá»n thá»§ cÃ´ng Ä‘á»‹a chá»‰ nháº­n hÃ ng..." />
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

