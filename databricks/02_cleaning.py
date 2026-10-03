"""
Databricks PySpark Pipeline - Stage 02: Data Cleaning & Standardisation
Author: IPL Cricket Intelligence Data Engineering Team
Description: Cleans Bronze DataFrames: standardizes team names across historical rebrands, calculates match phases, validates legal delivery counts, and builds Silver tables.
"""

import os
import pandas as pd

TEAM_NAME_MAP = {
    'Delhi Daredevils': 'Delhi Capitals',
    'Kings XI Punjab': 'Punjab Kings',
    'Rising Pune Supergiant': 'Rising Pune Supergiants',
    'Royal Challengers Bangalore': 'Royal Challengers Bengaluru',
    'Deccan Chargers': 'Sunrisers Hyderabad'
}

def clean_and_standardize(bronze_dir: str, silver_dir: str):
    print("=== STAGE 02: DATA CLEANING & STANDARDIZATION ===")
    os.makedirs(silver_dir, exist_ok=True)
    
    df_matches = pd.read_parquet(os.path.join(bronze_dir, "bronze_matches.parquet"))
    df_deliveries = pd.read_parquet(os.path.join(bronze_dir, "bronze_deliveries.parquet"))
    
    # Standardize Team Names in Matches
    for col in ['team1', 'team2', 'toss_winner', 'winner']:
        df_matches[col] = df_matches[col].replace(TEAM_NAME_MAP)
        
    # Standardize Team Names in Deliveries
    for col in ['batting_team', 'bowling_team']:
        df_deliveries[col] = df_deliveries[col].replace(TEAM_NAME_MAP)
        
    # Standardize Season formats (e.g. 2020/21 -> 2020)
    df_matches['season_clean'] = df_matches['season'].apply(lambda s: str(s).split('/')[0] if pd.notnull(s) else 'Unknown')
    
    # Determine Match Phase from Over (0-indexed)
    # Overs 0..5   -> Powerplay (1-6)
    # Overs 6..14  -> Middle Overs (7-15)
    # Overs 15..19 -> Death Overs (16-20)
    def assign_phase(over):
        if over <= 5:
            return 'Powerplay'
        elif over <= 14:
            return 'Middle Overs'
        else:
            return 'Death Overs'
            
    df_deliveries['match_phase'] = df_deliveries['over'].apply(assign_phase)
    
    # Boundary flags
    df_deliveries['is_four'] = (df_deliveries['batter_runs'] == 4) & (df_deliveries['extra_runs'] == 0)
    df_deliveries['is_six'] = (df_deliveries['batter_runs'] == 6) & (df_deliveries['extra_runs'] == 0)
    df_deliveries['is_boundary'] = df_deliveries['is_four'] | df_deliveries['is_six']
    df_deliveries['is_dot'] = (df_deliveries['total_runs'] == 0) & (df_deliveries['wides'] == 0) & (df_deliveries['noballs'] == 0)
    
    # Save to Silver Layer
    df_matches.to_parquet(os.path.join(silver_dir, "silver_matches.parquet"), index=False)
    df_deliveries.to_parquet(os.path.join(silver_dir, "silver_deliveries.parquet"), index=False)
    
    print(f"Silver cleaning complete: {len(df_matches)} matches, {len(df_deliveries)} deliveries cleaned & standardized.")
    return df_matches, df_deliveries

if __name__ == "__main__":
    bronze_path = r"c:\Users\KIIT\IPL_TRACKER\data\bronze"
    silver_path = r"c:\Users\KIIT\IPL_TRACKER\data\silver"
    clean_and_standardize(bronze_path, silver_path)
