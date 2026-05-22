import { useState, useCallback, useEffect } from 'react';
import { CartItem, Promo } from '@/services/typing';
import { getStorageData, StoragePromo } from '@/utils/storage';
import { message } from 'antd';

export default function useCartModel() {
  const [userId, setUserId] = useState<string | null>(() => {
    const data = localStorage.getItem('CURRENT_USER');
    return data ? JSON.parse(data).id : null;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const data = localStorage.getItem('CURRENT_USER');
    const uid = data ? JSON.parse(data).id : null;
    if (uid) {
      const savedCart = localStorage.getItem(`CART_${uid}`);
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  const [voucher, setVoucher] = useState<{ code: string, discount: number, type: 'PERCENT'|'AMOUNT', value: number, max?: number } | null>(null);

  useEffect(() => {
    const checkUser = () => {
      const data = localStorage.getItem('CURRENT_USER');
      const user = data ? JSON.parse(data) : null;
      const uid = user ? user.id : null;
      setUserId(uid);
      
      if (!uid) {
        setCartItems([]);
      } else {
        const savedCart = localStorage.getItem(`CART_${uid}`);
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
      }
    };
    
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCartItems(prev => {
      const newCart = [...prev, item];
      if (userId) localStorage.setItem(`CART_${userId}`, JSON.stringify(newCart));
      return newCart;
    });
  }, [userId]);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems(prev => {
      const newCart = prev.filter(item => item.cartItemId !== cartItemId);
      if (userId) localStorage.setItem(`CART_${userId}`, JSON.stringify(newCart));
      return newCart;
    });
  }, [userId]);

  const updateQuantity = useCallback((cartItemId: string, delta: number) => {
    setCartItems(prev => {
      const newCart = prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          const unitPrice = item.totalPrice / item.quantity;
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: unitPrice * newQuantity
          };
        }
        return item;
      });
      if (userId) localStorage.setItem(`CART_${userId}`, JSON.stringify(newCart));
      return newCart;
    });
  }, [userId]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (userId) localStorage.removeItem(`CART_${userId}`);
    setVoucher(null);
  }, [userId]);

  const applyVoucher = useCallback((code: string) => {
    if (!code) {
      setVoucher(null);
      return false;
    }
    
    const promos = getStorageData<StoragePromo>('promos');
    const promo = promos.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
    
    if (!promo) {
      message.error('Mã khuyến mãi không tồn tại hoặc đã bị tắt!');
      setVoucher(null);
      return false;
    }
    
    if (promo.quantity <= 0) {
      message.error('Mã khuyến mãi đã hết lượt sử dụng!');
      setVoucher(null);
      return false;
    }

    setVoucher({ 
      code: promo.code, 
      discount: 0, // calculated dynamically below
      type: promo.discountType,
      value: promo.discountValue,
      max: promo.maxDiscountAmount
    });
    message.success(`Đã áp dụng mã ${promo.code}`);
    return true;
  }, []);

  const subTotal = cartItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
  
  let currentDiscount = 0;
  if (voucher) {
    if (voucher.type === 'AMOUNT') {
      currentDiscount = voucher.value;
    } else if (voucher.type === 'PERCENT') {
      currentDiscount = (subTotal * voucher.value) / 100;
      if (voucher.max && currentDiscount > voucher.max) {
        currentDiscount = voucher.max;
      }
    }
    if (currentDiscount > subTotal) currentDiscount = subTotal;
  }
  
  const totalCartPrice = Math.max(0, subTotal - currentDiscount);
  
  // Provide a safe voucher object for UI that includes the calculated dynamic discount
  const safeVoucher = voucher ? { code: voucher.code, discount: currentDiscount } : null;

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    subTotal,
    totalCartPrice,
    cartCount: cartItems.length,
    voucher: safeVoucher,
    applyVoucher,
    updateQuantity
  };
}
