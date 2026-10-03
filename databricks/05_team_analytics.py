"""
Databricks PySpark Pipeline - Stage 05: Team Intelligence Engine
Author: IPL Cricket Intelligence Data Engineering Team
Description: Computes franchise team performance metrics, head-to-head records, season trends, and phase run rates.
"""

import os
import pandas as pd
import numpy as np

def build_team_analytics(silver_dir: str, gold_dir: str):
    print("=== STAGE 05: TEAM INTELLIGENCE ENGINE ===")
    os.makedirs(gold_dir, exist_ok=True)
    
    df_matches = pd.read_parquet(os.path.join(silver_dir, "silver_matches.parquet"))
    df_deliveries = pd.read_parquet(os.path.join(silver_dir, "silver_deliveries.parquet"))
    
    # --- TEAM MATCH PERFORMANCE ---
    teams = sorted(list(set(df_matches['team1'].dropna()).union(set(df_matches['team2'].dropna()))))
    
    team_stats = []
    for t in teams:
        t_matches = df_matches[(df_matches['team1'] == t) | (df_matches['team2'] == t)]
        m_count = len(t_matches)
        wins = len(t_matches[t_matches['winner'] == t])
        losses = len(t_matches[(t_matches['winner'].notnull()) & (t_matches['winner'] != t) & (t_matches['winner'] != 'Tie') & (t_matches['winner'] != 'no result')])
        win_pct = (wins / m_count * 100.0) if m_count > 0 else 0.0
        
        # Batting runs & Bowling conceded
        bat_del = df_deliveries[df_deliveries['batting_team'] == t]
        bowl_del = df_deliveries[df_deliveries['bowling_team'] == t]
        
        runs_scored = bat_del['total_runs'].sum()
        runs_conceded = bowl_del['total_runs'].sum()
        wickets_taken = bowl_del['is_wicket'].sum()
        
        team_stats.append({
            'team_name': t,
            'matches': m_count,
            'wins': wins,
            'losses': losses,
            'win_pct': round(win_pct, 2),
            'total_runs_scored': runs_scored,
            'total_runs_conceded': runs_conceded,
            'wickets_taken': wickets_taken
        })
        
    df_team_summary = pd.DataFrame(team_stats)
    
    # --- HEAD TO HEAD MATRIX ---
    h2h_list = []
    for i, t1 in enumerate(teams):
        for t2 in teams[i+1:]:
            matches_h2h = df_matches[((df_matches['team1'] == t1) & (df_matches['team2'] == t2)) | ((df_matches['team1'] == t2) & (df_matches['team2'] == t1))]
            m_cnt = len(matches_h2h)
            if m_cnt > 0:
                t1_wins = len(matches_h2h[matches_h2h['winner'] == t1])
                t2_wins = len(matches_h2h[matches_h2h['winner'] == t2])
                h2h_list.append({
                    'team1': t1,
                    'team2': t2,
                    'total_matches': m_cnt,
                    'team1_wins': t1_wins,
                    'team2_wins': t2_wins
                })
    df_h2h = pd.DataFrame(h2h_list)
    
    # --- TEAM PHASE METRICS ---
    team_phase = df_deliveries.groupby(['batting_team', 'match_phase']).agg(
        runs=('total_runs', 'sum'),
        legal_balls=('is_legal', 'sum'),
        wickets=('is_wicket', 'sum'),
        fours=('is_four', 'sum'),
        sixes=('is_six', 'sum'),
        dots=('is_dot', 'sum')
    ).reset_index()
    
    team_phase['overs'] = team_phase['legal_balls'] / 6.0
    team_phase['run_rate'] = np.where(team_phase['overs'] > 0, team_phase['runs'] / team_phase['overs'], 0.0)
    
    # Save Gold tables
    df_team_summary.to_parquet(os.path.join(gold_dir, "team_summary.parquet"), index=False)
    df_h2h.to_parquet(os.path.join(gold_dir, "team_head_to_head.parquet"), index=False)
    team_phase.to_parquet(os.path.join(gold_dir, "team_phase.parquet"), index=False)
    
    print("Team intelligence gold datasets saved successfully.")

if __name__ == "__main__":
    silver_path = r"c:\Users\KIIT\IPL_TRACKER\data\silver"
    gold_path = r"c:\Users\KIIT\IPL_TRACKER\data\gold"
    build_team_analytics(silver_path, gold_path)
