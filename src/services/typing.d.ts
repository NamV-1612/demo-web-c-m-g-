export interface User {
  id: string;
  phone: string;
  password?: string;
  name: string;
  full_name?: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  status?: 'ACTIVE' | 'LOCKED';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  isAvailable: boolean;
  toppings: string[];
  outOfStockToppings?: string[];
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
  pickupTime?: string;
  paymentMethod?: 'cash' | 'transfer' | string;
  isPaid?: boolean;
  createdAt: number | string;
  note?: string;
  rating?: {
    stars: number;
    comment: string;
  };
  promoCode?: string;
  discountAmount?: number;
  cancelMessage?: string;
  cancelPromoCode?: string;
}

export interface Promo {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  maxDiscountAmount?: number; // Only for PERCENT
  quantity: number;
  isActive: boolean;
}
