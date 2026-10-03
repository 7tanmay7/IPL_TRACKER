"""
Matchup Intelligence Service
"""
import duckdb

def get_matchup_data(con: duckdb.DuckDBPyConnection, batter: str, bowler: str):
    res = con.execute(f"""
        SELECT 
            batter,
            bowler,
            matches,
            balls,
            runs,
            fours,
            sixes,
            dots,
            dismissals,
            ROUND(strike_rate, 2) AS strike_rate,
            ROUND(dot_pct, 2) AS dot_pct,
            ROUND(boundary_pct, 2) AS boundary_pct,
            sample_sufficient
        FROM matchup_analytics
        WHERE batter = '{batter}' AND bowler = '{bowler}'
    """).fetchdf().to_dict(orient='records')
    
    if not res:
        # Check if they ever played in the same match
        return {
            "batter": batter,
            "bowler": bowler,
            "has_data": False,
            "message": f"No historical head-to-head deliveries recorded between {batter} and {bowler} in IPL history."
        }
    
    matchup_info = res[0]
    matchup_info["has_data"] = True
    matchup_info["sample_warning"] = not matchup_info["sample_sufficient"]
    return matchup_info
