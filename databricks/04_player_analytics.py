"""
Databricks PySpark Pipeline - Stage 04: Player Analytics Engine
Author: IPL Cricket Intelligence Data Engineering Team
Description: Computes player batting/bowling career & season metrics, phase metrics, and consistency index.
"""

import os
import pandas as pd
import numpy as np

def build_player_analytics(silver_dir: str, gold_dir: str):
    print("=== STAGE 04: PLAYER ANALYTICS ENGINE ===")
    os.makedirs(gold_dir, exist_ok=True)
    
    df_matches = pd.read_parquet(os.path.join(silver_dir, "silver_matches.parquet"))
    df_deliveries = pd.read_parquet(os.path.join(silver_dir, "silver_deliveries.parquet"))
    
    # Merge season into deliveries
    m_season = df_matches[['match_id', 'season_clean', 'venue']].copy()
    df_del_merged = df_deliveries.merge(m_season, on='match_id', how='left')
    
    # --- BATTING ANALYTICS ---
    print("Computing Batting Analytics...")
    # Group by Batter + Season
    bat_season = df_del_merged.groupby(['batter', 'season_clean']).agg(
        matches=('match_id', 'nunique'),
        runs=('batter_runs', 'sum'),
        balls=('is_legal', lambda x: (x == True).sum()), # Balls faced = legal deliveries faced
        fours=('is_four', 'sum'),
        sixes=('is_six', 'sum'),
        dots=('is_dot', 'sum'),
        dismissals=('is_wicket', lambda w: (w & (df_del_merged.loc[w.index, 'player_dismissed'] == df_del_merged.loc[w.index, 'batter'])).sum())
    ).reset_index()
    
    bat_season['strike_rate'] = np.where(bat_season['balls'] > 0, (bat_season['runs'] / bat_season['balls']) * 100.0, 0.0)
    bat_season['batting_average'] = np.where(bat_season['dismissals'] > 0, bat_season['runs'] / bat_season['dismissals'], bat_season['runs'])
    bat_season['boundary_pct'] = np.where(bat_season['balls'] > 0, ((bat_season['fours'] + bat_season['sixes']) / bat_season['balls']) * 100.0, 0.0)
    bat_season['dot_pct'] = np.where(bat_season['balls'] > 0, (bat_season['dots'] / bat_season['balls']) * 100.0, 0.0)
    
    # Batting Career Aggregates
    bat_career = df_del_merged.groupby('batter').agg(
        matches=('match_id', 'nunique'),
        runs=('batter_runs', 'sum'),
        balls=('is_legal', lambda x: (x == True).sum()),
        fours=('is_four', 'sum'),
        sixes=('is_six', 'sum'),
        dots=('is_dot', 'sum'),
        dismissals=('is_wicket', lambda w: (w & (df_del_merged.loc[w.index, 'player_dismissed'] == df_del_merged.loc[w.index, 'batter'])).sum())
    ).reset_index()
    
    bat_career['strike_rate'] = np.where(bat_career['balls'] > 0, (bat_career['runs'] / bat_career['balls']) * 100.0, 0.0)
    bat_career['batting_average'] = np.where(bat_career['dismissals'] > 0, bat_career['runs'] / bat_career['dismissals'], bat_career['runs'])
    bat_career['boundary_pct'] = np.where(bat_career['balls'] > 0, ((bat_career['fours'] + bat_career['sixes']) / bat_career['balls']) * 100.0, 0.0)
    bat_career['dot_pct'] = np.where(bat_career['balls'] > 0, (bat_career['dots'] / bat_career['balls']) * 100.0, 0.0)
    
    # Consistency Score (Inverse of StdDev of Match Runs normalized by Mean Runs, higher = more consistent)
    match_bat_runs = df_del_merged.groupby(['batter', 'match_id'])['batter_runs'].sum().reset_index()
    consistency = match_bat_runs.groupby('batter')['batter_runs'].agg(['mean', 'std']).reset_index()
    consistency['consistency_score'] = np.where(
        (consistency['std'] > 0) & (consistency['mean'] > 5),
        np.clip(100.0 - (consistency['std'] / consistency['mean']) * 30.0, 10.0, 99.0),
        50.0
    )
    bat_career = bat_career.merge(consistency[['batter', 'consistency_score']], on='batter', how='left').fillna({'consistency_score': 50.0})

    # --- BOWLING ANALYTICS ---
    print("Computing Bowling Analytics...")
    bowl_career = df_del_merged.groupby('bowler').agg(
        matches=('match_id', 'nunique'),
        balls=('is_legal', lambda x: (x == True).sum()),
        runs_conceded=('total_runs', lambda r: (r - df_del_merged.loc[r.index, 'legbyes'] - df_del_merged.loc[r.index, 'byes']).sum()),
        wickets=('is_wicket', lambda w: (w & (~df_del_merged.loc[w.index, 'dismissal_type'].isin(['run out', 'retired hurt', 'obstructing the field']))).sum()),
        dots=('is_dot', 'sum')
    ).reset_index()
    
    bowl_career['overs'] = bowl_career['balls'] / 6.0
    bowl_career['economy'] = np.where(bowl_career['overs'] > 0, bowl_career['runs_conceded'] / bowl_career['overs'], 0.0)
    bowl_career['bowling_strike_rate'] = np.where(bowl_career['wickets'] > 0, bowl_career['balls'] / bowl_career['wickets'], 0.0)
    bowl_career['bowling_average'] = np.where(bowl_career['wickets'] > 0, bowl_career['runs_conceded'] / bowl_career['wickets'], 0.0)
    bowl_career['dot_pct'] = np.where(bowl_career['balls'] > 0, (bowl_career['dots'] / bowl_career['balls']) * 100.0, 0.0)

    # --- PHASE BREAKDOWN ---
    bat_phase = df_del_merged.groupby(['batter', 'match_phase']).agg(
        runs=('batter_runs', 'sum'),
        balls=('is_legal', lambda x: (x == True).sum()),
        fours=('is_four', 'sum'),
        sixes=('is_six', 'sum'),
        dismissals=('is_wicket', lambda w: (w & (df_del_merged.loc[w.index, 'player_dismissed'] == df_del_merged.loc[w.index, 'batter'])).sum())
    ).reset_index()
    bat_phase['strike_rate'] = np.where(bat_phase['balls'] > 0, (bat_phase['runs'] / bat_phase['balls']) * 100.0, 0.0)
    bat_phase['average'] = np.where(bat_phase['dismissals'] > 0, bat_phase['runs'] / bat_phase['dismissals'], bat_phase['runs'])

    bowl_phase = df_del_merged.groupby(['bowler', 'match_phase']).agg(
        runs_conceded=('total_runs', lambda r: (r - df_del_merged.loc[r.index, 'legbyes'] - df_del_merged.loc[r.index, 'byes']).sum()),
        balls=('is_legal', lambda x: (x == True).sum()),
        wickets=('is_wicket', lambda w: (w & (~df_del_merged.loc[w.index, 'dismissal_type'].isin(['run out', 'retired hurt', 'obstructing the field']))).sum()),
        dots=('is_dot', 'sum')
    ).reset_index()
    bowl_phase['overs'] = bowl_phase['balls'] / 6.0
    bowl_phase['economy'] = np.where(bowl_phase['overs'] > 0, bowl_phase['runs_conceded'] / bowl_phase['overs'], 0.0)

    # Save to Gold Parquet
    bat_career.to_parquet(os.path.join(gold_dir, "player_batting_career.parquet"), index=False)
    bat_season.to_parquet(os.path.join(gold_dir, "player_batting_season.parquet"), index=False)
    bat_phase.to_parquet(os.path.join(gold_dir, "player_batting_phase.parquet"), index=False)
    
    bowl_career.to_parquet(os.path.join(gold_dir, "player_bowling_career.parquet"), index=False)
    bowl_phase.to_parquet(os.path.join(gold_dir, "player_bowling_phase.parquet"), index=False)
    
    print("Player analytics gold datasets saved successfully.")

if __name__ == "__main__":
    silver_path = r"c:\Users\KIIT\IPL_TRACKER\data\silver"
    gold_path = r"c:\Users\KIIT\IPL_TRACKER\data\gold"
    build_player_analytics(silver_path, gold_path)
