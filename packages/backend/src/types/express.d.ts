import { UserRole } from './common.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
      merchant?: {
        id: string;
        businessName: string;
        environment: string;
      };
    }
  }
}

export {};
