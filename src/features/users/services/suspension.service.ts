import { CreateSuspensionDTO } from '../dto/create-suspension.dto';
import { createSuspension, findSuspensionById } from '../repositories/suspension.repository';
import { findByIdUser } from '../repositories/user.repository';
import { BadRequestError, NotFoundError } from '../../../utils/errors/api-error';

export async function suspendUserService(dto: CreateSuspensionDTO) {
  try {
    const user = await findByIdUser(dto.user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const suspension = await findSuspensionById(dto.user_id);
    if (suspension) {
      throw new BadRequestError('User is already suspended');
    }

    return await createSuspension(dto);
  } catch (error) {
    throw error;
  }
}
