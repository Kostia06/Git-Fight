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

    // Get total unique users
    const usersResult = await sql`
      SELECT COUNT(*) as total_users FROM users
    `;

    // Get total battles
    const battlesResult = await sql`
      SELECT COUNT(*) as total_battles FROM battles
    `;

    // Get recent battles (last 10)
    const recentResult = await sql`
      SELECT player1, player2, player1_score, player2_score, winner, created_at
      FROM battles
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return res.status(200).json({
      success: true,
      stats: {
        total_users: parseInt(usersResult[0].total_users),
        total_battles: parseInt(battlesResult[0].total_battles),
        recent_battles: recentResult
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return res.status(500).json({
      error: 'Failed to fetch stats',
      details: error.message
    });
  }
}
