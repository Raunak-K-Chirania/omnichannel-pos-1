import { Request, Response, NextFunction } from "express";

// Custom Error Interface
interface CustomError extends Error {
  statusCode?: number;
}

// 404 Not Found Handler
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: CustomError = new Error(
    `Route not found - ${req.originalUrl}`
  );

  error.statusCode = 404;

  next(error);
};

// Global Error Handler
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",

    // Show stack only in development
    stack:
      process.env.NODE_ENV === "development"
        ? err.stack
        : undefined,
  });
};
export default { notFound, errorHandler };