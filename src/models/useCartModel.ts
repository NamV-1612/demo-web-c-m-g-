import { useState, useCallback, useEffect } from 'react';
import { CartItem } from '@/services/typing';
import api from '@/services/api';
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
      const existingItemIndex = prev.findIndex(
        p => p.product.id === item.product.id && (p.note || '').trim() === (item.note || '').trim()
      );

      let newCart;
      if (existingItemIndex > -1) {
        newCart = [...prev];
        const existingItem = newCart[existingItemIndex];
        newCart[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + item.quantity,
          totalPrice: existingItem.totalPrice + item.totalPrice
        };
      } else {
        newCart = [...prev, item];
      }

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

  const subTotal = cartItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const applyVoucher = useCallback(async (code: string) => {
    if (!code) {
      setVoucher(null);
      return false;
    }
    
    try {
      const { data } = await api.post('/promos/verify', { code, orderValue: subTotal });
      
      setVoucher({ 
        code: data.code, 
        discount: data.discount,
        type: 'AMOUNT', // API đã trả về số tiền cố định chính xác rồi nên luôn set là AMOUNT
        value: data.discount
      });
      message.success(`Đã áp dụng mã ${data.code}`);
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Mã khuyến mãi không hợp lệ');
      setVoucher(null);
      return false;
    }
  }, [subTotal]);
  
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
  
  const safeVoucher = voucher ? { code: voucher.code, discount: currentDiscount } : null;

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    subTotal,
    totalCartPrice,
    cartCount: cartItems.reduce((acc, curr) => acc + curr.quantity, 0),
    voucher: safeVoucher,
    applyVoucher,
    updateQuantity
  };
}
