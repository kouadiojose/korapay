import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        throw new ValidationError(messages);
      }
      throw err;
    }
  };
}
