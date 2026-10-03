"""
Database Connection & DuckDB Analytics Engine
Author: IPL Cricket Intelligence Backend Team
Description: Manages DuckDB in-memory / persistent queries over Gold Parquet analytical datasets.
"""

import os
import duckdb
import pandas as pd

GOLD_DIR = r"c:\Users\KIIT\IPL_TRACKER\data\gold"

def get_duckdb_con():
    con = duckdb.connect(database=':memory:')
    
    # Register Gold Parquet files as DuckDB views
    parquet_files = {
        'dim_player': 'dim_player.parquet',
        'dim_team': 'dim_team.parquet',
        'dim_venue': 'dim_venue.parquet',
        'dim_season': 'dim_season.parquet',
        'fact_match': r"..\silver\silver_matches.parquet",
        'fact_delivery': r"..\silver\silver_deliveries.parquet",
        'player_batting_career': 'player_batting_career.parquet',
        'player_batting_season': 'player_batting_season.parquet',
        'player_batting_phase': 'player_batting_phase.parquet',
        'player_bowling_career': 'player_bowling_career.parquet',
        'player_bowling_phase': 'player_bowling_phase.parquet',
        'team_summary': 'team_summary.parquet',
        'team_head_to_head': 'team_head_to_head.parquet',
        'team_phase': 'team_phase.parquet',
        'matchup_analytics': 'matchup_analytics.parquet',
        'scouting_candidates': 'scouting_candidates.parquet'
    }
    
    for table_name, rel_path in parquet_files.items():
        fpath = os.path.normpath(os.path.join(GOLD_DIR, rel_path))
        if os.path.exists(fpath):
            con.execute(f"CREATE VIEW {table_name} AS SELECT * FROM read_parquet('{fpath.replace('\\', '/')}')")
            
    return con
