/* Accepts a list of allowed roles as parameters
  - Checks if req.user.role is in the allowed list
  - Returns 403 if the role is not authorized
  - Calls next() if authorized */
  import { AuthenticatedRequest } from './authMiddleware';
  import { Response, NextFunction } from 'express';
  import { UserRole } from '../models/User';
const roleMiddleware = (...allowedRoles: UserRole[]) => {
    return (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user){
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden: You don't have permission to access this resource",
            });
        }
        next();
    }
};
export default roleMiddleware;