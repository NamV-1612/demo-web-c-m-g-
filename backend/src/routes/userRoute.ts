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

import bcrypt from 'bcryptjs';

// Thêm người dùng mới
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, password, role } = req.body;
    // Kiểm tra trùng phone
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã tồn tại!' });
    }
    
    // Băm (Hash) mật khẩu giống như trong authController để có thể đăng nhập được
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Thêm full_name. Để tránh lỗi trùng lặp username, ta gán name (username) bằng số điện thoại.
    const newUser = new User({ full_name: name, name: phone, phone, password: hashedPassword, role });
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

// Cập nhật thông tin người dùng (Sửa tài khoản)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    
    // Kiểm tra trùng số điện thoại nếu có đổi
    if (phone && phone !== user.phone) {
       const existing = await User.findOne({ phone });
       if (existing) {
         return res.status(400).json({ success: false, message: 'Số điện thoại này đã tồn tại!' });
       }
       user.phone = phone;
       user.name = phone; // Cập nhật luôn username theo sđt mới
    }

    if (name) {
       user.full_name = name; // Chỉ cập nhật họ tên, không cập nhật name(username)
    }

    if (password) {
       const salt = await bcrypt.genSalt(10);
       user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xóa người dùng
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    if (user.role === 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Admin!' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa người dùng' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
