import axios from 'axios';

// Base URL: Lúc code ở máy chạy localhost:5000, lúc đưa lên Netlify sẽ đổi thành URL thật
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.onrender.com/api' // Thay đổi sau khi deploy Backend
  : 'http://localhost:5000/api';

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
