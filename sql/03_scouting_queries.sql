-- ====================================================================
-- IPL Cricket Intelligence Platform - Scouting & Recruitment Queries
-- Author: Franchise Recruitment & Scouting Lead
-- ====================================================================

-- Query: Identify Death-Over Hitting Targets with High Consistency
-- Filters: Min 100 Balls Faced overall, Min 30 Death-Over Balls Faced
WITH player_scouting AS (
    SELECT 
        b.batter AS player_name,
        b.matches,
        b.runs AS total_runs,
        b.strike_rate AS overall_sr,
        b.batting_average AS overall_avg,
        b.consistency_score,
        COALESCE(p_death.strike_rate, 0.0) AS death_sr,
        COALESCE(p_death.balls, 0) AS death_balls_faced,
        COALESCE(p_pp.strike_rate, 0.0) AS powerplay_sr
    FROM player_batting_career b
    LEFT JOIN player_batting_phase p_death 
        ON b.batter = p_death.batter AND p_death.match_phase = 'Death Overs'
    LEFT JOIN player_batting_phase p_pp 
        ON b.batter = p_pp.batter AND p_pp.match_phase = 'Powerplay'
    WHERE b.balls >= 100
)
SELECT 
    player_name,
    matches,
    total_runs,
    overall_sr,
    overall_avg,
    death_sr,
    consistency_score,
    -- Composite Analytical Score (30% Run Prod, 25% SR, 20% Consistency, 15% Death SR, 10% PP SR)
    ROUND(
        (total_runs * 0.30 / 5.0) + 
        (overall_sr * 0.25) + 
        (consistency_score * 0.20) + 
        (death_sr * 0.15) + 
        (powerplay_sr * 0.10), 
    2) AS composite_scouting_score
FROM player_scouting
WHERE death_balls_faced >= 30
ORDER BY composite_scouting_score DESC
LIMIT 15;
