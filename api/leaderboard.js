import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ body: 'OK' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const limit = parseInt(req.query.limit) || 100;

    // Query top users with at least 3 battles
    const result = await sql`
      SELECT
        github_username,
        total_battles,
        wins,
        losses,
        highest_score,
        ROUND((wins::DECIMAL / NULLIF(total_battles, 0)) * 100, 1) as win_rate
      FROM users
      WHERE total_battles >= 3
      ORDER BY wins DESC, win_rate DESC, total_battles DESC
      LIMIT ${limit}
    `;

    return res.status(200).json({
      success: true,
      leaderboard: result
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return res.status(500).json({
      error: 'Failed to fetch leaderboard',
      details: error.message
    });
  }
}
