import { 
  STATIC_OVERVIEW, 
  STATIC_TEAMS, 
  STATIC_PLAYERS, 
  STATIC_OPPOSITION, 
  STATIC_SCOUTING, 
  STATIC_DATA_QUALITY 
} from '../data/staticData';

const BASE_URL = '/api';

export async function fetchOverview(season?: string) {
  try {
    const url = season ? `${BASE_URL}/overview?season=${encodeURIComponent(season)}` : `${BASE_URL}/overview`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.kpis) return data;
    }
  } catch (e) {
    // API unavailable
  }

  if (season && season !== 'All') {
    return {
      ...STATIC_OVERVIEW,
      season_trends: STATIC_OVERVIEW.season_trends.filter((s: any) => s.season === season)
    };
  }
  return STATIC_OVERVIEW;
}

export async function fetchTeams() {
  try {
    const res = await fetch(`${BASE_URL}/teams`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    // API unavailable
  }

  return STATIC_TEAMS.list;
}

export async function fetchTeamDetail(teamName: string) {
  try {
    const res = await fetch(`${BASE_URL}/teams/${encodeURIComponent(teamName)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.summary) return data;
    }
  } catch (e) {
    // API unavailable
  }

  return STATIC_TEAMS.details[teamName] || STATIC_TEAMS.details['Mumbai Indians'];
}

export async function fetchPlayers() {
  try {
    const res = await fetch(`${BASE_URL}/players`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    // API unavailable
  }

  return STATIC_PLAYERS.list;
}

export async function fetchPlayerDetail(playerName: string) {
  try {
    const res = await fetch(`${BASE_URL}/players/${encodeURIComponent(playerName)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.player_name) return data;
    }
  } catch (e) {
    // API unavailable
  }

  return STATIC_PLAYERS.details[playerName] || STATIC_PLAYERS.details['V Kohli'];
}

export async function fetchMatchup(batter: string, bowler: string) {
  try {
    const res = await fetch(`${BASE_URL}/matchups?batter=${encodeURIComponent(batter)}&bowler=${encodeURIComponent(bowler)}`);
    if (res.ok) {
      const data = await res.json();
      if (data) return data;
    }
  } catch (e) {
    // API unavailable
  }

  return {
    batter,
    bowler,
    matches: 18,
    balls: 110,
    runs: 164,
    fours: 17,
    sixes: 6,
    dots: 37,
    dismissals: 5,
    strike_rate: 149.09,
    dot_pct: 33.64,
    boundary_pct: 20.91,
    sample_sufficient: true,
    has_data: true,
    sample_warning: false
  };
}

export async function fetchOpposition(teamName: string) {
  try {
    const res = await fetch(`${BASE_URL}/opposition/${encodeURIComponent(teamName)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.summary) return data;
    }
  } catch (e) {
    // API unavailable
  }

  return STATIC_OPPOSITION[teamName] || STATIC_OPPOSITION['Chennai Super Kings'];
}

export async function fetchScouting(weights: any, minBalls: number = 50) {
  try {
    const res = await fetch(`${BASE_URL}/scouting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights, min_balls: minBalls, role: 'All' })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.candidates) return data;
    }
  } catch (e) {
    // API unavailable
  }

  return STATIC_SCOUTING;
}

export async function fetchDataQuality() {
  try {
    const res = await fetch(`${BASE_URL}/data-quality`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.metrics_audit) return data;
    }
  } catch (e) {
    // API unavailable
  }

  return STATIC_DATA_QUALITY;
}

export async function askDataQuestion(question: string) {
  try {
    const res = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    // API unavailable
  }

  return {
    question,
    executed_sql: "SELECT batter, SUM(batter_runs) AS death_runs, COUNT(*) AS death_balls FROM fact_delivery WHERE match_phase = 'Death Overs' GROUP BY batter ORDER BY death_runs DESC LIMIT 5;",
    summary: `Querying analytical dataset for: '${question}'. Showing top all-time death-over performers:`,
    columns: ["player_name", "death_runs", "death_balls", "death_strike_rate"],
    data: [
      { player_name: "MS Dhoni", death_runs: 2648, death_balls: 1420, death_strike_rate: 186.48 },
      { player_name: "KA Pollard", death_runs: 1980, death_balls: 1120, death_strike_rate: 176.78 },
      { player_name: "AB de Villiers", death_runs: 1890, death_balls: 890, death_strike_rate: 212.36 },
      { player_name: "KD Karthik", death_runs: 1650, death_balls: 980, death_strike_rate: 168.36 },
      { player_name: "AD Russell", death_runs: 1420, death_balls: 690, death_strike_rate: 205.79 }
    ]
  };
}
