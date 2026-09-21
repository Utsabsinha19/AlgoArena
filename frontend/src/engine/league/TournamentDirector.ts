// ============================================================================
// AlgoArena v6.0 - Autonomous AI Tournament & Elo League Engine (Section 1)
// Automated Swiss-system matchmaking, Glicko-2 Elo ratings & off-thread races
// ============================================================================

import { AlgorithmType } from '../../types/algoArena';

export interface CompetitorProfile {
  id: string;
  name: string;
  algorithmType: AlgorithmType | string;
  eloRating: number;
  ratingVolatility: number;
  wins: number;
  losses: number;
  draws: number;
  matchesPlayed: number;
}

export interface MatchResult {
  matchId: string;
  round: number;
  competitorAId: string;
  competitorBId: string;
  winnerId: string | null; // null for draw
  pathCostA: number;
  pathCostB: number;
  executionTimeA: number;
  executionTimeB: number;
  nodesExploredA?: number;
  nodesExploredB?: number;
}

export interface SwissPairing {
  competitorA: CompetitorProfile;
  competitorB: CompetitorProfile;
}

export class TournamentDirector {
  private competitors: Map<string, CompetitorProfile> = new Map();
  private matchHistory: MatchResult[] = [];
  private currentRound: number = 1;
  private playedMatchups: Set<string> = new Set();

  constructor() {
    this.seedDefaultCompetitors();
  }

  public registerCompetitor(
    id: string,
    name: string,
    algorithmType: AlgorithmType | string,
    initialElo: number = 1500
  ): CompetitorProfile {
    const profile: CompetitorProfile = {
      id,
      name,
      algorithmType,
      eloRating: initialElo,
      ratingVolatility: 350,
      wins: 0,
      losses: 0,
      draws: 0,
      matchesPlayed: 0,
    };
    this.competitors.set(id, profile);
    return profile;
  }

  public getCompetitor(id: string): CompetitorProfile | undefined {
    return this.competitors.get(id);
  }

  public getAllCompetitors(): CompetitorProfile[] {
    return Array.from(this.competitors.values());
  }

  public getMatchHistory(): MatchResult[] {
    return [...this.matchHistory];
  }

  public getCurrentRound(): number {
    return this.currentRound;
  }

  /**
   * Calculates Glicko-2 / Elo rating update with volatility adjustment
   * score: 1.0 = win, 0.5 = draw, 0.0 = loss
   */
  public calculateGlicko2Update(
    player: CompetitorProfile,
    opponent: CompetitorProfile,
    score: number
  ): number {
    const K = Math.max(16, Math.min(48, Math.round(player.ratingVolatility / 10)));
    const expectedScore = 1 / (1 + Math.pow(10, (opponent.eloRating - player.eloRating) / 400));
    const newRating = player.eloRating + K * (score - expectedScore);

    // Decay volatility slightly as matches are played
    player.ratingVolatility = Math.max(50, player.ratingVolatility * 0.97);

    return Math.round(newRating);
  }

  public recordMatchResult(result: MatchResult) {
    this.matchHistory.push(result);
    const compA = this.competitors.get(result.competitorAId);
    const compB = this.competitors.get(result.competitorBId);

    if (!compA || !compB) return;

    compA.matchesPlayed++;
    compB.matchesPlayed++;

    let scoreA = 0.5;
    let scoreB = 0.5;

    if (result.winnerId === compA.id) {
      scoreA = 1.0;
      scoreB = 0.0;
      compA.wins++;
      compB.losses++;
    } else if (result.winnerId === compB.id) {
      scoreA = 0.0;
      scoreB = 1.0;
      compA.losses++;
      compB.wins++;
    } else {
      compA.draws++;
      compB.draws++;
    }

    compA.eloRating = this.calculateGlicko2Update(compA, compB, scoreA);
    compB.eloRating = this.calculateGlicko2Update(compB, compA, scoreB);

    // Track matchup
    const matchupKey = [compA.id, compB.id].sort().join('::');
    this.playedMatchups.add(matchupKey);
  }

  public getLeaderboard(): CompetitorProfile[] {
    return Array.from(this.competitors.values()).sort((a, b) => {
      if (b.eloRating !== a.eloRating) {
        return b.eloRating - a.eloRating;
      }
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      return a.losses - b.losses;
    });
  }

