import { Request, Response } from "express";
import Inventory from "../models/Inventory";

// @desc    Get all inventory records
// @route   GET /api/inventory
// @access  Private
export const getInventory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filter: any = {};

    // Optional store filter
    if (req.query.store) {
      filter.store = req.query.store;
    }

    const inventory = await Inventory.find(filter)
      .populate("product", "name category")
      .populate("store", "name");

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};

// @desc    Update inventory stock
// @route   PUT /api/inventory/:id
// @access  Private (Admin, Manager)
export const updateStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { quantity, reorderPoint } = req.body;

    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
      return;
    }

    // Update quantity
    if (quantity !== undefined) {
      inventory.quantity = quantity;
    }

    // Update reorder point
    if (reorderPoint !== undefined) {
      inventory.reorderPoint = reorderPoint;
    }

    // Update lastUpdated field
    inventory.lastUpdated = new Date();

    await inventory.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: inventory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update stock",
      error: error.message,
    });
  }
};

// @desc    Get low stock inventory items
// @route   GET /api/inventory/low-stock
// @access  Private (Admin, Manager)
export const getLowStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const inventory = await Inventory.find({
      $expr: {
        $lte: ["$quantity", "$reorderPoint"],
      },
    })
      .populate("product", "name category")
      .populate("store", "name");

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock items",
      error: error.message,
    });
  }
};