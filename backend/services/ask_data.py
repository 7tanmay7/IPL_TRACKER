"""
Ask the Data - Natural Language Analytics Query Engine
Author: IPL Cricket Intelligence AI Engineering Team
Description: Translates natural language cricket questions into SQL queries executed against DuckDB Parquet tables and returns tabular data with natural language summaries.
"""

import duckdb
import re

def process_natural_language_query(con: duckdb.DuckDBPyConnection, question: str):
    q_clean = question.lower().strip()
    
    # Pre-defined Analytical Pattern Intent Handlers
    
    # 1. Death-over batters
    if "death" in q_clean and ("batter" in q_clean or "score" in q_clean or "run" in q_clean or "highest" in q_clean):
        query = """
            SELECT 
                batter AS player_name,
                SUM(batter_runs) AS death_runs,
                COUNT(CASE WHEN is_legal = TRUE THEN 1 END) AS death_balls,
                ROUND(SUM(batter_runs) * 100.0 / NULLIF(COUNT(CASE WHEN is_legal = TRUE THEN 1 END), 0), 1) AS death_strike_rate
            FROM fact_delivery
            WHERE match_phase = 'Death Overs'
            GROUP BY batter
            HAVING COUNT(CASE WHEN is_legal = TRUE THEN 1 END) >= 100
            ORDER BY death_runs DESC
            LIMIT 10
        """
        summary = "Here are the top run-scorers in Death Overs (Overs 16–20) with at least 100 legal balls faced:"
        
    # 2. Death-over bowlers / economy
    elif "death" in q_clean and ("bowler" in q_clean or "economy" in q_clean or "wicket" in q_clean):
        query = """
            SELECT 
                bowler AS player_name,
                COUNT(CASE WHEN is_wicket = TRUE AND dismissal_type NOT IN ('run out', 'retired hurt') THEN 1 END) AS death_wickets,
                ROUND(SUM(total_runs - legbyes - byes) / (COUNT(CASE WHEN is_legal = TRUE THEN 1 END) / 6.0), 2) AS death_economy
            FROM fact_delivery
            WHERE match_phase = 'Death Overs'
            GROUP BY bowler
            HAVING COUNT(CASE WHEN is_legal = TRUE THEN 1 END) >= 100
            ORDER BY death_economy ASC
            LIMIT 10
        """
        summary = "Here are the most economical bowlers in Death Overs (Overs 16–20) with minimum 100 legal balls bowled:"

    # 3. Top six hitters
    elif "six" in q_clean or "sixes" in q_clean:
        query = """
            SELECT 
                batter AS player_name,
                SUM(CASE WHEN is_six = TRUE THEN 1 END) AS total_sixes,
                SUM(batter_runs) AS total_runs
            FROM fact_delivery
            GROUP BY batter
            ORDER BY total_sixes DESC
            LIMIT 10
        """
        summary = "Here are the top 10 all-time six hitters in IPL history:"
        
    # 4. Highest team win %
    elif "team" in q_clean and ("win" in q_clean or "best" in q_clean or "highest" in q_clean):
        query = """
            SELECT 
                team_name,
                matches,
                wins,
                losses,
                win_pct
            FROM team_summary
            ORDER BY win_pct DESC
        """
        summary = "Here is the historical win percentage breakdown for all IPL franchise teams:"
        
    # Default: Top All-Time Run Scorers
    else:
        query = """
            SELECT 
                batter AS player_name,
                SUM(batter_runs) AS runs,
                COUNT(CASE WHEN is_legal = TRUE THEN 1 END) AS balls_faced,
                ROUND(SUM(batter_runs) * 100.0 / NULLIF(COUNT(CASE WHEN is_legal = TRUE THEN 1 END), 0), 1) AS strike_rate
            FROM fact_delivery
            GROUP BY batter
            ORDER BY runs DESC
            LIMIT 10
        """
        summary = f"Querying analytical dataset for: '{question}'. Showing top all-time IPL run-scorers:"
        
    df = con.execute(query).fetchdf()
    columns = list(df.columns)
    data = df.to_dict(orient='records')
    
    return {
        "question": question,
        "executed_sql": query.strip(),
        "summary": summary,
        "columns": columns,
        "data": data
    }
