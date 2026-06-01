"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPayment = exports.getPaymentStatus = exports.createPaymentSession = void 0;
// In-memory store for payment sessions (Mock Demo)
const paymentSessions = {};
const createPaymentSession = (req, res) => {
    const { amount } = req.body;
    const sessionId = 'SS' + Date.now() + Math.floor(Math.random() * 1000);
    paymentSessions[sessionId] = {
        amount,
        status: 'PENDING',
        createdAt: new Date()
    };
    res.status(201).json(Object.assign({ sessionId }, paymentSessions[sessionId]));
};
exports.createPaymentSession = createPaymentSession;
const getPaymentStatus = (req, res) => {
    const { id } = req.params;
    const sessionId = String(id);
    const session = paymentSessions[sessionId];
    if (!session) {
        return res.status(404).json({ message: 'Session not found' });
    }
    res.json(Object.assign({ sessionId }, session));
};
exports.getPaymentStatus = getPaymentStatus;
const confirmPayment = (req, res) => {
    const { id } = req.params;
    const sessionId = String(id);
    const session = paymentSessions[sessionId];
    if (!session) {
        return res.status(404).json({ message: 'Session not found' });
    }
    session.status = 'PAID';
    res.json({ message: 'Payment confirmed successfully', sessionId, status: 'PAID' });
};
exports.confirmPayment = confirmPayment;
