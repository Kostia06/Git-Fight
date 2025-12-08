import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ body: 'OK' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        github_username VARCHAR(255) PRIMARY KEY,
        total_battles INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        highest_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create battles table
    await sql`
      CREATE TABLE IF NOT EXISTS battles (
        id SERIAL PRIMARY KEY,
        player1 VARCHAR(255) NOT NULL,
        player2 VARCHAR(255) NOT NULL,
        player1_score INTEGER NOT NULL,
        player2_score INTEGER NOT NULL,
        winner VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_wins ON users(wins DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_battles_created_at ON battles(created_at DESC)
    `;

    return res.status(200).json({
      success: true,
      message: 'Database tables created successfully',
      tables: ['users', 'battles']
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({
      error: 'Failed to setup database',
      details: error.message
    });
  }
}
