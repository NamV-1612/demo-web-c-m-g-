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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const productModel_1 = __importDefault(require("../models/productModel"));
// @desc    Lấy danh sách tất cả sản phẩm
// @route   GET /api/products
// @access  Public
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield productModel_1.default.find({}).sort({ createdAt: -1 });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getProducts = getProducts;
// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private/Admin
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, description, categoryId, isAvailable } = req.body;
        let image = '';
        if (req.file) {
            image = req.file.path; // Đường dẫn ảnh trên Cloudinary
        }
        let toppingsArr = [];
        let outOfStockArr = [];
        try {
            if (req.body.toppings)
                toppingsArr = typeof req.body.toppings === 'string' ? JSON.parse(req.body.toppings) : req.body.toppings;
            if (req.body.outOfStockToppings)
                outOfStockArr = typeof req.body.outOfStockToppings === 'string' ? JSON.parse(req.body.outOfStockToppings) : req.body.outOfStockToppings;
        }
        catch (e) { }
        const product = new productModel_1.default({
            name,
            price,
            description,
            category: req.body.category || 'Món chính',
            toppings: toppingsArr,
            outOfStockToppings: outOfStockArr,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            image,
        });
        const createdProduct = yield product.save();
        res.status(201).json(createdProduct);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createProduct = createProduct;
// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, description, categoryId, isAvailable } = req.body;
        const product = yield productModel_1.default.findById(req.params.id);
        if (product) {
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description !== undefined ? description : product.description;
            product.category = req.body.category || product.category;
            // Parse toppings
            if (req.body.toppings) {
                try {
                    product.toppings = typeof req.body.toppings === 'string' ? JSON.parse(req.body.toppings) : req.body.toppings;
                }
                catch (e) {
                    product.toppings = req.body.toppings;
                }
            }
            if (req.body.outOfStockToppings) {
                try {
                    product.outOfStockToppings = typeof req.body.outOfStockToppings === 'string' ? JSON.parse(req.body.outOfStockToppings) : req.body.outOfStockToppings;
                }
                catch (e) {
                    product.outOfStockToppings = req.body.outOfStockToppings;
                }
            }
            if (isAvailable !== undefined) {
                product.isAvailable = isAvailable === 'true' || isAvailable === true;
            }
            if (req.file) {
                product.image = req.file.path;
            }
            const updatedProduct = yield product.save();
            res.json(updatedProduct);
        }
        else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateProduct = updateProduct;
// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield productModel_1.default.findById(req.params.id);
        if (product) {
            yield productModel_1.default.deleteOne({ _id: product._id });
            res.json({ message: 'Đã xóa sản phẩm' });
        }
        else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteProduct = deleteProduct;
