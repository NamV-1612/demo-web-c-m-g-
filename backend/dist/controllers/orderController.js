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
exports.rateOrder = exports.updateOrder = exports.updateOrderStatus = exports.getOrders = exports.getMyOrders = exports.createOrder = void 0;
const orderModel_1 = __importDefault(require("../models/orderModel"));
// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items, customerName, customerPhone, customerAddress, totalAmount, note, paymentMethod, pickupTime, promoCode, discountAmount } = req.body;
        if (items && items.length === 0) {
            res.status(400).json({ message: 'Giỏ hàng rỗng' });
            return;
        }
        const order = new orderModel_1.default({
            customerId: req.user._id,
            customerName,
            customerPhone,
            customerAddress,
            items,
            totalAmount,
            note,
            paymentMethod,
            pickupTime,
            promoCode,
            discountAmount
        });
        const createdOrder = yield order.save();
        res.status(201).json(createdOrder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createOrder = createOrder;
// @desc    Lấy đơn hàng của một người dùng
// @route   GET /api/orders/myorders
// @access  Private (Customer)
const getMyOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield orderModel_1.default.find({ customerId: req.user._id }).sort({ createdAt: -1 }).populate('items.productId');
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMyOrders = getMyOrders;
// @desc    Lấy tất cả đơn hàng
// @route   GET /api/orders
// @access  Private/Admin/Staff
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield orderModel_1.default.find({}).sort({ createdAt: -1 }).populate('items.productId');
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getOrders = getOrders;
// @desc    Cập nhật trạng thái đơn hàng (Staff/Admin có toàn quyền, Customer chỉ được Hủy khi đang PENDING)
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const order = yield orderModel_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        const { status } = req.body;
        // Check Role
        if (req.user.role === 'CUSTOMER') {
            if (status !== 'CANCELLED') {
                return res.status(403).json({ message: 'Khách hàng chỉ có quyền hủy đơn' });
            }
            if (order.status !== 'PENDING') {
                return res.status(400).json({ message: 'Chỉ có thể hủy đơn khi đang ở trạng thái Chờ xác nhận' });
            }
            if (((_a = order.customerId) === null || _a === void 0 ? void 0 : _a.toString()) !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Không có quyền hủy đơn của người khác' });
            }
        }
        order.status = status || order.status;
        // Nếu cập nhật thành COMPLETED thì coi như đã thanh toán (đối với tiền mặt)
        if (status === 'COMPLETED' && order.paymentMethod === 'cash') {
            order.isPaid = true;
        }
        const updatedOrder = yield order.save();
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateOrderStatus = updateOrderStatus;
// @desc    Sửa thông tin đơn hàng (Customer chỉ được sửa khi PENDING)
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const order = yield orderModel_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        if (req.user.role === 'CUSTOMER') {
            if (order.status !== 'PENDING') {
                return res.status(400).json({ message: 'Chỉ có thể sửa khi đơn đang Chờ xác nhận' });
            }
            if (((_a = order.customerId) === null || _a === void 0 ? void 0 : _a.toString()) !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Không có quyền sửa đơn này' });
            }
        }
        order.customerPhone = req.body.customerPhone || order.customerPhone;
        order.note = req.body.note || order.note;
        if (req.body.customerAddress) {
            order.customerAddress = req.body.customerAddress;
        }
        const updatedOrder = yield order.save();
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateOrder = updateOrder;
// @desc    Đánh giá đơn hàng (Customer)
// @route   PUT /api/orders/:id/rate
// @access  Private
const rateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const order = yield orderModel_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        // Check Role & Status
        if (((_a = order.customerId) === null || _a === void 0 ? void 0 : _a.toString()) !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền đánh giá đơn này' });
        }
        if (order.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Chỉ có thể đánh giá khi đơn hàng đã hoàn thành' });
        }
        if (order.rating && order.rating.stars) {
            return res.status(400).json({ message: 'Đơn hàng này đã được đánh giá' });
        }
        const { stars, comment } = req.body;
        if (!stars || stars < 1 || stars > 5) {
            return res.status(400).json({ message: 'Số sao đánh giá không hợp lệ (1-5)' });
        }
        order.rating = {
            stars,
            comment: comment || ''
        };
        const updatedOrder = yield order.save();
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.rateOrder = rateOrder;
