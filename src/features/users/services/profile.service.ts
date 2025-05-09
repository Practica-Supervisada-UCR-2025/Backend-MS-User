import { findByEmailUser } from "../repositories/user.repository";
import { findByEmailAdmin } from "../repositories/admin.repository";
import { updateUserProfile } from "../repositories/user.repository";
import { updateAdminProfile } from "../repositories/admin.repository";
import { NotFoundError, BadRequestError } from "../../../utils/errors/api-error";
import { UpdateUserProfileDTO, UpdateAdminProfileDTO } from "../dto/profile.dto";
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB
});

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
async function uploadProfileImage(
  fileBuffer: Buffer,
  fileName: string,
  fileMimeType: string,
  tokenAuth: string
): Promise<string> {
  try {
    // Crear FormData para enviar al MS-Files
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: fileMimeType
    });

    // Llamar al microservicio MS-Files
    const filesResponse = await fetch('http://ms-files:3006/api/files/profile-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenAuth}` // Usar el token del usuario
      },
      body: formData
    });

    // Procesar la respuesta de MS-Files
    if (!filesResponse.ok) {
      const errorData = await filesResponse.json();
      throw new BadRequestError('Error uploading profile picture', [errorData.message]);
    }

    // Extraer URL del archivo
    const fileData = await filesResponse.json();
    return fileData.fileUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw new BadRequestError('Error uploading profile picture', [(error as Error).message]);
  }
}

export const updateUserProfileService = async (email: string, tokenAuth: string, updateData: UpdateUserProfileDTO, fileBuffer?: Buffer,
  fileName?: string,
  fileMimeType?: string) => {
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

    if (fileBuffer && fileName && fileMimeType) {
      updateFields.profile_picture = await uploadProfileImage(fileBuffer, fileName, fileMimeType, tokenAuth);
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

export const updateAdminProfileService = async (email: string, tokenAuth: string, updateData: UpdateAdminProfileDTO, fileBuffer?: Buffer,
  fileName?: string,
  fileMimeType?: string) => {
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

    if (fileBuffer && fileName && fileMimeType) {
      updateFields.profile_picture = await uploadProfileImage(fileBuffer, fileName, fileMimeType, tokenAuth);
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