/**
 * Database migration helper
 * Creates tables if they don't exist
 */

export async function runMigrations(db) {
  try {
    console.log('Running database migrations...');
    
    // Create polls table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS polls (
        id TEXT PRIMARY KEY,
        creator_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        question TEXT NOT NULL,
        is_closed BOOLEAN DEFAULT false,
        allow_multiple BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create poll_options table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS poll_options (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        vote_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create feedback table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        feedback_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name VARCHAR(80) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        email_verified BOOLEAN DEFAULT false,
        profile_image_url TEXT,
        salt TEXT,
        password TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✓ Database migrations completed');
  } catch (error) {
    console.error('✗ Migration error:', error.message);
    throw error;
  }
}
