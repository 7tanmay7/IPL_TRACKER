"""
Databricks PySpark Pipeline - Stage 03: Gold Analytical Transformations (Updated with Supplemental Metadata)
Author: IPL Cricket Intelligence Data Engineering Team
Description: Builds Dimensional star schema tables (dim_player, dim_team, dim_venue, dim_season) incorporating player batting/bowling styles, images, and team logo metadata.
"""

import os
import pandas as pd

def build_gold_dimensions(silver_dir: str, gold_dir: str):
    print("=== STAGE 03: GOLD DIMENSIONAL MODEL TRANSFORMATIONS ===")
    os.makedirs(gold_dir, exist_ok=True)
    
    df_matches = pd.read_parquet(os.path.join(silver_dir, "silver_matches.parquet"))
    df_deliveries = pd.read_parquet(os.path.join(silver_dir, "silver_deliveries.parquet"))
    
    supp_dir = r"c:\Users\KIIT\IPL_TRACKER\data\supplemental"
    supp_players_path = os.path.join(supp_dir, "supplemental_players.csv")
    supp_teams_path = os.path.join(supp_dir, "supplemental_teams.csv")
    
    supp_players = pd.read_csv(supp_players_path) if os.path.exists(supp_players_path) else pd.DataFrame()
    supp_teams = pd.read_csv(supp_teams_path) if os.path.exists(supp_teams_path) else pd.DataFrame()
    
    # 1. dim_player
    batters = set(df_deliveries['batter'].dropna().unique())
    bowlers = set(df_deliveries['bowler'].dropna().unique())
    all_players = sorted(list(batters.union(bowlers)))
    
    dim_player = pd.DataFrame({'player_name': all_players, 'player_id': range(1, len(all_players) + 1)})
    
    if not supp_players.empty:
        # Merge player metadata on player_name
        supp_players_clean = supp_players.drop_duplicates(subset=['player_name']).copy()
        dim_player = dim_player.merge(
            supp_players_clean[['player_name', 'bat_style', 'bowl_style', 'field_pos', 'player_full_name', 'player_image']],
            on='player_name',
            how='left'
        )
    else:
        dim_player['bat_style'] = None
        dim_player['bowl_style'] = None
        dim_player['field_pos'] = None
        dim_player['player_full_name'] = dim_player['player_name']
        dim_player['player_image'] = None
        
    dim_player['bat_style'] = dim_player['bat_style'].fillna('Right hand Bat')
    dim_player['bowl_style'] = dim_player['bowl_style'].fillna('Right arm Medium')
    dim_player['player_full_name'] = dim_player['player_full_name'].fillna(dim_player['player_name'])
    
    # 2. dim_team
    teams1 = set(df_matches['team1'].dropna().unique())
    teams2 = set(df_matches['team2'].dropna().unique())
    all_teams = sorted(list(teams1.union(teams2)))
    dim_team = pd.DataFrame({'team_name': all_teams, 'team_id': range(1, len(all_teams) + 1)})
    
    if not supp_teams.empty:
        supp_teams_clean = supp_teams.drop_duplicates(subset=['team_name']).copy()
        dim_team = dim_team.merge(
            supp_teams_clean[['team_name', 'team_name_short', 'image_url']],
            on='team_name',
            how='left'
        )
    else:
        dim_team['team_name_short'] = dim_team['team_name'].apply(lambda x: "".join([w[0] for w in x.split()]))
        dim_team['image_url'] = None
        
    dim_team['team_name_short'] = dim_team['team_name_short'].fillna(dim_team['team_name'].apply(lambda x: "".join([w[0] for w in str(x).split()])))

    # 3. dim_venue
    venues = sorted(list(df_matches['venue'].dropna().unique()))
    dim_venue = pd.DataFrame({'venue_name': venues, 'venue_id': range(1, len(venues) + 1)})
    
    # 4. dim_season
    seasons = sorted(list(df_matches['season_clean'].dropna().unique()))
    dim_season = pd.DataFrame({'season_year': seasons, 'season_id': range(1, len(seasons) + 1)})
    
    dim_player.to_parquet(os.path.join(gold_dir, "dim_player.parquet"), index=False)
    dim_team.to_parquet(os.path.join(gold_dir, "dim_team.parquet"), index=False)
    dim_venue.to_parquet(os.path.join(gold_dir, "dim_venue.parquet"), index=False)
    dim_season.to_parquet(os.path.join(gold_dir, "dim_season.parquet"), index=False)
    
    print("Gold Dimension tables updated with player headshots & team logos.")

if __name__ == "__main__":
    silver_path = r"c:\Users\KIIT\IPL_TRACKER\data\silver"
    gold_path = r"c:\Users\KIIT\IPL_TRACKER\data\gold"
    build_gold_dimensions(silver_path, gold_path)
