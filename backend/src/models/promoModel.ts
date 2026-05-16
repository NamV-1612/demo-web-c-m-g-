import mongoose, { Schema, Document } from 'mongoose';

export interface IPromo extends Document {
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number; // số tiền giảm (VNĐ) hoặc phần trăm giảm (%)
  maxDiscountAmount?: number; // Số tiền giảm tối đa nếu dùng theo PERCENT
  quantity: number;
  minOrderValue: number;
  isActive: boolean;
  createdAt: Date;
}

const PromoSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['PERCENT', 'AMOUNT'], default: 'AMOUNT' },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number },
    quantity: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

PromoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Promo = mongoose.model<IPromo>('Promo', PromoSchema);

export default Promo;
