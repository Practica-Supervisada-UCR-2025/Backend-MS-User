import jwt from 'jsonwebtoken';
import { JwtService } from '../../src/features/users/services/jwt.service';
import { UnauthorizedError } from '../../src/utils/errors/api-error';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    process.env.JWT_SECRET = 'testsecret';
    jwtService = new JwtService();
  });

  it('should generate a valid token', () => {
    const payload = { role: 'user', email: 'example@ucr.ac.cr', uuid: '123456789101' };
    const token = jwtService.generateToken(payload);
    expect(typeof token).toBe('string');
  });

  it('should verify a valid token', () => {
    const payload = { role: 'user', email: 'example@ucr.ac.cr', uuid: '123456789101' };
    const token = jwtService.generateToken(payload);
    const decoded = jwtService.verifyToken(token);
    expect(decoded).toMatchObject(payload);
  });

  it('should throw UnauthorizedError for an invalid token', () => {
    expect(() => jwtService.verifyToken('invalidToken')).toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError for an expired token', () => {
    const payload = { role: 'user', email: 'example@ucr.ac.cr', uuid: '123456789101' };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1ms' });
    setTimeout(() => {
      expect(() => jwtService.verifyToken(token)).toThrow(UnauthorizedError);
    }, 10);
  });

  it('should throw UnauthorizedError if the role is invalid', () => {
    const payload = { role: 'invalidRole', email: 'example@ucr.ac.cr', uuid: '123456789101' };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    expect(() => jwtService.verifyToken(token)).toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if the email is missing', () => {
    const payload = { role: 'user', uuid: '123456789101' };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    expect(() => jwtService.verifyToken(token)).toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if the uuid is missing', () => {
    const payload = { role: 'user', email: 'example@ucr.ac.cr' };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    expect(() => jwtService.verifyToken(token)).toThrow(UnauthorizedError);
  });

  it('should throw an error if JWT_SECRET is not defined', () => {
    delete process.env.JWT_SECRET;
    expect(() => new JwtService()).toThrow('JWT_SECRET is not defined in environment variables');
  });

  it('should generate a token with a 1-hour expiration', () => {
    const payload = { role: 'user', email: 'example@ucr.ac.cr', uuid: '123456789101' };
    const token = jwtService.generateToken(payload);
    const decoded = jwt.decode(token) as any;
    const currentTime = Math.floor(Date.now() / 1000);
    expect(decoded.exp).toBeGreaterThan(currentTime);
    expect(decoded.exp).toBeLessThanOrEqual(currentTime + 3600);
  });
});