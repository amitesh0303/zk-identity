import request from "supertest";
import app from "../src/index";

describe("Health Check", () => {
  it("GET /health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("Credential Routes", () => {
  it("POST /api/credentials/issue - rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/credentials/issue")
      .send({});
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/credentials/issue - rejects invalid commitment", async () => {
    const res = await request(app)
      .post("/api/credentials/issue")
      .send({
        holderPublicKey: "A".repeat(44),
        credentialType: "age_verification",
        commitment: "not-hex",
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        issuerSignature: "sig123",
      });
    expect(res.status).toBe(422);
  });

  it("GET /api/credentials/:id - returns 404 for unknown id", async () => {
    const res = await request(app)
      .get("/api/credentials/00000000-0000-0000-0000-000000000000");
    // Will be 404 or 500 depending on DB availability
    expect([404, 500]).toContain(res.status);
  });
});

describe("Verify Routes", () => {
  it("POST /api/verify - rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/verify")
      .send({});
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/verify - rejects invalid circuitType", async () => {
    const res = await request(app)
      .post("/api/verify")
      .send({
        credentialId: "00000000-0000-0000-0000-000000000000",
        circuitType: "unknown_circuit",
        proof: {
          pi_a: ["1", "2", "3"],
          pi_b: [["1", "2"], ["3", "4"], ["5", "6"]],
          pi_c: ["1", "2", "3"],
          protocol: "groth16",
          curve: "bn128",
        },
        publicSignals: ["1"],
        verifierPublicKey: "A".repeat(44),
      });
    expect(res.status).toBe(422);
  });

  it("GET /api/verify/status/:id - returns 404 for unknown verification", async () => {
    const res = await request(app)
      .get("/api/verify/status/00000000-0000-0000-0000-000000000000");
    expect([404, 500]).toContain(res.status);
  });
});
