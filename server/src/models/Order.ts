import mongoose, { Document, Schema } from "mongoose";

enum PaymentMethod {
  cash = "cash",
  credit = "credit",
  digital_wallet = "digital_wallet",
}

enum OrderStatus {
  pending = "pending",
  completed = "completed",
  refunded = "refunded",
  cancelled = "cancelled",
}

export interface IOrder extends Document {
  store: mongoose.Types.ObjectId;
  cashier: mongoose.Types.ObjectId;
  items: mongoose.Types.ObjectId[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

const OrderSchema: Schema<IOrder> = new Schema<IOrder>(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    cashier: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderItem",
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.pending,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;