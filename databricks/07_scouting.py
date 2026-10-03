"""
Databricks PySpark Pipeline - Stage 07: Scouting & Recruitment Engine
Author: IPL Cricket Intelligence Data Engineering Team
Description: Computes multi-factor scouting scores for recruitment targets with configurable analytical weights.
"""

import os
import pandas as pd
import numpy as np

def build_scouting_matrix(gold_dir: str, weights: dict = None):
    print("=== STAGE 07: SCOUTING ENGINE ===")
    
    if weights is None:
        weights = {
            'run_prod': 0.30,
            'strike_rate': 0.25,
            'consistency': 0.20,
            'death_impact': 0.15,
            'powerplay_impact': 0.10
        }
        
    bat_career = pd.read_parquet(os.path.join(gold_dir, "player_batting_career.parquet"))
    bat_phase = pd.read_parquet(os.path.join(gold_dir, "player_batting_phase.parquet"))
    
    # Filter minimum sample (e.g. at least 50 balls faced)
    qualified = bat_career[bat_career['balls'] >= 50].copy()
    
    # Extract Death & Powerplay SR
    death_sr = bat_phase[bat_phase['match_phase'] == 'Death Overs'].set_index('batter')['strike_rate'].to_dict()
    pp_sr = bat_phase[bat_phase['match_phase'] == 'Powerplay'].set_index('batter')['strike_rate'].to_dict()
    
    qualified['death_sr'] = qualified['batter'].map(death_sr).fillna(0.0)
    qualified['powerplay_sr'] = qualified['batter'].map(pp_sr).fillna(0.0)
    
    # Percentile Normalization (0-100 scale)
    def normalize_col(series):
        max_val = series.max()
        min_val = series.min()
        if max_val == min_val:
            return pd.Series(50.0, index=series.index)
        return ((series - min_val) / (max_val - min_val)) * 100.0

    qualified['norm_runs'] = normalize_col(qualified['runs'])
    qualified['norm_sr'] = normalize_col(qualified['strike_rate'])
    qualified['norm_consistency'] = normalize_col(qualified['consistency_score'])
    qualified['norm_death_sr'] = normalize_col(qualified['death_sr'])
    qualified['norm_pp_sr'] = normalize_col(qualified['powerplay_sr'])
    
    # Composite Scouting Score Calculation
    qualified['scouting_score'] = (
        qualified['norm_runs'] * weights['run_prod'] +
        qualified['norm_sr'] * weights['strike_rate'] +
        qualified['norm_consistency'] * weights['consistency'] +
        qualified['norm_death_sr'] * weights['death_impact'] +
        qualified['norm_pp_sr'] * weights['powerplay_impact']
    ).round(2)
    
    scouting_df = qualified.sort_values(by='scouting_score', ascending=False)
    scouting_df.to_parquet(os.path.join(gold_dir, "scouting_candidates.parquet"), index=False)
    
    print(f"Scouting candidates dataset generated with {len(scouting_df)} players ranked.")
    return scouting_df

if __name__ == "__main__":
    gold_path = r"c:\Users\KIIT\IPL_TRACKER\data\gold"
    build_scouting_matrix(gold_path)
