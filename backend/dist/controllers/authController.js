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
exports.deleteAddress = exports.addAddress = exports.updateProfile = exports.getMe = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
        expiresIn: '30d',
    });
};
// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { full_name, name, phone, password, role, address } = req.body;
        const userExists = yield userModel_1.default.findOne({ $or: [{ phone }, { name }] });
        if (userExists) {
            res.status(400).json({ message: 'Số điện thoại hoặc tên đăng nhập đã được sử dụng' });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = yield userModel_1.default.create({
            full_name,
            name,
            phone,
            address,
            password: hashedPassword,
            role: role || 'CUSTOMER',
        });
        if (user) {
            res.status(201).json({
                id: user._id,
                full_name: user.full_name,
                name: user.name,
                phone: user.phone,
                address: user.address,
                role: user.role,
                token: generateToken(user.id),
            });
        }
        else {
            res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.registerUser = registerUser;
// @desc    Đăng nhập người dùng & lấy token
// @route   POST /api/auth/login
// @access  Public
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identifier, password } = req.body;
        // Tìm user theo username(name) hoặc phone
        const user = yield userModel_1.default.findOne({ $or: [{ phone: identifier }, { name: identifier }] });
        if (!user) {
            res.status(401).json({ message: 'Tài khoản không tồn tại' });
            return;
        }
        if (user.status === 'LOCKED') {
            res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password || '');
        if (!isMatch) {
            res.status(401).json({ message: 'Mật khẩu không chính xác' });
            return;
        }
        res.json({
            id: user._id,
            full_name: user.full_name,
            name: user.name,
            phone: user.phone,
            address: user.address,
            role: user.role,
            token: generateToken(user.id),
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.loginUser = loginUser;
// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMe = getMe;
// @desc    Cập nhật thông tin cá nhân (Địa chỉ, số điện thoại)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }
        if (req.body.address)
            user.address = req.body.address;
        if (req.body.phone)
            user.phone = req.body.phone;
        if (req.body.full_name)
            user.full_name = req.body.full_name;
        const updatedUser = yield user.save();
        res.json({
            id: updatedUser._id,
            full_name: updatedUser.full_name,
            name: updatedUser.name,
            phone: updatedUser.phone,
            address: updatedUser.address,
            addresses: updatedUser.addresses,
            role: updatedUser.role,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateProfile = updateProfile;
// @desc    Thêm địa chỉ mới vào sổ địa chỉ
// @route   POST /api/auth/address
// @access  Private
const addAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }
        const { name, phone, address, isDefault } = req.body;
        const newAddr = {
            id: 'addr' + Date.now(),
            name,
            phone,
            address,
            isDefault: isDefault || false
        };
        if (!user.addresses) {
            user.addresses = [];
        }
        // Nếu đặt làm mặc định, hủy mặc định của các địa chỉ khác
        if (newAddr.isDefault) {
            user.addresses.forEach(a => a.isDefault = false);
            user.address = newAddr.address; // Cập nhật luôn field address cũ cho tương thích
        }
        else if (user.addresses.length === 0) {
            // Nếu là địa chỉ đầu tiên thì tự làm mặc định
            newAddr.isDefault = true;
            user.address = newAddr.address;
        }
        user.addresses.push(newAddr);
        const updatedUser = yield user.save();
        res.json({
            id: updatedUser._id,
            full_name: updatedUser.full_name,
            name: updatedUser.name,
            phone: updatedUser.phone,
            address: updatedUser.address,
            addresses: updatedUser.addresses,
            role: updatedUser.role,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.addAddress = addAddress;
// @desc    Xóa địa chỉ
// @route   DELETE /api/auth/address/:addressId
// @access  Private
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }
        if (user.addresses) {
            user.addresses = user.addresses.filter(a => a.id !== req.params.addressId);
        }
        const updatedUser = yield user.save();
        res.json({
            id: updatedUser._id,
            full_name: updatedUser.full_name,
            name: updatedUser.name,
            phone: updatedUser.phone,
            address: updatedUser.address,
            addresses: updatedUser.addresses,
            role: updatedUser.role,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteAddress = deleteAddress;
