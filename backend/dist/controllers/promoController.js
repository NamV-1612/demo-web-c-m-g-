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
exports.deletePromo = exports.verifyPromo = exports.updatePromo = exports.getPromos = exports.createPromo = void 0;
const promoModel_1 = __importDefault(require("../models/promoModel"));
// @desc    Tạo mã giảm giá mới
// @route   POST /api/promos
// @access  Private (Admin/Staff)
const createPromo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, discountType, discountValue, maxDiscountAmount, quantity, minOrderValue, isActive } = req.body;
        const promoExists = yield promoModel_1.default.findOne({ code: code.toUpperCase() });
        if (promoExists) {
            res.status(400).json({ message: 'Mã giảm giá này đã tồn tại' });
            return;
        }
        const promo = new promoModel_1.default({
            code: code.toUpperCase(),
            discountType: discountType || 'AMOUNT',
            discountValue,
            maxDiscountAmount,
            quantity,
            minOrderValue: minOrderValue || 0,
            isActive: isActive !== undefined ? isActive : true
        });
        const createdPromo = yield promo.save();
        res.status(201).json(createdPromo);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createPromo = createPromo;
// @desc    Lấy danh sách mã giảm giá
// @route   GET /api/promos
// @access  Private (Admin/Staff)
const getPromos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promos = yield promoModel_1.default.find({}).sort({ createdAt: -1 });
        res.json(promos);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getPromos = getPromos;
// @desc    Cập nhật mã giảm giá
// @route   PUT /api/promos/:id
// @access  Private (Admin/Staff)
const updatePromo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { discountType, discountValue, maxDiscountAmount, quantity, isActive, minOrderValue } = req.body;
        const promo = yield promoModel_1.default.findById(req.params.id);
        if (!promo) {
            res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            return;
        }
        if (discountType !== undefined)
            promo.discountType = discountType;
        if (discountValue !== undefined)
            promo.discountValue = discountValue;
        if (maxDiscountAmount !== undefined)
            promo.maxDiscountAmount = maxDiscountAmount;
        if (quantity !== undefined)
            promo.quantity = quantity;
        if (isActive !== undefined)
            promo.isActive = isActive;
        if (minOrderValue !== undefined)
            promo.minOrderValue = minOrderValue;
        const updatedPromo = yield promo.save();
        res.json(updatedPromo);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updatePromo = updatePromo;
// @desc    Khách hàng kiểm tra và áp dụng mã giảm giá
// @route   POST /api/promos/verify
// @access  Private (Customer)
const verifyPromo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, orderValue } = req.body;
        if (!code) {
            res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });
            return;
        }
        const promo = yield promoModel_1.default.findOne({ code: code.toUpperCase() });
        if (!promo) {
            res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
            return;
        }
        if (!promo.isActive) {
            res.status(400).json({ message: 'Mã giảm giá đã hết hạn hoặc bị khóa' });
            return;
        }
        if (promo.quantity <= 0) {
            res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
            return;
        }
        if (orderValue !== undefined && orderValue < promo.minOrderValue) {
            res.status(400).json({ message: `Đơn hàng tối thiểu phải từ ${promo.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng mã này` });
            return;
        }
        let calculatedDiscount = 0;
        if (promo.discountType === 'AMOUNT') {
            calculatedDiscount = promo.discountValue;
        }
        else if (promo.discountType === 'PERCENT') {
            calculatedDiscount = (orderValue * promo.discountValue) / 100;
            if (promo.maxDiscountAmount && calculatedDiscount > promo.maxDiscountAmount) {
                calculatedDiscount = promo.maxDiscountAmount;
            }
        }
        if (orderValue !== undefined && calculatedDiscount > orderValue) {
            calculatedDiscount = orderValue;
        }
        res.json({
            message: 'Áp dụng mã thành công',
            discount: calculatedDiscount,
            code: promo.code
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.verifyPromo = verifyPromo;
// @desc    Xóa mã giảm giá
// @route   DELETE /api/promos/:id
// @access  Private (Admin/Staff)
const deletePromo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promo = yield promoModel_1.default.findById(req.params.id);
        if (!promo) {
            res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            return;
        }
        yield promo.deleteOne();
        res.json({ message: 'Đã xóa mã giảm giá thành công' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deletePromo = deletePromo;
