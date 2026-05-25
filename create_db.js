import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const baseDbUrl = dbUrl.replace(/\/pulseboard$/, '/postgres');

async function createDatabase() {
  const client = new pg.Client({
    connectionString: baseDbUrl,
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE pulseboard');
    console.log('Database pulseboard created successfully');
  } catch (error) {
    if (error.code === '42P04') {
      console.log(' Database pulseboard already exists');
    } else {
      console.error('Failed to create database:', error.message);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
