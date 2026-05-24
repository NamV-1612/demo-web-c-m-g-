import express from 'express';
import { createOrder, getMyOrders, getOrders, updateOrderStatus } from '../controllers/orderController';
import { protect, staffOrAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, staffOrAdmin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id/status').put(protect, staffOrAdmin, updateOrderStatus);

export default router;
