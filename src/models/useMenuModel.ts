import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { message } from 'antd';
import { Product } from '@/services/typing';

export default function useMenuModel() {
  const [products, setProducts] = useState<Product[]>([]);

  const loadData = useCallback(async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách món ăn', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateProductAvailability = async (id: string, isAvailable: boolean) => {
    try {
      await api.put(`/products/${id}`, { isAvailable });
      loadData(); // Gọi lại API để cập nhật state
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const addProduct = async (p: any, file?: File) => {
    try {
      const formData = new FormData();
      formData.append('name', p.name);
      formData.append('price', p.price.toString());
      if (p.description) formData.append('description', p.description);
      formData.append('isAvailable', String(p.isAvailable));
      if (p.category) formData.append('category', p.category);
      if (p.toppings) formData.append('toppings', JSON.stringify(p.toppings));
      if (p.outOfStockToppings) formData.append('outOfStockToppings', JSON.stringify(p.outOfStockToppings));
      
      if (file) {
        formData.append('image', file); // Multer sẽ xử lý field 'image'
      }

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Thêm món thành công!');
      loadData();
    } catch (error) {
      message.error('Lỗi khi thêm món mới');
    }
  };

  const updateProduct = async (id: string, data: any, file?: File, silent: boolean = false) => {
    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.price !== undefined) formData.append('price', data.price.toString());
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.isAvailable !== undefined) formData.append('isAvailable', String(data.isAvailable));
      if (data.category) formData.append('category', data.category);
      if (data.toppings) formData.append('toppings', JSON.stringify(data.toppings));
      if (data.outOfStockToppings) formData.append('outOfStockToppings', JSON.stringify(data.outOfStockToppings));
      
      if (file) {
        formData.append('image', file);
      }

      await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!silent) message.success('Cập nhật món thành công!');
      loadData();
    } catch (error) {
      if (!silent) message.error('Lỗi khi cập nhật món');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Đã xóa món ăn');
      loadData();
    } catch (error) {
      message.error('Lỗi khi xóa món ăn');
    }
  };

  return { products, updateProductAvailability, addProduct, updateProduct, deleteProduct, reloadMenu: loadData };
}
