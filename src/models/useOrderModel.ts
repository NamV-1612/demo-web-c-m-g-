import { useState, useEffect } from 'react';
import { getStorageData, setStorageData, StorageInventory, StorageRecipe } from '@/utils/storage';
import { Order } from '@/services/typing';
import { message } from 'antd';

export default function useOrderModel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<{id: string, name: string, phone: string, address: string}[]>([
    { id: 'addr1', name: 'Nguyễn Văn A', phone: '0987654321', address: 'Tòa nhà C2, Bách Khoa, Hà Nội' }
  ]);

  const addAddress = (addr: {name: string, phone: string, address: string}) => {
    const newAddr = { ...addr, id: 'addr' + Date.now() };
    setAddresses([...addresses, newAddr]);
    message.success('Đã lưu địa chỉ mới vào Sổ địa chỉ!');
    return newAddr;
  };

  useEffect(() => {
    const loadData = () => {
      const data = getStorageData<Order>('orders');
      setOrders(data);
    };
    loadData();

    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const deductInventory = (order: Order) => {
    const inventory = getStorageData<StorageInventory>('inventory');
    const recipes = getStorageData<StorageRecipe>('recipes');
    
    let updatedInventory = [...inventory];
    let isEnough = true;
    let missingItems: string[] = [];

    const required: Record<string, number> = {};
    
    order.items.forEach(item => {
      const recipe = recipes.find(r => r.productId === item.product.id);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          if (!required[ing.inventoryId]) required[ing.inventoryId] = 0;
          required[ing.inventoryId] += ing.quantity * item.quantity;
        });
      }
    });

    Object.keys(required).forEach(invId => {
      const invItem = updatedInventory.find(i => i.id === invId);
      if (invItem) {
        if (invItem.quantity < required[invId]) {
          isEnough = false;
          missingItems.push(invItem.ingredient_name);
        } else {
          invItem.quantity -= required[invId];
        }
      }
    });

    if (isEnough) {
      setStorageData('inventory', updatedInventory);
      return true;
    } else {
      message.error(`Kho không đủ nguyên liệu: ${missingItems.join(', ')}`);
      return false;
    }
  };

  const changeOrderStatus = (id: string, newStatus: string) => {
    let canProceed = true;
    const currentOrder = orders.find(o => o.id === id);
    const upperNewStatus = newStatus.toUpperCase();
    const upperCurrentStatus = currentOrder?.status?.toUpperCase();
    
    if (upperNewStatus === 'COMPLETED' && currentOrder && upperCurrentStatus !== 'COMPLETED') {
      canProceed = deductInventory(currentOrder);
    }
    
    if (canProceed) {
      const updated = orders.map(o => o.id === id ? { ...o, status: upperNewStatus as any } : o);
      setStorageData('orders', updated);
      if (upperNewStatus === 'COMPLETED') message.success('Đã hoàn thành đơn & trừ nguyên liệu tự động!');
    }
  };

  const rateOrder = (id: string, rating: { stars: number; comment: string }) => {
    const updated = orders.map(o => o.id === id ? { ...o, rating } : o);
    setStorageData('orders', updated);
    message.success('Cảm ơn bạn đã đánh giá đơn hàng!');
  };

  const togglePaymentStatus = (id: string, isPaid: boolean) => {
    const updated = orders.map(o => o.id === id ? { ...o, isPaid } : o);
    setStorageData('orders', updated);
  };

  const submitOrder = (order: Order) => {
    const updated = [order, ...orders];
    setStorageData('orders', updated);
  };

  const updateOrderInfo = (id: string, info: { phone: string; address: string }) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        // Cập nhật sdt và cả note (chứa địa chỉ giao hàng)
        return { ...o, customerPhone: info.phone, note: `Giao đến: ${info.address}` };
      }
      return o;
    });
    setStorageData('orders', updated);
    setOrders(updated);
    message.success('Đã cập nhật thông tin giao hàng!');
  };

  const deleteOrder = (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    setStorageData('orders', updated);
    setOrders(updated);
    message.success('Đã xóa đơn hàng khỏi lịch sử!');
  };

  return { orders, changeOrderStatus, rateOrder, togglePaymentStatus, submitOrder, addresses, addAddress, updateOrderInfo, deleteOrder };
}
