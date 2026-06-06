import express from "express";
import productController from "../controllers/productController";
import { protect, authorize } from "../middleware/authMiddleware";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import fs from "fs";

// Check if Cloudinary environment variables are configured
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let storage: multer.StorageEngine;

if (isCloudinaryConfigured) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Configure multer-storage-cloudinary
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file: any) => {
      return {
        folder: "products",
        allowed_formats: ["jpeg", "jpg", "png", "webp"],
        public_id: file.fieldname + "-" + Date.now() + "-" + Math.round(Math.random() * 1e9),
      };
    },
  });
} else {
  console.warn("WARNING: Cloudinary credentials not configured in environment variables. Falling back to local disk storage for product image uploads.");
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads/products");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

// File filter validation to ensure only images are allowed
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = /jpeg|jpg|png|webp/i;
  const mimeType = allowedExtensions.test(file.mimetype);
  const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error("Only images of format JPG, JPEG, PNG, or WEBP are allowed."));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

const router = express.Router();

/**
 * ALL ROUTES BELOW REQUIRE LOGIN
 */
router.use(protect);

/**
 * UPLOAD PRODUCT IMAGE (manager, admin)
 */
router.post(
  "/upload",
  authorize("manager", "admin"),
  (req, res) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ success: false, message: "File is too large. Max size allowed is 5MB." });
        }
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
      }

      const fileUrl = req.file.path.startsWith("http")
        ? req.file.path
        : `/uploads/products/${req.file.filename}`;
      res.status(200).json({
        success: true,
        url: fileUrl,
      });
    });
  }
);

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