import { GetAllUsersQueryDto } from '../dto/getAllUsers.dto';
import { getAllUsersRepository } from '../repositories/user.repository';

interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  profile_picture: string | null;
  is_active: boolean;
  created_at: Date;
}

export const getAllUsersService = async (dto: GetAllUsersQueryDto) => {
  const { users, totalRemaining } = await getAllUsersRepository(dto);

  const formattedUsers: User[] = users.map((user: User): User => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    username: user.username,
    profile_picture: user.profile_picture,
    is_active: user.is_active,
    created_at: user.created_at,
  }));

  const lastTime =
    formattedUsers.length > 0
      ? formattedUsers[formattedUsers.length - 1].created_at
      : null;

  return {
    message: 'All users fetched successfully',
    data: formattedUsers,
    metadata: {
      last_time: lastTime,
      remainingItems: totalRemaining - formattedUsers.length,
      remainingPages: Math.ceil((totalRemaining - formattedUsers.length) / dto.limit),
    },
  };
};
