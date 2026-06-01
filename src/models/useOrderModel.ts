import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/services/api';
import { Order } from '@/services/typing';
import { message, notification } from 'antd';
import useAuthModel from './useAuthModel';
import moment from 'moment';

export default function useOrderModel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const prevOrdersRef = useRef<Order[]>([]);
  const { currentUser } = useAuthModel();

  const [addresses, setAddresses] = useState<{id: string, name: string, phone: string, address: string}[]>([]);

  useEffect(() => {
    // Populate addresses from currentUser
    if (currentUser) {
      if (currentUser.addresses && currentUser.addresses.length > 0) {
        setAddresses(currentUser.addresses);
      } else if (currentUser.address) {
        // Fallback for old data
        const userAddr = {
          id: 'default',
          name: currentUser.full_name || currentUser.name,
          phone: currentUser.phone,
          address: currentUser.address
        };
        setAddresses([userAddr]);
      } else {
        setAddresses([]);
      }
    } else {
      setAddresses([]);
    }
  }, [currentUser]);

  const addAddress = async (addr: {name: string, phone: string, address: string}) => {
    let newAddr: any = null;
    if (currentUser) {
      try {
        const { data } = await api.post('/auth/address', addr);
        const updatedUser = { ...currentUser, ...data, token: currentUser.token };
        localStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser));
        const userId = updatedUser._id || updatedUser.id;
        if (userId && updatedUser.addresses) {
          localStorage.setItem(`ADDRESSES_${userId}`, JSON.stringify(updatedUser.addresses));
        }
        window.dispatchEvent(new Event('storage'));
        
        // Find the newly added address to return its ID so the UI can select it
        newAddr = updatedUser.addresses[updatedUser.addresses.length - 1];
      } catch (e) {
        console.error('Không thể lưu địa chỉ mới', e);
      }
    }
    
    if (!newAddr) {
      // Fallback for non-logged in or offline
      newAddr = { id: 'addr' + Date.now(), ...addr };
      setAddresses(prev => [...prev, newAddr]);
    }

    message.success('Đã lưu địa chỉ mới vào Sổ địa chỉ!');
    return newAddr;
  };

  const removeAddress = async (id: string) => {
    if (currentUser) {
      try {
        const { data } = await api.delete(`/auth/address/${id}`);
        const updatedUser = { ...currentUser, ...data, token: currentUser.token };
        localStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser));
        const userId = updatedUser._id || updatedUser.id;
        if (userId && updatedUser.addresses) {
          localStorage.setItem(`ADDRESSES_${userId}`, JSON.stringify(updatedUser.addresses));
        }
        window.dispatchEvent(new Event('storage'));
        message.success('Đã xóa địa chỉ!');
        return true;
      } catch (e) {
        console.error('Không thể xóa địa chỉ', e);
        message.error('Lỗi khi xóa địa chỉ');
        return false;
      }
    }
    // Fallback locally
    setAddresses(prev => prev.filter(a => a.id !== id));
    return true;
  };

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const endpoint = (currentUser.role === 'ADMIN' || currentUser.role === 'STAFF') 
        ? '/orders' 
        : '/orders/myorders';
      const { data } = await api.get(endpoint);
      const formattedData = data.map((order: any) => {
        // Auto-cancel logic for PENDING orders older than 15 mins
        const createdAtMs = moment(order.createdAt).valueOf();
        if (order.status === 'PENDING' && Date.now() - createdAtMs > 15 * 60 * 1000) {
          order.status = 'CANCELLED';
          order.cancelMessage = 'Hệ thống tự động hủy do quá 15 phút không xác nhận.';
          api.put(`/orders/${order.id}/status`, { status: 'CANCELLED', cancelMessage: 'Hệ thống tự động hủy do quá 15 phút không xác nhận.' }).catch(() => {});
        }
        
        return {
          ...order,
          items: order.items?.map((item: any) => ({
            product: item.productId || { name: item.name, price: item.price, image: '' },
            quantity: item.quantity,
            selectedToppings: item.selectedToppings || [],
            note: item.note,
            totalPrice: item.price * item.quantity
          })) || []
        };
      });

      // Notification Logic
      if (prevOrdersRef.current.length > 0) {
        formattedData.forEach((newOrder: any) => {
          const oldOrder = prevOrdersRef.current.find(o => o.id === newOrder.id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
            // Customer notification when ready
            if (currentUser.role === 'CUSTOMER' && newOrder.status === 'READY') {
              notification.success({
                message: 'Đơn hàng đã sẵn sàng!',
                description: `Đơn hàng #${newOrder.id} của bạn đã chuẩn bị xong, vui lòng lấy hàng!`,
                placement: 'topRight'
              });
            }
            // Staff notification when auto-cancelled
            if ((currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') && newOrder.status === 'CANCELLED' && newOrder.cancelMessage?.includes('quá 15 phút')) {
              notification.error({
                message: 'Đơn hàng tự động hủy',
                description: `Đơn #${newOrder.id} đã bị hủy do quá 15 phút không được duyệt.`,
                placement: 'topRight'
              });
            }
          }
        });
      }
      prevOrdersRef.current = formattedData;
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
        id: order.id,
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

  return { orders, changeOrderStatus, rateOrder, togglePaymentStatus, submitOrder, addresses, addAddress, removeAddress, updateOrderInfo, cancelOrder, reloadOrders: loadData };
}
