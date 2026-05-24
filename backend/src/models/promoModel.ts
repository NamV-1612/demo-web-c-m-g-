import mongoose, { Schema, Document } from 'mongoose';

export interface IPromo extends Document {
  code: string;
  discount: number; // số tiền giảm (VNĐ)
  quantity: number;
  minOrderValue: number;
  isActive: boolean;
  createdAt: Date;
}

const PromoSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discount: { type: Number, required: true, min: 0 },
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
