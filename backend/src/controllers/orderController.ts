import { Request, Response } from 'express';
import Order from '../models/orderModel';

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private (Customer)
export const createOrder = async (req: any, res: Response) => {
  try {
    const { items, customerName, customerPhone, totalAmount, note, paymentMethod, pickupTime, promoCode, discountAmount } = req.body;

    if (items && items.length === 0) {
      res.status(400).json({ message: 'Giỏ hàng rỗng' });
      return;
    }

    const order = new Order({
      customerId: req.user._id,
      customerName,
      customerPhone,
      items,
      totalAmount,
      note,
      paymentMethod,
      pickupTime,
      promoCode,
      discountAmount
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy đơn hàng của một người dùng
// @route   GET /api/orders/myorders
// @access  Private (Customer)
export const getMyOrders = async (req: any, res: Response) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy tất cả đơn hàng
// @route   GET /api/orders
// @access  Private/Admin/Staff
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Staff
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      
      // Nếu cập nhật thành COMPLETED thì coi như đã thanh toán (đối với tiền mặt)
      if (req.body.status === 'COMPLETED' && order.paymentMethod === 'cash') {
        order.isPaid = true;
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
