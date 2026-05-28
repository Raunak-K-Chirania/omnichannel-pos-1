import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  createOrder,
  getOrders,
} from "../controllers/orderController";

const router = Router();

// -----------------------------------------
// TEST ROUTE
// -----------------------------------------
/*router.get("/", (req, res) => {
  res.send("Order routes working");
});*/

// -----------------------------------------
// ALL ROUTES BELOW REQUIRE LOGIN
// -----------------------------------------
router.use(protect);

// -----------------------------------------
// CREATE ORDER
// POST /api/orders
// -----------------------------------------
router.post("/", createOrder);

// -----------------------------------------
// GET ORDERS
// GET /api/orders
// -----------------------------------------
router.get("/", getOrders);

export default router;