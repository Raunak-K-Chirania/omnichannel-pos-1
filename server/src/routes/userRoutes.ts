import { Router } from "express";
import { getUsers, updateUserRole, deleteUser } from "../controllers/userController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

// Protect all routes under this router and restrict to admin
router.use(protect);
router.use(authorize("admin"));

// GET /api/users — List all users (admin only)
router.get("/", getUsers);

// PUT /api/users/:id/role — Change a user's role (admin only)
router.put("/:id/role", updateUserRole);

// DELETE /api/users/:id — Delete a user account (admin only)
router.delete("/:id", deleteUser);

export default router;
