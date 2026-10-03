"""
Overview Intelligence Service
"""
import duckdb

def get_overview_data(con: duckdb.DuckDBPyConnection, season_filter: str = None):
    where_match = f"WHERE m.season_clean = '{season_filter}'" if season_filter and season_filter != 'All' else ""
    where_del = f"WHERE d.match_id IN (SELECT match_id FROM fact_match WHERE season_clean = '{season_filter}')" if season_filter and season_filter != 'All' else ""
    
    kpis = con.execute(f"""
        SELECT 
            COUNT(DISTINCT d.match_id) AS total_matches,
            COALESCE(SUM(d.total_runs), 0) AS total_runs,
            COALESCE(SUM(CASE WHEN d.is_wicket = TRUE THEN 1 END), 0) AS total_wickets,
            COUNT(DISTINCT d.batter) AS total_batters,
            COUNT(DISTINCT d.bowler) AS total_bowlers
        FROM fact_delivery d
        {where_del}
    """).fetchdf().to_dict(orient='records')[0]
    
    seasons_cnt = con.execute("SELECT COUNT(DISTINCT season_year) FROM dim_season").fetchone()[0]
    kpis['total_seasons'] = seasons_cnt
    
    season_trends = con.execute(f"""
        SELECT 
            m.season_clean AS season,
            COUNT(DISTINCT d.match_id) AS matches,
            SUM(d.total_runs) AS total_runs,
            ROUND(SUM(d.total_runs) * 1.0 / NULLIF(COUNT(DISTINCT d.match_id), 0), 1) AS avg_match_runs
        FROM fact_delivery d
        JOIN fact_match m ON d.match_id = m.match_id
        {where_match}
        GROUP BY m.season_clean
        ORDER BY m.season_clean ASC
    """).fetchdf().to_dict(orient='records')
    
    phase_breakdown = con.execute(f"""
        SELECT 
            d.match_phase,
            SUM(d.total_runs) AS runs,
            COUNT(CASE WHEN d.is_legal = TRUE THEN 1 END) AS balls,
            ROUND(SUM(d.total_runs) / (COUNT(CASE WHEN d.is_legal = TRUE THEN 1 END) / 6.0), 2) AS run_rate,
            COUNT(CASE WHEN d.is_wicket = TRUE THEN 1 END) AS wickets
        FROM fact_delivery d
        {where_del}
        GROUP BY d.match_phase
        ORDER BY CASE d.match_phase WHEN 'Powerplay' THEN 1 WHEN 'Middle Overs' THEN 2 ELSE 3 END
    """).fetchdf().to_dict(orient='records')
    
    top_batters = con.execute(f"""
        SELECT d.batter AS player_name, SUM(d.batter_runs) AS runs, ROUND(SUM(d.batter_runs) * 100.0 / COUNT(CASE WHEN d.is_legal = TRUE THEN 1 END), 1) AS strike_rate
        FROM fact_delivery d
        {where_del}
        GROUP BY d.batter
        ORDER BY runs DESC
        LIMIT 5
    """).fetchdf().to_dict(orient='records')
    
    top_bowlers = con.execute(f"""
        SELECT d.bowler AS player_name, COUNT(CASE WHEN d.is_wicket = TRUE THEN 1 END) AS wickets, ROUND(SUM(d.total_runs - d.legbyes - d.byes) / (COUNT(CASE WHEN d.is_legal = TRUE THEN 1 END) / 6.0), 2) AS economy
        FROM fact_delivery d
        {where_del}
        GROUP BY d.bowler
        HAVING COUNT(CASE WHEN d.is_legal = TRUE THEN 1 END) >= 30
        ORDER BY wickets DESC
        LIMIT 5
    """).fetchdf().to_dict(orient='records')
    
    return {
        "kpis": kpis,
        "season_trends": season_trends,
        "phase_breakdown": phase_breakdown,
        "top_performers": {
            "batters": top_batters,
            "bowlers": top_bowlers
        }
    }
