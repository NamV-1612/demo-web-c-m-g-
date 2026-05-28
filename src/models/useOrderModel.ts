import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { Order } from '@/services/typing';
import { message } from 'antd';
import useAuthModel from './useAuthModel';

export default function useOrderModel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { currentUser } = useAuthModel();

  const [addresses, setAddresses] = useState<{id: string, name: string, phone: string, address: string}[]>([]);

  useEffect(() => {
    // Populate default address from currentUser
    if (currentUser) {
      const userAddr = {
        id: 'default',
        name: currentUser.full_name || currentUser.name,
        phone: currentUser.phone,
        address: currentUser.address || ''
      };
      // Only set if they actually have an address to show, or just always provide a default option
      setAddresses([userAddr]);
    } else {
      setAddresses([]);
    }
  }, [currentUser]);

  const addAddress = async (addr: {name: string, phone: string, address: string}) => {
    const newAddr = { ...addr, id: 'addr' + Date.now() };
    setAddresses(prev => [...prev, newAddr]);
    
    // Gọi API lưu địa chỉ làm mặc định cho User (chạy ngầm)
    if (currentUser) {
      try {
        const { data } = await api.put('/auth/profile', { address: addr.address });
        // Cập nhật lại user trong localStorage nhưng giữ nguyên token
        const updatedUser = { ...currentUser, ...data, token: currentUser.token };
        localStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Không thể lưu địa chỉ mặc định', e);
      }
    }

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
        customerAddress: order.customerAddress || order.note?.replace('Giao đến: ', ''), // Pass address to backend
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
      message.success('Đặt hàng thành công!');
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi đặt hàng');
      return false;
    }
  };

  const changeOrderStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus.toUpperCase() });
      
      if (newStatus.toUpperCase() === 'CANCELLED') {
        const order = orders.find(o => o.id === id);
        if (order && order.promoCode) {
          // Gửi request khôi phục mã giảm giá
          api.post('/promos/restore', { code: order.promoCode }).catch(() => {});
          message.info(`Đã hoàn lại mã khuyến mãi ${order.promoCode} vào kho`);
        }
      }
      
      message.success('Cập nhật trạng thái thành công');
      loadData();
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const rateOrder = async (id: string, rating: { stars: number; comment: string }) => {
    try {
      await api.put(`/orders/${id}/rate`, rating);
      message.success('Đánh giá đơn hàng thành công! Cảm ơn bạn.');
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi gửi đánh giá');
    }
  };

  const togglePaymentStatus = (id: string, isPaid: boolean) => {
    message.warning('Tính năng đang được phát triển!');
  };

  const updateOrderInfo = async (id: string, info: { phone: string; address: string }) => {
    try {
      await api.put(`/orders/${id}`, { customerPhone: info.phone, customerAddress: info.address, note: 'Giao đến: ' + info.address });
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
