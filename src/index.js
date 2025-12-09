// ============================================
// GIT FIGHT v2.0 - ULTIMATE EDITION
// Enhanced Features & Mobile Optimized
// ============================================

// ============================================
// IMPORTS
// ============================================

import { saveBattle, loadLeaderboard, loadStats, updateLeaderboardUI, updateGlobalStatsUI } from './database.js';

// ============================================
// CONSTANTS & CONFIG
// ============================================

const ACHIEVEMENTS = [
    { id: 'first_blood', icon: '🩸', name: 'First Blood', desc: 'Win your first battle', condition: (s) => s.totalWins >= 1 },
    { id: 'veteran', icon: '⚔️', name: 'Veteran', desc: 'Complete 10 battles', condition: (s) => s.totalBattles >= 10 },
    { id: 'champion', icon: '🏆', name: 'Champion', desc: 'Win 5 battles', condition: (s) => s.totalWins >= 5 },
    { id: 'dominator', icon: '👑', name: 'Dominator', desc: 'Win with 6+ points', condition: (s) => s.maxScore >= 6 },
    { id: 'perfectionist', icon: '💎', name: 'Perfectionist', desc: 'Win 7-0', condition: (s) => s.perfectWins >= 1 },
    { id: 'streak_master', icon: '🔥', name: 'On Fire', desc: '3 win streak', condition: (s) => s.maxStreak >= 3 },
    { id: 'legend_slayer', icon: '⚡', name: 'Legend Slayer', desc: 'Beat torvalds', condition: (s) => s.legendsDefeated?.includes('torvalds') },
    { id: 'explorer', icon: '🌍', name: 'Explorer', desc: 'Battle 10 unique users', condition: (s) => s.uniqueUsers >= 10 },
    { id: 'combo_king', icon: '💥', name: 'Combo King', desc: 'Get a 4+ combo', condition: (s) => s.maxCombo >= 4 },
    { id: 'dedicated', icon: '🎮', name: 'Dedicated', desc: '5 battles in one day', condition: (s) => s.maxDailyBattles >= 5 }
];

const RANKS = [
    { name: 'ROOKIE', minPower: 0, color: '#888' },
    { name: 'BRONZE', minPower: 20, color: '#cd7f32' },
    { name: 'SILVER', minPower: 40, color: '#c0c0c0' },
    { name: 'GOLD', minPower: 60, color: '#ffd700' },
    { name: 'PLATINUM', minPower: 75, color: '#e5e4e2' },
    { name: 'DIAMOND', minPower: 85, color: '#b9f2ff' },
    { name: 'LEGEND', minPower: 95, color: '#ff2a6d' }
];

const TITLES = {
    high_stars: ['Star Collector', 'Star Lord', 'Celestial'],
    high_followers: ['Influencer', 'Community Leader', 'Icon'],
    high_repos: ['Prolific Coder', 'Repository King', 'Code Factory'],
    veteran: ['GitHub Veteran', 'Old Guard', 'Pioneer'],
    balanced: ['Well Rounded', 'Jack of All Trades', 'Balanced Fighter']
};

const BATTLE_CATEGORIES = [
    { key: 'stars', label: 'TOTAL STARS', icon: '⭐', format: v => v.toLocaleString() },
    { key: 'repos', label: 'REPOSITORIES', icon: '📦', format: v => v.toLocaleString() },
    { key: 'followers', label: 'FOLLOWERS', icon: '👥', format: v => v.toLocaleString() },
    { key: 'age', label: 'YEARS ON GITHUB', icon: '📅', format: v => v.toFixed(1) },
    { key: 'starsPerRepo', label: 'STARS PER REPO', icon: '✨', format: v => parseFloat(v).toFixed(2) },
    { key: 'followerRatio', label: 'FOLLOWER RATIO', icon: '📊', format: v => parseFloat(v).toFixed(2) },
    { key: 'forks', label: 'TOTAL FORKS', icon: '🍴', format: v => v.toLocaleString() }
];

const LOADING_TIPS = [
    'Stars count double in the final score!',
    'Older accounts have more battle experience!',
    'A high follower ratio shows true influence!',
    'Quality over quantity - stars per repo matters!',
    'Forks show how useful your code is to others!',
    'Win streaks give bonus XP!',
    'Unlock achievements for bragging rights!',
    'Perfect wins are legendary!'
];

const ANNOUNCER_PHRASES = {
    fight: ['FIGHT!', 'BATTLE!', 'LET\'S GO!'],
    round: ['ROUND {n}!', 'NEXT ROUND!'],
    combo: ['{n} HIT COMBO!', 'COMBO x{n}!'],
    critical: ['CRITICAL!', 'DEVASTATING!', 'BRUTAL!'],
    victory: ['VICTORY!', 'WINNER!', 'CHAMPION!'],
    flawless: ['FLAWLESS!', 'PERFECT!', 'UNSTOPPABLE!'],
    close: ['CLOSE FIGHT!', 'PHOTO FINISH!'],
    tie: ['DRAW!', 'TIE GAME!']
};

const FAMOUS_DEVS = [
  "torvalds",
  "gvanrossum",
  "mojombo",
  "defunkt",
  "pjhyett",
  "schacon",
  "antirez",
  "dhh",
  "yyx990803",
  "addyosmani",
  "rauchg",
  "kentcdodds",
  "tj",
  "geohot",
  "djangofan",  
  "peng‑zhihui",
  "ruanyf",
  "bradtraversy",
  "Kostia06"
];

// ============================================
// USAGE LOGGER
// ============================================

