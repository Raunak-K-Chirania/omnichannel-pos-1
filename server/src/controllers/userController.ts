import { Request, Response } from "express";
import User from "../models/User";

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).populate("store", "name");
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users list",
      error: error.message,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { role } = req.body;

    if (!role || !["cashier", "manager", "admin", "customer"].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid user role",
      });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Update role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Prevent deleting self (current logged in admin)
    if (user._id.toString() === req.user?.id) {
      res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
      return;
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User profile deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user profile",
      error: error.message,
    });
  }
};
