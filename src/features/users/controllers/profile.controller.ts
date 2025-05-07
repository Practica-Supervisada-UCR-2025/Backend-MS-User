import { Request, Response, NextFunction } from "express";
import { getUserProfileService, getAdminProfileService } from "../services/profile.service";


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