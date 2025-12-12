// ============================================
// CONSTANTS & CONFIG
// ============================================

export const ACHIEVEMENTS = [
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

export const RANKS = [
    { name: 'ROOKIE', minPower: 0, color: '#888' },
    { name: 'BRONZE', minPower: 20, color: '#cd7f32' },
    { name: 'SILVER', minPower: 40, color: '#c0c0c0' },
    { name: 'GOLD', minPower: 60, color: '#ffd700' },
    { name: 'PLATINUM', minPower: 75, color: '#e5e4e2' },
    { name: 'DIAMOND', minPower: 85, color: '#b9f2ff' },
    { name: 'LEGEND', minPower: 95, color: '#ff2a6d' }
];

export const TITLES = {
    high_stars: ['Star Collector', 'Star Lord', 'Celestial'],
    high_followers: ['Influencer', 'Community Leader', 'Icon'],
    high_repos: ['Prolific Coder', 'Repository King', 'Code Factory'],
    veteran: ['GitHub Veteran', 'Old Guard', 'Pioneer'],
    balanced: ['Well Rounded', 'Jack of All Trades', 'Balanced Fighter']
};

export const BATTLE_CATEGORIES = [
    { key: 'stars', label: 'TOTAL STARS', icon: '⭐', format: v => v.toLocaleString() },
    { key: 'repos', label: 'REPOSITORIES', icon: '📦', format: v => v.toLocaleString() },
    { key: 'followers', label: 'FOLLOWERS', icon: '👥', format: v => v.toLocaleString() },
    { key: 'age', label: 'YEARS ON GITHUB', icon: '📅', format: v => v.toFixed(1) },
    { key: 'starsPerRepo', label: 'STARS PER REPO', icon: '✨', format: v => parseFloat(v).toFixed(2) },
    { key: 'followerRatio', label: 'FOLLOWER RATIO', icon: '📊', format: v => parseFloat(v).toFixed(2) },
    { key: 'forks', label: 'TOTAL FORKS', icon: '🍴', format: v => v.toLocaleString() },
    { key: 'pullRequests', label: 'PULL REQUESTS', icon: '🔀', format: v => v.toLocaleString() },
    { key: 'issues', label: 'ISSUES', icon: '🐛', format: v => v.toLocaleString() },
    { key: 'commitFreq', label: 'COMMITS/MONTH', icon: '📝', format: v => parseFloat(v).toFixed(1) },
    { key: 'languages', label: 'LANGUAGES', icon: '💻', format: v => v.toLocaleString() },
    { key: 'gists', label: 'GISTS', icon: '📄', format: v => v.toLocaleString() }
];

export const LOADING_TIPS = [
    'Stars count double in the final score!',
    'Older accounts have more battle experience!',
    'A high follower ratio shows true influence!',
    'Quality over quantity - stars per repo matters!',
    'Forks show how useful your code is to others!',
    'Win streaks give bonus XP!',
    'Unlock achievements for bragging rights!',
    'Perfect wins are legendary!'
];

export const ANNOUNCER_PHRASES = {
    fight: ['FIGHT!', 'BATTLE!', 'LET\'S GO!'],
    round: ['ROUND {n}!', 'NEXT ROUND!'],
    combo: ['{n} HIT COMBO!', 'COMBO x{n}!'],
    critical: ['CRITICAL!', 'DEVASTATING!', 'BRUTAL!'],
    victory: ['VICTORY!', 'WINNER!', 'CHAMPION!'],
    flawless: ['FLAWLESS!', 'PERFECT!', 'UNSTOPPABLE!'],
    close: ['CLOSE FIGHT!', 'PHOTO FINISH!'],
    tie: ['DRAW!', 'TIE GAME!']
};

export const FAMOUS_DEVS = [
    // Legends (20)
    'torvalds', 'gvanrossum', 'brendaneich', 'timberners-lee', 'gaearon',
    'dhh', 'mojombo', 'defunkt', 'tj', 'antirez',
    'yyx990803', 'migueldeicaza', 'pjhyett', 'schacon', 'ry',
    'evykassirer', 'github', 'microsoft', 'google', 'facebook',
    // Famous Library Authors (30)
    'sindresorhus', 'addyosmani', 'paulirish', 'fat', 'mdo',
    'jeresig', 'fabpot', 'taylorotwell', 'wesbos', 'kentcdodds',
    'mpj', 'dan_abramov', 'swyx', 'cassidoo', 'sarah_edo',
    'TheLarkInn', 'youyuxi', 'antfu', 'patak-dev', 'bluwy',
    'sokra', 'evanw', 'jlongster', 'vjeux', 'vjeux',
    'orta', 'rkrasiuk', 'kolodny', 'amasad', 'gresham',
    'addyosmani', 'subtleGradient', 'tmm1', 'slexaxton', 'littledan',
    // Rising Stars (30)
    'monkwonderland', 'acdlite', 'threepointone', 'sebmarkbage', 'sophiebits',
    'szhell', 'lencioni', 'gman', 'tomocchino', 'seungho',
    'vjeux', 'jcdav', 'dominictarr', 'substack', 'esnext',
    'zcbenz', 'sindresorhus', 'jashkenas', 'visionmedia', 'bnoordhuis',
    'ry', 'jasnell', 'cjihrig', 'addaleax', 'targos',
    'Flarna', 'everyoneisbots', 'bzbarsky', 'domenic', 'slightlyoff',
    // Community Educators (20)
    'traversymedia', 'fireship-io', 'academind', 'developedbyed', 'cleverprogrammer',
    'codewithharry', 'hiteshchoudhary', 'thenetninjas', 'programmingwithmosh', 'freecodecamp',
    'thecodeshot', 'poojag50', 'tech_with_nana', 'codeWithHarry', 'jamesQQuick',
    'learnwithjason', 'kyleshevlin', 'eggheadio', 'frontendmasters', 'scrimba',
    // Additional notable devs
    'vercel', 'nextjs', 'remix-run', 'solidjs', 'astro',
    'qwikdev', 'sveltejs', 'vuejs', 'angular', 'reactjs',
    'emberjs', 'backbonejs', 'underscorejs', 'lodash', 'momentjs',
    'webpack', 'vite', 'parcel', 'rollup', 'esbuild',
    'typescript', 'babel', 'postcss', 'tailwindcss', 'chakra-ui'
];
