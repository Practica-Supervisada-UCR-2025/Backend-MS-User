// src/middlewares/authenticate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../users/services/jwt.service';
import {ForbiddenError, UnauthorizedError} from '../../utils/errors/api-error';
import admin from '../../config/firebase';
import {isUserSuspended} from "../../features/users/repositories/suspension.repository";

export interface AuthenticatedRequest extends Request {
  user: {
    email: string;
    role: string;
    uuid: string;
  };
}

const checkUserSuspension = async (
    uuid: string,
) => {

  return await isUserSuspended(uuid);
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No token provided');
    }

    if (!authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] === '') {
      throw new UnauthorizedError('Invalid token format');
    }

    const token = authHeader.split('Bearer ')[1];

    const jwtService = new JwtService();
    const decoded = jwtService.verifyToken(token);

    // Validate and set role to either 'user' or 'admin'
    const validRole = decoded.role === 'admin' ? 'admin' : 'user';
    const email = decoded.email;

    if (!email) {
      throw new UnauthorizedError('Unauthorized', ['Not registered user']);
    }
    
    // Convertimos el req a AuthenticatedRequest al inyectar la propiedad user
    (req as AuthenticatedRequest).user = {
      email: decoded.email,
      role: decoded.role,
      uuid: decoded.uuid
    };
    
    (req as any).token = token;

    if (await checkUserSuspension(decoded.uuid) && decoded.role !== 'admin') {
      throw new ForbiddenError('Unauthorized', ['User suspended']);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Validate Firebase token from body
    const { auth_token } = req.body;
    if (!auth_token) {
      throw new UnauthorizedError('Unauthorized', ['No auth token provided']);
    }

    await admin.auth()
      .verifyIdToken(auth_token)
      .catch(() => {
        throw new UnauthorizedError('Unauthorized', ['Invalid auth token']);
      });

    next();
  } catch (error) {
    next(error);
  }
};