"""
Databricks PySpark Pipeline - Stage 06: Matchup Intelligence Engine
Author: IPL Cricket Intelligence Data Engineering Team
Description: Computes direct Batter vs Bowler head-to-head metrics (runs, balls faced, SR, dismissals, dot %, boundary %).
"""

import os
import pandas as pd
import numpy as np

def build_matchup_analytics(silver_dir: str, gold_dir: str):
    print("=== STAGE 06: MATCHUP INTELLIGENCE ENGINE ===")
    os.makedirs(gold_dir, exist_ok=True)
    
    df_deliveries = pd.read_parquet(os.path.join(silver_dir, "silver_deliveries.parquet"))
    
    matchup = df_deliveries.groupby(['batter', 'bowler']).agg(
        matches=('match_id', 'nunique'),
        balls=('is_legal', 'sum'),
        runs=('batter_runs', 'sum'),
        fours=('is_four', 'sum'),
        sixes=('is_six', 'sum'),
        dots=('is_dot', 'sum'),
        dismissals=('is_wicket', lambda w: (w & (df_deliveries.loc[w.index, 'player_dismissed'] == df_deliveries.loc[w.index, 'batter'])).sum())
    ).reset_index()
    
    matchup['strike_rate'] = np.where(matchup['balls'] > 0, (matchup['runs'] / matchup['balls']) * 100.0, 0.0)
    matchup['dot_pct'] = np.where(matchup['balls'] > 0, (matchup['dots'] / matchup['balls']) * 100.0, 0.0)
    matchup['boundary_pct'] = np.where(matchup['balls'] > 0, ((matchup['fours'] + matchup['sixes']) / matchup['balls']) * 100.0, 0.0)
    matchup['sample_sufficient'] = matchup['balls'] >= 10 # Sample size threshold indicator
    
    matchup.to_parquet(os.path.join(gold_dir, "matchup_analytics.parquet"), index=False)
    print(f"Matchup analytics complete: {len(matchup)} batter-bowler pair records saved.")

if __name__ == "__main__":
    silver_path = r"c:\Users\KIIT\IPL_TRACKER\data\silver"
    gold_path = r"c:\Users\KIIT\IPL_TRACKER\data\gold"
    build_matchup_analytics(silver_path, gold_path)
