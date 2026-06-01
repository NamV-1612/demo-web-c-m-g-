export interface StorageUser {
  id: string;
  phone: string;
  password?: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  full_name: string;
  name?: string;
  status?: 'ACTIVE' | 'LOCKED';
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
  outOfStockToppings?: string[]; // to track out of stock toppings
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

export interface StoragePromo {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  maxDiscountAmount?: number;
  quantity: number;
  isActive: boolean;
}

const DEFAULT_USERS: StorageUser[] = [
  { id: 'u1', phone: 'admin', password: 'admin', role: 'ADMIN', full_name: 'Quản trị viên Hệ thống', name: 'Quản trị viên Hệ thống', status: 'ACTIVE' },
  { id: 'u2', phone: 'staff', password: 'staff', role: 'STAFF', full_name: 'Nhân viên Phục vụ', name: 'staff', status: 'ACTIVE' }
];



const DEFAULT_PRODUCTS: StorageProduct[] = [
  {
    id: 'p1',
    name: 'Cơm rang dưa bò',
    price: 45000,
    status: 'available',
    category: 'Cơm rang',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Thêm trứng ốp la', 'Thêm xúc xích', 'Thêm dưa xào']
  },
  {
    id: 'p2',
    name: 'Cơm rang thập cẩm',
    price: 40000,
    status: 'available',
    category: 'Cơm rang',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Thêm trứng ốp la', 'Thêm lạp xưởng', 'Thêm pate']
  },
  {
    id: 'p3',
    name: 'Cơm rang hải sản',
    price: 55000,
    status: 'available',
    category: 'Cơm rang',
    imageUrl: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Thêm trứng ốp la', 'Nhiều hải sản']
  },
  {
    id: 'p4',
    name: 'Canh rong biển thịt băm',
    price: 15000,
    status: 'available',
    category: 'Món ăn kèm',
    imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4f43b4850?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: []
  },
  {
    id: 'p5',
    name: 'Kim chi Hàn Quốc',
    price: 10000,
    status: 'available',
    category: 'Món ăn kèm',
    imageUrl: 'https://images.unsplash.com/photo-1583224964978-225ddb3ea661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: []
  },
  {
    id: 'p6',
    name: 'Xúc xích Đức nướng',
    price: 12000,
    status: 'available',
    category: 'Món ăn kèm',
    imageUrl: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Thêm tương ớt']
  },
  {
    id: 'p7',
    name: 'Coca Cola mát lạnh',
    price: 15000,
    status: 'available',
    category: 'Đồ uống',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Thêm đá']
  },
  {
    id: 'p8',
    name: 'Trà tắc khổng lồ',
    price: 15000,
    status: 'available',
    category: 'Đồ uống',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Thêm đá', 'Ít đường']
  },
  {
    id: 'p9',
    name: 'Trà đá giải nhiệt',
    price: 5000,
    status: 'available',
    category: 'Đồ uống',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: []
  },
  {
    id: 'p10',
    name: 'Cơm rang gà xối mỡ',
    price: 45000,
    status: 'available',
    category: 'Cơm rang',
    imageUrl: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Thêm trứng ốp la', 'Thêm cơm', 'Nhiều sốt']
  },
  {
    id: 'p11',
    name: 'Cơm chiên Dương Châu',
    price: 40000,
    status: 'available',
    category: 'Cơm rang',
    imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Thêm trứng', 'Thêm tôm']
  },
  {
    id: 'p12',
    name: 'Cơm rang dưa tôm',
    price: 50000,
    status: 'available',
    category: 'Cơm rang',
    imageUrl: 'https://images.unsplash.com/photo-1627844005128-66236b2f7dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Nhiều tôm', 'Nhiều dưa', 'Thêm trứng ốp la']
  },
  {
    id: 'p13',
    name: 'Mì xào hải sản',
    price: 55000,
    status: 'available',
    category: 'Cơm rang', // Putting in main menu for now or 'Món nước'
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Thêm mực', 'Thêm rau']
  },
  {
    id: 'p14',
    name: 'Phở xào bò',
    price: 50000,
    status: 'available',
    category: 'Cơm rang',
    imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Nhiều bò', 'Thêm trứng']
  },
  {
    id: 'p15',
    name: 'Nước ép cam tươi',
    price: 25000,
    status: 'available',
    category: 'Đồ uống',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451b02?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Không đá', 'Ít đường']
  },
  {
    id: 'p16',
    name: 'Sinh tố bơ',
    price: 35000,
    status: 'available',
    category: 'Đồ uống',
    imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: ['Nhiều sữa', 'Ít đá']
  },
  {
    id: 'p17',
    name: 'Đậu phộng rang',
    price: 5000,
    status: 'available',
    category: 'Món ăn kèm',
    imageUrl: 'https://images.unsplash.com/photo-1593923986877-33827bb6ac2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: []
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
  // Dọn dẹp dữ liệu cũ bị xung đột với rule mới
  if (!localStorage.getItem('force_clear_v5')) {
    localStorage.removeItem('users');
    localStorage.removeItem('CURRENT_USER');
    localStorage.setItem('force_clear_v5', 'true');
  }

  if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
  
  if (!localStorage.getItem('force_clear_products_v2')) {
    localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem('force_clear_products_v2', 'true');
  }
  
  if (!localStorage.getItem('inventory')) localStorage.setItem('inventory', JSON.stringify(DEFAULT_INVENTORY));
  if (!localStorage.getItem('recipes')) localStorage.setItem('recipes', JSON.stringify(DEFAULT_RECIPES));
  if (!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([]));
  if (!localStorage.getItem('promos')) localStorage.setItem('promos', JSON.stringify([]));
};

export const getStorageData = <T>(key: 'users' | 'products' | 'inventory' | 'recipes' | 'orders' | 'promos'): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setStorageData = <T>(key: 'users' | 'products' | 'inventory' | 'recipes' | 'orders' | 'promos', data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('storage'));
};

// Tự động mồi dữ liệu nếu kho trống
initStorage();
