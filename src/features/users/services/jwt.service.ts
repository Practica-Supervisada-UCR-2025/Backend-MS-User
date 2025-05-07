// src/features/users/services/jwt.service.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UnauthorizedError } from '../../../utils/errors/api-error';

dotenv.config();

interface Payload {
  role: string;
  email: string; // For future request to database based on email
  uuid: string;
}

export class JwtService {
  private readonly secret: string;

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    this.secret = process.env.JWT_SECRET;
  }

  public generateToken(payload: Payload): string {
    return jwt.sign(payload, this.secret as string, { expiresIn: "1h" });
  }

  public verifyToken(token: string): Payload {
    try {
      const decoded = jwt.verify(token, this.secret) as Payload;
      // Validate role is either 'user' or 'admin'
      if (decoded.role !== 'user' && decoded.role !== 'admin') {
        throw new UnauthorizedError('Invalid role in token');
      }

      if (!decoded.email) {
        throw new UnauthorizedError('Unauthorized', ['Not registered user']);
      }

      if (!decoded.uuid) {
        throw new UnauthorizedError('Unauthorized', ['Not registered user']);
      }
      return decoded;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired JWT');
    }
  }
}