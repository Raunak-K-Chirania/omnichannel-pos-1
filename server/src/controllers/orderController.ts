import { Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Inventory from "../models/Inventory";
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
      // Atomic check and decrement for product stock
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          "variants.sku": item.sku,
          "variants.stock": { $gte: item.quantity },
        },
        {
          $inc: { "variants.$.stock": -item.quantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(`Insufficient stock for SKU ${item.sku}`);
      }

      // Find the updated variant to get the correct price
      const updatedVariant = updatedProduct.variants.find(
        (v) => v.sku === item.sku
      );

      if (!updatedVariant) {
        throw new Error("Variant not found after update");
      }

      // reduce inventory stock atomically as well, checking if there is sufficient stock
      const updatedInventory = await Inventory.findOneAndUpdate(
        { sku: item.sku, store: store, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );

      if (!updatedInventory) {
        // Rollback product stock update if inventory update fails
        await Product.findOneAndUpdate(
          { _id: item.productId, "variants.sku": item.sku },
          { $inc: { "variants.$.stock": item.quantity } }
        );
        throw new Error(`Insufficient stock in store inventory for SKU ${item.sku}`);
      }

      const lineTotal = updatedVariant.price * item.quantity;
      subtotal += lineTotal;

      const [orderItem] = await OrderItem.create(
        [
          {
            product: updatedProduct._id,
            sku: updatedVariant.sku,
            name: updatedProduct.name,
            quantity: item.quantity,
            unitPrice: updatedVariant.price,
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