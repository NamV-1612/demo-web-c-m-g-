import { User } from './typing';

const MOCK_USERS: User[] = [
  { id: 'admin1', phone: 'ADMIN', password: 'ADMIN', name: 'Super Admin', role: 'ADMIN', status: false ? 'LOCKED' : 'ACTIVE' },
  { id: 'staff1', phone: 'STAFF', password: 'STAFF', name: 'Nhân viên Bếp', role: 'STAFF', status: false ? 'LOCKED' : 'ACTIVE' },
  { id: 'user1', phone: '0987654321', password: '123', name: 'Khách VIP', role: 'user', status: false ? 'LOCKED' : 'ACTIVE' },
];

export const getUsers = (): User[] => {
  const data = localStorage.getItem('USER_DATA');
  if (data) return JSON.parse(data);
  localStorage.setItem('USER_DATA', JSON.stringify(MOCK_USERS));
  return MOCK_USERS;
};

export const updateUsers = (users: User[]) => {
  localStorage.setItem('USER_DATA', JSON.stringify(users));
  window.dispatchEvent(new Event('storage'));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem('CURRENT_USER');
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('CURRENT_USER', JSON.stringify(user));
  } else {
    localStorage.removeItem('CURRENT_USER');
  }
  window.dispatchEvent(new Event('storage'));
};
