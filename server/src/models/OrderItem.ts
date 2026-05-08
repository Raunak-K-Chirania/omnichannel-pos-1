import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem extends Document {
  product: mongoose.Types.ObjectId;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

const OrderItemSchema: Schema<IOrderItem> = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
});

const OrderItem = mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);

export default OrderItem;