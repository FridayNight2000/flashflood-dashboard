import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined');
}

function getPostgresOptions(url: string) {
  const parsed = new URL(url);
  const isSupabasePooler = parsed.hostname.endsWith('.pooler.supabase.com');
  const isTransactionMode = parsed.port === '6543';

  // Supabase shared pooler transaction mode does not support prepared statements.
  return {
    max: 10,
    ...(isSupabasePooler && isTransactionMode ? { prepare: false } : {}),
  } as const;
}

// Establish a physical connection to PostgreSQL by reading DATABASE_URL from .env.local.
const client = postgres(dbUrl, getPostgresOptions(dbUrl));

// Returns a database connection pool for executing SQL queries and operations.
export const db = drizzle(client, { schema });
