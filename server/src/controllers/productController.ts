import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import Inventory from "../models/Inventory";
import redisClient from "../config/redis";

const CACHE_PREFIX = "products:";
const CACHE_TTL = 300; // 5 minutes


// -----------------------------------------
// CLEAR PRODUCT CACHE
// -----------------------------------------

const clearProductCache = async () => {
  try {
    const keys = await redisClient.keys(`${CACHE_PREFIX}*`);

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error("Redis cache clearing failed:", err);
  }
};


// -----------------------------------------
// CREATE PRODUCT
// POST /api/products
// ACCESS: manager, admin
// -----------------------------------------

const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const product = await Product.create(req.body);

    // Initialize inventory record for each variant
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        await Inventory.create({
          product: product._id,
          store: product.store,
          sku: variant.sku,
          quantity: variant.stock || 0,
          reorderPoint: 10,
        });
      }
    }

    // Clear cache after create
    await clearProductCache();

    res.status(201).json(product);

  } catch (error) {

  console.error("CREATE PRODUCT ERROR:");
  console.error(error);

  res.status(500).json({
    message: "Failed to create product",
    error,
});
}
};

// -----------------------------------------
// GET PRODUCTS
// GET /api/products
// ACCESS: public
// FEATURES:
// - cursor pagination
// - search
// - category filter
// - redis caching
// -----------------------------------------

const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const {
      search,
      category,
      cursor,
      limit = 20,
    } = req.query;

    // MongoDB query
    const query: Record<string, any> = {
      isActive: { $ne: false },
    };

    // Full text search fallback to regex
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { category: { $regex: search as string, $options: "i" } },
        { "variants.sku": { $regex: search as string, $options: "i" } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Cursor based pagination
    if (cursor) {
      query._id = {
        $gt: new mongoose.Types.ObjectId(
          cursor as string
        ),
      };
    }

    // Fetch products
    const products = await Product.find(query)
      .sort({ _id: 1 })
      .limit(Number(limit) + 1);

    let nextCursor = null;

    // Check if next page exists
    if (products.length > Number(limit)) {
      const nextProduct = products.pop();

      nextCursor = nextProduct?._id;
    }

    const result = {
      products,
      nextCursor,
    };

    res.json(result);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};


// -----------------------------------------
// GET PRODUCT BY ID
// GET /api/products/:id
// ACCESS: public
// -----------------------------------------

const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};


// -----------------------------------------
// UPDATE PRODUCT
// PUT /api/products/:id
// ACCESS: manager, admin
// -----------------------------------------

const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    // Clear cache after update
    await clearProductCache();

    res.json(product);

  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
    });
  }
};


// -----------------------------------------
// DELETE PRODUCT (SOFT DELETE)
// DELETE /api/products/:id
// ACCESS: admin
// -----------------------------------------

const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        {
          isActive: false,
        },
        {
          new: true,
        }
      );

    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    // Clear cache after delete
    await clearProductCache();

    res.json({
      message: "Product deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};


export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};