// ============================================
// DATABASE API INTEGRATION
// ============================================

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// Save battle results to database
export async function saveBattle(player1, player2, scores, winner) {
    try {
        const response = await fetch(`${API_BASE}/battle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                player1,
                player2,
                scores,
                winner
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to save battle:', error);
        // Don't throw - we don't want to break the UI if database fails
        return null;
    }
}

// Load leaderboard from database
export async function loadLeaderboard(limit = 100) {
    try {
        const response = await fetch(`${API_BASE}/leaderboard?limit=${limit}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.leaderboard || [];
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        return [];
    }
}

// Load global stats from database
export async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.stats || null;
    } catch (error) {
        console.error('Failed to load stats:', error);
        return null;
    }
}

// Setup database (run once)
export async function setupDatabase() {
    try {
        const response = await fetch(`${API_BASE}/setup`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Database setup:', data);
        return data;
    } catch (error) {
        console.error('Failed to setup database:', error);
        return null;
    }
}

// Update leaderboard UI
export function updateLeaderboardUI(leaderboard) {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;

    if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = '<div class="leaderboard-empty">No rankings yet. Start battling to appear on the leaderboard!</div>';
        return;
    }

    container.innerHTML = leaderboard.map((user, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

        return `
            <div class="leaderboard-item ${rank <= 3 ? 'top-3' : ''}" data-rank="${rank}">
                <div class="leaderboard-rank">
                    <span class="rank-number">${rank}</span>
                    ${medal ? `<span class="rank-medal">${medal}</span>` : ''}
                </div>
                <div class="leaderboard-user">
                    <a href="https://github.com/${user.github_username}" target="_blank" class="user-link">
                        <img src="https://github.com/${user.github_username}.png"
                             alt="${user.github_username}"
                             class="user-avatar"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Crect fill=%22%23333%22 width=%2240%22 height=%2240%22/%3E%3C/svg%3E'">
                        <span class="user-name">${user.github_username}</span>
                    </a>
                </div>
                <div class="leaderboard-stats">
                    <div class="stat-item">
                        <span class="stat-label">Battles</span>
                        <span class="stat-value">${user.total_battles}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Wins</span>
                        <span class="stat-value wins">${user.wins}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Win Rate</span>
                        <span class="stat-value rate">${user.win_rate || 0}%</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update global stats UI
export function updateGlobalStatsUI(stats) {
    if (!stats) return;

    const totalUsersEl = document.getElementById('global-total-users');
    const totalBattlesEl = document.getElementById('global-total-battles');

    if (totalUsersEl) {
        totalUsersEl.textContent = stats.total_users.toLocaleString();
    }

    if (totalBattlesEl) {
        totalBattlesEl.textContent = stats.total_battles.toLocaleString();
    }
}
