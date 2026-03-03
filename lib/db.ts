import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined');
}
// Establish a physical connection to the PostgreSQL database by reading DATABASE_URL from .env.local.
const client = postgres(dbUrl, { max: 10 });

// Returns a database connection pool for executing SQL queries and operations.
export const db = drizzle(client, { schema });
