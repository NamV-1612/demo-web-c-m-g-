import { Product } from './typing';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Cơm rang dưa bò',
    price: 45000,
    category: 'Cơm rang',
    imageUrl: 'https://cdn.tgdd.vn/2021/05/CookRecipe/Avatar/com-rang-dua-bo-thumbnail.jpg',
    isAvailable: true,
    toppings: ['Thêm trứng ốp la', 'Thêm xúc xích', 'Thêm dưa xào'],
  },
  {
    id: 'p2',
    name: 'Cơm rang thập cẩm',
    price: 40000,
    category: 'Cơm rang',
    imageUrl: 'https://i.ytimg.com/vi/q_Hj_zM09wE/maxresdefault.jpg',
    isAvailable: true,
    toppings: ['Thêm trứng ốp la', 'Thêm lạp xưởng', 'Thêm pate'],
  },
  {
    id: 'p3',
    name: 'Cơm rang hải sản',
    price: 55000,
    category: 'Cơm rang',
    imageUrl: 'https://cdn.tgdd.vn/2021/02/CookRecipe/Avatar/com-rang-hai-san-thumbnail.jpg',
    isAvailable: true,
    toppings: ['Thêm trứng ốp la', 'Nhiều hải sản'],
  },
  {
    id: 'p4',
    name: 'Trà đá',
    price: 5000,
    category: 'Đồ uống',
    imageUrl: 'https://www.disnfood.com/wp-content/uploads/2018/10/tra-da.jpg',
    isAvailable: true,
    toppings: [],
  },
  {
    id: 'p5',
    name: 'Nước sấu',
    price: 15000,
    category: 'Đồ uống',
    imageUrl: 'https://cdn.tgdd.vn/2020/06/CookRecipe/Avatar/nuoc-sau-ngam-duong-thumbnail-1.jpg',
    isAvailable: true,
    toppings: [],
  }
];

export const getMenu = (): Product[] => {
  const data = localStorage.getItem('MENU_DATA');
  if (data) {
    return JSON.parse(data);
  }
  localStorage.setItem('MENU_DATA', JSON.stringify(MOCK_PRODUCTS));
  return MOCK_PRODUCTS;
};

export const updateMenu = (products: Product[]) => {
  localStorage.setItem('MENU_DATA', JSON.stringify(products));
  window.dispatchEvent(new Event('storage'));
};