const UsageLogger = {
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

    logBattle(player1, player2, winner, p1Score, p2Score) {
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
                showAchievement('🎉', 'LEVEL UP!', `You reached level ${stats.level}!`);
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
        this.checkAchievements(stats);

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

    checkAchievements(stats) {
        ACHIEVEMENTS.forEach(achievement => {
            if (!stats.achievements.includes(achievement.id) && achievement.condition(stats)) {
                stats.achievements.push(achievement.id);
                showAchievement(achievement.icon, achievement.name, achievement.desc);
            }
        });
        this.saveStats(stats);
        renderAchievements();
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

// ============================================
// DOM HELPERS
// ============================================

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let screens = {};

// ============================================
// GAME STATE
// ============================================

let gameState = {
    player1: null,
    player2: null,
    p1Stats: {},
    p2Stats: {},
    p1Score: 0,
    p2Score: 0,
    currentRound: 0,
    combo: { streak: 0, lastWinner: null },
    battleTimer: 0,
    timerInterval: null
};

let settings = {
    sound: true,
    crt: true,
    vhs: true,
    particles: true
};

let audioCtx = null;
let particlesCanvas = null;
let particlesCtx = null;
let particles = [];
let animationId = null;

// ============================================
// DATABASE INTEGRATION HELPERS
// ============================================

// Load and update global stats display
async function loadAndUpdateGlobalStats() {
    try {
        const stats = await loadStats();
        if (stats) {
            updateGlobalStatsUI(stats);
        }
    } catch (error) {
        console.error('Failed to load global stats:', error);
    }
}

// Load and display leaderboard
async function loadAndDisplayLeaderboard() {
    try {
        const leaderboard = await loadLeaderboard();
        updateLeaderboardUI(leaderboard);
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        const container = document.getElementById('leaderboard-list');
        if (container) {
            container.innerHTML = '<div class="leaderboard-empty">Failed to load leaderboard. Please try again later.</div>';
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Initialize screens object after DOM is loaded
    screens = {
        'title-screen': $('title-screen'),
        'loading-screen': $('loading-screen'),
        'battle-screen': $('battle-screen'),
        'results-screen': $('results-screen'),
        'hall-of-fame-screen': $('hall-of-fame-screen'),
        'achievements-screen': $('achievements-screen'),
        'leaderboard-screen': $('leaderboard-screen')
    };

    UsageLogger.init();
    loadSettings();
    createStars();
    initParticles();
    startVHSTimer();
    renderHallOfFame();
    renderAchievements();
    setupEventListeners();
    checkURLParams();
    checkAPIStatus();

    // Preload sounds
    if (settings.sound) {
        initAudio();
    }
}

function setupEventListeners() {
    // VS Battle button
    $('vs-battle-btn').addEventListener('click', startBattle);
    
    // Random Start button
    $('random-start-btn').addEventListener('click', startBattle);

    // Player inputs
    $('player1').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if ($('player2').value) startBattle();
            else $('player2').focus();
        }
    });
    $('player1').addEventListener('input', debounce(() => previewPlayer('player1', 'p1'), 400));

    $('player2').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startBattle();
    });
    $('player2').addEventListener('input', debounce(() => previewPlayer('player2', 'p2'), 400));

    // Quick match buttons
    $$('.quick-btn').forEach(btn => {
        if (btn.id === 'random-btn') {
            btn.addEventListener('click', randomMatch);
        } else {
            btn.addEventListener('click', () => {
                $('player1').value = btn.dataset.p1;
                $('player2').value = btn.dataset.p2;
                triggerGlitch();
                startBattle();
            });
        }
    });

    // Game mode selector
    const playerSelect = document.querySelector('.player-select');

    $$('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            $$('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Get mode
            currentMode = btn.dataset.mode;

            // Update UI
            if (currentMode === 'random') {
                playerSelect.classList.add('random-mode');
                playerSelect.classList.add('random-mode-active');
                $('player2').value = ''; // Clear P2 input
            } else {
                playerSelect.classList.remove('random-mode');
                playerSelect.classList.remove('random-mode-active');
            }
        });
    });

    // Settings
    $('settings-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        $('settings-panel').classList.add('open');
    });

    $('close-settings').addEventListener('click', (e) => {
        e.stopPropagation();
        $('settings-panel').classList.remove('open');
    });

    $('sound-toggle').addEventListener('change', (e) => {
        settings.sound = e.target.checked;
        if (settings.sound) initAudio();
        saveSettings();
    });

    $('crt-toggle').addEventListener('change', (e) => {
        settings.crt = e.target.checked;
        document.querySelector('.scan-lines').style.display = e.target.checked ? 'block' : 'none';
        document.querySelector('.crt-vignette').style.display = e.target.checked ? 'block' : 'none';
        saveSettings();
    });

    $('vhs-toggle').addEventListener('change', (e) => {
        settings.vhs = e.target.checked;
        document.querySelector('.vhs-tracking').style.display = e.target.checked ? 'block' : 'none';
        saveSettings();
    });

    $('particles-toggle').addEventListener('change', (e) => {
        settings.particles = e.target.checked;
        if (settings.particles) {
            startParticles();
        } else {
            stopParticles();
        }
        saveSettings();
    });

    $('clear-stats-btn').addEventListener('click', () => {
        if (confirm('Clear all battle data and achievements?')) {
            UsageLogger.clearStats();
        }
    });

    // Result buttons
    $('rematch-btn').addEventListener('click', rematch);
    $('new-game-btn').addEventListener('click', newGame);
    $('copy-btn').addEventListener('click', copyShareText);
    $('tweet-btn').addEventListener('click', shareTwitter);

    // Navigation buttons
    $('hall-of-fame-btn').addEventListener('click', () => switchScreen('hall-of-fame-screen'));
    $('achievements-btn').addEventListener('click', () => switchScreen('achievements-screen'));
    $('leaderboard-btn').addEventListener('click', () => {
        switchScreen('leaderboard-screen');
        loadAndDisplayLeaderboard();
        loadAndUpdateGlobalStats();
    });
    $('hof-back-btn').addEventListener('click', () => switchScreen('title-screen'));
    $('ach-back-btn').addEventListener('click', () => switchScreen('title-screen'));
    $('leaderboard-back-btn').addEventListener('click', () => switchScreen('title-screen'));

    // Close settings on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.settings-panel') && !e.target.closest('.settings-btn')) {
            $('settings-panel').classList.remove('open');
        }
    });

    // Comprehensive keyboard controls
    document.addEventListener('keydown', (e) => {
        // Don't interfere if typing in input
        if (e.target.tagName === 'INPUT' && e.key !== 'Escape') return;

        const activeScreen = document.querySelector('.screen.active');
        const screenId = activeScreen?.id;

        // Global shortcuts
        if (e.key === 'Escape') {
            const settingsPanel = $('settings-panel');
            if (settingsPanel.classList.contains('open')) {
                settingsPanel.classList.remove('open');
                e.preventDefault();
                return;
            }
            // Go back to title from other screens
            if (screenId === 'hall-of-fame-screen' || screenId === 'achievements-screen' || screenId === 'leaderboard-screen' || screenId === 'battle-screen' || screenId === 'loading-screen' || screenId === 'results-screen') {
                switchScreen('title-screen');
                e.preventDefault();
                return;
            }
        }

        // Title screen shortcuts
        if (screenId === 'title-screen') {
            if (e.key === 'Enter' || e.key === ' ') {
                const p1 = $('player1').value;
                const p2 = $('player2').value;
                if (p1 && p2) {
                    startBattle();
                    e.preventDefault();
                }
            }  else if (e.key === 'h' || e.key === 'H') {
                switchScreen('hall-of-fame-screen');
                e.preventDefault();
            } else if (e.key === 'a' || e.key === 'A') {
                switchScreen('achievements-screen');
                e.preventDefault();
            } else if (e.key === 'l' || e.key === 'L') {
                switchScreen('leaderboard-screen');
                loadAndDisplayLeaderboard();
                loadAndUpdateGlobalStats();
                e.preventDefault();
            } else if (e.key === 's' || e.key === 'S') {
                $('settings-panel').classList.toggle('open');
                e.preventDefault();
            } else if (e.key === 'y' || e.key === 'Y') {
                const randomStartBtn = $('random-start-btn');
                if (randomStartBtn && randomStartBtn.style.display !== 'none') {
                    randomStartBtn.click();
                } else if (currentMode === 'random') {
                    startBattle();
                }
                e.preventDefault();
            } else if (e.key === 'Tab') {
                if (document.activeElement === $('player1')) {
                    $('player2').focus();
                    e.preventDefault();
                } else if (document.activeElement === $('player2')) {
                    $('player1').focus();
                    e.preventDefault();
                } else {
                    $('player1').focus();
                    e.preventDefault();
                }
            } else if (e.key === '1') {
                const quickBtns = document.querySelectorAll('.quick-btn:not(.random-btn)');
                if (quickBtns[0]) quickBtns[0].click();
                e.preventDefault();
            } else if (e.key === '2') {
                const quickBtns = document.querySelectorAll('.quick-btn:not(.random-btn)');
                if (quickBtns[1]) quickBtns[1].click();
                e.preventDefault();
            } else if (e.key === '3') {
                const quickBtns = document.querySelectorAll('.quick-btn:not(.random-btn)');
                if (quickBtns[2]) quickBtns[2].click();
                e.preventDefault();
            }
        }

        // Results screen shortcuts
        if (screenId === 'results-screen') {
            if (e.key === 'Enter' || e.key === ' ') {
                const rematchBtn = $('rematch-btn');
                if (rematchBtn) rematchBtn.click();
                e.preventDefault();
            } else if (e.key === 'n' || e.key === 'N') {
                const newGameBtn = $('new-game-btn');
                if (newGameBtn) newGameBtn.click();
                e.preventDefault();
            } else if (e.key === 'c' || e.key === 'C') {
                const copyBtn = $('copy-btn');
                if (copyBtn) copyBtn.click();
                e.preventDefault();
            } else if (e.key === 't' || e.key === 'T') {
                const tweetBtn = $('tweet-btn');
                if (tweetBtn) tweetBtn.click();
                e.preventDefault();
            }
        }

        // Hall of Fame / Achievements screen shortcuts
        if (screenId === 'hall-of-fame-screen' || screenId === 'achievements-screen') {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Backspace') {
                switchScreen('title-screen');
                e.preventDefault();
            }
        }
    });
}

