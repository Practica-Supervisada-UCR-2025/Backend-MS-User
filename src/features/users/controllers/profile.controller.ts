import { Request, Response, NextFunction } from "express";
import { getUserProfileService, getAdminProfileService, updateAdminProfileService, updateUserProfileService } from "../services/profile.service";
import { updateUserProfileSchema, updateAdminProfileSchema, UpdateUserProfileDTO, UpdateAdminProfileDTO } from "../dto/profile.dto";
import * as yup from 'yup';
import { BadRequestError } from "../../../utils/errors/api-error";
import multer from 'multer';
import { AuthenticatedRequest } from '../../middleware/authenticate.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
}).single('profile_picture'); // El nombre del campo debe ser 'profile_picture'

export const getUserProfileController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.user.email;

    const { message, userData } = await getUserProfileService(email);

    res.status(201).json({
      message: message,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfileController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.user.email;

    const { message, adminData } = await getAdminProfileService(email);

    res.status(201).json({
      message: message,
      data: adminData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfileController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await new Promise<void>((resolve, reject) => {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          reject(new BadRequestError(`Error upload profile: ${err.message}`));
        } else if (err) {
          reject(new BadRequestError(`Error upload profile: ${err.message}`));
        } else {
          resolve();
        }
      });
    });

    // Validate form data
    const validatedData = await updateUserProfileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    }) as UpdateUserProfileDTO;

    const token = (req as any).token;
    const email = req.user.email;
    let result;

    if (req.file) {
      // Pass file to service
      result = await updateUserProfileService(
        email,
        token,
        validatedData,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    } else {
      // No file to upload
      result = await updateUserProfileService(email, token, validatedData);
    }

    res.status(200).json({
      message: result.message,
      data: result.userData
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      next(new BadRequestError('Validation error', error.errors));
    } else {
      next(error);
    }
  }
};

export const updateAdminProfileController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await new Promise<void>((resolve, reject) => {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          reject(new BadRequestError(`Error upload profile: ${err.message}`));
        } else if (err) {
          reject(new BadRequestError(`Error upload profile: ${err.message}`));
        } else {
          resolve();
        }
      });
    });

    const validatedData = await updateAdminProfileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    }) as UpdateAdminProfileDTO;

    const token = (req as any).token;
    const email = req.user.email;
    let result;

    if (req.file) {
      // Pass file to service
      result = await updateAdminProfileService(
        email,
        token,
        validatedData,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    } else {
      // No file to upload
      result = await updateAdminProfileService(email, token, validatedData);
    }

    res.status(200).json({
      message: result.message,
      data: result.adminData
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      next(new BadRequestError('Validation error', error.errors));
    } else {
      next(error);
    }
  }
};
