import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  customerId?: mongoose.Types.ObjectId; // User ID
  customerName: string;
  customerPhone: string;
  customerAddress?: string; // Địa chỉ giao hàng
  items: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    selectedToppings?: string[];
    note?: string;
  }>;
  totalAmount: number;
  note?: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  isPaid: boolean;
  paymentMethod: 'cash' | 'transfer';
  pickupTime: string; // 'asap' or specific time
  promoCode?: string;
  discountAmount?: number;
  rating?: {
    stars: number;
    comment: string;
  };
  cancelMessage?: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    _id: { type: String },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String }, // Địa chỉ giao hàng
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        selectedToppings: [{ type: String }],
        note: { type: String }
      }
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    note: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING'
    },
    isPaid: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ['cash', 'transfer'], default: 'cash' },
    pickupTime: { type: String, default: 'asap' },
    promoCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    rating: {
      stars: { type: Number, min: 1, max: 5 },
      comment: { type: String }
    },
    cancelMessage: { type: String }
  },
  {
    timestamps: true,
  }
);

// Map _id to id
OrderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
