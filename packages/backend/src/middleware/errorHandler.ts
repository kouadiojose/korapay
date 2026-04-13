import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: config.app.isProduction ? undefined : err.stack,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
      },
    });
    return;
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
      error: {
        code: 'INVALID_JSON',
      },
    });
    return;
  }

  // Default to 500 for unexpected errors
  res.status(500).json({
    success: false,
    message: config.app.isProduction
      ? 'An unexpected error occurred'
      : err.message,
    error: {
      code: 'INTERNAL_ERROR',
    },
  });
}
