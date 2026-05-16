import express from "express";
import productController from "../controllers/productController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * ALL ROUTES BELOW REQUIRE LOGIN
 */
router.use(protect);

/**
 * CREATE PRODUCT (manager, admin)
 */
router.post(
  "/",
  authorize("manager", "admin"),
  productController.createProduct
);

/**
 * GET ALL PRODUCTS (all roles)
 */
router.get("/", productController.getProducts);

/**
 * GET PRODUCT BY ID (all roles)
 */
router.get("/:id", productController.getProductById);

/**
 * UPDATE PRODUCT (manager, admin)
 */
router.put(
  "/:id",
  authorize("manager", "admin"),
  productController.updateProduct
);

/**
 * DELETE PRODUCT (admin only)
 */
router.delete(
  "/:id",
  authorize("admin"),
  productController.deleteProduct
);

export default router;