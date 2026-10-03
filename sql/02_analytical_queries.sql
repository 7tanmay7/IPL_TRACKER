-- ====================================================================
-- IPL Cricket Intelligence Platform - Production SQL Analytics Queries
-- Author: Senior Sports Data Analyst
-- ====================================================================

-- Query 1: Top 10 All-Time Highest Run Scorers with Average & Strike Rate (Min 500 Balls)
WITH batter_stats AS (
    SELECT 
        batter,
        COUNT(DISTINCT match_id) AS matches,
        SUM(batter_runs) AS total_runs,
        COUNT(CASE WHEN is_legal = TRUE THEN 1 END) AS balls_faced,
        SUM(CASE WHEN is_four = TRUE THEN 1 END) AS fours,
        SUM(CASE WHEN is_six = TRUE THEN 1 END) AS sixes,
        SUM(CASE WHEN is_wicket = TRUE AND player_dismissed = batter THEN 1 END) AS dismissals
    FROM fact_delivery
    GROUP BY batter
)
SELECT 
    batter,
    matches,
    total_runs,
    balls_faced,
    ROUND((total_runs * 100.0 / NULLIF(balls_faced, 0)), 2) AS strike_rate,
    ROUND((total_runs * 1.0 / NULLIF(dismissals, 0)), 2) AS batting_average,
    fours,
    sixes,
    ROUND(((fours * 4 + sixes * 6) * 100.0 / NULLIF(total_runs, 0)), 2) AS boundary_run_pct
FROM batter_stats
WHERE balls_faced >= 500
ORDER BY total_runs DESC
LIMIT 10;

-- Query 2: Death-Over Specialist Bowlers (Overs 16-20, Min 100 Legal Balls)
WITH death_bowling AS (
    SELECT 
        bowler,
        COUNT(CASE WHEN is_legal = TRUE THEN 1 END) AS death_balls,
        SUM(total_runs - legbyes - byes) AS runs_conceded,
        SUM(CASE WHEN is_wicket = TRUE AND dismissal_type NOT IN ('run out', 'retired hurt', 'obstructing the field') THEN 1 END) AS wickets,
        SUM(CASE WHEN is_dot = TRUE THEN 1 END) AS dot_balls
    FROM fact_delivery
    WHERE match_phase = 'Death Overs'
    GROUP BY bowler
)
SELECT 
    bowler,
    ROUND(death_balls / 6.0, 1) AS overs,
    runs_conceded,
    wickets,
    ROUND(runs_conceded / (death_balls / 6.0), 2) AS death_economy,
    ROUND(death_balls * 1.0 / NULLIF(wickets, 0), 2) AS bowling_strike_rate,
    ROUND(dot_balls * 100.0 / NULLIF(death_balls, 0), 2) AS dot_ball_pct
FROM death_bowling
WHERE death_balls >= 100
ORDER BY death_economy ASC
LIMIT 10;

-- Query 3: Batter vs Bowler Head-to-Head Matchup Matrix
SELECT 
    batter,
    bowler,
    COUNT(CASE WHEN is_legal = TRUE THEN 1 END) AS balls_faced,
    SUM(batter_runs) AS runs_scored,
    SUM(CASE WHEN is_wicket = TRUE AND player_dismissed = batter THEN 1 END) AS dismissals,
    ROUND(SUM(batter_runs) * 100.0 / NULLIF(COUNT(CASE WHEN is_legal = TRUE THEN 1 END), 0), 2) AS strike_rate,
    SUM(CASE WHEN is_dot = TRUE THEN 1 END) AS dot_balls
FROM fact_delivery
WHERE batter = 'V Kohli' AND bowler = 'JJ Bumrah'
GROUP BY batter, bowler;