// ============================================
// SETTINGS
// ============================================

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem('battleSettings_v2') || '{}');
        settings = { ...settings, ...saved };

        $('sound-toggle').checked = settings.sound;
        $('crt-toggle').checked = settings.crt;
        $('vhs-toggle').checked = settings.vhs;
        $('particles-toggle').checked = settings.particles;

        if (!settings.crt) {
            document.querySelector('.scan-lines').style.display = 'none';
            document.querySelector('.crt-vignette').style.display = 'none';
        }
        if (!settings.vhs) {
            document.querySelector('.vhs-tracking').style.display = 'none';
        }
    } catch (e) {
        console.error('Settings load error:', e);
    }
}

function saveSettings() {
    try {
        localStorage.setItem('battleSettings_v2', JSON.stringify(settings));
    } catch (e) {
        console.error('Settings save error:', e);
    }
}

// ============================================
// VISUAL EFFECTS
// ============================================

function createStars() {
    const container = $('stars');
    if (!container) return;

    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star' + (Math.random() > 0.9 ? ' large' : '');
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(star);
    }
}

function initParticles() {
    particlesCanvas = $('particles-canvas');
    if (!particlesCanvas) return;

    particlesCtx = particlesCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (settings.particles) {
        startParticles();
    }
}

function resizeCanvas() {
    if (!particlesCanvas) return;
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
}

function startParticles() {
    if (animationId) return;

    // Create particles
    particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * particlesCanvas.width,
            y: Math.random() * particlesCanvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -Math.random() * 1 - 0.5,
            size: Math.random() * 3 + 1,
            color: ['#ff2a6d', '#05d9e8', '#ffd700', '#b537f2'][Math.floor(Math.random() * 4)],
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    animateParticles();
}

