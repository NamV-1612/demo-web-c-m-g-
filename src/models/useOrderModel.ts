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
    if (currentUser) {
      if (currentUser.addresses && currentUser.addresses.length > 0) {
        setAddresses(currentUser.addresses);
      } else if (currentUser.address) {
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
        window.dispatchEvent(new Event('storage'));
        
        // Find the newly added address to return its ID so the UI can select it
        newAddr = updatedUser.addresses[updatedUser.addresses.length - 1];
      } catch (e) {
        console.error('KhÃ´ng thá»ƒ lÆ°u Ä‘á»‹a chá»‰ má»›i', e);
      }
    }
    
    if (!newAddr) {
      newAddr = { id: 'addr' + Date.now(), ...addr };
      setAddresses(prev => [...prev, newAddr]);
    }

    message.success('ÄÃ£ lÆ°u Ä‘á»‹a chá»‰ má»›i vÃ o Sá»• Ä‘á»‹a chá»‰!');
    return newAddr;
  };

  const removeAddress = async (id: string) => {
    if (currentUser) {
      try {
        const { data } = await api.delete(`/auth/address/${id}`);
        const updatedUser = { ...currentUser, ...data, token: currentUser.token };
        localStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
        message.success('ÄÃ£ xÃ³a Ä‘á»‹a chá»‰!');
        return true;
      } catch (e) {
        console.error('KhÃ´ng thá»ƒ xÃ³a Ä‘á»‹a chá»‰', e);
        message.error('Lá»—i khi xÃ³a Ä‘á»‹a chá»‰');
        return false;
      }
    }
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
      console.error('Lá»—i táº£i Ä‘Æ¡n hÃ ng', error);
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
      const formattedOrder = {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress || order.note?.replace('Giao Ä‘áº¿n: ', ''), // Pass address to backend
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
      loadData(); // Táº£i láº¡i danh sÃ¡ch
      message.success('Äáº·t hÃ ng thÃ nh cÃ´ng!');
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lá»—i Ä‘áº·t hÃ ng');
      return false;
    }
  };

  const changeOrderStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus.toUpperCase() });
      
      if (newStatus.toUpperCase() === 'CANCELLED') {
        const order = orders.find(o => o.id === id);
        if (order && order.promoCode) {
          // Gá»­i request khÃ´i phá»¥c mÃ£ giáº£m giÃ¡
          api.post('/promos/restore', { code: order.promoCode }).catch(() => {});
          message.info(`ÄÃ£ hoÃ n láº¡i mÃ£ khuyáº¿n mÃ£i ${order.promoCode} vÃ o kho`);
        }
      }
      
      message.success('Cáº­p nháº­t tráº¡ng thÃ¡i thÃ nh cÃ´ng');
      loadData();
    } catch (error) {
      message.error('Lá»—i khi cáº­p nháº­t tráº¡ng thÃ¡i');
    }
  };

  const rateOrder = async (id: string, rating: { stars: number; comment: string }) => {
    try {
      await api.put(`/orders/${id}/rate`, rating);
      message.success('ÄÃ¡nh giÃ¡ Ä‘Æ¡n hÃ ng thÃ nh cÃ´ng! Cáº£m Æ¡n báº¡n.');
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lá»—i khi gá»­i Ä‘Ã¡nh giÃ¡');
    }
  };

  const togglePaymentStatus = (id: string, isPaid: boolean) => {
    message.warning('TÃ­nh nÄƒng Ä‘ang Ä‘Æ°á»£c phÃ¡t triá»ƒn!');
  };

  const updateOrderInfo = async (id: string, info: { phone: string; address: string }) => {
    try {
      await api.put(`/orders/${id}`, { customerPhone: info.phone, customerAddress: info.address, note: 'Giao Ä‘áº¿n: ' + info.address });
      message.success('Cáº­p nháº­t thÃ´ng tin nháº­n hÃ ng thÃ nh cÃ´ng!');
      loadData();
    } catch (error) {
      message.error('Lá»—i khi cáº­p nháº­t thÃ´ng tin');
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      await changeOrderStatus(id, 'CANCELLED');
    } catch (error) {}
  };

  return { orders, changeOrderStatus, rateOrder, togglePaymentStatus, submitOrder, addresses, addAddress, removeAddress, updateOrderInfo, cancelOrder, reloadOrders: loadData };
}
