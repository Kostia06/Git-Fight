// ============================================
// DAILY CHALLENGE SYSTEM
// ============================================

import { FAMOUS_DEVS } from '../constants.js';

/**
 * Simple hash function for deterministic seeding
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Seeded random number generator
 */
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export class DailyChallenge {
    /**
     * Get today's date in YYYY-MM-DD format
     */
    static getTodayDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    /**
     * Get or generate today's challenge
     */
    static getCurrentChallenge() {
        const today = this.getTodayDate();
        const saved = JSON.parse(localStorage.getItem('dailyChallenge') || '{}');

        if (saved.date !== today) {
            return this.generateNewChallenge(today);
        }

        return saved;
    }

    /**
     * Generate a new daily challenge using deterministic seeding
     */
    static generateNewChallenge(date) {
        const seed = hashString(date);
        const rng1 = seededRandom(seed);
        const rng2 = seededRandom(seed + 1);

        const player1 = FAMOUS_DEVS[Math.floor(rng1 * FAMOUS_DEVS.length)];
        const player2 = FAMOUS_DEVS[Math.floor(rng2 * FAMOUS_DEVS.length)];

        const challenge = {
            date,
            player1,
            player2,
            completed: false,
            result: null,
            xpAwarded: 0
        };

        localStorage.setItem('dailyChallenge', JSON.stringify(challenge));
        return challenge;
    }

    /**
     * Complete today's challenge
     */
    static completeChallenge(winner) {
        const challenge = this.getCurrentChallenge();

        challenge.completed = true;
        challenge.result = winner; // 'player1', 'player2', or 'tie'
        challenge.xpAwarded = 100;

        localStorage.setItem('dailyChallenge', JSON.stringify(challenge));

        // Update daily stats
        this.updateDailyStats(winner);
        this.updateStreak();
    }

    /**
     * Update daily statistics
     */
    static updateDailyStats(winner) {
        const stats = JSON.parse(localStorage.getItem('dailyStats') || JSON.stringify({
            totalCompleted: 0,
            wins: 0,
            losses: 0,
            ties: 0
        }));

        stats.totalCompleted++;
        if (winner === 'tie') {
            stats.ties++;
        } else {
            stats.wins++;
        }

        localStorage.setItem('dailyStats', JSON.stringify(stats));
    }

    /**
     * Update streak (consecutive days completed)
     */
    static updateStreak() {
        let streak = parseInt(localStorage.getItem('dailyStreak') || '0');
        streak++;
        localStorage.setItem('dailyStreak', JSON.stringify(streak));
    }

    /**
     * Get current streak
     */
    static getStreak() {
        return parseInt(localStorage.getItem('dailyStreak') || '0');
    }

    /**
     * Get daily statistics
     */
    static getDailyStats() {
        return JSON.parse(localStorage.getItem('dailyStats') || JSON.stringify({
            totalCompleted: 0,
            wins: 0,
            losses: 0,
            ties: 0
        }));
    }

    /**
     * Check if today's challenge is already completed
     */
    static isCompletedToday() {
        const challenge = this.getCurrentChallenge();
        return challenge.completed && challenge.date === this.getTodayDate();
    }

    /**
     * Reset streak if yesterday wasn't completed
     */
    static validateStreak() {
        const lastChallenge = JSON.parse(localStorage.getItem('lastCompletedChallenge') || '{}');
        const today = this.getTodayDate();

        // If last completion wasn't yesterday, reset streak
        if (lastChallenge.date) {
            const lastDate = new Date(lastChallenge.date);
            const todayDate = new Date(today);
            const dayDiff = (todayDate - lastDate) / (1000 * 60 * 60 * 24);

            if (dayDiff > 1) {
                localStorage.setItem('dailyStreak', '0');
            }
        }
    }
}
