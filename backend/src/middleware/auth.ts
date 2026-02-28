import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

/**
 * Middleware factory that validates request body against the provided Joi schema.
 */
export function validateRequest(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(422).json({
        success: false,
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
      return;
    }
    next();
  };
}

/**
 * Middleware that requires a valid API key in the X-Api-Key header.
 * The key is compared against the API_KEY environment variable.
 */
export function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers["x-api-key"];
  const expected = process.env.API_KEY;

  if (!expected || apiKey !== expected) {
    res.status(401).json({ success: false, error: "Invalid or missing API key" });
    return;
  }
  next();
}
