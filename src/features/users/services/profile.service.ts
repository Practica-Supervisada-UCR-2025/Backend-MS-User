import { findByEmailUser } from "../repositories/user.repository";
import { findByEmailAdmin } from "../repositories/admin.repository";
import { updateUserProfile } from "../repositories/user.repository";
import { updateAdminProfile } from "../repositories/admin.repository";
import { NotFoundError, BadRequestError } from "../../../utils/errors/api-error";
import { UpdateUserProfileDTO, UpdateAdminProfileDTO } from "../dto/profile.dto";


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

export const updateUserProfileService = async (email: string, updateData: UpdateUserProfileDTO) => {
  try {

    const user = await findByEmailUser(email);

    if (!user) {
      throw new NotFoundError("User not found");
    }
    // Extraer solo los campos actualizables
    const updateFields: { username?: string; full_name?: string; profile_picture?: string } = {};

    // Solo permitir actualizar username si es cliente móvil
    if (updateData.username) {
      updateFields.username = updateData.username;
    }

    if (updateData.full_name) {
      updateFields.full_name = updateData.full_name;
    }

    if (updateData.profile_picture) {
      updateFields.profile_picture = updateData.profile_picture;
    }

    // Verificar si hay campos para actualizar
    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestError("No fields to update provided", ["Provide at least one field to update"]);
    }

    // Actualizar perfil
    const updatedUser = await updateUserProfile(email, updateFields);

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return {
      message: "User profile updated successfully",
      userData: {
        email: updatedUser.email,
        username: updatedUser.username,
        full_name: updatedUser.full_name,
        profile_picture: updatedUser.profile_picture,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError("Failed to update user profile", [(error as Error).message]);
  }
};

export const updateAdminProfileService = async (email: string, updateData: UpdateAdminProfileDTO) => {
  try {

    const admin = await findByEmailAdmin(email);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }
    // Extraer solo los campos actualizables
    const updateFields: { full_name?: string; profile_picture?: string } = {};

    if (updateData.full_name) {
      updateFields.full_name = updateData.full_name;
    }

    if (updateData.profile_picture) {
      updateFields.profile_picture = updateData.profile_picture;
    }

    // Verificar si hay campos para actualizar
    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestError("No fields to update provided", ["Provide at least one field to update"]);
    }

    // Actualizar perfil
    const updatedAdmin = await updateAdminProfile(email, updateFields);

    if (!updatedAdmin) {
      throw new NotFoundError("Admin user not found");
    }

    return {
      message: "Admin profile updated successfully",
      adminData: {
        email: updatedAdmin.email,
        full_name: updatedAdmin.full_name,
        profile_picture: updatedAdmin.profile_picture,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError("Failed to update admin profile", [(error as Error).message]);
  }
};