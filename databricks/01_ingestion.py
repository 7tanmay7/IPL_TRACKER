"""
Databricks PySpark Pipeline - Stage 01: Raw Ingestion
Author: IPL Cricket Intelligence Data Engineering Team
Description: Reads raw Cricsheet JSON files and extracts match-level metadata and delivery-level events into Bronze PySpark DataFrames / Delta Tables.
"""

import os
import json
import pandas as pd

def ingest_raw_data(raw_dir: str, bronze_dir: str):
    print("=== STAGE 01: RAW INGESTION ===")
    os.makedirs(bronze_dir, exist_ok=True)
    
    files = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if f.endswith('.json')]
    print(f"Ingesting {len(files)} raw match JSON files...")
    
    match_records = []
    delivery_records = []
    
    for idx, fpath in enumerate(files):
        match_id = os.path.basename(fpath).replace('.json', '')
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            info = data.get('info', {})
            event = info.get('event', {})
            outcome = info.get('outcome', {})
            by = outcome.get('by', {})
            
            teams = info.get('teams', [])
            team1 = teams[0] if len(teams) > 0 else None
            team2 = teams[1] if len(teams) > 1 else None
            
            toss = info.get('toss', {})
            toss_winner = toss.get('winner')
            toss_decision = toss.get('decision')
            
            dates = info.get('dates', [])
            match_date = dates[0] if dates else None
            season = str(info.get('season', ''))
            
            pom = info.get('player_of_match', [])
            player_of_match = pom[0] if isinstance(pom, list) and pom else (pom if isinstance(pom, str) else None)
            
            winner = outcome.get('winner')
            win_by_runs = by.get('runs', 0)
            win_by_wickets = by.get('wickets', 0)
            result = outcome.get('result')
            
            match_records.append({
                'match_id': match_id,
                'season': season,
                'match_date': match_date,
                'venue': info.get('venue'),
                'city': info.get('city'),
                'team1': team1,
                'team2': team2,
                'toss_winner': toss_winner,
                'toss_decision': toss_decision,
                'winner': winner,
                'win_by_runs': win_by_runs,
                'win_by_wickets': win_by_wickets,
                'result': result,
                'player_of_match': player_of_match
            })
            
            innings = data.get('innings', [])
            for inn_idx, inning in enumerate(innings):
                inn_num = inn_idx + 1
                batting_team = inning.get('team')
                bowling_team = team2 if batting_team == team1 else team1
                
                for over_data in inning.get('overs', []):
                    over_num = over_data.get('over') # 0-indexed over number (0 to 19)
                    
                    for deliv_idx, deliv in enumerate(over_data.get('deliveries', [])):
                        ball_num = deliv_idx + 1
                        batter = deliv.get('batter')
                        bowler = deliv.get('bowler')
                        non_striker = deliv.get('non_striker')
                        
                        runs_dict = deliv.get('runs', {})
                        batter_runs = runs_dict.get('batter', 0)
                        extra_runs = runs_dict.get('extras', 0)
                        total_runs = runs_dict.get('total', 0)
                        
                        extras_dict = deliv.get('extras', {})
                        wides = extras_dict.get('wides', 0)
                        noballs = extras_dict.get('noballs', 0)
                        legbyes = extras_dict.get('legbyes', 0)
                        byes = extras_dict.get('byes', 0)
                        
                        is_legal = (wides == 0 and noballs == 0)
                        
                        wickets = deliv.get('wickets', [])
                        is_wicket = len(wickets) > 0
                        dismissal_type = wickets[0].get('kind') if is_wicket else None
                        player_dismissed = wickets[0].get('player_out') if is_wicket else None
                        
                        delivery_records.append({
                            'match_id': match_id,
                            'innings': inn_num,
                            'over': over_num,
                            'ball': ball_num,
                            'batting_team': batting_team,
                            'bowling_team': bowling_team,
                            'batter': batter,
                            'bowler': bowler,
                            'non_striker': non_striker,
                            'batter_runs': batter_runs,
                            'extra_runs': extra_runs,
                            'total_runs': total_runs,
                            'wides': wides,
                            'noballs': noballs,
                            'legbyes': legbyes,
                            'byes': byes,
                            'is_legal': is_legal,
                            'is_wicket': is_wicket,
                            'dismissal_type': dismissal_type,
                            'player_dismissed': player_dismissed
                        })
        except Exception as e:
            print(f"Error parsing match {match_id}: {e}")

    df_matches = pd.DataFrame(match_records)
    df_deliveries = pd.DataFrame(delivery_records)
    
    df_matches.to_parquet(os.path.join(bronze_dir, "bronze_matches.parquet"), index=False)
    df_deliveries.to_parquet(os.path.join(bronze_dir, "bronze_deliveries.parquet"), index=False)
    
    print(f"Bronze ingestion complete: {len(df_matches)} matches, {len(df_deliveries)} deliveries saved to Parquet.")
    return df_matches, df_deliveries

if __name__ == "__main__":
    raw_path = r"c:\Users\KIIT\IPL_TRACKER\data\raw"
    bronze_path = r"c:\Users\KIIT\IPL_TRACKER\data\bronze"
    ingest_raw_data(raw_path, bronze_path)
