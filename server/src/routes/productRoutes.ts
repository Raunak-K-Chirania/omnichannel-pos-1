import express from "express";
import productController from "../controllers/productController";

const router = express.Router();


/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - store
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nike Shirt
 *
 *               category:
 *                 type: string
 *                 example: clothing
 *
 *               description:
 *                 type: string
 *                 example: Cotton shirt
 *
 *               store:
 *                 type: string
 *                 example: 6823a8f512ab34cd5678ef90
 *
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     size:
 *                       type: string
 *                       example: M
 *
 *                     color:
 *                       type: string
 *                       example: Black
 *
 *                     sku:
 *                       type: string
 *                       example: NK-BLK-M
 *
 *                     price:
 *                       type: number
 *                       example: 1200
 *
 *                     stock:
 *                       type: number
 *                       example: 50
 */
router.post("/", productController.createProduct);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name/category
 *
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Last product ID from previous request
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products to return
 *
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
router.get("/", productController.getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *
 *       404:
 *         description: Product not found
 */
router.get("/:id", productController.getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Nike Shirt
 *
 *               category:
 *                 type: string
 *                 example: sportswear
 *
 *               description:
 *                 type: string
 *                 example: Updated cotton shirt
 *
 *               isActive:
 *                 type: boolean
 *                 example: true
 *
 *     responses:
 *       200:
 *         description: Product updated successfully
 *
 *       404:
 *         description: Product not found
 */
router.put("/:id", productController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Soft delete product
 *     tags: [Products]
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *
 *       404:
 *         description: Product not found
 */
router.delete("/:id", productController.deleteProduct);

export default router;