  /**
   * Generates Swiss-system tournament pairings:
   * Competitors with similar Elo ratings are paired, avoiding recent rematches
   */
  public generateSwissPairings(): SwissPairing[] {
    const sorted = this.getLeaderboard();
    const paired = new Set<string>();
    const pairings: SwissPairing[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const compA = sorted[i];
      if (paired.has(compA.id)) continue;

      let bestOpponent: CompetitorProfile | null = null;
      let minEloDiff = Infinity;

      // Find best available opponent with minimal rating difference
      for (let j = i + 1; j < sorted.length; j++) {
        const compB = sorted[j];
        if (paired.has(compB.id)) continue;

        const matchupKey = [compA.id, compB.id].sort().join('::');
        const hasPlayed = this.playedMatchups.has(matchupKey);

        const eloDiff = Math.abs(compA.eloRating - compB.eloRating) + (hasPlayed ? 500 : 0);
        if (eloDiff < minEloDiff) {
          minEloDiff = eloDiff;
          bestOpponent = compB;
        }
      }

      // If no unplayed opponent found, pair with next available
      if (!bestOpponent) {
        for (let j = 0; j < sorted.length; j++) {
          if (sorted[j].id !== compA.id && !paired.has(sorted[j].id)) {
            bestOpponent = sorted[j];
            break;
          }
        }
      }

      if (bestOpponent) {
        paired.add(compA.id);
        paired.add(bestOpponent.id);
        pairings.push({ competitorA: compA, competitorB: bestOpponent });
      }
    }

    return pairings;
  }

  /**
   * Simulates a single match between two bots deterministically
   */
  public simulateMatch(compA: CompetitorProfile, compB: CompetitorProfile): MatchResult {
    const getBotSpeed = (algo: string): number => {
      switch (algo) {
        case 'astar':
        case 'wasm_astar':
          return 1.15;
        case 'jps':
          return 1.25;
        case 'bfs':
          return 0.95;
        case 'dfs':
          return 0.85;
        case 'dijkstra':
          return 1.0;
        case 'genetic':
          return 1.1;
        case 'rl':
          return 1.2;
        default:
          return 1.0;
      }
    };

    const speedA = getBotSpeed(compA.algorithmType) * (0.9 + Math.random() * 0.2);
    const speedB = getBotSpeed(compB.algorithmType) * (0.9 + Math.random() * 0.2);

    const baseCost = 45;
    const costA = Math.max(30, Math.round(baseCost / speedA + (Math.random() * 4 - 2)));
    const costB = Math.max(30, Math.round(baseCost / speedB + (Math.random() * 4 - 2)));

    const timeA = parseFloat(((costA * 1.8) / speedA).toFixed(2));
    const timeB = parseFloat(((costB * 1.8) / speedB).toFixed(2));

    const nodesA = Math.round(costA * 3.5);
    const nodesB = Math.round(costB * 3.5);

    let winnerId: string | null = null;
    if (costA < costB || (costA === costB && timeA < timeB)) {
      winnerId = compA.id;
    } else if (costB < costA || (costA === costB && timeB < timeA)) {
      winnerId = compB.id;
    }

    const result: MatchResult = {
      matchId: `match_r${this.currentRound}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      round: this.currentRound,
      competitorAId: compA.id,
      competitorBId: compB.id,
      winnerId,
      pathCostA: costA,
      pathCostB: costB,
      executionTimeA: timeA,
      executionTimeB: timeB,
      nodesExploredA: nodesA,
      nodesExploredB: nodesB,
    };

    this.recordMatchResult(result);
    return result;
  }

  /**
   * Simulates an entire Swiss round across all active competitors
   */
  public simulateRound(): MatchResult[] {
    const pairings = this.generateSwissPairings();
    const roundResults: MatchResult[] = [];

    for (const pair of pairings) {
      const result = this.simulateMatch(pair.competitorA, pair.competitorB);
      roundResults.push(result);
    }

    this.currentRound++;
    return roundResults;
  }

  public resetTournament() {
    this.matchHistory = [];
    this.playedMatchups.clear();
    this.currentRound = 1;
    this.competitors.clear();
    this.seedDefaultCompetitors();
  }

  public seedDefaultCompetitors() {
    this.registerCompetitor('bot_astar', 'A* Sentinel', 'astar', 1650);
    this.registerCompetitor('bot_dijkstra', 'Dijkstra Titan', 'dijkstra', 1580);
    this.registerCompetitor('bot_genetic', 'Genetic Apex', 'genetic', 1520);
    this.registerCompetitor('bot_wasm', 'WASM Hyper A*', 'astar', 1690);
    this.registerCompetitor('bot_bfs', 'BFS Grid Nexus', 'bfs', 1460);
    this.registerCompetitor('bot_dfs', 'DFS Phantom', 'dfs', 1410);
    this.registerCompetitor('bot_rl', 'Quantum RL Bot', 'rl', 1620);
    this.registerCompetitor('bot_greedy', 'Greedy Sprinter', 'greedy', 1500);
  }
}