function stopParticles() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (particlesCtx) {
        particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    }
}

function animateParticles() {
    if (!particlesCtx || !settings.particles) return;

    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Reset if off screen
        if (p.y < -10) {
            p.y = particlesCanvas.height + 10;
            p.x = Math.random() * particlesCanvas.width;
        }
        if (p.x < -10) p.x = particlesCanvas.width + 10;
        if (p.x > particlesCanvas.width + 10) p.x = -10;

        particlesCtx.beginPath();
        particlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        particlesCtx.fillStyle = p.color;
        particlesCtx.globalAlpha = p.alpha;
        particlesCtx.fill();
    });

    particlesCtx.globalAlpha = 1;
    animationId = requestAnimationFrame(animateParticles);
}

let vhsSeconds = 0;
function startVHSTimer() {
    setInterval(() => {
        vhsSeconds++;
        const h = String(Math.floor(vhsSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((vhsSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(vhsSeconds % 60).padStart(2, '0');
        const timeEl = $('vhs-time');
        if (timeEl) timeEl.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

function triggerGlitch() {
    const overlay = $('glitch-overlay');
    if (overlay) {
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 300);
    }
}

function triggerScreenFlash() {
    const flash = $('screen-flash');
    if (flash) {
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 300);
    }
}

function showAnnouncer(text, duration = 1500) {
    const announcer = $('announcer');
    const textEl = announcer?.querySelector('.announcer-text');
    if (!announcer || !textEl) return;

    textEl.textContent = text;
    announcer.classList.add('active');
    playSound('announce');

    setTimeout(() => {
        announcer.classList.remove('active');
    }, duration);
}

function showAchievement(icon, title, desc) {
    const popup = $('achievement-popup');
    if (!popup) return;

    popup.querySelector('.achievement-icon').textContent = icon;
    popup.querySelector('.achievement-title').textContent = title;
    popup.querySelector('.achievement-desc').textContent = desc;

    popup.classList.add('show');
    playSound('achievement');

    setTimeout(() => popup.classList.remove('show'), 4000);
}

function launchConfetti() {
    const container = $('confetti');
    if (!container) return;

    container.innerHTML = '';
    const colors = ['#ff2a6d', '#05d9e8', '#ffd700', '#39ff14', '#b537f2', '#ff6b35'];

    for (let i = 0; i < 100; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 2 + 's';
        piece.style.animationDuration = (Math.random() * 2 + 3) + 's';
        if (Math.random() > 0.5) piece.style.borderRadius = '50%';
        container.appendChild(piece);
    }

    setTimeout(() => container.innerHTML = '', 6000);
}

// ============================================
// SOUND EFFECTS
// ============================================

function initAudio() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    } catch (e) {
        console.warn('Audio not supported');
    }
}

function playSound(type) {
    if (!settings.sound || !audioCtx) return;

    try {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        switch (type) {
            case 'start':
                osc.type = 'square';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'hit':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;

            case 'win':
                [523, 659, 784, 1047].forEach((freq, i) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.type = 'square';
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.frequency.setValueAtTime(freq, now + i * 0.12);
                    g.gain.setValueAtTime(0.15, now + i * 0.12);
                    g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.2);
                    o.start(now + i * 0.12);
                    o.stop(now + i * 0.12 + 0.2);
                });
                return;

            case 'combo':
                osc.type = 'square';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.setValueAtTime(800, now + 0.05);
                osc.frequency.setValueAtTime(1000, now + 0.1);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'announce':
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'achievement':
                [440, 554, 659, 880].forEach((freq, i) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.type = 'sine';
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.frequency.setValueAtTime(freq, now + i * 0.1);
                    g.gain.setValueAtTime(0.1, now + i * 0.1);
                    g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
                    o.start(now + i * 0.1);
                    o.stop(now + i * 0.1 + 0.3);
                });
                return;
        }
    } catch (e) {
        console.warn('Sound error:', e);
    }
}

// ============================================
// PLAYER PREVIEW & RANKING
// ============================================

async function previewPlayer(inputId, prefix) {
    const input = $(inputId);
    const username = input.value.trim();

    const avatarContainer = $(`${prefix}-avatar-container`);
    const avatarImg = $(`${prefix}-avatar`);
    const powerFill = $(`${prefix}-power`);
    const powerVal = $(`${prefix}-power-val`);
    const rankEl = $(`${prefix}-rank`);
    const starsEl = $(`${prefix}-stars`);
    const followersEl = $(`${prefix}-followers`);
    const reposEl = $(`${prefix}-repos`);

    if (username.length < 2) {
        resetPreview(prefix);
        return;
    }

    try {
        const user = await fetchUser(username);
        const repos = await fetchRepos(username);

        // Show avatar
        avatarImg.src = user.avatar_url;
        avatarImg.onload = () => avatarImg.classList.add('loaded');

        // Calculate stats
        const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
        const power = calculatePowerLevel(user, repos);
        const rank = getRank(power);

        // Update UI
        if (starsEl) starsEl.textContent = formatNumber(stars);
        if (followersEl) followersEl.textContent = formatNumber(user.followers);
        if (reposEl) reposEl.textContent = user.public_repos;

        if (powerFill) powerFill.style.width = Math.min(power, 100) + '%';
        if (powerVal) powerVal.textContent = Math.round(power);
        if (rankEl) {
            rankEl.textContent = rank.name;
            rankEl.style.color = rank.color;
        }

    } catch (e) {
        resetPreview(prefix);
    }
}

