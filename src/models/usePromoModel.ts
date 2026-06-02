import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { Promo } from '@/services/typing';
import { message } from 'antd';

export default function usePromoModel() {
  const [promos, setPromos] = useState<Promo[]>([]);

  const loadData = useCallback(async () => {
    // Láº¥y thÃ´ng tin user tá»« localStorage Ä‘á»ƒ trÃ¡nh gá»i hook useModel gÃ¢y lá»—i
    const userStr = localStorage.getItem('CURRENT_USER');
    if (!userStr) return;
    
    try {
      const user = JSON.parse(userStr);
      // Chá»‰ láº¥y toÃ n bá»™ mÃ£ KM náº¿u lÃ  ADMIN hoáº·c STAFF
      if (user.role !== 'ADMIN' && user.role !== 'STAFF') return;
      
      const { data } = await api.get('/promos');
      const formattedPromos = data.map((p: any) => ({
        id: p.id || p._id,
        code: p.code,
        discountType: p.discountType || 'AMOUNT',
        maxDiscountAmount: p.maxDiscountAmount,
        quantity: p.quantity,
        isActive: p.isActive,
      }));
      setPromos(formattedPromos);
    } catch (error) {
      console.error('Lá»—i táº£i danh sÃ¡ch mÃ£ khuyáº¿n mÃ£i', error);
      message.error('Lá»—i táº£i danh sÃ¡ch mÃ£ khuyáº¿n mÃ£i');
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  const addPromo = async (p: Promo) => {
    try {
      await api.post('/promos', {
        code: p.code,
        discountType: p.discountType,
        discountValue: p.discountValue,
        maxDiscountAmount: p.maxDiscountAmount,
        quantity: p.quantity,
        isActive: p.isActive,
        minOrderValue: 0 // Frontend hiá»‡n chÆ°a cÃ³ trÆ°á»ng nÃ y
      });
      message.success('ÄÃ£ thÃªm mÃ£ khuyáº¿n mÃ£i má»›i thÃ nh cÃ´ng!');
      loadData();
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lá»—i khi thÃªm mÃ£ khuyáº¿n mÃ£i');
      return false;
    }
  };

  const updatePromo = async (id: string, data: Partial<Promo>) => {
    try {
      await api.put(`/promos/${id}`, {
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscountAmount: data.maxDiscountAmount,
        quantity: data.quantity,
        isActive: data.isActive,
      });
      message.success('ÄÃ£ cáº­p nháº­t mÃ£ khuyáº¿n mÃ£i thÃ nh cÃ´ng!');
      loadData();
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lá»—i khi cáº­p nháº­t mÃ£ khuyáº¿n mÃ£i');
      return false;
    }
  };

  const deletePromo = async (id: string) => {
    try {
      await api.delete(`/promos/${id}`);
      message.success('ÄÃ£ xÃ³a mÃ£ khuyáº¿n mÃ£i!');
      loadData();
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lá»—i khi xÃ³a mÃ£ khuyáº¿n mÃ£i');
      return false;
    }
  };

  const togglePromoStatus = async (id: string, isActive: boolean) => {
    await updatePromo(id, { isActive });
  };
  
  const validateAndApplyPromo = async (code: string, subtotal: number): Promise<{ isValid: boolean, discountAmount: number, message: string, promo?: Promo }> => {
    try {
      const { data } = await api.post('/promos/verify', { code, orderValue: subtotal });
      const promo: Promo = {
        id: 'temp',
        code: data.code,
        discountType: 'AMOUNT', // KhÃ¡ch hÃ ng khÃ´ng cáº§n quan tÃ¢m type ná»¯a vÃ¬ API Ä‘Ã£ tráº£ vá» sá»‘ tiá»n cá»‘ Ä‘á»‹nh cuá»‘i cÃ¹ng rá»“i
        discountValue: data.discount,
        quantity: 1,
        isActive: true
      };
      return { isValid: true, discountAmount: data.discount, message: 'Ãp dá»¥ng mÃ£ khuyáº¿n mÃ£i thÃ nh cÃ´ng!', promo };
    } catch (error: any) {
      return { isValid: false, discountAmount: 0, message: error.response?.data?.message || 'MÃ£ khuyáº¿n mÃ£i khÃ´ng há»£p lá»‡' };
    }
  };
  
  const decreasePromoQuantity = (code: string) => {
    // KhÃ´ng cáº§n xá»­ lÃ½ á»Ÿ frontend ná»¯a vÃ¬ backend sáº½ tá»± trá»« khi Ä‘áº·t hÃ ng thÃ nh cÃ´ng
  };

  return { promos, addPromo, updatePromo, deletePromo, togglePromoStatus, validateAndApplyPromo, decreasePromoQuantity, reloadPromos: loadData };
}
