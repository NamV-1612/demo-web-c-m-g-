import React, { useState } from 'react';
import { List, Card, Typography, Button, message, Empty, Row, Col } from 'antd';
import moment from 'moment';
import { ShopOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { Order } from '@/services/typing';
import './style.less';

import CartItem from './components/CartItem';
import CheckoutSummary from './components/CheckoutSummary';
import CheckoutForm from './components/CheckoutForm';
import AddressModal from './components/AddressModal';
import CartMapModal from './components/CartMapModal';

const { Title } = Typography;

const CustomerCart: React.FC = () => {
  const { cartItems, removeFromCart, clearCart, subTotal, totalCartPrice, voucher, applyVoucher, updateQuantity } = useModel('useCartModel');
  const { submitOrder, addresses, addAddress, removeAddress } = useModel('useOrderModel');
  const { currentUser } = useModel('useAuthModel');
  const { decreasePromoQuantity } = useModel('usePromoModel');

  const timeOptions = [1, 2, 3, 4].map(h => {
    const time = moment().startOf('hour').add(h, 'hours').format('hh:00 A');
    return {
      value: time,
      label: time.replace('AM', 'SA').replace('PM', 'CH')
    };
  });
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id || '');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [pickupTimeType, setPickupTimeType] = useState('asap');
  const [pickupTimeText, setPickupTimeText] = useState(timeOptions[0].value);
  const [voucherInput, setVoucherInput] = useState('');
  
  // Modals
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const handleCheckout = async () => {
    if (!currentUser) return;
    
    const isDelivery = deliveryMethod === 'delivery';
    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    
    if (isDelivery && (!selectedAddr || !selectedAddr.address.trim())) {
      message.error('Vui lÃ²ng chá»n hoáº·c Ä‘iá»n thÃªm Ä‘á»‹a chá»‰ nháº­n hÃ ng!');
      return;
    }

    if (isDelivery && pickupTimeType === 'specific') {
      const selectedTime = moment(pickupTimeText, 'hh:00 A');
      const minTime = moment().add(1, 'hours');
      if (selectedTime.isBefore(minTime)) {
        message.error(`Vui lÃ²ng táº£i láº¡i trang hoáº·c chá»n giá» khÃ¡c (giá» hiá»‡n táº¡i Ä‘Ã£ vÆ°á»£t qua giá» báº¡n chá»n)`);
        return;
      }
    }

    const orderId = 'ORD' + Date.now().toString().slice(-6);
    
    const order: Order = {
      id: orderId,
      customerId: currentUser.id,
      customerName: isDelivery ? selectedAddr!.name : (currentUser.full_name || currentUser.name || 'KhÃ¡ch hÃ ng'),
      customerPhone: isDelivery ? selectedAddr!.phone : currentUser.phone || '',
      items: cartItems,
      totalAmount: totalCartPrice,
      note: isDelivery ? `Giao Ä‘áº¿n: ${selectedAddr!.address}` : 'KhÃ¡ch tá»± Ä‘áº¿n láº¥y',
      status: 'PENDING',
      isPaid: false,
      paymentMethod: 'transfer',
      pickupTime: deliveryMethod === 'pickup' ? 'asap' : (pickupTimeType === 'asap' ? 'asap' : pickupTimeText),
      createdAt: Date.now(),
      promoCode: voucher?.code,
      discountAmount: voucher?.discount
    };

    const success = await submitOrder(order);
    if (success) {
      if (voucher) {
        decreasePromoQuantity(voucher.code);
      }
      clearCart();
      history.push('/customer/history');
    }
  };

  const handleAddAddress = async (values: any) => {
    const newAddr = await addAddress(values);
    setSelectedAddressId(newAddr.id);
    setIsAddressModalVisible(false);
  };

  const handleMapConfirm = (address: string) => {
    // We will just let AddressModal expose onOpenMap, and when MapConfirm triggers, we would need to pass it to AddressModal.
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <Empty description="Giá» hÃ ng cá»§a báº¡n Ä‘ang trá»‘ng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        <Button type="primary" size="large" onClick={() => history.push('/customer/home')} style={{ marginTop: 24, borderRadius: 24 }}>
          KhÃ¡m phÃ¡ Thá»±c Ä‘Æ¡n ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <Title level={2} className="art-title"><ShopOutlined /> Giá» hÃ ng cá»§a báº¡n</Title>
      </div>
      
      <Row gutter={[32, 24]}>
        {/* Cá»˜T TRÃI: DANH SÃCH MÃ“N Ä‚N VÃ€ Äá»ŠA CHá»ˆ */}
        <Col xs={24} lg={14}>
          <Card className="checkout-section-card" title={<><EnvironmentOutlined /> ThÃ´ng tin nháº­n hÃ ng & Háº¹n giá»</>} bordered={false}>
            <CheckoutForm 
              deliveryMethod={deliveryMethod}
              setDeliveryMethod={setDeliveryMethod}
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              onRemoveAddress={(id) => {
                removeAddress(id);
                if (selectedAddressId === id) setSelectedAddressId(addresses[0]?.id || '');
              }}
              onAddAddressClick={() => setIsAddressModalVisible(true)}
              pickupTimeType={pickupTimeType}
              setPickupTimeType={setPickupTimeType}
              pickupTimeText={pickupTimeText}
              setPickupTimeText={setPickupTimeText}
              timeOptions={timeOptions}
            />

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24, marginTop: 24 }}>
              <Title level={5} style={{ color: '#BA1A21', marginBottom: 16 }}>
                <ShopOutlined /> Danh sÃ¡ch mÃ³n Äƒn
              </Title>
              <List
                dataSource={cartItems}
                renderItem={item => (
                  <CartItem 
                    item={item} 
                    onUpdateQuantity={updateQuantity} 
                    onRemove={removeFromCart} 
                  />
                )}
              />
            </div>
          </Card>
        </Col>
 
        {/* Cá»˜T PHáº¢I: Tá»”NG Káº¾T VÃ€ THANH TOÃN */}
        <Col xs={24} lg={10}>
          <CheckoutSummary 
            subTotal={subTotal}
            totalCartPrice={totalCartPrice}
            voucher={voucher}
            voucherInput={voucherInput}
            onVoucherInputChange={setVoucherInput}
            onApplyVoucher={() => applyVoucher(voucherInput)}
            onCheckout={handleCheckout}
          />
        </Col>
      </Row>

      {/* Modal ThÃªm Äá»‹a chá»‰ */}
      <AddressModal 
        visible={isAddressModalVisible}
        currentUser={currentUser}
        onCancel={() => setIsAddressModalVisible(false)}
        onSubmit={handleAddAddress}
        onOpenMap={() => setIsMapModalVisible(true)}
      />

      {/* Modal Google Map */}
      <CartMapModal 
        visible={isMapModalVisible}
        onCancel={() => setIsMapModalVisible(false)}
        onConfirm={(addr) => {
          window.dispatchEvent(new CustomEvent('map-address-selected', { detail: addr }));
          setIsMapModalVisible(false);
        }}
      />
    </div>
  );
};

export default CustomerCart;

