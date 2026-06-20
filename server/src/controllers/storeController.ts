import { Request, Response } from "express";
import Store from "../models/Store";
import User from "../models/User";
import Product from "../models/Product";
import Inventory from "../models/Inventory";

// @desc    Get all stores
// @route   GET /api/stores
// @access  Private
export const getStores = async (req: any, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    // Admins see all stores (including deactivated ones), managers/cashiers/customers see only active ones
    const query = isAdmin ? {} : { isActive: true };
    const stores = await Store.find(query).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stores",
      error: error.message,
    });
  }
};

// @desc    Create a new store
// @route   POST /api/stores
// @access  Private (Admin only)
export const createStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, isActive, currency } = req.body;
    if (!name || !location) {
      res.status(400).json({
        success: false,
        message: "Please provide store name and location",
      });
      return;
    }

    const store = await Store.create({
      name,
      location,
      isActive: isActive !== undefined ? isActive : true,
      currency: currency || "USD",
    });

    res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: store,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create store",
      error: error.message,
    });
  }
};

// @desc    Update store details
// @route   PUT /api/stores/:id
// @access  Private (Admin only)
export const updateStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, isActive, currency } = req.body;
    const store = await Store.findById(req.params.id);

    if (!store) {
      res.status(404).json({
        success: false,
        message: "Store not found",
      });
      return;
    }

    if (name !== undefined) store.name = name;
    if (location !== undefined) store.location = location;
    if (isActive !== undefined) store.isActive = isActive;
    if (currency !== undefined) store.currency = currency;

    await store.save();

    res.status(200).json({
      success: true,
      message: "Store updated successfully",
      data: store,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update store",
      error: error.message,
    });
  }
};

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private (Admin only)
export const deleteStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const storeId = req.params.id;

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({
        success: false,
        message: "Store not found",
      });
      return;
    }

    // Check if there are users associated with this store
    const userCount = await User.countDocuments({ store: storeId });
    if (userCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete store. There are ${userCount} users associated with this store.`,
      });
      return;
    }

    // Check if there are products associated with this store
    const productCount = await Product.countDocuments({ store: storeId });
    if (productCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete store. There are ${productCount} products associated with this store.`,
      });
      return;
    }

    // Check if there are inventory records associated with this store
    const inventoryCount = await Inventory.countDocuments({ store: storeId });
    if (inventoryCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete store. There are ${inventoryCount} inventory items associated with this store.`,
      });
      return;
    }

    await store.deleteOne();

    res.status(200).json({
      success: true,
      message: "Store deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete store",
      error: error.message,
    });
  }
};
