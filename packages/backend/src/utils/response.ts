import { Response } from 'express';
import { AppError } from './errors';
import { ApiResponse } from '../types/common.types';

export function successResponse<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(body);
}

export function errorResponse(res: Response, error: Error | AppError): Response {
  if (error instanceof AppError) {
    const body: ApiResponse = {
      success: false,
      message: error.message,
      error: {
        code: error.code,
      },
    };
    return res.status(error.statusCode).json(body);
  }

  const body: ApiResponse = {
    success: false,
    message: 'An unexpected error occurred',
    error: {
      code: 'INTERNAL_ERROR',
    },
  };
  return res.status(500).json(body);
}
