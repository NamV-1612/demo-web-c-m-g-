import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401).json({ message: 'Người dùng không tồn tại' });
        return;
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Token không hợp lệ, xác thực thất bại' });
    }
  } else {
    res.status(401).json({ message: 'Không tìm thấy token xác thực' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Từ chối truy cập. Chỉ dành cho Admin.' });
  }
};

export const staffOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'STAFF')) {
    next();
  } else {
    res.status(403).json({ message: 'Từ chối truy cập. Chỉ dành cho Nhân viên hoặc Admin.' });
  }
};
