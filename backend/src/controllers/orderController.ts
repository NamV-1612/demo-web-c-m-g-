import { Request, Response } from 'express';
import Order from '../models/orderModel';
import Promo from '../models/promoModel';

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private (Customer)
export const createOrder = async (req: any, res: Response) => {
  try {
    const { items, customerName, customerPhone, customerAddress, totalAmount, note, paymentMethod, pickupTime, promoCode, discountAmount } = req.body;

    if (items && items.length === 0) {
      res.status(400).json({ message: 'Giỏ hàng rỗng' });
      return;
    }

    const order = new Order({
      customerId: req.user._id,
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalAmount,
      note,
      paymentMethod,
      pickupTime,
      promoCode,
      discountAmount
    });

    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode });
      if (promo && promo.quantity > 0) {
        promo.quantity -= 1;
        await promo.save();
      }
    }

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

    const previousStatus = order.status;
    order.status = status || order.status;
    
    // Nếu cập nhật thành PREPARING (Đang nấu) thì tự động coi như Đã thanh toán theo yêu cầu
    if (status === 'PREPARING') {
      order.isPaid = true;
    }

    // Nếu hủy đơn và đơn có mã khuyến mãi, trả lại số lượng cho mã khuyến mãi
    if (status === 'CANCELLED' && previousStatus !== 'CANCELLED' && order.promoCode) {
      const promo = await Promo.findOne({ code: order.promoCode });
      if (promo) {
        promo.quantity += 1;
        await promo.save();
      }
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
    if (req.body.customerAddress) {
      order.customerAddress = req.body.customerAddress;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đánh giá đơn hàng (Customer)
// @route   PUT /api/orders/:id/rate
// @access  Private
export const rateOrder = async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Check Role & Status
    if (order.customerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền đánh giá đơn này' });
    }
    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Chỉ có thể đánh giá khi đơn hàng đã hoàn thành' });
    }
    if (order.rating && order.rating.stars) {
      return res.status(400).json({ message: 'Đơn hàng này đã được đánh giá' });
    }

    const { stars, comment } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Số sao đánh giá không hợp lệ (1-5)' });
    }

    order.rating = {
      stars,
      comment: comment || ''
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
