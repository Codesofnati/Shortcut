import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// 1. Function version for Cloudflare / Hono environment bindings
export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, {
    prepare: false,
  });

  return drizzle(client, { schema });
}

// 2. Direct export version for frontend or direct imports if needed
const connectionString = process.env.DATABASE_URL || "";
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });