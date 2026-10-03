"""
Opposition Intelligence Service
"""
import duckdb

def get_opposition_analysis(con: duckdb.DuckDBPyConnection, opponent_team: str):
    # Overall record
    summary = con.execute(f"SELECT * FROM team_summary WHERE team_name = '{opponent_team}'").fetchdf().to_dict(orient='records')
    if not summary:
        return None
    summary_data = summary[0]
    
    # Top run-scorers against opponent
    top_opp_batters = con.execute(f"""
        SELECT batter AS player_name, SUM(batter_runs) AS runs, COUNT(CASE WHEN is_legal = TRUE THEN 1 END) AS balls, ROUND(SUM(batter_runs) * 100.0 / COUNT(CASE WHEN is_legal = TRUE THEN 1 END), 1) AS strike_rate
        FROM fact_delivery
        WHERE bowling_team = '{opponent_team}'
        GROUP BY batter
        ORDER BY runs DESC
        LIMIT 5
    """).fetchdf().to_dict(orient='records')
    
    # Top wicket-takers against opponent
    top_opp_bowlers = con.execute(f"""
        SELECT bowler AS player_name, COUNT(CASE WHEN is_wicket = TRUE THEN 1 END) AS wickets, ROUND(SUM(total_runs - legbyes - byes) / (COUNT(CASE WHEN is_legal = TRUE THEN 1 END) / 6.0), 2) AS economy
        FROM fact_delivery
        WHERE batting_team = '{opponent_team}'
        GROUP BY bowler
        HAVING COUNT(CASE WHEN is_legal = TRUE THEN 1 END) >= 30
        ORDER BY wickets DESC
        LIMIT 5
    """).fetchdf().to_dict(orient='records')
    
    # Phase vulnerability of opponent (Batting run rate & Bowling economy by phase)
    opp_bat_phase = con.execute(f"""
        SELECT match_phase, round(run_rate, 2) AS bat_run_rate, wickets AS wickets_lost
        FROM team_phase
        WHERE batting_team = '{opponent_team}'
        ORDER BY CASE match_phase WHEN 'Powerplay' THEN 1 WHEN 'Middle Overs' THEN 2 ELSE 3 END
    """).fetchdf().to_dict(orient='records')
    
    return {
        "opponent": opponent_team,
        "summary": summary_data,
        "top_opposing_batters": top_opp_batters,
        "top_opposing_bowlers": top_opp_bowlers,
        "phase_patterns": opp_bat_phase,
        "tactical_observations": [
            f"{opponent_team} exhibits an average win rate of {summary_data['win_pct']}% across historical IPL matches.",
            f"Powerplay scoring average is {next((p['bat_run_rate'] for p in opp_bat_phase if p['match_phase'] == 'Powerplay'), 0.0)} RPO.",
            f"Death-overs scoring average is {next((p['bat_run_rate'] for p in opp_bat_phase if p['match_phase'] == 'Death Overs'), 0.0)} RPO."
        ]
    }
