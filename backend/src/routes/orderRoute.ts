import express from 'express';
import { createOrder, getMyOrders, getOrders, updateOrderStatus, updateOrder, rateOrder } from '../controllers/orderController';
import { protect, staffOrAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, staffOrAdmin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id/status').put(protect, updateOrderStatus);
router.route('/:id/rate').put(protect, rateOrder);
router.route('/:id').put(protect, updateOrder);

export default router;
