import { Request, Response, NextFunction } from 'express';
import { UserDTO, UserRole } from '@ecotransit/shared';
import { prisma } from '../config/db.js';

// Extend express-session declarations
declare module 'express-session' {
  interface SessionData {
    user: UserDTO;
    unverifiedUserEmail?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  // session user is guaranteed to be present if requireAuth middleware runs
}

// 1. Require Authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để thực hiện tác vụ này.',
    });
  }
  return next();
}

// 2. Require Specific Roles (RBAC)
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để thực hiện tác vụ này.',
      });
    }

    const userRole = req.session.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Tài khoản của bạn không có quyền thực hiện tác vụ này (Yêu cầu vai trò: ${allowedRoles.join(', ')}).`,
      });
    }

    return next();
  };
}

// 3. Enforce Resource Ownership (checks if resource.userId matches session.user.id OR user is Admin)
export function requireOwnership(modelName: 'ticket' | 'pointsLedger' | 'uGCReview' | 'voucherRedemption', idParamName: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        message: 'Bạn chưa đăng nhập.',
      });
    }

    const currentUser = req.session.user;
    const resourceId = req.params[idParamName];

    if (!resourceId) {
      return res.status(400).json({
        message: 'Không xác định được ID tài nguyên cần kiểm tra.',
      });
    }

    // Admins bypass ownership checks
    if (currentUser.role === 'ADMIN') {
      return next();
    }

    try {
      let resource: any = null;

      // Type-safe lookup based on Prisma model names
      if (modelName === 'ticket') {
        resource = await prisma.ticket.findUnique({ where: { id: resourceId } });
      } else if (modelName === 'pointsLedger') {
        resource = await prisma.pointsLedger.findUnique({ where: { id: resourceId } });
      } else if (modelName === 'uGCReview') {
        resource = await prisma.uGCReview.findUnique({ where: { id: resourceId } });
      } else if (modelName === 'voucherRedemption') {
        resource = await prisma.voucherRedemption.findUnique({ where: { id: resourceId } });
      }

      if (!resource) {
        return res.status(404).json({
          message: 'Không tìm thấy tài nguyên yêu cầu.',
        });
      }

      // Check ownership
      if (resource.userId !== currentUser.id) {
        return res.status(403).json({
          message: 'Bạn không có quyền truy cập vào tài nguyên của người dùng khác.',
        });
      }

      return next();
    } catch (err: any) {
      console.error(`Ownership check failed for model ${modelName}:`, err);
      return res.status(500).json({
        message: 'Có lỗi xảy ra khi xác thực quyền sở hữu tài nguyên.',
        error: err.message,
      });
    }
  };
}
