"""
Master Databricks Orchestration Script
Runs stages 01 through 07 to generate all Bronze, Silver, and Gold datasets from raw JSONs.
"""

import sys
import os
import importlib

sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.dirname(__file__))

ingest_module = importlib.import_module("01_ingestion")
clean_module = importlib.import_module("02_cleaning")
transform_module = importlib.import_module("03_transformation")
player_module = importlib.import_module("04_player_analytics")
team_module = importlib.import_module("05_team_analytics")
matchup_module = importlib.import_module("06_matchup_analytics")
scouting_module = importlib.import_module("07_scouting")

def main():
    base_dir = r"c:\Users\KIIT\IPL_TRACKER\data"
    raw_dir = os.path.join(base_dir, "raw")
    bronze_dir = os.path.join(base_dir, "bronze")
    silver_dir = os.path.join(base_dir, "silver")
    gold_dir = os.path.join(base_dir, "gold")
    
    print("=== Starting Master IPL Cricket Intelligence Pipeline ===")
    ingest_module.ingest_raw_data(raw_dir, bronze_dir)
    clean_module.clean_and_standardize(bronze_dir, silver_dir)
    transform_module.build_gold_dimensions(silver_dir, gold_dir)
    player_module.build_player_analytics(silver_dir, gold_dir)
    team_module.build_team_analytics(silver_dir, gold_dir)
    matchup_module.build_matchup_analytics(silver_dir, gold_dir)
    scouting_module.build_scouting_matrix(gold_dir)
    print("=== Master Pipeline Execution Complete ===")

if __name__ == "__main__":
    main()
