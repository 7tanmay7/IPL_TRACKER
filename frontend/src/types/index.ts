export interface OverviewData {
  kpis: {
    total_matches: number;
    total_runs: number;
    total_wickets: number;
    total_batters: number;
    total_bowlers: number;
    total_seasons: number;
  };
  season_trends: {
    season: string;
    matches: number;
    total_runs: number;
    avg_match_runs: number;
  }[];
  phase_breakdown: {
    match_phase: string;
    runs: number;
    balls: number;
    run_rate: number;
    wickets: number;
  }[];
  top_performers: {
    batters: { player_name: string; runs: number; strike_rate: number }[];
    bowlers: { player_name: string; wickets: number; economy: number }[];
  };
}

export interface TeamSummary {
  team_name: string;
  team_short: string;
  logo_url: string;
  matches: number;
  wins: number;
  losses: number;
  win_pct: number;
  total_runs_scored: number;
  total_runs_conceded: number;
  wickets_taken: number;
}

export interface PlayerProfile {
  player_name: string;
  full_name: string;
  bat_style: string;
  bowl_style: string;
  player_image: string;
  batting?: {
    matches: number;
    runs: number;
    balls: number;
    strike_rate: number;
    batting_average: number;
    fours: number;
    sixes: number;
    consistency_score: number;
  };
  bowling?: {
    matches: number;
    overs: number;
    runs_conceded: number;
    wickets: number;
    economy: number;
    bowling_strike_rate: number;
  };
  season_trends: any[];
  phase_breakdown: any[];
  opposition_breakdown: any[];
}

export interface MatchupData {
  batter: string;
  bowler: string;
  matches?: number;
  balls?: number;
  runs?: number;
  fours?: number;
  sixes?: number;
  dots?: number;
  dismissals?: number;
  strike_rate?: number;
  dot_pct?: number;
  boundary_pct?: number;
  sample_sufficient?: boolean;
  has_data: boolean;
  message?: string;
  sample_warning?: boolean;
}

export interface ScoutingCandidate {
  player_name: string;
  bat_style: string;
  bowl_style: string;
  player_image: string;
  matches: number;
  runs: number;
  balls: number;
  strike_rate: number;
  batting_average: number;
  death_sr: number;
  powerplay_sr: number;
  consistency_score: number;
  scouting_score: number;
}
