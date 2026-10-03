const BASE_URL = '/api';

export async function fetchOverview(season?: string) {
  const url = season ? `${BASE_URL}/overview?season=${encodeURIComponent(season)}` : `${BASE_URL}/overview`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch overview data');
  return res.json();
}

export async function fetchTeams() {
  const res = await fetch(`${BASE_URL}/teams`);
  if (!res.ok) throw new Error('Failed to fetch teams list');
  return res.json();
}

export async function fetchTeamDetail(teamName: string) {
  const res = await fetch(`${BASE_URL}/teams/${encodeURIComponent(teamName)}`);
  if (!res.ok) throw new Error('Failed to fetch team detail');
  return res.json();
}

export async function fetchPlayers() {
  const res = await fetch(`${BASE_URL}/players`);
  if (!res.ok) throw new Error('Failed to fetch players list');
  return res.json();
}

export async function fetchPlayerDetail(playerName: string) {
  const res = await fetch(`${BASE_URL}/players/${encodeURIComponent(playerName)}`);
  if (!res.ok) throw new Error('Failed to fetch player profile');
  return res.json();
}

export async function fetchMatchup(batter: string, bowler: string) {
  const res = await fetch(`${BASE_URL}/matchups?batter=${encodeURIComponent(batter)}&bowler=${encodeURIComponent(bowler)}`);
  if (!res.ok) throw new Error('Failed to fetch matchup');
  return res.json();
}

export async function fetchOpposition(teamName: string) {
  const res = await fetch(`${BASE_URL}/opposition/${encodeURIComponent(teamName)}`);
  if (!res.ok) throw new Error('Failed to fetch opposition analysis');
  return res.json();
}

export async function fetchScouting(weights: any, minBalls: number = 50) {
  const res = await fetch(`${BASE_URL}/scouting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weights, min_balls: minBalls, role: 'All' })
  });
  if (!res.ok) throw new Error('Failed to compute scouting matrix');
  return res.json();
}

export async function fetchDataQuality() {
  const res = await fetch(`${BASE_URL}/data-quality`);
  if (!res.ok) throw new Error('Failed to fetch data quality audit');
  return res.json();
}

export async function askDataQuestion(question: string) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  if (!res.ok) throw new Error('Failed to process natural language query');
  return res.json();
}
