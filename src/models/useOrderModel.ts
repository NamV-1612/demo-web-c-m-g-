import { useState, useEffect } from 'react';
import { getStorageData, setStorageData, StorageOrder, StorageInventory, StorageRecipe } from '@/utils/storage';
import { Order } from '@/services/typing';
import { message } from 'antd';

export default function useOrderModel() {
  const [orders, setOrders] = useState<Order[]>([]);

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
    
    if (newStatus === 'completed' && currentOrder && currentOrder.status !== 'completed') {
      canProceed = deductInventory(currentOrder);
    }
    
    if (canProceed) {
      const updated = orders.map(o => o.id === id ? { ...o, status: newStatus as any } : o);
      setStorageData('orders', updated);
      if (newStatus === 'completed') message.success('Đã hoàn thành đơn & trừ nguyên liệu tự động!');
    }
  };

  const submitOrder = (order: Order) => {
    const updated = [order, ...orders];
    setStorageData('orders', updated);
  };

  return { orders, changeOrderStatus, submitOrder };
}
