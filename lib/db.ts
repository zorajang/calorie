import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

declare global {
  // Reuse the same Postgres client across hot reloads in local dev.
  var __calorie_sql_client__: ReturnType<typeof postgres> | undefined;
}

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  // Supabase pooler works reliably with postgres.js; disable prepared statements for pooler compatibility.
  const sql =
    globalThis.__calorie_sql_client__ ??
    postgres(connectionString, {
      prepare: false,
      max: 1
    });

  if (!globalThis.__calorie_sql_client__) {
    globalThis.__calorie_sql_client__ = sql;
  }

  return drizzle(sql);
}
