export default [
	// 0. CHUYỂN HƯỚNG GỐC VÀ LOGIN ĐỘC LẬP
	{ path: '/', exact: true, redirect: '/login' },
	{ path: '/login', layout: false, name: 'Đăng nhập', component: './Customer/Login' },

	// 1. GUEST / USER PORTAL (Đổi thành /customer)
	{
		path: '/customer',
		layout: false,
		component: '@/layouts/CustomerLayout',
		routes: [
			{ path: '/customer', redirect: '/customer/home' },
			{ path: '/customer/home', name: 'Trang chủ', component: './Customer/Home' },
			{
				path: '/customer/cart',
				name: 'Giỏ hàng',
				component: './Customer/Cart',
				wrappers: ['@/wrappers/authCustomer'],
			},
			{
				path: '/customer/profile',
				name: 'Tài khoản',
				component: './Customer/Profile',
				wrappers: ['@/wrappers/authCustomer'],
			},
			{
				path: '/customer/history',
				name: 'Lịch sử Đơn hàng',
				component: './Customer/History',
				wrappers: ['@/wrappers/authCustomer'],
			},
		],
	},

	// 2. STAFF PORTAL / POS
	{ path: '/staff/login', layout: false, name: 'Đăng nhập Nhân viên', component: './Staff/Login' },
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
				wrappers: ['@/wrappers/authStaff'],
			},
		],
	},

	// 3. ADMIN PORTAL / CMS
	{ path: '/admin/login', layout: false, name: 'Admin Login', component: './user/Login' },
	{
		path: '/admin',
		name: 'Quản trị',
		icon: 'crown',
		layout: false,
		component: '@/layouts/AdminLayout',
		wrappers: ['@/wrappers/authAdmin'],
		routes: [
			{ path: '/admin', redirect: '/admin/dashboard' },
			{ path: '/admin/dashboard', name: 'Tổng quan', icon: 'barChart', component: './Admin/Dashboard' },
			{ path: '/admin/menu', name: 'Quản lý Thực đơn', icon: 'coffee', component: './Admin/MenuManagement' },
			{ path: '/admin/orders', name: 'Quản lý Đơn hàng', icon: 'table', component: './Admin/OrderManagement' },
			{ path: '/admin/promos', name: 'Quản lý Mã Khuyến Mãi', icon: 'tag', component: './Admin/PromoManagement' },
			{ path: '/admin/users', name: 'Quản lý Người dùng', icon: 'team', component: './Admin/UserManagement' },
		],
	},

	// FALLBACKS
	{ path: '/403', component: './exception/403/403Page', layout: false },
	{ path: '/404', component: './exception/404', layout: false },
	{ component: './exception/404' },
];
