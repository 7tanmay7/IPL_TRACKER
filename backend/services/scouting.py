"""
Scouting & Recruitment Engine Service
"""
import duckdb
import pandas as pd

def compute_custom_scouting_matrix(
    con: duckdb.DuckDBPyConnection,
    weights: dict,
    min_balls: int = 50,
    role_filter: str = 'All'
):
    w_run = weights.get('run_prod', 0.30)
    w_sr = weights.get('strike_rate', 0.25)
    w_cons = weights.get('consistency', 0.20)
    w_death = weights.get('death_impact', 0.15)
    w_pp = weights.get('powerplay_impact', 0.10)
    
    bat_df = con.execute("SELECT * FROM player_batting_career").fetchdf()
    phase_df = con.execute("SELECT * FROM player_batting_phase").fetchdf()
    player_dim = con.execute("SELECT player_name, COALESCE(bat_style, 'Right hand Bat') AS bat_style, COALESCE(bowl_style, 'Right arm Medium') AS bowl_style, COALESCE(player_image, '') AS player_image FROM dim_player").fetchdf()
    
    qualified = bat_df[bat_df['balls'] >= min_balls].copy()
    
    death_sr = phase_df[phase_df['match_phase'] == 'Death Overs'].set_index('batter')['strike_rate'].to_dict()
    pp_sr = phase_df[phase_df['match_phase'] == 'Powerplay'].set_index('batter')['strike_rate'].to_dict()
    
    qualified['death_sr'] = qualified['batter'].map(death_sr).fillna(0.0)
    qualified['powerplay_sr'] = qualified['batter'].map(pp_sr).fillna(0.0)
    
    def norm(s):
        mx, mn = s.max(), s.min()
        return pd.Series(50.0, index=s.index) if mx == mn else ((s - mn) / (mx - mn)) * 100.0

    qualified['norm_runs'] = norm(qualified['runs'])
    qualified['norm_sr'] = norm(qualified['strike_rate'])
    qualified['norm_consistency'] = norm(qualified['consistency_score'])
    qualified['norm_death_sr'] = norm(qualified['death_sr'])
    qualified['norm_pp_sr'] = norm(qualified['powerplay_sr'])
    
    qualified['scouting_score'] = (
        qualified['norm_runs'] * w_run +
        qualified['norm_sr'] * w_sr +
        qualified['norm_consistency'] * w_cons +
        qualified['norm_death_sr'] * w_death +
        qualified['norm_pp_sr'] * w_pp
    ).round(2)
    
    player_dim_clean = player_dim.drop_duplicates(subset=['player_name'])
    merged = qualified.merge(player_dim_clean, left_on='batter', right_on='player_name', how='left')
    merged = merged.sort_values(by='scouting_score', ascending=False)
    
    records = merged[[
        'player_name', 'bat_style', 'bowl_style', 'player_image',
        'matches', 'runs', 'balls', 'strike_rate', 'batting_average',
        'death_sr', 'powerplay_sr', 'consistency_score', 'scouting_score'
    ]].to_dict(orient='records')
    
    return {
        "formula": {
            "run_production_weight": f"{int(w_run*100)}%",
            "strike_rate_weight": f"{int(w_sr*100)}%",
            "consistency_weight": f"{int(w_cons*100)}%",
            "death_impact_weight": f"{int(w_death*100)}%",
            "powerplay_impact_weight": f"{int(w_pp*100)}%"
        },
        "candidates": records
    }
