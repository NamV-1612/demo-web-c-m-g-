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

  const login = useCallback((phone: string, pass: string) => {
    const users = getStorageData<StorageUser>('users');
    const user = users.find(u => u.phone === phone && u.password === pass);
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

  const register = useCallback((name: string, phone: string, pass: string) => {
    const users = getStorageData<StorageUser>('users');
    if (users.find(u => u.phone === phone)) {
      message.error('Số điện thoại này đã được đăng ký!');
      return false;
    }
    const newUser: StorageUser = {
      id: 'u' + Date.now(),
      full_name: name,
      phone,
      password: pass,
      role: 'CUSTOMER'
    };
    users.push(newUser);
    setStorageData('users', users);
    
    localStorage.setItem('CURRENT_USER', JSON.stringify(newUser));
    window.dispatchEvent(new Event('storage'));
    
    message.success('Đăng ký thành công!');
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('CURRENT_USER');
    window.dispatchEvent(new Event('storage'));
    message.success('Đã đăng xuất!');
  }, []);

  return { currentUser, login, register, logout };
}
