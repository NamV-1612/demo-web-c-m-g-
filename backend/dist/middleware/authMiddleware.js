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
exports.staffOrAdmin = exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
            req.user = yield userModel_1.default.findById(decoded.id).select('-password');
            if (!req.user) {
                res.status(401).json({ message: 'Người dùng không tồn tại' });
                return;
            }
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token không hợp lệ, xác thực thất bại' });
        }
    }
    else {
        res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }
});
exports.protect = protect;
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    }
    else {
        res.status(403).json({ message: 'Từ chối truy cập. Chỉ dành cho Admin.' });
    }
};
exports.adminOnly = adminOnly;
const staffOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'STAFF')) {
        next();
    }
    else {
        res.status(403).json({ message: 'Từ chối truy cập. Chỉ dành cho Nhân viên hoặc Admin.' });
    }
};
exports.staffOrAdmin = staffOrAdmin;
