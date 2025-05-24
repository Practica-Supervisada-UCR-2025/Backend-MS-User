// src/utils/generate-test-jwt.ts
import { JwtService } from '../../features/users/services/jwt.service';

const jwtService = new JwtService();

// Define your test user payload
const testUserPayload = {
  email: 'testuser@ucr.ac.cr.com',
  role: 'user',
  uuid: 'dfd8a500-663c-47e8-9477-3e1405428cfa',
};

// Generate the JWT token
const token = jwtService.generateToken(testUserPayload);

console.log('Generated JWT Token:', token);
