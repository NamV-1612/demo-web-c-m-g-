import { Product } from './typing';

export const getMenu = (): Product[] => {
  const data = localStorage.getItem('products');
  if (data) {
    return JSON.parse(data);
  }
  return [];
};

export const updateMenu = (products: Product[]) => {
  localStorage.setItem('products', JSON.stringify(products));
  window.dispatchEvent(new Event('storage'));
};
