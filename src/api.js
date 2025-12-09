// ============================================
// GITHUB API
// ============================================

export async function fetchUser(username) {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (res.status === 404) throw new Error(`User "${username}" not found`);
    if (res.status === 403) throw new Error('API rate limit exceeded. Try again later.');
    if (!res.ok) throw new Error('API error');
    return res.json();
}

export async function fetchRepos(username) {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars`);
    if (!res.ok) throw new Error('Failed to fetch repos');
    return res.json();
}

export async function checkAPIStatus() {
    try {
        const res = await fetch('https://api.github.com/rate_limit');
        if (res.ok) {
            document.getElementById('status-led')?.classList.remove('warning');
            document.getElementById('api-status').textContent = 'SYSTEM ONLINE';
            return true;
        }
    } catch (e) {
        document.getElementById('status-led')?.classList.add('warning');
        document.getElementById('api-status').textContent = 'CONNECTION ISSUE';
        return false;
    }
}

export function calculateStats(user, repos) {
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
    const accountAge = (Date.now() - new Date(user.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const starsPerRepo = repos.length > 0 ? totalStars / repos.length : 0;
    const followerRatio = user.public_repos > 0 ? user.followers / user.public_repos : 0;

    return {
        stars: totalStars,
        repos: repos.length,
        followers: user.followers,
        forks: totalForks,
        age: accountAge,
        starsPerRepo,
        followerRatio
    };
}

export function calculatePowerLevel(user, repos) {
    const stats = calculateStats(user, repos);

    let power = 0;
    power += Math.min(stats.stars / 100, 30);
    power += Math.min(stats.repos * 0.5, 20);
    power += Math.min(stats.followers / 50, 25);
    power += Math.min(stats.age * 2, 10);
    power += Math.min(stats.starsPerRepo * 2, 15);

    return Math.min(Math.round(power), 100);
}
