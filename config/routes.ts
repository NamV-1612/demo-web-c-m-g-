export default [
  // 0. CHUYá»‚N HÆ¯á»šNG Gá»C VÃ€ LOGIN Äá»˜C Láº¬P
  { path: '/', exact: true, redirect: '/login' },
  { path: '/login', layout: false, name: 'ÄÄƒng nháº­p', component: './Customer/Login' },

  // 1. GUEST / USER PORTAL (Äá»•i thÃ nh /customer)
  {
    path: '/customer',
    layout: false,
    component: '@/layouts/CustomerLayout',
    routes: [
      { path: '/customer', redirect: '/customer/home' },
      { path: '/customer/home', name: 'Trang chá»§', component: './Customer/Home' },
      { 
        path: '/customer/cart', 
        name: 'Giá» hÃ ng', 
        component: './Customer/Cart',
        wrappers: ['@/wrappers/authCustomer'] 
      },
      { 
        path: '/customer/profile', 
        name: 'TÃ i khoáº£n', 
        component: './Customer/Profile',
        wrappers: ['@/wrappers/authCustomer'] 
      },
      { 
        path: '/customer/history', 
        name: 'Lá»‹ch sá»­ ÄÆ¡n hÃ ng', 
        component: './Customer/History',
        wrappers: ['@/wrappers/authCustomer'] 
      },
    ],
  },

  // 2. STAFF PORTAL / POS
  { path: '/staff/login', layout: false, name: 'ÄÄƒng nháº­p NhÃ¢n viÃªn', component: './Staff/Login' },
  {
    path: '/staff',
    layout: false,
    component: '@/layouts/StaffLayout',
    routes: [
      { path: '/staff', redirect: '/staff/dashboard' },
      { 
        path: '/staff/dashboard', 
        name: 'POS Dashboard', 
        component: './Staff/Dashboard',
        wrappers: ['@/wrappers/authStaff'] 
      },
    ],
  },

  // 3. ADMIN PORTAL / CMS
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user/login', layout: false, name: 'login', component: './user/Login' },
      { path: '/user', redirect: '/user/login' },
    ],
  },
  {
    path: '/admin',
    name: 'Quáº£n trá»‹',
    icon: 'crown',
    layout: false,
    component: '@/layouts/AdminLayout',
    wrappers: ['@/wrappers/authAdmin'],
    routes: [
      { path: '/admin', redirect: '/admin/dashboard' },
      { path: '/admin/dashboard', name: 'Tá»•ng quan', icon: 'barChart', component: './Admin/Dashboard' },
      { path: '/admin/menu', name: 'Quáº£n lÃ½ Thá»±c Ä‘Æ¡n', icon: 'coffee', component: './Admin/MenuManagement' },
      { path: '/admin/orders', name: 'Quáº£n lÃ½ ÄÆ¡n hÃ ng', icon: 'table', component: './Admin/OrderManagement' },
      { path: '/admin/promos', name: 'Quáº£n lÃ½ MÃ£ Khuyáº¿n MÃ£i', icon: 'tag', component: './Admin/PromoManagement' },
      { path: '/admin/users', name: 'Quáº£n lÃ½ NgÆ°á»i dÃ¹ng', icon: 'team', component: './Admin/UserManagement' },
    ],
  },

  { path: '/403', component: './exception/403/403Page', layout: false },
  { path: '/404', component: './exception/404', layout: false },
  { component: './exception/404' },
];
