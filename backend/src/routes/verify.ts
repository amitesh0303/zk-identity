import { Router, Request, Response } from "express";
import Joi from "joi";
import { VerificationService } from "../services/verificationService";
import { validateRequest } from "../middleware/auth";

export const verifyRoutes = Router();
const verificationService = new VerificationService();

const verifySchema = Joi.object({
  credentialId: Joi.string().uuid().required(),
  circuitType: Joi.string()
    .valid("age_verification", "citizenship", "income")
    .required(),
  proof: Joi.object({
    pi_a: Joi.array().items(Joi.string()).length(3).required(),
    pi_b: Joi.array()
      .items(Joi.array().items(Joi.string()).length(2))
      .length(3)
      .required(),
    pi_c: Joi.array().items(Joi.string()).length(3).required(),
    protocol: Joi.string().valid("groth16").required(),
    curve: Joi.string().valid("bn128").required(),
  }).required(),
  publicSignals: Joi.array().items(Joi.string()).min(1).required(),
  verifierPublicKey: Joi.string().length(44).required(),
});

// POST /api/verify
verifyRoutes.post(
  "/",
  validateRequest(verifySchema),
  async (req: Request, res: Response) => {
    try {
      const result = await verificationService.verify(req.body);
      res.json({ success: true, ...result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(400).json({ success: false, error: message });
    }
  }
);

// GET /api/verify/status/:verificationId
verifyRoutes.get("/status/:verificationId", async (req: Request, res: Response) => {
  try {
    const status = await verificationService.getStatus(req.params.verificationId);
    if (!status) {
      return res.status(404).json({ success: false, error: "Verification not found" });
    }
    res.json({ success: true, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});
