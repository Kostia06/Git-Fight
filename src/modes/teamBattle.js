// ============================================
// TEAM BATTLE MODE (2v2 and 3v3)
// ============================================

export class TeamBattle {
    constructor(teamSize = 2) {
        this.teamSize = teamSize; // 2 or 3
        this.teamAlpha = {
            players: [],
            aggregatedStats: {},
            power: 0
        };
        this.teamBeta = {
            players: [],
            aggregatedStats: {},
            power: 0
        };
    }

    /**
     * Fetch data for all team members
     */
    async fetchTeamData(alphaUsernames, betaUsernames) {
        const { fetchUser, fetchRepos, calculateStats } = await import('../api.js');

        this.teamAlpha.players = await Promise.all(
            alphaUsernames.map(async (username) => {
                try {
                    const user = await fetchUser(username);
                    const repos = await fetchRepos(username);
                    const stats = calculateStats(user, repos);
                    return { username, user, stats };
                } catch (e) {
                    throw new Error(`Failed to fetch ${username}: ${e.message}`);
                }
            })
        );

        this.teamBeta.players = await Promise.all(
            betaUsernames.map(async (username) => {
                try {
                    const user = await fetchUser(username);
                    const repos = await fetchRepos(username);
                    const stats = calculateStats(user, repos);
                    return { username, user, stats };
                } catch (e) {
                    throw new Error(`Failed to fetch ${username}: ${e.message}`);
                }
            })
        );
    }

    /**
     * Aggregate team stats using smart averaging
     * SUM: raw metrics (more players = more output)
     * AVG: quality metrics (prevent exploitation)
     */
    aggregateTeamStats(teamPlayers) {
        const statsArray = teamPlayers.map(p => p.stats);

        // Sum raw metrics
        const aggregated = {
            stars: statsArray.reduce((sum, s) => sum + s.stars, 0),
            repos: statsArray.reduce((sum, s) => sum + s.repos, 0),
            followers: statsArray.reduce((sum, s) => sum + s.followers, 0),
            forks: statsArray.reduce((sum, s) => sum + s.forks, 0),
            pullRequests: statsArray.reduce((sum, s) => sum + s.pullRequests, 0),
            issues: statsArray.reduce((sum, s) => sum + s.issues, 0),
            gists: statsArray.reduce((sum, s) => sum + s.gists, 0),
        };

        // Average quality metrics
        aggregated.age = statsArray.reduce((sum, s) => sum + s.age, 0) / statsArray.length;
        aggregated.starsPerRepo = statsArray.reduce((sum, s) => sum + s.starsPerRepo, 0) / statsArray.length;
        aggregated.followerRatio = statsArray.reduce((sum, s) => sum + s.followerRatio, 0) / statsArray.length;
        aggregated.commitFreq = statsArray.reduce((sum, s) => sum + s.commitFreq, 0) / statsArray.length;
        aggregated.languages = Math.max(...statsArray.map(s => s.languages)); // Use highest

        return aggregated;
    }

    /**
     * Calculate team power level
     */
    calculateTeamPower(aggregatedStats) {
        let power = 0;
        power += Math.min(aggregatedStats.stars / 100, 30);
        power += Math.min(aggregatedStats.repos * 0.5, 20);
        power += Math.min(aggregatedStats.followers / 50, 25);
        power += Math.min(aggregatedStats.age * 2, 10);
        power += Math.min(aggregatedStats.starsPerRepo * 2, 15);
        power += Math.min(aggregatedStats.pullRequests / 10, 8);
        power += Math.min(aggregatedStats.commitFreq / 20, 7);
        power += Math.min(aggregatedStats.languages * 2, 10);

        return Math.min(Math.round(power), 100);
    }

    /**
     * Finalize team data
     */
    finalizeTeams() {
        // Alpha team
        this.teamAlpha.aggregatedStats = this.aggregateTeamStats(this.teamAlpha.players);
        this.teamAlpha.power = this.calculateTeamPower(this.teamAlpha.aggregatedStats);

        // Beta team
        this.teamBeta.aggregatedStats = this.aggregateTeamStats(this.teamBeta.players);
        this.teamBeta.power = this.calculateTeamPower(this.teamBeta.aggregatedStats);
    }

    /**
     * Compare a stat between teams
     */
    compareStat(statKey) {
        const alphaVal = this.teamAlpha.aggregatedStats[statKey];
        const betaVal = this.teamBeta.aggregatedStats[statKey];

        if (alphaVal > betaVal) {
            return { winner: 'alpha', alphaVal, betaVal };
        } else if (betaVal > alphaVal) {
            return { winner: 'beta', alphaVal, betaVal };
        } else {
            return { winner: 'tie', alphaVal, betaVal };
        }
    }
}
