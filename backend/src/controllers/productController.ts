import { Request, Response } from 'express';
import Product from '../models/productModel';

// @desc    Lấy danh sách tất cả sản phẩm
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, categoryId, isAvailable } = req.body;
    let image = '';

    if (req.file) {
      image = req.file.path; // Đường dẫn ảnh trên Cloudinary
    }

    let toppingsArr = [];
    let outOfStockArr = [];
    try {
      if (req.body.toppings) toppingsArr = typeof req.body.toppings === 'string' ? JSON.parse(req.body.toppings) : req.body.toppings;
      if (req.body.outOfStockToppings) outOfStockArr = typeof req.body.outOfStockToppings === 'string' ? JSON.parse(req.body.outOfStockToppings) : req.body.outOfStockToppings;
    } catch(e) {}

    const product = new Product({
      name,
      price,
      description,
      category: req.body.category || 'Món chính',
      toppings: toppingsArr,
      outOfStockToppings: outOfStockArr,
      isAvailable: isAvailable === 'true' || isAvailable === true,
      image,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, categoryId, isAvailable } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description !== undefined ? description : product.description;
      product.category = req.body.category || product.category;
      
      // Parse toppings
      if (req.body.toppings) {
        try {
          product.toppings = typeof req.body.toppings === 'string' ? JSON.parse(req.body.toppings) : req.body.toppings;
        } catch(e) { product.toppings = req.body.toppings; }
      }
      if (req.body.outOfStockToppings) {
        try {
          product.outOfStockToppings = typeof req.body.outOfStockToppings === 'string' ? JSON.parse(req.body.outOfStockToppings) : req.body.outOfStockToppings;
        } catch(e) { product.outOfStockToppings = req.body.outOfStockToppings; }
      }

      if (isAvailable !== undefined) {
        product.isAvailable = isAvailable === 'true' || isAvailable === true;
      }
      
      if (req.file) {
        product.image = req.file.path;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Đã xóa sản phẩm' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
