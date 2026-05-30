import express from 'express';
import { createPaymentSession, getPaymentStatus, confirmPayment } from '../controllers/paymentController';

const router = express.Router();

router.post('/session', createPaymentSession);
router.get('/session/:id', getPaymentStatus);
router.post('/session/:id/confirm', confirmPayment);

export default router;
