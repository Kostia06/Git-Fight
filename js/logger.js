// ============================================
// USAGE LOGGER
// ============================================

import { ACHIEVEMENTS, FAMOUS_DEVS } from './constants.js';

export const UsageLogger = {
    storageKey: 'devBattleStats_v2',

    getStats() {
        const defaults = {
            totalBattles: 0,
            todayBattles: 0,
            todayDate: new Date().toDateString(),
            pageViews: 0,
            totalWins: 0,
            maxScore: 0,
            perfectWins: 0,
            maxStreak: 0,
            currentStreak: 0,
            lastWinner: null,
            maxCombo: 0,
            maxDailyBattles: 0,
            uniqueUsers: 0,
            usersPlayed: [],
            legendsDefeated: [],
            winners: {},
            recentBattles: [],
            achievements: [],
            xp: 0,
            level: 1,
            firstVisit: Date.now(),
            lastVisit: Date.now()
        };

        try {
            const saved = JSON.parse(localStorage.getItem(this.storageKey));
            if (!saved) return defaults;

            if (saved.todayDate !== new Date().toDateString()) {
                if (saved.todayBattles > saved.maxDailyBattles) {
                    saved.maxDailyBattles = saved.todayBattles;
                }
                saved.todayBattles = 0;
                saved.todayDate = new Date().toDateString();
            }

            return { ...defaults, ...saved };
        } catch (e) {
            return defaults;
        }
    },

    saveStats(stats) {
        stats.lastVisit = Date.now();
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(stats));
        } catch (e) {
            console.error('Failed to save stats:', e);
        }
    },

    init() {
        const stats = this.getStats();
        stats.pageViews++;
        this.saveStats(stats);
        this.updateDisplay(stats);
        this.logToConsole(stats);
    },

    logToConsole(stats) {
        console.log('%c🎮 GIT FIGHT v2.0 🎮', 'font-size: 20px; font-weight: bold; color: #ff2a6d; text-shadow: 0 0 10px #ff2a6d;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #05d9e8;');
        console.table({
            'Total Battles': stats.totalBattles,
            'Today\'s Battles': stats.todayBattles,
            'Total Wins': stats.totalWins,
            'Win Streak': stats.currentStreak,
            'Max Streak': stats.maxStreak,
            'Level': stats.level,
            'XP': stats.xp,
            'Achievements': `${stats.achievements.length}/${ACHIEVEMENTS.length}`,
            'Page Views': stats.pageViews
        });
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #05d9e8;');
    },

    logBattle(player1, player2, winner, p1Score, p2Score, showAchievement) {
        const stats = this.getStats();
        stats.totalBattles++;
        stats.todayBattles++;

        // Track unique users
        [player1, player2].forEach(p => {
            if (!stats.usersPlayed.includes(p.toLowerCase())) {
                stats.usersPlayed.push(p.toLowerCase());
                stats.uniqueUsers = stats.usersPlayed.length;
            }
        });

        // Track winner
        if (winner) {
            stats.winners[winner] = (stats.winners[winner] || 0) + 1;
            stats.totalWins++;

            // Win streak
            if (stats.lastWinner === winner) {
                stats.currentStreak++;
            } else {
                stats.currentStreak = 1;
            }
            stats.lastWinner = winner;
            if (stats.currentStreak > stats.maxStreak) {
                stats.maxStreak = stats.currentStreak;
            }

            // Track score
            const winnerScore = winner === player1 ? p1Score : p2Score;
            if (winnerScore > stats.maxScore) stats.maxScore = winnerScore;
            if (winnerScore === 7) stats.perfectWins++;

            // Track legends defeated
            const loser = winner === player1 ? player2 : player1;
            if (FAMOUS_DEVS.includes(loser.toLowerCase()) && !stats.legendsDefeated.includes(loser.toLowerCase())) {
                stats.legendsDefeated.push(loser.toLowerCase());
            }

            // XP calculation
            const xpGain = 50 + (winnerScore * 10) + (stats.currentStreak * 20);
            stats.xp += xpGain;

            // Level up check
            const xpNeeded = stats.level * 200;
            if (stats.xp >= xpNeeded) {
                stats.level++;
                if (showAchievement) {
                    showAchievement('🎉', 'LEVEL UP!', `You reached level ${stats.level}!`);
                }
            }
        } else {
            stats.currentStreak = 0;
            stats.lastWinner = null;
            stats.xp += 25; // Tie XP
        }

        // Recent battles
        stats.recentBattles.unshift({
            player1, player2, winner, p1Score, p2Score, timestamp: Date.now()
        });
        stats.recentBattles = stats.recentBattles.slice(0, 50);

        // Check achievements
        this.checkAchievements(stats, showAchievement);

        this.saveStats(stats);
        this.updateDisplay(stats);

        // Console log
        console.log('%c⚔️ BATTLE COMPLETE ⚔️', 'font-size: 16px; font-weight: bold; color: #f7b32b;');
        console.log(`   ${player1} vs ${player2}`);
        console.log(`   Winner: ${winner || 'TIE'} (${p1Score}-${p2Score})`);
        console.log(`   Streak: ${stats.currentStreak} | XP: ${stats.xp} | Level: ${stats.level}`);

        return stats;
    },

    updateCombo(combo) {
        const stats = this.getStats();
        if (combo > stats.maxCombo) {
            stats.maxCombo = combo;
            this.saveStats(stats);
            this.checkAchievements(stats);
        }
    },

    checkAchievements(stats, showAchievement) {
        ACHIEVEMENTS.forEach(achievement => {
            if (!stats.achievements.includes(achievement.id) && achievement.condition(stats)) {
                stats.achievements.push(achievement.id);
                if (showAchievement) {
                    showAchievement(achievement.icon, achievement.name, achievement.desc);
                }
            }
        });
        this.saveStats(stats);
    },

    updateDisplay(stats) {
        const totalEl = document.getElementById('total-battles');
        const todayEl = document.getElementById('today-battles');
        const streakEl = document.getElementById('win-streak');

        if (totalEl) totalEl.textContent = stats.totalBattles;
        if (todayEl) todayEl.textContent = stats.todayBattles;
        if (streakEl) streakEl.textContent = stats.currentStreak;
    },

    getTopWinners(limit = 5) {
        const stats = this.getStats();
        return Object.entries(stats.winners)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    },

    clearStats() {
        localStorage.removeItem(this.storageKey);
        console.log('%c🗑️ All data cleared!', 'color: #ff2a6d;');
        location.reload();
    }
};
