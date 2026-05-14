export interface StorageUser {
  id: string;
  phone: string;
  password?: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  full_name: string;
}

export interface StorageProduct {
  id: string;
  name: string;
  price: number;
  status: 'available' | 'out_of_stock';
  category?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  toppings?: string[];
}

export interface StorageInventory {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

export interface StorageRecipe {
  productId: string;
  ingredients: { inventoryId: string; quantity: number }[];
}

export interface StorageOrder {
  id: string;
  customer_phone: string;
  total_price: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  created_at: number;
}

const DEFAULT_USERS: StorageUser[] = [
  { id: 'u1', phone: 'ADMIN', password: 'ADMIN', role: 'ADMIN', full_name: 'Quản trị viên Hệ thống' },
  { id: 'u2', phone: 'STAFF', password: 'STAFF', role: 'STAFF', full_name: 'Nhân viên Bếp' }
];

const DEFAULT_PRODUCTS: StorageProduct[] = [
  {
    id: 'p1',
    name: 'Cơm rang dưa bò',
    price: 45000,
    status: 'available',
    category: 'Cơm rang',
    imageUrl: 'https://cdn.tgdd.vn/2021/05/CookRecipe/Avatar/com-rang-dua-bo-thumbnail.jpg',
    isAvailable: true,
    toppings: ['Thêm trứng ốp la', 'Thêm xúc xích', 'Thêm dưa xào']
  },
  {
    id: 'p2',
    name: 'Cơm rang thập cẩm',
    price: 40000,
    status: 'available',
    category: 'Cơm rang',
    imageUrl: 'https://i.ytimg.com/vi/q_Hj_zM09wE/maxresdefault.jpg',
    isAvailable: true,
    toppings: ['Thêm trứng ốp la', 'Thêm lạp xưởng', 'Thêm pate']
  },
  {
    id: 'p3',
    name: 'Cơm rang hải sản',
    price: 55000,
    status: 'available',
    category: 'Cơm rang',
    imageUrl: 'https://cdn.tgdd.vn/2021/02/CookRecipe/Avatar/com-rang-hai-san-thumbnail.jpg',
    isAvailable: true,
    toppings: ['Thêm trứng ốp la', 'Nhiều hải sản']
  }
];

const DEFAULT_INVENTORY: StorageInventory[] = [
  { id: 'i1', ingredient_name: 'Gạo', quantity: 50000, unit: 'g' },
  { id: 'i2', ingredient_name: 'Dưa bò', quantity: 10000, unit: 'g' },
  { id: 'i3', ingredient_name: 'Hộp xốp', quantity: 500, unit: 'cái' },
  { id: 'i4', ingredient_name: 'Trứng', quantity: 200, unit: 'quả' }
];

const DEFAULT_RECIPES: StorageRecipe[] = [
  { 
    productId: 'p1', 
    ingredients: [
      { inventoryId: 'i1', quantity: 200 }, 
      { inventoryId: 'i2', quantity: 50 }, 
      { inventoryId: 'i3', quantity: 1 }
    ] 
  },
  { 
    productId: 'p2', 
    ingredients: [
      { inventoryId: 'i1', quantity: 200 }, 
      { inventoryId: 'i4', quantity: 1 }, 
      { inventoryId: 'i3', quantity: 1 }
    ] 
  }
];

export const initStorage = () => {
  if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
  if (!localStorage.getItem('products')) localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
  if (!localStorage.getItem('inventory')) localStorage.setItem('inventory', JSON.stringify(DEFAULT_INVENTORY));
  if (!localStorage.getItem('recipes')) localStorage.setItem('recipes', JSON.stringify(DEFAULT_RECIPES));
  if (!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([]));
};

export const getStorageData = <T>(key: 'users' | 'products' | 'inventory' | 'recipes' | 'orders'): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setStorageData = <T>(key: 'users' | 'products' | 'inventory' | 'recipes' | 'orders', data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('storage'));
};

// Tự động mồi dữ liệu nếu kho trống
initStorage();
