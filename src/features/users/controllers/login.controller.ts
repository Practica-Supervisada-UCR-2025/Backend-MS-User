// src/features/users/controllers/login.controller.ts
import { Request, Response, NextFunction } from 'express';
import { loginUserService, loginAdminService } from '../services/login.service';
import { UnauthorizedError } from '../../../utils/errors/api-error';

export const loginUserController = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) =>  {
  try {
    // Validate Firebase token from body
    const { auth_token } = req.body;
    if (!auth_token) {
      throw new UnauthorizedError('Unauthorized', ['No token provided']);
    }

    // Validate the token with user service
    const result = await loginUserService(auth_token);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in LoginUserController: ', error);
    next(error);
  }
};

export const loginAdminController = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Validate Firebase token from body
    const { auth_token } = req.body;
    if (!auth_token) {
      throw new UnauthorizedError('Unauthorized', ['No token provided']);
    }
    
    // Validate the token with admin service
    const result = await loginAdminService(auth_token);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in LoginAdminController: ', error);
    next(error);
  }
};
