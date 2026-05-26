import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// -----------------------------------------
// CREATE ORDER
// -----------------------------------------
export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { items, store, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ message: "No items in order" });
      return;
    }

    let subtotal = 0;
    const orderItemsIds: mongoose.Types.ObjectId[] = [];

    // STEP 1: PROCESS ITEMS
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      const variant = product.variants.find(
        (v) => v.sku === item.sku
      );

      if (!variant) {
        throw new Error("Variant not found");
      }

      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for SKU ${variant.sku}`);
      }

      // reduce stock
      variant.stock -= item.quantity;
      await product.save();

      const lineTotal = variant.price * item.quantity;
      subtotal += lineTotal;

      const [orderItem] = await OrderItem.create(
        [
          {
            product: product._id,
            sku: variant.sku,
            name: product.name,
            quantity: item.quantity,
            unitPrice: variant.price,
            total: lineTotal,
          },
        ]
      );

      orderItemsIds.push(orderItem._id);
    }

    // STEP 2: CALCULATION
    const tax = parseFloat((subtotal * 0.18).toFixed(2));
    const discount = 0;

    const total = parseFloat((subtotal + tax - discount).toFixed(2));

    // STEP 3: CREATE ORDER
    const [order] = await Order.create(
      [
        {
          store,
          cashier: req.user?.id || req.user?._id,
          items: orderItemsIds,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod,
          status: "pending",
        },
      ]
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
    return;

  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Order creation failed",
      error: error.message,
    });
    return;
  }
};

// -----------------------------------------
// GET ORDERS
// -----------------------------------------
export const getOrders = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { store } = req.query;

    const query: any = {};

    if (store) {
      query.store = store;
    }

    const orders = await Order.find(query)
      .populate("cashier", "name email")
      .populate("items")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: orders,
    });
    return;

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
    return;
  }
};