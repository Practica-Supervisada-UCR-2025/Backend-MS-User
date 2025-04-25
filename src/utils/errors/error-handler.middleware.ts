import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from './api-error';
import { ValidationError } from 'yup';

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Handle Yup validation errors
  if (error instanceof ValidationError) {
    res.status(400).json({
      message: 'Validation Error',
      details: error.errors
    });
    return;
  }

  // Handle our custom API errors
  if (error instanceof ApiError) {
    const response: { message: string; details?: any } = {
      message: error.message
    };
    // Only include details if they exist and it's not an unauthorized error
    if (error.details) {
      response.details = error.details;
    }
    res.status(error.status).json(response);
    return;
  }

  // Handle Firebase auth errors
  if (error.name === 'FirebaseAuthError') {
    res.status(401).json({
      message: 'Invalid or missing Firebase token',
      details: error.message
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    message: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};