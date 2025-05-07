import { findByEmailUser } from "../repositories/user.repository";
import { findByEmailAdmin } from "../repositories/admin.repository";
import { NotFoundError } from "../../../utils/errors/api-error";

export const getUserProfileService = async (email: string) => {
  const user = await findByEmailUser(email);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return {
    message: "User profile retrieved successfully",
    userData: {
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      profile_picture: user.profile_picture,
    },
  };
};


export const getAdminProfileService = async (email: string) => {
  const admin = await findByEmailAdmin(email);

  if (!admin) {
    throw new NotFoundError("Admin user not found");
  }

  return {
    message: "Admin profile retrieved successfully",
    adminData: {
      email: admin.email,
      full_name: admin.full_name,
      profile_picture: admin.profile_picture,
    },
  };
};