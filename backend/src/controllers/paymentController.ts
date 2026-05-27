import { Request, Response } from 'express';

// In-memory store for payment sessions (Mock Demo)
const paymentSessions: Record<string, any> = {};

export const createPaymentSession = (req: Request, res: Response) => {
  const { amount } = req.body;
  const sessionId = 'SS' + Date.now() + Math.floor(Math.random() * 1000);
  
  paymentSessions[sessionId] = {
    amount,
    status: 'PENDING',
    createdAt: new Date()
  };
  
  res.status(201).json({ sessionId, ...paymentSessions[sessionId] });
};

export const getPaymentStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const session = paymentSessions[id];
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  
  res.json({ sessionId: id, ...session });
};

export const confirmPayment = (req: Request, res: Response) => {
  const { id } = req.params;
  const session = paymentSessions[id];
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  
  session.status = 'PAID';
  res.json({ message: 'Payment confirmed successfully', sessionId: id, status: 'PAID' });
};