function resetPreview(prefix) {
    const avatarImg = $(`${prefix}-avatar`);
    const powerFill = $(`${prefix}-power`);
    const powerVal = $(`${prefix}-power-val`);
    const rankEl = $(`${prefix}-rank`);
    const starsEl = $(`${prefix}-stars`);
    const followersEl = $(`${prefix}-followers`);
    const reposEl = $(`${prefix}-repos`);

    if (avatarImg) {
        avatarImg.classList.remove('loaded');
        avatarImg.src = '';
    }
    if (powerFill) powerFill.style.width = '0%';
    if (powerVal) powerVal.textContent = '???';
    if (rankEl) {
        rankEl.textContent = 'ROOKIE';
        rankEl.style.color = '#888';
    }
    if (starsEl) starsEl.textContent = '-';
    if (followersEl) followersEl.textContent = '-';
    if (reposEl) reposEl.textContent = '-';
}

function calculatePowerLevel(user, repos) {
    const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const forks = repos.reduce((sum, r) => sum + r.forks_count, 0);

    const power = (
        Math.log10(stars + 1) * 15 +
        Math.log10(forks + 1) * 10 +
        Math.log10(user.followers + 1) * 12 +
        Math.log10(user.public_repos + 1) * 5 +
        Math.min(user.public_repos > 0 ? (stars / user.public_repos) * 0.5 : 0, 10)
    );

    return Math.min(power, 100);
}

function getRank(power) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (power >= RANKS[i].minPower) return RANKS[i];
    }
    return RANKS[0];
}

function getTitle(stats) {
    if (stats.stars > 10000) return TITLES.high_stars[Math.floor(Math.random() * TITLES.high_stars.length)];
    if (stats.followers > 5000) return TITLES.high_followers[Math.floor(Math.random() * TITLES.high_followers.length)];
    if (stats.repos > 100) return TITLES.high_repos[Math.floor(Math.random() * TITLES.high_repos.length)];
    if (stats.age > 10) return TITLES.veteran[Math.floor(Math.random() * TITLES.veteran.length)];
    return TITLES.balanced[Math.floor(Math.random() * TITLES.balanced.length)];
}

// ============================================
// HALL OF FAME & ACHIEVEMENTS
// ============================================

function renderHallOfFame() {
    const container = $('hall-of-fame');
    if (!container) return;

    const topWinners = UsageLogger.getTopWinners(5);

    if (topWinners.length === 0) {
        container.innerHTML = '<div class="hall-empty">No champions yet. Start battling!</div>';
        return;
    }

    container.innerHTML = topWinners.map(([name, wins], i) => `
        <div class="hall-item">
            <span class="hall-medal">${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
            <div class="hall-info">
                <div class="hall-name">${name}</div>
                <div class="hall-wins">${wins} win${wins > 1 ? 's' : ''}</div>
            </div>
        </div>
    `).join('');
}

