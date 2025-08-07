import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

export function createDb(d1?: D1Database) {
  if (d1) {
    // Production: Use D1 database
    return drizzle(d1, { schema });
  } else {
    // Development: Use local SQLite with libsql client
    // Check if running in Node.js runtime
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      // Node.js runtime - try using better-sqlite3 if available
      try {
        const Database = require('better-sqlite3');
        const { drizzle: drizzleBetterSqlite3 } = require('drizzle-orm/better-sqlite3');
        
        const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './sqlite.db';
        const sqlite = new Database(dbPath);
        return drizzleBetterSqlite3(sqlite, { schema });
      } catch (error) {
        console.warn('better-sqlite3 not available, falling back to libsql');
        // Fall back to libsql with in-memory database
        const client = createClient({
          url: ':memory:',
        });
        return drizzleLibsql(client, { schema });
      }
    } else {
      // Edge runtime - use libsql
      const client = createClient({
        url: ':memory:', // Fallback for Edge runtime
      });
      return drizzleLibsql(client, { schema });
    }
  }
}

export type Database = ReturnType<typeof createDb>;
export * from './schema';