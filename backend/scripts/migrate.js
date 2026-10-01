import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

// Configure dotenv to look for .env file
dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  // Use a direct PostgreSQL connection string (which acts with admin privileges).
  // Example: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is missing.');
    console.error('Please add your Supabase connection string to the backend/.env file.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    // Add SSL for Supabase connections
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL Database.');

    // Path to the migration SQL file
    const sqlFilePath = path.join(__dirname, '../../supabase/migrations/001_initial_schema.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Migration file not found at: ${sqlFilePath}`);
    }

    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Running migration script...');
    // Run the SQL script
    await client.query(sqlScript);
    
    console.log('Migration completed successfully! Tables, RLS, and Seed Data applied.');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

runMigration();
