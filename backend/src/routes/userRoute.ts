import express, { Request, Response } from 'express';
import User from '../models/userModel';

const router = express.Router();

// Lấy danh sách tất cả người dùng
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users); // Trả thẳng mảng cho giống với localStorage cũ của Frontend
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm người dùng mới
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, password, role } = req.body;
    // Kiểm tra trùng phone
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã tồn tại!' });
    }
    
    // Thêm full_name (vì schema bắt buộc, ta lấy name làm full_name cho Staff)
    const newUser = new User({ full_name: name, name, phone, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Cập nhật trạng thái người dùng (Khóa/Mở khóa)
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    if (user.role === 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Không thể khóa tài khoản Admin!' });
    }
    
    user.status = status;
    await user.save();
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
