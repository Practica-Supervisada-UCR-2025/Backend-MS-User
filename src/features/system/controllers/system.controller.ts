import { Request, Response } from "express";
import client from "../../../config/database";

export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Test database connection
    await client.query('SELECT NOW()');
    
    res.status(200).json({
      status: "success",
      message: "Server is running and database connection is active",
      timestamp: new Date(),
      database: {
        connected: true,
        host: process.env.DB_HOST
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server is running but database connection failed",
      timestamp: new Date(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    });
  }
};