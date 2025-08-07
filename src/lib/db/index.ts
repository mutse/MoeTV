import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

export function createDb(d1?: D1Database) {
  if (d1) {
    // Production: Use D1 database
    return drizzle(d1, { schema });
  } else {
    // Development: Use local SQLite with libsql
    const client = createClient({
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return drizzleLibsql(client, { schema });
  }
}

export type Database = ReturnType<typeof createDb>;
export * from './schema';