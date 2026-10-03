"""
Player Intelligence Service
"""
import duckdb

def get_players_list(con: duckdb.DuckDBPyConnection):
    return con.execute("""
        SELECT 
            p.player_name,
            COALESCE(p.player_full_name, p.player_name) AS full_name,
            COALESCE(p.bat_style, 'Right hand Bat') AS bat_style,
            COALESCE(p.bowl_style, 'Right arm Medium') AS bowl_style,
            COALESCE(p.player_image, '') AS player_image,
            COALESCE(b.runs, 0) AS total_runs,
            COALESCE(b.strike_rate, 0.0) AS strike_rate,
            COALESCE(b.batting_average, 0.0) AS batting_average,
            COALESCE(w.wickets, 0) AS total_wickets,
            COALESCE(w.economy, 0.0) AS economy,
            COALESCE(b.matches, w.matches, 0) AS matches
        FROM dim_player p
        LEFT JOIN player_batting_career b ON p.player_name = b.batter
        LEFT JOIN player_bowling_career w ON p.player_name = w.bowler
        ORDER BY COALESCE(b.runs, 0) DESC
    """).fetchdf().to_dict(orient='records')

def get_player_detail(con: duckdb.DuckDBPyConnection, player_name: str):
    profile = con.execute(f"""
        SELECT 
            p.player_name,
            COALESCE(p.player_full_name, p.player_name) AS full_name,
            COALESCE(p.bat_style, 'Right hand Bat') AS bat_style,
            COALESCE(p.bowl_style, 'Right arm Medium') AS bowl_style,
            COALESCE(p.player_image, '') AS player_image
        FROM dim_player p
        WHERE p.player_name = '{player_name}'
    """).fetchdf().to_dict(orient='records')
    
    if not profile:
        return None
    player_data = profile[0]
    
    # Batting Career
    bat_career = con.execute(f"SELECT * FROM player_batting_career WHERE batter = '{player_name}'").fetchdf().to_dict(orient='records')
    player_data['batting'] = bat_career[0] if bat_career else None
    
    # Bowling Career
    bowl_career = con.execute(f"SELECT * FROM player_bowling_career WHERE bowler = '{player_name}'").fetchdf().to_dict(orient='records')
    player_data['bowling'] = bowl_career[0] if bowl_career else None
    
    # Season Trend
    season_bat = con.execute(f"""
        SELECT season_clean AS season, matches, runs, balls, strike_rate, batting_average, fours, sixes
        FROM player_batting_season
        WHERE batter = '{player_name}'
        ORDER BY season ASC
    """).fetchdf().to_dict(orient='records')
    player_data['season_trends'] = season_bat
    
    # Phase Breakdown
    phase_bat = con.execute(f"""
        SELECT match_phase, runs, balls, strike_rate, average, fours, sixes
        FROM player_batting_phase
        WHERE batter = '{player_name}'
        ORDER BY CASE match_phase WHEN 'Powerplay' THEN 1 WHEN 'Middle Overs' THEN 2 ELSE 3 END
    """).fetchdf().to_dict(orient='records')
    player_data['phase_breakdown'] = phase_bat
    
    # Opposition Breakdown
    opp_bat = con.execute(f"""
        SELECT bowling_team AS opponent, SUM(batter_runs) AS runs, COUNT(CASE WHEN is_legal = TRUE THEN 1 END) AS balls, ROUND(SUM(batter_runs) * 100.0 / COUNT(CASE WHEN is_legal = TRUE THEN 1 END), 1) AS strike_rate
        FROM fact_delivery
        WHERE batter = '{player_name}'
        GROUP BY bowling_team
        ORDER BY runs DESC
    """).fetchdf().to_dict(orient='records')
    player_data['opposition_breakdown'] = opp_bat
    
    return player_data
