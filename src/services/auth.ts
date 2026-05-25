import axios from 'axios';
import { User } from './typing';

const API_URL = 'https://demo-web-c-m-g.onrender.com/api/users';

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(API_URL);
    // Backend trả về mảng trực tiếp
    return response.data.map((u: any) => ({
      id: u.id,
      phone: u.phone,
      password: u.password,
      name: u.name,
      full_name: u.name,
      role: u.role,
      status: u.status
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách User:", error);
    return [];
  }
};

export const createStaff = async (user: Partial<User>): Promise<{success: boolean, message?: string}> => {
  try {
    await axios.post(API_URL, user);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Lỗi kết nối server' };
  }
};

export const toggleUserStatus = async (id: string, isBanned: boolean): Promise<{success: boolean, message?: string}> => {
  try {
    await axios.put(`${API_URL}/${id}/status`, { status: isBanned ? 'LOCKED' : 'ACTIVE' });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Lỗi kết nối server' };
  }
};

// Vẫn giữ lại phần Login (Current User) lưu trong localStorage tạm thời
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem('CURRENT_USER');
  if (!data) return null;
  const u = JSON.parse(data);
  return {
    id: u.id,
    phone: u.phone,
    password: u.password,
    name: u.name || u.full_name || 'Người dùng',
    full_name: u.full_name || u.name || 'Người dùng',
    role: u.role,
    status: u.status || 'ACTIVE'
  };
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('CURRENT_USER', JSON.stringify(user));
  } else {
    localStorage.removeItem('CURRENT_USER');
  }
  window.dispatchEvent(new Event('storage'));
};
