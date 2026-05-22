import { User } from './typing';

export const getUsers = (): User[] => {
  const data = localStorage.getItem('users');
  if (data) {
    const list = JSON.parse(data) as any[];
    return list.map(u => ({
      id: u.id,
      phone: u.phone,
      password: u.password,
      name: u.name || u.full_name || 'Người dùng',
      full_name: u.full_name || u.name || 'Người dùng',
      role: u.role,
      status: u.status || 'ACTIVE'
    }));
  }
  return [];
};

export const updateUsers = (users: User[]) => {
  const list = users.map(u => ({
    id: u.id,
    phone: u.phone,
    password: u.password,
    name: u.name || u.full_name,
    full_name: u.full_name || u.name,
    role: u.role,
    status: u.status || 'ACTIVE'
  }));
  localStorage.setItem('users', JSON.stringify(list));
  window.dispatchEvent(new Event('storage'));
};

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
