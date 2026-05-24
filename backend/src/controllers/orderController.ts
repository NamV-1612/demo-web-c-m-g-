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
    const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 }).populate('items.productId');
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
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('items.productId');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật trạng thái đơn hàng (Staff/Admin có toàn quyền, Customer chỉ được Hủy khi đang PENDING)
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const { status } = req.body;

    // Check Role
    if (req.user.role === 'CUSTOMER') {
      if (status !== 'CANCELLED') {
        return res.status(403).json({ message: 'Khách hàng chỉ có quyền hủy đơn' });
      }
      if (order.status !== 'PENDING') {
        return res.status(400).json({ message: 'Chỉ có thể hủy đơn khi đang ở trạng thái Chờ xác nhận' });
      }
      if (order.customerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Không có quyền hủy đơn của người khác' });
      }
    }

    order.status = status || order.status;
    
    // Nếu cập nhật thành COMPLETED thì coi như đã thanh toán (đối với tiền mặt)
    if (status === 'COMPLETED' && order.paymentMethod === 'cash') {
      order.isPaid = true;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sửa thông tin đơn hàng (Customer chỉ được sửa khi PENDING)
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (req.user.role === 'CUSTOMER') {
      if (order.status !== 'PENDING') {
        return res.status(400).json({ message: 'Chỉ có thể sửa khi đơn đang Chờ xác nhận' });
      }
      if (order.customerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Không có quyền sửa đơn này' });
      }
    }

    order.customerPhone = req.body.customerPhone || order.customerPhone;
    order.note = req.body.note || order.note;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
