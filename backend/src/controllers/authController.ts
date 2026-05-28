import { Request, Response } from 'express';
import User from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { full_name, name, phone, password, role, address } = req.body;

    const userExists = await User.findOne({ $or: [{ phone }, { name }] });
    if (userExists) {
      res.status(400).json({ message: 'Số điện thoại hoặc tên đăng nhập đã được sử dụng' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      full_name,
      name,
      phone,
      address,
      password: hashedPassword,
      role: role || 'CUSTOMER',
    });

    if (user) {
      res.status(201).json({
        id: user._id,
        full_name: user.full_name,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đăng nhập người dùng & lấy token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    // Tìm user theo username(name) hoặc phone
    const user = await User.findOne({ $or: [{ phone: identifier }, { name: identifier }] });

    if (!user) {
      res.status(401).json({ message: 'Tài khoản không tồn tại' });
      return;
    }

    if (user.status === 'LOCKED') {
      res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      res.status(401).json({ message: 'Mật khẩu không chính xác' });
      return;
    }

    res.json({
      id: user._id,
      full_name: user.full_name,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật thông tin cá nhân (Địa chỉ, số điện thoại)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    if (req.body.address) user.address = req.body.address;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.full_name) user.full_name = req.body.full_name;

    const updatedUser = await user.save();
    
    res.json({
      id: updatedUser._id,
      full_name: updatedUser.full_name,
      name: updatedUser.name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      addresses: updatedUser.addresses,
      role: updatedUser.role,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Thêm địa chỉ mới vào sổ địa chỉ
// @route   POST /api/auth/address
// @access  Private
export const addAddress = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    const { name, phone, address, isDefault } = req.body;
    const newAddr = {
      id: 'addr' + Date.now(),
      name,
      phone,
      address,
      isDefault: isDefault || false
    };

    if (!user.addresses) {
      user.addresses = [];
    }

    // Nếu đặt làm mặc định, hủy mặc định của các địa chỉ khác
    if (newAddr.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
      user.address = newAddr.address; // Cập nhật luôn field address cũ cho tương thích
    } else if (user.addresses.length === 0) {
      // Nếu là địa chỉ đầu tiên thì tự làm mặc định
      newAddr.isDefault = true;
      user.address = newAddr.address;
    }

    user.addresses.push(newAddr);
    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      full_name: updatedUser.full_name,
      name: updatedUser.name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      addresses: updatedUser.addresses,
      role: updatedUser.role,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa địa chỉ
// @route   DELETE /api/auth/address/:addressId
// @access  Private
export const deleteAddress = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    if (user.addresses) {
      user.addresses = user.addresses.filter(a => a.id !== req.params.addressId);
    }
    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      full_name: updatedUser.full_name,
      name: updatedUser.name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      addresses: updatedUser.addresses,
      role: updatedUser.role,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
