import { useState, useEffect, useCallback } from 'react';
import { StorageUser, getStorageData, setStorageData } from '@/utils/storage';
import { message } from 'antd';

export default function useAuthModel() {
  const [currentUser, setLocalUser] = useState<StorageUser | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('CURRENT_USER');
    setLocalUser(data ? JSON.parse(data) : null);
    
    const handleStorageChange = () => {
      const newData = localStorage.getItem('CURRENT_USER');
      setLocalUser(newData ? JSON.parse(newData) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback((identifier: string, pass: string, allowedRoles?: string[]) => {
    const users = getStorageData<StorageUser>('users');
    const user = users.find(u => (u.phone === identifier || u.name === identifier) && u.password === pass);
    if (!user) {
      message.error('Sai thông tin đăng nhập!');
      return false;
    }
    // Chặn nếu có trường isBanned (Tính năng khóa của bản cũ)
    if ((user as any)?.status === 'LOCKED') {
      message.error('Tài khoản đã bị khóa!');
      return false;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user.role?.toUpperCase() || 'CUSTOMER';
      if (!allowedRoles.includes(userRole)) {
        message.warning('Cảnh báo: Tài khoản của bạn không có quyền truy cập trang này. Vui lòng đăng nhập đúng cổng!');
        return false;
      }
    }
    
    localStorage.setItem('CURRENT_USER', JSON.stringify(user));
    window.dispatchEvent(new Event('storage'));
    message.success(`Chào mừng ${user.full_name}`);
    return true;
  }, []);

  const register = useCallback((name: string, username: string, phone: string, pass: string, role: 'CUSTOMER' | 'STAFF' | 'ADMIN' = 'CUSTOMER') => {
    const users = getStorageData<StorageUser>('users');
    if (users.find(u => u.phone === phone || u.name === phone)) {
      message.error('Số điện thoại này đã được sử dụng!');
      return false;
    }
    if (users.find(u => u.name === username || u.phone === username)) {
      message.error('Tên đăng nhập này đã được sử dụng!');
      return false;
    }
    const newUser: StorageUser = {
      id: 'u' + Date.now(),
      full_name: name,
      name: username,
      phone,
      password: pass,
      role: role,
      status: 'ACTIVE'
    };
    users.push(newUser);
    setStorageData('users', users);
    
    message.success('Đăng ký thành công! Vui lòng đăng nhập lại.');
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('CURRENT_USER');
    window.dispatchEvent(new Event('storage'));
    message.success('Đã đăng xuất!');
  }, []);

  const updateAccount = useCallback((phone: string, username: string, newPass: string) => {
    if (!currentUser) return false;
    if (currentUser.phone !== phone || currentUser.name !== username) {
      message.error('Số điện thoại hoặc tên đăng nhập không chính xác!');
      return false;
    }
    
    const users = getStorageData<StorageUser>('users');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return false;
    
    users[userIndex].password = newPass;
    
    setStorageData('users', users);
    const updatedUser = { ...currentUser, ...users[userIndex] };
    localStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('storage'));
    message.success('Đổi mật khẩu thành công!');
    return true;
  }, [currentUser]);

  return { currentUser, login, register, logout, updateAccount };
}
