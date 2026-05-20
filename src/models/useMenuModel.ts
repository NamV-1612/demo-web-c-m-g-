import { useState, useEffect } from 'react';
import { getStorageData, setStorageData, StorageProduct } from '@/utils/storage';
import { Product } from '@/services/typing';

export default function useMenuModel() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadData = () => {
      const data = getStorageData<StorageProduct>('products');
      // Cast to Product to maintain compatibility with UI
      setProducts(data as unknown as Product[]);
    };
    loadData();

    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const updateProductAvailability = (id: string, isAvailable: boolean) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, isAvailable, status: isAvailable ? 'available' : 'out_of_stock' } : p
    );
    setStorageData('products', updated);
  };

  const addProduct = (p: Product) => {
    const newP = { ...p, status: p.isAvailable ? 'available' : 'out_of_stock' };
    const updated = [...products, newP];
    setStorageData('products', updated);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...data, status: (data.isAvailable !== undefined ? (data.isAvailable ? 'available' : 'out_of_stock') : (p.isAvailable ? 'available' : 'out_of_stock')) } : p);
    setStorageData('products', updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setStorageData('products', updated);
  };

  return { products, updateProductAvailability, addProduct, updateProduct, deleteProduct };
}
