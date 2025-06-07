import { findByEmailUser, findByIdUser} from "../repositories/user.repository";
import { findByEmailAdmin } from "../repositories/admin.repository";
import { updateUserProfile } from "../repositories/user.repository";
import { updateAdminProfile } from "../repositories/admin.repository";
import { NotFoundError, BadRequestError } from "../../../utils/errors/api-error";
import { UpdateUserProfileDTO, UpdateAdminProfileDTO } from "../dto/profile.dto";
import FormData from 'form-data';
import fetch from 'node-fetch';
import { logProfileUpdate } from './audit.service';
import { DEFAULT_PROFILE_PICTURE } from '../../../utils/constants/image';

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
  tokenAuth: string,
  oldProfileUrl?: string,
  userId?: string
): Promise<string> {
  try {
    // Crear FormData para enviar al MS-Files
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: fileMimeType
    });

    formData.append('userId', userId);
    if (oldProfileUrl) {
      formData.append('oldImageUrl', oldProfileUrl);
    }

    formData.append('mediaType', 0);
    // Llamar al microservicio MS-Files
    const filesResponse = await fetch(`http://${process.env.MS_FILES_URL}/api/files/upload`, {
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

    if (updateData.profile_picture === null) {
      updateFields.profile_picture = DEFAULT_PROFILE_PICTURE;
    } else if (fileBuffer && fileName && fileMimeType) {
      updateFields.profile_picture = await uploadProfileImage(fileBuffer, fileName, fileMimeType, tokenAuth, user.profile_picture, user.id);
    }
    // Verificar si hay campos para actualizar
    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestError("No fields to update provided", ["Provide at least one field to update"]);
    }
    // Guardar valores actuales antes de la actualización para la auditoría
    const oldValues: Record<string, any> = {};
    const changedFields: string[] = [];

    Object.keys(updateFields).forEach(field => {
      if (user[field as keyof typeof user] !== updateFields[field as keyof typeof updateFields]) {
        oldValues[field] = user[field as keyof typeof user];
        changedFields.push(field);
      }
    });

    // Actualizar perfil
    const updatedUser = await updateUserProfile(email, updateFields);

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    const newValues: Record<string, any> = {};
    changedFields.forEach(field => {
      newValues[field] = updatedUser[field as keyof typeof updatedUser];
    });

    // Registrar en auditoría si hubo cambios
    if (changedFields.length > 0) {
      await logProfileUpdate(
        'mobile', // Determinar cliente
        'user',
        updatedUser.id,
        email, // Usuario que hizo el cambio (sí mismo)
        changedFields,
        oldValues,
        newValues,
      );
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

    if (updateData.profile_picture === null) {
      updateFields.profile_picture = DEFAULT_PROFILE_PICTURE;
    } else if (fileBuffer && fileName && fileMimeType) {
      updateFields.profile_picture = await uploadProfileImage(fileBuffer, fileName, fileMimeType, tokenAuth, admin.profile_picture, admin.id);
    }

    // Verificar si hay campos para actualizar
    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestError("No fields to update provided", ["Provide at least one field to update"]);
    }
    const oldValues: Record<string, any> = {};
    const changedFields: string[] = [];

    Object.keys(updateFields).forEach(field => {
      if (admin[field as keyof typeof admin] !== updateFields[field as keyof typeof updateFields]) {
        oldValues[field] = admin[field as keyof typeof admin];
        changedFields.push(field);
      }
    });

    // Actualizar perfil
    const updatedAdmin = await updateAdminProfile(email, updateFields);

    if (!updatedAdmin) {
      throw new NotFoundError("Admin user not found");
    }

    // Preparar nuevos valores para la auditoría
    const newValues: Record<string, any> = {};
    changedFields.forEach(field => {
      newValues[field] = updatedAdmin[field as keyof typeof updatedAdmin];
    });

    // Registrar en auditoría si hubo cambios
    if (changedFields.length > 0) {
      await logProfileUpdate(
        'web', // Determinar cliente
        'admin',
        updatedAdmin.id,
        email, // Usuario que hizo el cambio (sí mismo)
        changedFields,
        oldValues,
        newValues,
      );
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

export const getOtherUserProfileService = async (userId: string) => {
  const user = await findByIdUser(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return {
    message: "User profile retrieved successfully",
    userData: {
      username: user.username,
      full_name: user.full_name,
      profile_picture: user.profile_picture,
    },
  };
};