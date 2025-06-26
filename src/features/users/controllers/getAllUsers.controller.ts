import { Request, Response } from 'express';
import { GetAllUsersQueryDto } from '../dto/getAllUsers.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { getAllUsersService } from '../services/getAllUsers.service';

export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
 const raw = {
  created_after: req.query.created_after,
  limit: req.query.limit !== undefined ? parseInt(req.query.limit as string, 10) : undefined,
  username: req.query.username,
};

  const dto = plainToInstance(GetAllUsersQueryDto, raw);
  const errors = await validate(dto);

    if (
    (dto.limit !== undefined && dto.created_after === undefined) ||
    (dto.limit === undefined && dto.created_after !== undefined)
  ) {
    res.status(400).json({
      error: 'Invalid query parameters.',
      messages: ['limit and created_after must be provided together or omitted together'],
    });
    return;
  }

  if (errors.length > 0) {
    const messages = errors.flatMap(err =>
      err.constraints ? Object.values(err.constraints) : [`Invalid ${err.property}`]
    );
    res.status(400).json({ error: 'Invalid query parameters.', messages });
    return;
  }

  try {
    const result = await getAllUsersService(dto);
    res.status(200).json(result);
  } catch (err) {
    console.error('[Error fetching active users]', err);
    res.status(500).json({ error: 'Failed to fetch active users.' });
  }
};
