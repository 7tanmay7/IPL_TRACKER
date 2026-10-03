"""
Team Intelligence Service
"""
import duckdb

def get_teams_list(con: duckdb.DuckDBPyConnection):
    return con.execute("""
        SELECT 
            t.team_name,
            COALESCE(d.team_name_short, REPLACE(t.team_name, ' ', '')) AS team_short,
            COALESCE(d.image_url, '') AS logo_url,
            t.matches,
            t.wins,
            t.losses,
            t.win_pct,
            t.total_runs_scored,
            t.total_runs_conceded,
            t.wickets_taken
        FROM team_summary t
        LEFT JOIN dim_team d ON t.team_name = d.team_name
        ORDER BY t.win_pct DESC
    """).fetchdf().to_dict(orient='records')

def get_team_detail(con: duckdb.DuckDBPyConnection, team_name: str):
    summary = con.execute(f"SELECT * FROM team_summary WHERE team_name = '{team_name}'").fetchdf().to_dict(orient='records')
    if not summary:
        return None
    summary_data = summary[0]
    
    # Head to Head records
    h2h = con.execute(f"""
        SELECT 
            CASE WHEN team1 = '{team_name}' THEN team2 ELSE team1 END AS opponent,
            SUM(total_matches) AS matches,
            SUM(CASE WHEN team1 = '{team_name}' THEN team1_wins ELSE team2_wins END) AS wins,
            SUM(CASE WHEN team1 = '{team_name}' THEN team2_wins ELSE team1_wins END) AS losses
        FROM team_head_to_head
        WHERE team1 = '{team_name}' OR team2 = '{team_name}'
        GROUP BY opponent
        ORDER BY matches DESC
    """).fetchdf().to_dict(orient='records')
    
    # Phase performance
    phase = con.execute(f"""
        SELECT match_phase, runs, legal_balls, round(run_rate, 2) AS run_rate, wickets, fours, sixes, dots
        FROM team_phase
        WHERE batting_team = '{team_name}'
        ORDER BY CASE match_phase WHEN 'Powerplay' THEN 1 WHEN 'Middle Overs' THEN 2 ELSE 3 END
    """).fetchdf().to_dict(orient='records')
    
    # Top batters & bowlers for team
    top_batters = con.execute(f"""
        SELECT batter AS player_name, SUM(batter_runs) AS runs, ROUND(SUM(batter_runs) * 100.0 / COUNT(CASE WHEN is_legal = TRUE THEN 1 END), 1) AS strike_rate
        FROM fact_delivery
        WHERE batting_team = '{team_name}'
        GROUP BY batter
        ORDER BY runs DESC
        LIMIT 5
    """).fetchdf().to_dict(orient='records')
    
    top_bowlers = con.execute(f"""
        SELECT bowler AS player_name, COUNT(CASE WHEN is_wicket = TRUE THEN 1 END) AS wickets, ROUND(SUM(total_runs - legbyes - byes) / (COUNT(CASE WHEN is_legal = TRUE THEN 1 END) / 6.0), 2) AS economy
        FROM fact_delivery
        WHERE bowling_team = '{team_name}'
        GROUP BY bowler
        HAVING COUNT(CASE WHEN is_legal = TRUE THEN 1 END) >= 30
        ORDER BY wickets DESC
        LIMIT 5
    """).fetchdf().to_dict(orient='records')
    
    return {
        "summary": summary_data,
        "head_to_head": h2h,
        "phase_performance": phase,
        "top_batters": top_batters,
        "top_bowlers": top_bowlers
    }
