import { Order } from './typing';

export const getOrders = (): Order[] => {
  const data = localStorage.getItem('ORDER_DATA');
  return data ? JSON.parse(data) : [];
};

export const createOrder = (order: Order) => {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem('ORDER_DATA', JSON.stringify(orders));
  // Kích hoạt sự kiện storage để Staff POS nhận được đơn ngay lập tức (Realtime fake)
  window.dispatchEvent(new Event('storage'));
};

export const updateOrderStatus = (orderId: string, status: Order['status']) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index > -1) {
    orders[index].status = status;
    localStorage.setItem('ORDER_DATA', JSON.stringify(orders));
    window.dispatchEvent(new Event('storage'));
  }
};
