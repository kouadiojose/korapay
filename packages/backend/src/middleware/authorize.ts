import { Request, Response, NextFunction } from 'express';
import { AuthorizationError, AuthenticationError } from '../utils/errors';
import { UserRole } from '../types/common.types';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
}
