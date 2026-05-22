import { useState, useEffect } from 'react';
import { getStorageData, setStorageData, StoragePromo } from '@/utils/storage';
import { Promo } from '@/services/typing';

export default function usePromoModel() {
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    const loadData = () => {
      const data = getStorageData<StoragePromo>('promos');
      setPromos(data as unknown as Promo[]);
    };
    loadData();

    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const addPromo = (p: Promo) => {
    const updated = [...promos, p];
    setStorageData('promos', updated);
  };

  const updatePromo = (id: string, data: Partial<Promo>) => {
    const updated = promos.map(p => p.id === id ? { ...p, ...data } : p);
    setStorageData('promos', updated);
  };

  const deletePromo = (id: string) => {
    const updated = promos.filter(p => p.id !== id);
    setStorageData('promos', updated);
  };

  const togglePromoStatus = (id: string, isActive: boolean) => {
    const updated = promos.map(p => p.id === id ? { ...p, isActive } : p);
    setStorageData('promos', updated);
  };
  
  const validateAndApplyPromo = (code: string, subtotal: number): { isValid: boolean, discountAmount: number, message: string, promo?: Promo } => {
    const promo = promos.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
    if (!promo) {
      return { isValid: false, discountAmount: 0, message: 'Mã khuyến mãi không tồn tại hoặc đã hết hạn.' };
    }
    
    if (promo.quantity <= 0) {
      return { isValid: false, discountAmount: 0, message: 'Mã khuyến mãi đã hết lượt sử dụng.' };
    }
    
    let discountAmount = 0;
    if (promo.discountType === 'AMOUNT') {
      discountAmount = promo.discountValue;
    } else if (promo.discountType === 'PERCENT') {
      discountAmount = (subtotal * promo.discountValue) / 100;
      if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
        discountAmount = promo.maxDiscountAmount;
      }
    }
    
    // Đảm bảo không giảm giá quá tổng tiền
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
    
    return { isValid: true, discountAmount, message: 'Áp dụng mã khuyến mãi thành công!', promo };
  };
  
  const decreasePromoQuantity = (code: string) => {
    const promo = promos.find(p => p.code.toUpperCase() === code.toUpperCase());
    if (promo && promo.quantity > 0) {
      updatePromo(promo.id, { quantity: promo.quantity - 1 });
    }
  };

  return { promos, addPromo, updatePromo, deletePromo, togglePromoStatus, validateAndApplyPromo, decreasePromoQuantity };
}
