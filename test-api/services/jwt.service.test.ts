import { JwtService } from '../../src/features/users/services/jwt.service';
import { UnauthorizedError } from '../../src/utils/errors/api-error';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    process.env.JWT_SECRET = 'testsecret';
    jwtService = new JwtService();
  });

  it('should generate a valid token', () => {
    const payload = {role: 'user' , email: 'example@ucr.ac.cr', uuid: '123456789101'};
    const token = jwtService.generateToken(payload);
    expect(typeof token).toBe('string');
  });

  it('should verify a valid token', () => {
    const payload = {role: 'user' , email: 'example@ucr.ac.cr', uuid: '123456789101'};
    const token = jwtService.generateToken(payload);
    const decoded = jwtService.verifyToken(token);
    expect(decoded).toMatchObject(payload); // Verifica solo las propiedades relevantes
  });

  it('should throw UnauthorizedError for an invalid token', () => {
    expect(() => jwtService.verifyToken('invalidToken')).toThrow(UnauthorizedError);
  });
});