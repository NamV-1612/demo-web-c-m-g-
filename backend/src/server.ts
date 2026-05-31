import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoute';
import authRoutes from './routes/authRoute';
import productRoutes from './routes/productRoute';
import orderRoutes from './routes/orderRoute';
import promoRoutes from './routes/promoRoute';
import paymentRoutes from './routes/paymentRoute';
// config env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cho phép gọi API từ cổng khác (Frontend React chạy port 8000)
app.use(express.json()); // Phân tích body của request dưới dạng JSON

// Kết nối MongoDB
const MONGODB_URI = process.env.MONGODB_URI || '';
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Đã kết nối thành công tới MongoDB');
    // Khởi chạy server sau khi DB đã kết nối để tránh lỗi timeout buffering
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    console.log('💡 Lưu ý: Hãy thay đổi MONGODB_URI trong file .env bằng đường dẫn thực tế của bạn');
  });

// Routes cơ bản
app.get('/', (req: Request, res: Response) => {
  res.send('Backend đang chạy ngon lành! 🚀');
});

// Sử dụng Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/payment', paymentRoutes);

