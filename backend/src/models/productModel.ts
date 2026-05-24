import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId?: mongoose.Types.ObjectId;
  isAvailable: boolean;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    isAvailable: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

// Map _id to id
ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
