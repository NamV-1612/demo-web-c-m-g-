import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { Order } from '@/services/typing';
import { message } from 'antd';
import useAuthModel from './useAuthModel';

export default function useOrderModel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { currentUser } = useAuthModel();

  const [addresses, setAddresses] = useState<{id: string, name: string, phone: string, address: string}[]>([
    { id: 'addr1', name: 'Nguyễn Văn A', phone: '0987654321', address: 'Tòa nhà C2, Bách Khoa, Hà Nội' }
  ]);

  const addAddress = (addr: {name: string, phone: string, address: string}) => {
    const newAddr = { ...addr, id: 'addr' + Date.now() };
    setAddresses([...addresses, newAddr]);
    message.success('Đã lưu địa chỉ mới vào Sổ địa chỉ!');
    return newAddr;
  };

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const endpoint = (currentUser.role === 'ADMIN' || currentUser.role === 'STAFF') 
        ? '/orders' 
        : '/orders/myorders';
      const { data } = await api.get(endpoint);
      const formattedData = data.map((order: any) => ({
        ...order,
        items: order.items?.map((item: any) => ({
          product: item.productId || { name: item.name, price: item.price, image: '' },
          quantity: item.quantity,
          selectedToppings: item.selectedToppings || [],
          note: item.note,
          totalPrice: item.price * item.quantity
        })) || []
      }));
      setOrders(formattedData);
    } catch (error) {
      console.error('Lỗi tải đơn hàng', error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
    // Auto refresh orders every 30s
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const submitOrder = async (order: any) => {
    try {
      // Map frontend cart format to backend expected format
      const formattedOrder = {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        note: order.note,
        paymentMethod: order.paymentMethod,
        pickupTime: order.pickupTime,
        promoCode: order.promoCode,
        discountAmount: order.discountAmount,
        items: order.items.map((i: any) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.totalPrice / i.quantity, // single item price
          quantity: i.quantity,
          selectedToppings: i.selectedToppings,
          note: i.note
        }))
      };

      await api.post('/orders', formattedOrder);
      loadData(); // Tải lại danh sách
    } catch (error) {
      message.error('Lỗi đặt hàng');
    }
  };

  const changeOrderStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus.toUpperCase() });
      message.success('Cập nhật trạng thái thành công');
      loadData();
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const rateOrder = (id: string, rating: { stars: number; comment: string }) => {
    message.warning('Tính năng đánh giá đang được chuyển sang Backend!');
  };

  const togglePaymentStatus = (id: string, isPaid: boolean) => {
    message.warning('Tính năng đang được phát triển!');
  };

  const updateOrderInfo = async (id: string, info: { phone: string; address: string }) => {
    try {
      await api.put(`/orders/${id}`, { customerPhone: info.phone, note: 'Giao đến: ' + info.address });
      message.success('Cập nhật thông tin nhận hàng thành công!');
      loadData();
    } catch (error) {
      message.error('Lỗi khi cập nhật thông tin');
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      await changeOrderStatus(id, 'CANCELLED');
    } catch (error) {}
  };

  return { orders, changeOrderStatus, rateOrder, togglePaymentStatus, submitOrder, addresses, addAddress, updateOrderInfo, cancelOrder, reloadOrders: loadData };
}
