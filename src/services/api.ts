import axios from 'axios';

// Đổi lại link Render để deploy lên Netlify
const API_URL = 'https://demo-web-c-m-g.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào mỗi request (Interceptor)
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (chúng ta sẽ lưu token vào currentUser)
    const currentUserStr = localStorage.getItem('CURRENT_USER');
    if (currentUserStr) {
      try {
        const user = JSON.parse(currentUserStr);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('Không thể đọc token từ storage');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Bắt lỗi toàn cục (VD: Token hết hạn -> Tự động đăng xuất)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // localStorage.removeItem('CURRENT_USER');
      // window.dispatchEvent(new Event('storage'));
      // Lỗi 401: Không có quyền hoặc token hết hạn
    }
    return Promise.reject(error);
  }
);

export default api;
