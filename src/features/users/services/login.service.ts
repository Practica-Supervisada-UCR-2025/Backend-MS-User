// src/features/users/services/auth.service.ts
import admin from '../../../config/firebase';
import { findByEmailUser } from '../repositories/user.repository';
import { findByEmailAdmin} from '../repositories/admin.repository';
import { UnauthorizedError, ConflictError, InternalServerError } from '../../../utils/errors/api-error';
import { JwtService } from './jwt.service';

export const loginUserService = async (firebaseToken: string) => {
  try {
    // Verify the Firebase token
    const decoded = await admin.auth().verifyIdToken(firebaseToken).catch(() => {
      throw new UnauthorizedError('Unauthorized', ['Invalid access token']);
    });

    const email = decoded.email;

    if (!email) {
      throw new UnauthorizedError('Unauthorized', ['Not registered user']);
    }

    // Search user in the database
    const existingUser  = await findByEmailUser(email);

    if (!existingUser) {
      throw new UnauthorizedError('Unauthorized', ['Not registered user']);
    }

    // Generate JWT token
    const jwtService = new JwtService();
    const token = jwtService.generateToken({
      role: 'user'
    });

    return {
      access_token: token
    };
  } catch (error) {
    console.error('Error in loginUserService:', error);
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new InternalServerError('Internal server error');
  }
};

export const loginAdminService = async (firebaseToken: string) => {
  try {
    // Verify the Firebase token
    const decoded = await admin.auth().verifyIdToken(firebaseToken).catch(() => {
      throw new UnauthorizedError('Unauthorized', ['Invalid access token']);
    });

    const email = decoded.email;

    if (!email) {
      throw new UnauthorizedError('Unauthorized', ['Not registered user']);
    }

    // Search user in the database
    const existingAdmin  = await findByEmailAdmin(email);

    if (!existingAdmin) {
      throw new UnauthorizedError('Unauthorized', ['Not registered admin']);
    }
    
    console.log('Successful verification. Admin:', decoded.uid, 'Email:', email);

    // Generate JWT token
    const jwtService = new JwtService();
    const token = jwtService.generateToken({
      role: 'admin'
    });

    return {
      access_token: token
    };
  } catch (error) {
    console.error('Error in loginAdminService:', error);
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new InternalServerError('Internal server error');
  }
};