import { useState, useCallback } from 'react';
import { CartItem } from '@/services/typing';

export default function useCartModel() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: CartItem) => {
    setCartItems(prev => [...prev, item]);
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalCartPrice = cartItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    totalCartPrice,
    cartCount: cartItems.length,
  };
}
