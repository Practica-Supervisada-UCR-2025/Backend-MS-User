// src/features/users/services/auth.service.ts
import admin from '../../../config/firebase';
import { findByEmailUser } from '../repositories/user.repository';
import { findByEmailAdmin} from '../repositories/admin.repository';
import { isUserSuspended } from '../repositories/suspension.repository';
import {UnauthorizedError, ConflictError, InternalServerError, ForbiddenError} from '../../../utils/errors/api-error';
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

    if (!existingUser.is_active) {
      throw new UnauthorizedError('Unauthorized', ['User is inactive']);
    }

    if (existingUser.id === null) {
      throw new UnauthorizedError('Unauthorized', ['Not registered user']);
    }

    if (await isUserSuspended(existingUser.id)) {
      throw new ForbiddenError('Forbidden', ['User account is suspended']);
    }



    // Generate JWT token
    const jwtService = new JwtService();
    const token = jwtService.generateToken({
      role: 'user',
      email: email, // Include email in the token payload for future requests
      uuid: existingUser.id // Include UUID in the token payload for future requests
    });

    return {
      access_token: token
    };
  } catch (error) {
    console.error('Error in loginUserService:', error);
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
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

    if (!existingAdmin.is_active) {
      throw new UnauthorizedError('Unauthorized', ['User is inactive']);
    }

    if (existingAdmin.id === null) {
      throw new UnauthorizedError('Unauthorized', ['Not registered user']);
    }
    
    console.log('Successful verification. Admin:', decoded.uid, 'Email:', email, existingAdmin.id);

    // Generate JWT token
    const jwtService = new JwtService();
    const token = jwtService.generateToken({
      role: 'admin',
      email: email, // Include email in the token payload for future requests
      uuid: existingAdmin.id // Include UUID in the token payload for future requests
    });

    return {
      access_token: token
    };
  } catch (error) {
    console.error('Error in loginAdminService:', error);
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throw error;
    }
    throw new InternalServerError('Internal server error');
  }
};