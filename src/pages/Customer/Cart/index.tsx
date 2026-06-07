import React, { useState, useEffect } from 'react';
import { List, Card, Typography, Button, message, Empty, Row, Col, Popconfirm } from 'antd';
import moment from 'moment';
import { ShopOutlined, EnvironmentOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const { decreasePromoQuantity } = useModel('usePromoModel');

  const timeOptions = [0, 1, 2, 3].map(h => {
    let minTime = moment().add(30, 'minutes');
    let firstHour = minTime.clone().startOf('hour');
    if (firstHour.isBefore(minTime)) {
      firstHour.add(1, 'hour');
    }
    const time = firstHour.add(h, 'hours').format('hh:00 A');
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

  const [newCartItemId, setNewCartItemId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const id = sessionStorage.getItem('newCartItemId');
    if (id) {
      setNewCartItemId(id);
      sessionStorage.removeItem('newCartItemId');
    }
  }, []);

  useEffect(() => {
    if (addresses.length > 0) {
      const exists = addresses.find(a => a.id === selectedAddressId);
      if (!exists) {
        setSelectedAddressId(addresses[0].id);
      }
    } else if (selectedAddressId) {
      setSelectedAddressId('');
    }
  }, [addresses, selectedAddressId]);

  const handleCheckout = async () => {
    if (!currentUser) return;
    
    const isDelivery = deliveryMethod === 'delivery';
    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    
    if (isDelivery && (!selectedAddr || !selectedAddr.address.trim())) {
      message.error('Vui lòng chọn hoặc điền thêm địa chỉ nhận hàng!');
      return;
    }

    if (isDelivery && pickupTimeType === 'specific') {
      let selectedTime = moment(pickupTimeText, 'hh:00 A');
      // fix chon gio buoi dem
      if (moment().hour() >= 12 && selectedTime.hour() < 12) {
        selectedTime.add(1, 'day');
      }
      const minTime = moment().add(30, 'minutes');
      if (selectedTime.isBefore(minTime)) {
        message.error(`Vui lòng tải lại trang hoặc chọn giờ khác (giờ hiện tại đã vượt qua giờ bạn chọn)`);
        return;
      }
    }

    const orderId = 'CD_' + Math.floor(1000 + Math.random() * 9000).toString();
    
    const order: Order = {
      id: orderId,
      customerId: currentUser.id,
      customerName: isDelivery ? selectedAddr!.name : (currentUser.full_name || currentUser.name || 'Khách hàng'),
      customerPhone: isDelivery ? selectedAddr!.phone : currentUser.phone || '',
      items: cartItems,
      totalAmount: totalCartPrice,
      note: isDelivery ? `Giao đến: ${selectedAddr!.address}` : 'Khách tự đến lấy',
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
      setCheckoutSuccess(true);
      setTimeout(() => {
        clearCart();
        sessionStorage.setItem('newOrderId', order.id);
        history.push('/customer/history');
      }, 1500); // doi xiu cho hien tich xanh
    }
  };

  const handleAddAddress = async (values: any) => {
    const newAddr = await addAddress(values);
    setSelectedAddressId(newAddr.id);
    setIsAddressModalVisible(false);
  };

  const handleMapConfirm = (address: string) => {
    // address modal xu ly form, so we need to either pass it a ref or let AddressModal handle MapModal. 
    // Wait, AddressModal encapsulates the form but MapModal is outside. It's better if MapModal is just called from AddressModal or we pass the address back.
    // For simplicity, we can just trigger a global event or manage the form inside AddressModal completely.
    // Since we extracted AddressModal, we can let it handle the MapModal state internally if we wanted.
    // But since they are parallel here, this requires passing form.setFieldsValue. 
    // Let's adjust this: AddressModal shouldn't be isolated if it doesn't own MapModal. 
    // We will just let AddressModal expose onOpenMap, and when MapConfirm triggers, we would need to pass it to AddressModal.
    // Let's just pass `address` back to AddressModal. Actually, let's keep the form in AddressModal and just give it the `MapModal` internally in the next iteration.
    // For now, I'll let CartMapModal be managed by AddressModal internally to be clean. I'll modify AddressModal.
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <Empty description="Giỏ hàng của bạn đang trống" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        <Button type="primary" size="large" onClick={() => history.push('/customer/home')} style={{ marginTop: 24, borderRadius: 24 }}>
          Khám phá Thực đơn ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} className="art-title" style={{ margin: 0 }}><ShopOutlined /> Giỏ hàng của bạn</Title>
      </div>
      
      <Row gutter={[32, 24]}>
        {/* CỘT TRÁI: DANH SÁCH MÓN ĂN VÀ ĐỊA CHỈ */}
        <Col xs={24} lg={14}>
          <Card className="checkout-section-card" title={<><EnvironmentOutlined /> Thông tin nhận hàng & Hẹn giờ</>} bordered={false}>
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
              <Title level={5} style={{ color: '#D53E0F', marginBottom: 16 }}>
                <ShopOutlined /> Danh sách món ăn
              </Title>
              <List
                dataSource={cartItems}
                renderItem={item => (
                  <CartItem 
                    item={item} 
                    onUpdateQuantity={updateQuantity} 
                    onRemove={removeFromCart}
                    isNew={item.cartItemId === newCartItemId}
                  />
                )}
              />
            </div>
          </Card>
        </Col>
 
        {/* CỘT PHẢI: TỔNG KẾT VÀ THANH TOÁN */}
        <Col xs={24} lg={10}>
          <CheckoutSummary 
            subTotal={subTotal}
            totalCartPrice={totalCartPrice}
            voucher={voucher}
            voucherInput={voucherInput}
            onVoucherInputChange={setVoucherInput}
            onApplyVoucher={() => applyVoucher(voucherInput)}
            onCheckout={handleCheckout}
            onClearCart={clearCart}
            checkoutSuccess={checkoutSuccess}
          />
        </Col>
      </Row>

      {/* Modal Thêm Địa chỉ */}
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
          // This will require us to pass the address to the AddressModal's form somehow.
          // The easiest way is to let AddressModal handle CartMapModal. I'll modify AddressModal to include CartMapModal.
          // For now, I'll just dispatch a custom event.
          window.dispatchEvent(new CustomEvent('map-address-selected', { detail: addr }));
          setIsMapModalVisible(false);
        }}
      />
    </div>
  );
};

export default CustomerCart;

