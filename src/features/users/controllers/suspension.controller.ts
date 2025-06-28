import { Request, Response, NextFunction } from 'express';
import { suspendUserService } from '../services/suspension.service';
import * as yup from 'yup';
import { CreateSuspensionDTO, createSuspensionSchema } from '../dto/create-suspension.dto';
import { BadRequestError, UnauthorizedError } from '../../../utils/errors/api-error';
import { AuthenticatedRequest } from '../../../features/middleware/authenticate.middleware';
export const suspendUserController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {

    console.log("User role:", req.user.role);

    if (req.user.role !== 'admin') {
      throw new UnauthorizedError('Unauthorized', ['Only admins can suspend users']);
    }
    
    const validatedData = await createSuspensionSchema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    }) as CreateSuspensionDTO;

    const { user_id, days, description } = validatedData;
    const result = await suspendUserService({ user_id, days, description });
    res.status(201).json({ message: 'User suspended successfully', suspension: result });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      next(new BadRequestError('Validation error', error.errors));
    } else {
      next(error);
    }
  }
};
