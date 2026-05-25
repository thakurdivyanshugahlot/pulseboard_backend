import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import { config } from '../config/db.js';
import * as schema from './schema.js';


const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });

export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
}

export async function closePool() {
  await pool.end();
}
