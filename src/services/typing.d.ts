export interface User {
  id: string;
  phone: string;
  password?: string;
  name: string;
  role: 'user' | 'STAFF' | 'ADMIN';
  isBanned: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description?: string;
  isAvailable: boolean;
  toppings: string[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedToppings: string[];
  note: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId?: string; // Để lưu xem user nào đặt
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  pickupTime: string;
  paymentMethod: 'cash' | 'transfer';
  isPaid: boolean;
  createdAt: number;
  note?: string;
}
