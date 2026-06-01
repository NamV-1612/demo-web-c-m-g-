"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const OrderSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String }, // Địa chỉ giao hàng
    items: [
        {
            productId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product' },
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
    }
}, {
    timestamps: true,
});
// Map _id to id
OrderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});
const Order = mongoose_1.default.model('Order', OrderSchema);
exports.default = Order;
