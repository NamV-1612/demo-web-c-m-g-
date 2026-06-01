"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promoController_1 = require("../controllers/promoController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Public hoặc Customer (để check mã khi thanh toán)
router.post('/verify', authMiddleware_1.protect, promoController_1.verifyPromo);
// Quản lý mã giảm giá (Dành cho Admin/Staff)
router.route('/')
    .post(authMiddleware_1.protect, authMiddleware_1.staffOrAdmin, promoController_1.createPromo)
    .get(authMiddleware_1.protect, authMiddleware_1.staffOrAdmin, promoController_1.getPromos);
router.route('/:id')
    .put(authMiddleware_1.protect, authMiddleware_1.staffOrAdmin, promoController_1.updatePromo)
    .delete(authMiddleware_1.protect, authMiddleware_1.staffOrAdmin, promoController_1.deletePromo);
exports.default = router;
