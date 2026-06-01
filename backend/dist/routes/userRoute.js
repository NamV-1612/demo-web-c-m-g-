"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userModel_1 = __importDefault(require("../models/userModel"));
const router = express_1.default.Router();
// Lấy danh sách tất cả người dùng
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find().sort({ createdAt: -1 });
        res.json(users); // Trả thẳng mảng cho giống với localStorage cũ của Frontend
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Thêm người dùng mới
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone, password, role } = req.body;
        // Kiểm tra trùng phone
        const existing = yield userModel_1.default.findOne({ phone });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Số điện thoại này đã tồn tại!' });
        }
        // Băm (Hash) mật khẩu giống như trong authController để có thể đăng nhập được
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Thêm full_name (vì schema bắt buộc, ta lấy name làm full_name cho Staff)
        const newUser = new userModel_1.default({ full_name: name, name, phone, password: hashedPassword, role });
        yield newUser.save();
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}));
// Cập nhật trạng thái người dùng (Khóa/Mở khóa)
router.put('/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const user = yield userModel_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
        if (user.role === 'ADMIN') {
            return res.status(400).json({ success: false, message: 'Không thể khóa tài khoản Admin!' });
        }
        user.status = status;
        yield user.save();
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));
exports.default = router;
