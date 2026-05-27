import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { Promo } from '@/services/typing';
import { message } from 'antd';

export default function usePromoModel() {
  const [promos, setPromos] = useState<Promo[]>([]);

  const loadData = useCallback(async () => {
    // Lấy thông tin user từ localStorage để tránh gọi hook useModel gây lỗi
    const userStr = localStorage.getItem('CURRENT_USER');
    if (!userStr) return;
    
    try {
      const user = JSON.parse(userStr);
      // Chỉ lấy toàn bộ mã KM nếu là ADMIN hoặc STAFF
      if (user.role !== 'ADMIN' && user.role !== 'STAFF') return;
      
      const { data } = await api.get('/promos');
      const formattedPromos = data.map((p: any) => ({
        id: p.id || p._id,
        code: p.code,
        discountType: p.discountType || 'AMOUNT',
        discountValue: p.discountValue || p.discount || 0, // Fallback cho dữ liệu cũ (nếu có)
        maxDiscountAmount: p.maxDiscountAmount,
        quantity: p.quantity,
        isActive: p.isActive,
      }));
      setPromos(formattedPromos);
    } catch (error) {
      console.error('Lỗi tải danh sách mã khuyến mãi', error);
      message.error('Lỗi tải danh sách mã khuyến mãi');
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
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
        minOrderValue: 0 // Frontend hiện chưa có trường này
      });
      message.success('Đã thêm mã khuyến mãi mới thành công!');
      loadData();
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi thêm mã khuyến mãi');
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
      message.success('Đã cập nhật mã khuyến mãi thành công!');
      loadData();
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi cập nhật mã khuyến mãi');
      return false;
    }
  };

  const deletePromo = async (id: string) => {
    try {
      await api.delete(`/promos/${id}`);
      message.success('Đã xóa mã khuyến mãi!');
      loadData();
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa mã khuyến mãi');
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
        discountType: 'AMOUNT', // Khách hàng không cần quan tâm type nữa vì API đã trả về số tiền cố định cuối cùng rồi
        discountValue: data.discount,
        quantity: 1,
        isActive: true
      };
      return { isValid: true, discountAmount: data.discount, message: 'Áp dụng mã khuyến mãi thành công!', promo };
    } catch (error: any) {
      return { isValid: false, discountAmount: 0, message: error.response?.data?.message || 'Mã khuyến mãi không hợp lệ' };
    }
  };
  
  const decreasePromoQuantity = (code: string) => {
    // Không cần xử lý ở frontend nữa vì backend sẽ tự trừ khi đặt hàng thành công
  };

  return { promos, addPromo, updatePromo, deletePromo, togglePromoStatus, validateAndApplyPromo, decreasePromoQuantity, reloadPromos: loadData };
}
