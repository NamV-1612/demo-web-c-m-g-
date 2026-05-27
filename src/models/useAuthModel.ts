import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { message } from 'antd';

export default function useAuthModel() {
  const [currentUser, setLocalUser] = useState<any | null>(null);

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

  const login = useCallback(async (identifier: string, pass: string, allowedRoles?: string[]) => {
    try {
      const { data } = await api.post('/auth/login', { identifier, password: pass });
      
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = data.role?.toUpperCase() || 'CUSTOMER';
        if (!allowedRoles.includes(userRole)) {
          message.warning('Cảnh báo: Tài khoản của bạn không có quyền truy cập trang này. Vui lòng đăng nhập đúng cổng!');
          return false;
        }
      }
      
      localStorage.setItem('CURRENT_USER', JSON.stringify(data));
      window.dispatchEvent(new Event('storage'));
      message.success(`Chào mừng ${data.full_name}`);
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Sai thông tin đăng nhập!');
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, username: string, phone: string, pass: string, role: 'CUSTOMER' | 'STAFF' | 'ADMIN' = 'CUSTOMER') => {
    try {
      await api.post('/auth/register', { 
        full_name: name, 
        name: username, 
        phone, 
        password: pass, 
        role 
      });
      message.success('Đăng ký thành công! Vui lòng đăng nhập lại.');
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi đăng ký!');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    const user = localStorage.getItem('CURRENT_USER');
    if (user) {
      localStorage.removeItem('CURRENT_USER');
      window.dispatchEvent(new Event('storage'));
      message.success('Đã đăng xuất!');
    }
  }, []);

  const updateAccount = useCallback((phone: string, username: string, newPass: string) => {
    message.warning('Chức năng đổi mật khẩu đang được nâng cấp!');
    return false;
  }, []);

  return { currentUser, login, register, logout, updateAccount };
}
