import { Pool } from "pg";
import dotenv from "dotenv";
import { logger } from "../middleware/auth";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "zk_identity",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  logger.error("Unexpected PostgreSQL pool error", err);
});

export const db = {
  query: <T extends object = Record<string, unknown>>(
    text: string,
    params?: unknown[]
  ) => pool.query<T>(text, params),

  getClient: () => pool.connect(),
};

export default pool;
