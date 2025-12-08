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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { player1, player2, scores, winner } = req.body;

    // Validate input
    if (!player1 || !player2 || !scores || typeof scores.p1 !== 'number' || typeof scores.p2 !== 'number') {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Validate GitHub usernames (basic validation)
    const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    if (!usernameRegex.test(player1) || !usernameRegex.test(player2)) {
      return res.status(400).json({ error: 'Invalid GitHub username format' });
    }

    // Insert battle record
    await sql`
      INSERT INTO battles (player1, player2, player1_score, player2_score, winner)
      VALUES (${player1.toLowerCase()}, ${player2.toLowerCase()}, ${scores.p1}, ${scores.p2}, ${winner ? winner.toLowerCase() : null})
    `;

    // Update player 1 stats
    const p1IsWinner = winner && winner.toLowerCase() === player1.toLowerCase();
    const p1IsLoser = winner && winner.toLowerCase() === player2.toLowerCase();

    await sql`
      INSERT INTO users (github_username, total_battles, wins, losses, highest_score)
      VALUES (
        ${player1.toLowerCase()},
        1,
        ${p1IsWinner ? 1 : 0},
        ${p1IsLoser ? 1 : 0},
        ${scores.p1}
      )
      ON CONFLICT (github_username) DO UPDATE SET
        total_battles = users.total_battles + 1,
        wins = users.wins + ${p1IsWinner ? 1 : 0},
        losses = users.losses + ${p1IsLoser ? 1 : 0},
        highest_score = GREATEST(users.highest_score, ${scores.p1})
    `;

    // Update player 2 stats
    const p2IsWinner = winner && winner.toLowerCase() === player2.toLowerCase();
    const p2IsLoser = winner && winner.toLowerCase() === player1.toLowerCase();

    await sql`
      INSERT INTO users (github_username, total_battles, wins, losses, highest_score)
      VALUES (
        ${player2.toLowerCase()},
        1,
        ${p2IsWinner ? 1 : 0},
        ${p2IsLoser ? 1 : 0},
        ${scores.p2}
      )
      ON CONFLICT (github_username) DO UPDATE SET
        total_battles = users.total_battles + 1,
        wins = users.wins + ${p2IsWinner ? 1 : 0},
        losses = users.losses + ${p2IsLoser ? 1 : 0},
        highest_score = GREATEST(users.highest_score, ${scores.p2})
    `;

    return res.status(200).json({
      success: true,
      message: 'Battle saved successfully',
      data: {
        player1,
        player2,
        winner,
        scores
      }
    });
  } catch (error) {
    console.error('Battle save error:', error);
    return res.status(500).json({
      error: 'Failed to save battle',
      details: error.message
    });
  }
}
