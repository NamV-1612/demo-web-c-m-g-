"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const productRoute_1 = __importDefault(require("./routes/productRoute"));
const orderRoute_1 = __importDefault(require("./routes/orderRoute"));
const promoRoute_1 = __importDefault(require("./routes/promoRoute"));
const paymentRoute_1 = __importDefault(require("./routes/paymentRoute"));
// Nạp các biến môi trường từ file .env
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)()); // Cho phép gọi API từ cổng khác (Frontend React chạy port 8000)
app.use(express_1.default.json()); // Phân tích body của request dưới dạng JSON
// Kết nối MongoDB
const MONGODB_URI = process.env.MONGODB_URI || '';
mongoose_1.default
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
app.get('/', (req, res) => {
    res.send('Backend đang chạy ngon lành! 🚀');
});
// Sử dụng Routes
app.use('/api/users', userRoute_1.default);
app.use('/api/auth', authRoute_1.default);
app.use('/api/products', productRoute_1.default);
app.use('/api/orders', orderRoute_1.default);
app.use('/api/promos', promoRoute_1.default);
app.use('/api/payment', paymentRoute_1.default);
