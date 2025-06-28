import { suspendUserController } from '../../src/features/users/controllers/suspension.controller';
import { suspendUserService } from '../../src/features/users/services/suspension.service';
import { createSuspensionSchema } from '../../src/features/users/dto/create-suspension.dto';

// Only mock suspendUserService, keep the schema as real as possible
jest.mock('../../src/features/users/services/suspension.service');

describe('suspendUserController', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = { 
      body: { user_id: '123e4567-e89b-12d3-a456-426614174000', days: 3, description: 'test' },
      user: { role: 'admin', uuid: '123e4567-e89b-12d3-a456-426614174000' } 
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should suspend user successfully', async () => {
    // Use the real schema validation
    jest.spyOn(createSuspensionSchema, 'validate').mockResolvedValueOnce(req.body);
    (suspendUserService as jest.Mock).mockResolvedValueOnce({ id: 'susp-id', user_id: '123e4567-e89b-12d3-a456-426614174000', days: 3, description: 'test' });

    await suspendUserController(req, res, next);

    expect(createSuspensionSchema.validate).toHaveBeenCalledWith(req.body, { abortEarly: false, stripUnknown: true });
    expect(suspendUserService).toHaveBeenCalledWith({ user_id: '123e4567-e89b-12d3-a456-426614174000', days: 3, description: 'test' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User suspended successfully', suspension: { id: 'susp-id', user_id: '123e4567-e89b-12d3-a456-426614174000', days: 3, description: 'test' } });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle validation error', async () => {
    // Use the real schema validation
    const validationError = new Error('Validation failed');
    jest.spyOn(createSuspensionSchema, 'validate').mockRejectedValueOnce(validationError);

    await suspendUserController(req, res, next);

    expect(next).toHaveBeenCalledWith(validationError);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should handle service error', async () => {
    jest.spyOn(createSuspensionSchema, 'validate').mockResolvedValueOnce(req.body);
    const serviceError = new Error('Service failed');
    (suspendUserService as jest.Mock).mockRejectedValueOnce(serviceError);

    await suspendUserController(req, res, next);

    expect(next).toHaveBeenCalledWith(serviceError);
    expect(res.status).not.toHaveBeenCalled();
  });
});
