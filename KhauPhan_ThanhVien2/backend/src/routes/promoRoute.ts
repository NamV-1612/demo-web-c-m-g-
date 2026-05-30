import express from 'express';
import { createPromo, getPromos, verifyPromo, deletePromo, updatePromo } from '../controllers/promoController';
import { protect, staffOrAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public hoặc Customer (để check mã khi thanh toán)
router.post('/verify', protect, verifyPromo);

// Quản lý mã giảm giá (Dành cho Admin/Staff)
router.route('/')
  .post(protect, staffOrAdmin, createPromo)
  .get(protect, staffOrAdmin, getPromos);

router.route('/:id')
  .put(protect, staffOrAdmin, updatePromo)
  .delete(protect, staffOrAdmin, deletePromo);

export default router;
