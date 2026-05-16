import express from "express";

import {
  getInventory,
  updateStock,
  getLowStock,
} from "../controllers/inventoryController";

import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

// Get all inventory
/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory fetched successfully
 */
router.get("/", protect, getInventory);

// Get low stock inventory
/**
 * @swagger
 * /api/inventory/low-stock:
 *   get:
 *     summary: Get low stock inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock inventory fetched successfully
 */
router.get(
  "/low-stock",
  protect,
  authorize("admin", "manager"),
  getLowStock
);

// Update stock
/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update inventory stock
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 50
 *               reorderPoint:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Stock updated successfully
 */
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateStock
);

export default router;