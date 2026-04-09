import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=disable') ? false : true,
  min: Number(process.env.DB_MIN_CONNECTIONS || 0),
  max: Number(process.env.DB_MAX_CONNECTIONS || 5),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT || 5000),
});

export const db = drizzle({ client: pool, schema });

export * from './schema.js';
