import { Request, Response } from 'express';
import Promo from '../models/promoModel';

// @desc    Tạo mã giảm giá mới
// @route   POST /api/promos
// @access  Private (Admin/Staff)
export const createPromo = async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, maxDiscountAmount, quantity, minOrderValue, isActive } = req.body;
    
    const promoExists = await Promo.findOne({ code: code.toUpperCase() });
    if (promoExists) {
      res.status(400).json({ message: 'Mã giảm giá này đã tồn tại' });
      return;
    }

    const promo = new Promo({
      code: code.toUpperCase(),
      discountType: discountType || 'AMOUNT',
      discountValue,
      maxDiscountAmount,
      quantity,
      minOrderValue: minOrderValue || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    const createdPromo = await promo.save();
    res.status(201).json(createdPromo);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách mã giảm giá
// @route   GET /api/promos
// @access  Private (Admin/Staff)
export const getPromos = async (req: Request, res: Response) => {
  try {
    const promos = await Promo.find({}).sort({ createdAt: -1 });
    res.json(promos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật mã giảm giá
// @route   PUT /api/promos/:id
// @access  Private (Admin/Staff)
export const updatePromo = async (req: Request, res: Response) => {
  try {
    const { discountType, discountValue, maxDiscountAmount, quantity, isActive, minOrderValue } = req.body;

    const promo = await Promo.findById(req.params.id);

    if (!promo) {
      res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
      return;
    }

    if (discountType !== undefined) promo.discountType = discountType;
    if (discountValue !== undefined) promo.discountValue = discountValue;
    if (maxDiscountAmount !== undefined) promo.maxDiscountAmount = maxDiscountAmount;
    if (quantity !== undefined) promo.quantity = quantity;
    if (isActive !== undefined) promo.isActive = isActive;
    if (minOrderValue !== undefined) promo.minOrderValue = minOrderValue;

    const updatedPromo = await promo.save();
    res.json(updatedPromo);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Khách hàng kiểm tra và áp dụng mã giảm giá
// @route   POST /api/promos/verify
// @access  Private (Customer)
export const verifyPromo = async (req: Request, res: Response) => {
  try {
    const { code, orderValue } = req.body;
    
    if (!code) {
      res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });
      return;
    }

    const promo = await Promo.findOne({ code: code.toUpperCase() });

    if (!promo) {
      res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
      return;
    }

    if (!promo.isActive) {
      res.status(400).json({ message: 'Mã giảm giá đã hết hạn hoặc bị khóa' });
      return;
    }

    if (promo.quantity <= 0) {
      res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
      return;
    }

    if (orderValue !== undefined && orderValue < promo.minOrderValue) {
      res.status(400).json({ message: `Đơn hàng tối thiểu phải từ ${promo.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng mã này` });
      return;
    }

    let calculatedDiscount = 0;
    if (promo.discountType === 'AMOUNT') {
      calculatedDiscount = promo.discountValue;
    } else if (promo.discountType === 'PERCENT') {
      calculatedDiscount = (orderValue * promo.discountValue) / 100;
      if (promo.maxDiscountAmount && calculatedDiscount > promo.maxDiscountAmount) {
        calculatedDiscount = promo.maxDiscountAmount;
      }
    }
    
    if (orderValue !== undefined && calculatedDiscount > orderValue) {
      calculatedDiscount = orderValue;
    }

    res.json({
      message: 'Áp dụng mã thành công',
      discount: calculatedDiscount,
      code: promo.code
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa mã giảm giá
// @route   DELETE /api/promos/:id
// @access  Private (Admin/Staff)
export const deletePromo = async (req: Request, res: Response) => {
  try {
    const promo = await Promo.findById(req.params.id);
    
    if (!promo) {
      res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
      return;
    }

    await promo.deleteOne();
    res.json({ message: 'Đã xóa mã giảm giá thành công' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
