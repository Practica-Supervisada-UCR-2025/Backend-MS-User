import { GetAllUsersQueryDto } from '../dto/getAllUsers.dto';
import { getAllUsersRepository, getUserByUsernameRepository } from '../repositories/user.repository';

interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  profile_picture: string | null;
  is_active: boolean;
  created_at: Date;
  is_banned: boolean;
  suspension_end_date: string | null;
}

export const getAllUsersService = async (dto: GetAllUsersQueryDto) => {
  if (dto.username !== undefined) {
    const user = await getUserByUsernameRepository(dto.username);

    if (!user) {
      return {
        message: 'User not found',
        data: [],
        metadata: {
          last_time: null,
          remainingItems: 0,
          remainingPages: 0,
        },
      };
    }

    return {
      message: 'User fetched successfully',
      data: [{
        ...user,
        is_banned: user.is_banned ?? false,
        suspension_end_date: user.suspension_end_date ?? null,
      }],
      metadata: {
        last_time: user.created_at,
        remainingItems: 0,
        remainingPages: 0,
      },
    };
  }

  const { users, totalRemaining } = await getAllUsersRepository(dto);

  const formattedUsers: User[] = users.map((user): User => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    username: user.username,
    profile_picture: user.profile_picture,
    is_active: user.is_active,
    created_at: user.created_at,
    is_banned: user.is_banned ?? false,
    suspension_end_date: user.suspension_end_date ?? null,
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
      remainingPages: dto.limit
        ? Math.ceil((totalRemaining - formattedUsers.length) / dto.limit)
        : null,
    },
  };
};

