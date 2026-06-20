import { Router } from "express";
import {
  getStores,
  createStore,
  updateStore,
  deleteStore,
} from "../controllers/storeController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

// Retrieve stores (requires authentication so cashiers/managers/admins can access and switch)
router.get("/", protect, getStores);

// CRUD operations on stores (restricted to admin role only)
router.post("/", protect, authorize("admin"), createStore);
router.put("/:id", protect, authorize("admin"), updateStore);
router.delete("/:id", protect, authorize("admin"), deleteStore);

export default router;
