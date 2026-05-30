import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { protect, adminOnly, staffOrAdmin } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, staffOrAdmin, upload.single('image'), createProduct);

router.route('/:id')
  .put(protect, staffOrAdmin, upload.single('image'), updateProduct)
  .delete(protect, adminOnly, deleteProduct);

export default router;
