import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  full_name: string;
  name: string; 
  phone: string;
  password?: string;
  address?: string; // Bổ sung địa chỉ
  addresses?: Array<{
    id: string;
    name: string;
    phone: string;
    address: string;
    isDefault: boolean;
  }>;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  status: 'ACTIVE' | 'LOCKED';
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    full_name: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String },
    address: { type: String }, // Bổ sung địa chỉ
    addresses: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        isDefault: { type: Boolean, default: false }
      }
    ],
    role: { type: String, enum: ['ADMIN', 'STAFF', 'CUSTOMER'], default: 'CUSTOMER' },
    status: { type: String, enum: ['ACTIVE', 'LOCKED'], default: 'ACTIVE' }
  },
  {
    timestamps: true,
  }
);

// Map _id to id for Frontend compatibility
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
