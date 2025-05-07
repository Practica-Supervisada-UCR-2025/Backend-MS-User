import { Request, Response, NextFunction } from "express";
import { getUserProfileService, getAdminProfileService, updateAdminProfileService, updateUserProfileService } from "../services/profile.service";
import { updateUserProfileSchema, updateAdminProfileSchema, UpdateUserProfileDTO, UpdateAdminProfileDTO } from "../dto/profile.dto";
import * as yup from 'yup';
import { BadRequestError } from "../../../utils/errors/api-error";

export const getUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const {message, userData} = await getUserProfileService(email);

    res.status(201).json({
      message: message,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const {message, adminData} = await getAdminProfileService(email);

    res.status(201).json({
      message: message,
      data: adminData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = await updateUserProfileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    }) as UpdateUserProfileDTO;

    const result = await updateUserProfileService(validatedData.email, validatedData);

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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const validatedData = await updateAdminProfileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    }) as UpdateAdminProfileDTO;

    const result = await updateAdminProfileService(validatedData.email, validatedData);

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
