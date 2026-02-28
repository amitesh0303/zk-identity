import { Router, Request, Response } from "express";
import Joi from "joi";
import { CredentialService } from "../services/credentialService";
import { validateRequest } from "../middleware/auth";

export const credentialRoutes = Router();
const credentialService = new CredentialService();

const issueSchema = Joi.object({
  holderPublicKey: Joi.string().length(44).required(),
  credentialType: Joi.string()
    .valid("age_verification", "citizenship", "income")
    .required(),
  commitment: Joi.string().hex().length(64).required(),
  expiresAt: Joi.number().integer().min(Date.now() / 1000).required(),
  issuerSignature: Joi.string().required(),
});

const revokeSchema = Joi.object({
  credentialId: Joi.string().uuid().required(),
  issuerSignature: Joi.string().required(),
});

// POST /api/credentials/issue
credentialRoutes.post(
  "/issue",
  validateRequest(issueSchema),
  async (req: Request, res: Response) => {
    try {
      const credential = await credentialService.issue(req.body);
      res.status(201).json({ success: true, credential });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(400).json({ success: false, error: message });
    }
  }
);

// POST /api/credentials/revoke
credentialRoutes.post(
  "/revoke",
  validateRequest(revokeSchema),
  async (req: Request, res: Response) => {
    try {
      await credentialService.revoke(
        req.body.credentialId,
        req.body.issuerSignature
      );
      res.json({ success: true, message: "Credential revoked" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(400).json({ success: false, error: message });
    }
  }
);

// GET /api/credentials/:id
credentialRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const credential = await credentialService.getById(req.params.id);
    if (!credential) {
      return res
        .status(404)
        .json({ success: false, error: "Credential not found" });
    }
    res.json({ success: true, credential });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});
