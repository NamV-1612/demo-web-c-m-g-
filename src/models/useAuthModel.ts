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

  const login = useCallback((identifier: string, pass: string) => {
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

  return { currentUser, login, register, logout };
}
