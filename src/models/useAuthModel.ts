import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { message } from 'antd';

export default function useAuthModel() {
	const [currentUser, setLocalUser] = useState<any | null>(null);

	useEffect(() => {
		const data = localStorage.getItem('CURRENT_USER');
		if (data) {
			const parsed = JSON.parse(data);
			setLocalUser(parsed);

			// Đồng bộ ngầm profile từ backend để lấy mảng addresses (do API login bị thiếu)
			if (parsed && parsed.token) {
				api
					.get('/auth/me')
					.then((res) => {
						if (res.data) {
							const syncedUser = { ...parsed, ...res.data, token: parsed.token };
							localStorage.setItem('CURRENT_USER', JSON.stringify(syncedUser));
							const userId = syncedUser._id || syncedUser.id;
							if (userId && syncedUser.addresses) {
								localStorage.setItem(`ADDRESSES_${userId}`, JSON.stringify(syncedUser.addresses));
							}
							setLocalUser(syncedUser);
						}
					})
					.catch((err) => console.error('Lỗi đồng bộ profile:', err));
			}
		} else {
			setLocalUser(null);
		}

		const handleStorageChange = () => {
			const newData = localStorage.getItem('CURRENT_USER');
			setLocalUser(newData ? JSON.parse(newData) : null);
		};
		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);

	const login = useCallback(async (identifier: string, pass: string, allowedRoles?: string[]) => {
		try {
			const { data } = await api.post('/auth/login', { identifier, password: pass });

			if (allowedRoles && allowedRoles.length > 0) {
				const userRole = data.role?.toUpperCase() || 'CUSTOMER';
				if (!allowedRoles.includes(userRole)) {
					message.warning(
						'Cảnh báo: Tài khoản của bạn không có quyền truy cập trang này. Vui lòng đăng nhập đúng cổng!',
					);
					return false;
				}
			}

			const userId = data._id || data.id;
			if (userId) {
				const cachedAddresses = localStorage.getItem(`ADDRESSES_${userId}`);
				if ((!data.addresses || data.addresses.length === 0) && cachedAddresses) {
					try {
						data.addresses = JSON.parse(cachedAddresses);
					} catch (e) {}
				}
			}

			localStorage.setItem('CURRENT_USER', JSON.stringify(data));
			window.dispatchEvent(new Event('storage'));
			return true;
		} catch (error: any) {
			message.error(error.response?.data?.message || 'Sai thông tin đăng nhập!');
			return false;
		}
	}, []);

	const register = useCallback(
		async (
			name: string,
			username: string,
			phone: string,
			pass: string,
			role: 'CUSTOMER' | 'STAFF' | 'ADMIN' = 'CUSTOMER',
		) => {
			try {
				await api.post('/auth/register', {
					full_name: name,
					name: username,
					phone,
					password: pass,
					role,
				});
				message.success('Đăng ký thành công! Vui lòng đăng nhập lại.');
				localStorage.setItem('isNewlyRegistered', 'true');
				return true;
			} catch (error: any) {
				message.error(error.response?.data?.message || 'Lỗi đăng ký!');
				return false;
			}
		},
		[],
	);

	const logout = useCallback(() => {
		const user = localStorage.getItem('CURRENT_USER');
		if (user) {
			localStorage.removeItem('CURRENT_USER');
			window.dispatchEvent(new Event('storage'));
		}
	}, []);

	const updateAccount = useCallback(async (phone: string, username: string, newPass: string) => {
		const userStr = localStorage.getItem('CURRENT_USER');
		if (!userStr) {
			message.error('Vui lòng đăng nhập để thực hiện chức năng này!');
			return false;
		}
		const user = JSON.parse(userStr);
		const userId = user._id || user.id;

		if (user.phone !== phone || user.name !== username) {
			message.error('Số điện thoại hoặc tên đăng nhập không khớp với tài khoản hiện tại!');
			return false;
		}

		try {
			await api.put(`/users/${userId}`, { password: newPass });
			message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
			logout();
			return true;
		} catch (error: any) {
			message.error(error.response?.data?.message || 'Lỗi cập nhật mật khẩu!');
			return false;
		}
	}, [logout]);

	return { currentUser, login, register, logout, updateAccount };
}