function renderAchievements() {
    const container = $('achievements-grid');
    if (!container) return;

    const stats = UsageLogger.getStats();
    const unlocked = stats.achievements || [];

    container.innerHTML = ACHIEVEMENTS.map(a => `
        <div class="achievement-item ${unlocked.includes(a.id) ? 'unlocked' : ''}"
             data-name="${a.name}" title="${a.desc}">
            ${a.icon}
        </div>
    `).join('');

    // Update both header counters
    const countEl = $('achievement-count');
    const countHeaderEl = $('achievement-count-header');
    const countText = `${unlocked.length}/${ACHIEVEMENTS.length}`;

    if (countEl) countEl.textContent = countText;
    if (countHeaderEl) countHeaderEl.textContent = countText;
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchUser(username) {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (res.status === 404) throw new Error(`User "${username}" not found`);
    if (res.status === 403) throw new Error('API rate limit exceeded. Try again later.');
    if (!res.ok) throw new Error('API error');
    return res.json();
}

async function fetchRepos(username) {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars`);
    if (!res.ok) throw new Error('Failed to fetch repos');
    return res.json();
}

async function checkAPIStatus() {
    try {
        const res = await fetch('https://api.github.com/rate_limit');
        const data = await res.json();
        const remaining = data.rate.remaining;

        const led = $('status-led');
        const status = $('api-status');

        if (remaining < 10) {
            if (led) led.className = 'status-led error';
            if (status) status.textContent = `LOW: ${remaining} calls`;
        } else if (remaining < 30) {
            if (led) led.className = 'status-led warning';
            if (status) status.textContent = `${remaining} calls left`;
        } else {
            if (led) led.className = 'status-led';
            if (status) status.textContent = 'SYSTEM ONLINE';
        }
    } catch (e) {
        console.warn('API check failed');
    }
}

// ============================================
// URL PARAMS
// ============================================

function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const p1 = params.get('p1');
    const p2 = params.get('p2');

    if (p1 && p2) {
        $('player1').value = p1;
        $('player2').value = p2;
        setTimeout(startBattle, 500);
    }
}

function updateURL(p1, p2) {
    const url = new URL(window.location);
    url.searchParams.set('p1', p1);
    url.searchParams.set('p2', p2);
    history.pushState({}, '', url);
}

// ============================================
// BATTLE FLOW
// ============================================

let currentMode = '1v1'; // Game mode: '1v1' or 'random'


function youVsRandom() {
    // Get random developer
    const randomDev = FAMOUS_DEVS[Math.floor(Math.random() * FAMOUS_DEVS.length)];

    // Check if either input already has a value
    const p1 = $('player1').value.trim();
    const p2 = $('player2').value.trim();

    if (p1 && !p2) {
        // User already entered P1, fill P2 with random
        $('player2').value = randomDev;
        triggerGlitch();
        startBattle();
    } else if (p2 && !p1) {
        // User already entered P2, fill P1 with random
        $('player1').value = randomDev;
        triggerGlitch();
        startBattle();
    } else {
        // No input yet, prompt for username
        const username = prompt('Enter your GitHub username:');
        if (username && username.trim()) {
            $('player1').value = username.trim();
            $('player2').value = randomDev;
            triggerGlitch();
            startBattle();
        }
    }
}

async function startBattle() {
    let p1Name = $('player1').value.trim();
    let p2Name = $('player2').value.trim();

    // Auto-fill P2 with random developer if in random mode
    if (currentMode === 'random' && p1Name && !p2Name) {
        p2Name = FAMOUS_DEVS[Math.floor(Math.random() * FAMOUS_DEVS.length)];
        $('player2').value = p2Name;
    }

    if (!p1Name) {
        showError(currentMode === 'random' ? 'Enter your username!' : 'Enter both usernames!');
        return;
    }

    if (!p2Name) {
        showError('Enter both usernames!');
        return;
    }

    if (p1Name.toLowerCase() === p2Name.toLowerCase()) {
        showError('Choose different fighters!');
        return;
    }

    showError('');
    playSound('start');
    triggerGlitch();
    switchScreen('loading-screen');

    // Show loading tip
    const tipEl = $('loading-tip');
    if (tipEl) tipEl.textContent = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];

    // Update loading names
    $('load-p1-name').textContent = p1Name;
    $('load-p2-name').textContent = p2Name;

    const phases = $$('.phase');
    phases.forEach(p => p.classList.remove('active', 'done'));

    try {
        // Phase 1
        phases[0].classList.add('active');
        updateProgress(15, 'Fetching user data...');

        const [p1Data, p2Data] = await Promise.all([
            fetchUser(p1Name),
            fetchUser(p2Name)
        ]);

        // Show avatars in loading
        const loadP1Img = $('load-p1-img');
        const loadP2Img = $('load-p2-img');
        if (loadP1Img) {
            loadP1Img.src = p1Data.avatar_url;
            loadP1Img.onload = () => loadP1Img.classList.add('loaded');
        }
        if (loadP2Img) {
            loadP2Img.src = p2Data.avatar_url;
            loadP2Img.onload = () => loadP2Img.classList.add('loaded');
        }

        phases[0].classList.remove('active');
        phases[0].classList.add('done');

        // Phase 2
        phases[1].classList.add('active');
        updateProgress(40, 'Scanning repositories...');

        const [p1Repos, p2Repos] = await Promise.all([
            fetchRepos(p1Name),
            fetchRepos(p2Name)
        ]);

        phases[1].classList.remove('active');
        phases[1].classList.add('done');

        // Phase 3
        phases[2].classList.add('active');
        updateProgress(70, 'Calculating power levels...');

        await sleep(400);

        gameState.player1 = p1Data;
        gameState.player2 = p2Data;
        gameState.p1Stats = calculateStats(p1Data, p1Repos);
        gameState.p2Stats = calculateStats(p2Data, p2Repos);
        gameState.p1Score = 0;
        gameState.p2Score = 0;
        gameState.currentRound = 0;
        gameState.combo = { streak: 0, lastWinner: null };

        // Show ranks
        const p1Power = calculatePowerLevel(p1Data, p1Repos);
        const p2Power = calculatePowerLevel(p2Data, p2Repos);
        $('load-p1-rank').textContent = getRank(p1Power).name;
        $('load-p2-rank').textContent = getRank(p2Power).name;

        phases[2].classList.remove('active');
        phases[2].classList.add('done');

        // Phase 4
        phases[3].classList.add('active');
        updateProgress(90, 'Preparing arena...');

        await sleep(400);

        phases[3].classList.remove('active');
        phases[3].classList.add('done');
        updateProgress(100, 'READY!');

        await sleep(300);

        updateURL(p1Name, p2Name);
        runBattle();

    } catch (error) {
        showError(error.message);
        switchScreen('title-screen');
    }
}

function calculateStats(user, repos) {
    const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const forks = repos.reduce((sum, r) => sum + r.forks_count, 0);
    const created = new Date(user.created_at);
    const age = (Date.now() - created) / (1000 * 60 * 60 * 24 * 365);

    const languages = {};
    repos.forEach(r => {
        if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
    });
    const topLang = Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    return {
        stars,
        repos: user.public_repos,
        followers: user.followers,
        age,
        starsPerRepo: user.public_repos > 0 ? stars / user.public_repos : 0,
        followerRatio: user.following > 0 ? user.followers / user.following : user.followers,
        forks,
        topLang
    };
}

async function runBattle() {
    switchScreen('battle-screen');
    triggerScreenFlash();

    // Setup fighters
    $('f1-img').src = gameState.player1.avatar_url;
    $('f1-name').textContent = gameState.player1.login;
    $('f1-title').textContent = getTitle(gameState.p1Stats);
    $('f1-score').textContent = '0';
    $('f1-health').style.width = '100%';
    $('f1-health').className = 'health-fill';
    $('f1-energy').style.width = '0%';
    $('f1-hp').textContent = '100%';
    $('f1-sp').textContent = '0%';

    $('f2-img').src = gameState.player2.avatar_url;
    $('f2-name').textContent = gameState.player2.login;
    $('f2-title').textContent = getTitle(gameState.p2Stats);
    $('f2-score').textContent = '0';
    $('f2-health').style.width = '100%';
    $('f2-health').className = 'health-fill';
    $('f2-energy').style.width = '0%';
    $('f2-hp').textContent = '100%';
    $('f2-sp').textContent = '0%';

    // Reset round indicators
    $$('.round-dot').forEach(dot => dot.className = 'round-dot');
    $$('.round-win').forEach(dot => dot.classList.remove('won'));

    $('battle-log').innerHTML = '';

    // Start battle timer
    gameState.battleTimer = 0;
    gameState.timerInterval = setInterval(() => {
        gameState.battleTimer++;
        const m = String(Math.floor(gameState.battleTimer / 60)).padStart(2, '0');
        const s = String(gameState.battleTimer % 60).padStart(2, '0');
        const timerEl = document.querySelector('.timer-value');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
    }, 1000);

    // Announce fight
    await sleep(500);
    showAnnouncer(ANNOUNCER_PHRASES.fight[Math.floor(Math.random() * ANNOUNCER_PHRASES.fight.length)]);
    await sleep(1500);

    // Run rounds
    for (let i = 0; i < BATTLE_CATEGORIES.length; i++) {
        gameState.currentRound = i + 1;

        // Update round display
        $('round-num').textContent = i + 1;
        $$('.round-dot')[i].classList.add('active');

        const cat = BATTLE_CATEGORIES[i];
        $('category-icon').textContent = cat.icon;
        $('battle-category').textContent = cat.label;

        await sleep(600);
        await showRound(cat, i);

        // Update round dot
        $$('.round-dot')[i].classList.remove('active');
    }

    // Stop timer
    clearInterval(gameState.timerInterval);

    await sleep(1000);
    showResults();
}

async function showRound(category, roundIndex) {
    const p1Val = gameState.p1Stats[category.key];
    const p2Val = gameState.p2Stats[category.key];

    // Show clash
    const clashEffect = $('clash-effect');
    clashEffect.classList.add('active');
    playSound('hit');
    triggerGlitch();

    await sleep(400);
    clashEffect.classList.remove('active');

    // Show comparison
    const comparison = $('stat-comparison');
    $('comparison-header').textContent = category.label;
    $('compare-p1').textContent = category.format(p1Val);
    $('compare-p2').textContent = category.format(p2Val);
    comparison.classList.add('show');

    await sleep(300);

    // Determine winner
    let winner = null;
    const resultEl = $('comparison-result');

    if (p1Val > p2Val) {
        gameState.p1Score++;
        winner = 'p1';
        $('compare-p1').classList.add('winner');
        resultEl.textContent = `${gameState.player1.login} WINS!`;
        resultEl.style.color = '#05d9e8';

        // Update round indicator
        $$('.round-dot')[roundIndex].classList.add('p1-win');

        // Hit effect on loser
        $('fighter-right').classList.add('hit');
        setTimeout(() => $('fighter-right').classList.remove('hit'), 200);

        // Win glow
        $('fighter-left').classList.add('round-winner');
        setTimeout(() => $('fighter-left').classList.remove('round-winner'), 1000);

    } else if (p2Val > p1Val) {
        gameState.p2Score++;
        winner = 'p2';
        $('compare-p2').classList.add('winner');
        resultEl.textContent = `${gameState.player2.login} WINS!`;
        resultEl.style.color = '#ff2a6d';

        $$('.round-dot')[roundIndex].classList.add('p2-win');

        $('fighter-left').classList.add('hit');
        setTimeout(() => $('fighter-left').classList.remove('hit'), 200);

        $('fighter-right').classList.add('round-winner');
        setTimeout(() => $('fighter-right').classList.remove('round-winner'), 1000);

    } else {
        gameState.p1Score++;
        gameState.p2Score++;
        resultEl.textContent = 'TIE!';
        resultEl.style.color = '#ffd700';
        gameState.combo.streak = 0;
        gameState.combo.lastWinner = null;
    }

    // Update combo
    if (winner) {
        updateCombo(winner);
    }

    // Update scores
    $('f1-score').textContent = gameState.p1Score;
    $('f2-score').textContent = gameState.p2Score;

    // Update health bars
    updateHealthBars();

    // Update energy bars
    const p1Energy = (gameState.p1Score / 7) * 100;
    const p2Energy = (gameState.p2Score / 7) * 100;
    $('f1-energy').style.width = p1Energy + '%';
    $('f2-energy').style.width = p2Energy + '%';
    $('f1-sp').textContent = Math.round(p1Energy) + '%';
    $('f2-sp').textContent = Math.round(p2Energy) + '%';

    // Add to battle log
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${winner || 'tie'}`;
    logEntry.innerHTML = `<strong>${category.label}:</strong> ${winner === 'p1' ? gameState.player1.login : winner === 'p2' ? gameState.player2.login : 'TIE'} ${winner ? `(${category.format(winner === 'p1' ? p1Val : p2Val)})` : ''}`;
    $('battle-log').appendChild(logEntry);
    $('battle-log').scrollTop = $('battle-log').scrollHeight;

    await sleep(800);

    comparison.classList.remove('show');
    $('compare-p1').classList.remove('winner');
    $('compare-p2').classList.remove('winner');
}

function updateCombo(winner) {
    if (gameState.combo.lastWinner === winner) {
        gameState.combo.streak++;
        if (gameState.combo.streak >= 2) {
            showCombo(gameState.combo.streak);
            UsageLogger.updateCombo(gameState.combo.streak);
        }
        if (gameState.combo.streak >= 3) {
            showCritical();
        }
    } else {
        gameState.combo.streak = 1;
    }
    gameState.combo.lastWinner = winner;
}

function showCombo(count) {
    playSound('combo');
    const popup = $('combo-display');
    if (!popup) return;

    popup.querySelector('.combo-count').textContent = count;
    popup.classList.add('show');

    setTimeout(() => popup.classList.remove('show'), 1200);
}

function showCritical() {
    const critical = $('critical-hit');
    if (critical) {
        critical.classList.add('show');
        setTimeout(() => critical.classList.remove('show'), 800);
    }
}

function updateHealthBars() {
    const maxScore = 7;
    const p1Health = Math.max(0, 100 - (gameState.p2Score / maxScore) * 100);
    const p2Health = Math.max(0, 100 - (gameState.p1Score / maxScore) * 100);

    const p1Bar = $('f1-health');
    const p2Bar = $('f2-health');

    p1Bar.style.width = p1Health + '%';
    p2Bar.style.width = p2Health + '%';

    $('f1-hp').textContent = Math.round(p1Health) + '%';
    $('f2-hp').textContent = Math.round(p2Health) + '%';

    // Update colors
    [p1Bar, p2Bar].forEach((bar, i) => {
        const health = i === 0 ? p1Health : p2Health;
        bar.classList.remove('medium', 'low');
        if (health < 30) bar.classList.add('low');
        else if (health < 60) bar.classList.add('medium');
    });
}

// ============================================
// RESULTS
// ============================================

function showResults() {
    switchScreen('results-screen');
    playSound('win');
    launchConfetti();
    triggerScreenFlash();

    const p1Score = gameState.p1Score;
    const p2Score = gameState.p2Score;

    let winner, loser, winnerScore, loserScore;
    let isTie = false;

    if (p1Score > p2Score) {
        winner = gameState.player1;
        loser = gameState.player2;
        winnerScore = p1Score;
        loserScore = p2Score;
    } else if (p2Score > p1Score) {
        winner = gameState.player2;
        loser = gameState.player1;
        winnerScore = p2Score;
        loserScore = p1Score;
    } else {
        isTie = true;
        winner = gameState.player1;
        loser = gameState.player2;
        winnerScore = p1Score;
        loserScore = p2Score;
    }

    // Log battle
    const stats = UsageLogger.logBattle(
        gameState.player1.login,
        gameState.player2.login,
        isTie ? null : winner.login,
        p1Score,
        p2Score
    );

    // Save battle to database
    saveBattle(
        gameState.player1.login,
        gameState.player2.login,
        { p1: p1Score, p2: p2Score },
        isTie ? null : winner.login
    ).then(result => {
        if (result) {
            console.log('Battle saved to database:', result);
            // Refresh global stats after saving battle
            loadAndUpdateGlobalStats();
        }
    });

    // Update displays
    renderHallOfFame();

    // Victory banner
    const crownEl = $('winner-crown');
    const titleEl = $('result-title');
    const subtitleEl = $('result-subtitle');

    if (isTie) {
        crownEl.textContent = '🤝';
        titleEl.textContent = 'TIE GAME!';
        subtitleEl.textContent = 'PERFECTLY BALANCED';
        showAnnouncer(ANNOUNCER_PHRASES.tie[Math.floor(Math.random() * ANNOUNCER_PHRASES.tie.length)]);
    } else {
        crownEl.textContent = '👑';
        titleEl.textContent = 'VICTORY!';

        const diff = winnerScore - loserScore;
        if (diff >= 6) {
            subtitleEl.textContent = 'FLAWLESS VICTORY!';
            showAnnouncer(ANNOUNCER_PHRASES.flawless[Math.floor(Math.random() * ANNOUNCER_PHRASES.flawless.length)]);
        } else if (diff <= 1) {
            subtitleEl.textContent = 'CLOSE BATTLE!';
            showAnnouncer(ANNOUNCER_PHRASES.close[Math.floor(Math.random() * ANNOUNCER_PHRASES.close.length)]);
        } else {
            subtitleEl.textContent = 'DOMINANT WIN!';
            showAnnouncer(ANNOUNCER_PHRASES.victory[Math.floor(Math.random() * ANNOUNCER_PHRASES.victory.length)]);
        }
    }

    // Podium
    $('winner-avatar').src = winner.avatar_url;
    $('winner-name').textContent = winner.login;
    $('winner-score').textContent = winnerScore;

    $('loser-avatar').src = loser.avatar_url;
    $('loser-name').textContent = loser.login;
    $('loser-score').textContent = loserScore;

    // Stats breakdown
    renderStatsGrid();

    // Share text
    const shareText = isTie
        ? `⚔️ @${gameState.player1.login} vs @${gameState.player2.login} = ${p1Score}-${p2Score} TIE!\n\n🎮 Battle: ${location.href}`
        : `🏆 @${winner.login} defeated @${loser.login} ${winnerScore}-${loserScore}!\n\n⚔️ Git Fight\n🎮 ${location.href}`;

    $('share-preview').textContent = shareText;
}

function renderStatsGrid() {
    const grid = $('stats-grid');
    if (!grid) return;

    const stats = ['stars', 'repos', 'followers', 'age', 'starsPerRepo', 'followerRatio', 'forks'];
    const labels = ['Stars', 'Repos', 'Followers', 'Age', '⭐/Repo', 'Ratio', 'Forks'];

    grid.innerHTML = stats.map((stat, i) => {
        const p1 = parseFloat(gameState.p1Stats[stat]);
        const p2 = parseFloat(gameState.p2Stats[stat]);
        const p1Win = p1 > p2;
        const p2Win = p2 > p1;

        return `
            <div class="stat-item">
                <div class="stat-item-label">${labels[i]}</div>
                <div class="stat-item-winner ${p1Win ? 'p1' : p2Win ? 'p2' : 'tie'}">
                    ${p1Win ? gameState.player1.login : p2Win ? gameState.player2.login : 'Tie'}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// ACTIONS
// ============================================

function rematch() {
    const temp = $('player1').value;
    $('player1').value = $('player2').value;
    $('player2').value = temp;
    triggerGlitch();
    startBattle();
}

function newGame() {
    $('player1').value = '';
    $('player2').value = '';
    resetPreview('p1');
    resetPreview('p2');
    switchScreen('title-screen');
    history.pushState({}, '', location.pathname);
}

function copyShareText() {
    const text = $('share-preview').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = $('copy-btn');
        btn.innerHTML = '<span class="btn-icon">✓</span><span class="btn-text">COPIED!</span>';
        setTimeout(() => {
            btn.innerHTML = '<span class="btn-icon">📋</span><span class="btn-text">COPY</span>';
        }, 2000);
    });
}

function shareTwitter() {
    const text = $('share-preview').textContent;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}

// ============================================
// UTILITIES
// ============================================

function switchScreen(name) {
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove('active');
    });
    if (screens[name]) screens[name].classList.add('active');
}

function showError(msg) {
    const el = $('error-msg');
    if (el) el.textContent = msg;
}

function updateProgress(pct, status) {
    const bar = $('progress-bar');
    const pctEl = $('progress-pct');
    const statusEl = $('progress-status');

    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    if (statusEl) statusEl.textContent = status || '';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', init);
