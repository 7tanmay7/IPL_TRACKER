# System Architecture & Data Pipeline Blueprint

## 1. High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PUBLIC CRICKET DATA                              │
│                    Cricsheet (CC-BY 4.0) - 1,243 Match JSONs               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATABRICKS PYSPARK PIPELINE (01-07)                      │
│ 01 Ingestion ──► 02 Cleaning ──► 03 Transformations ──► 04-07 Gold Engines    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     GOLD ANALYTICAL PARQUET & DELTA ENGINE                  │
│  dim_player, dim_team, fact_match, fact_delivery, player_batting, scouting  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DUCKDB HIGH-SPEED SQL ENGINE                        │
│                   In-Memory Querying & Star Schema Engine                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FASTAPI REST BACKEND (Python)                      │
│       Endpoints: /overview, /teams, /players, /matchups, /scouting, /ask     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     REACT + VITE + TAILWIND CSS DASHBOARD                   │
│             Bloomberg Dark UX, Recharts Visuals, Interactive Tables          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Pipeline Stages

1. **Stage 01: Raw Ingestion (`databricks/01_ingestion.py`)**: Converts 1,243 Cricsheet JSON files into Bronze Parquet files.
2. **Stage 02: Data Cleaning (`databricks/02_cleaning.py`)**: Standardizes franchise rebrands, calculates phases (Powerplay: 0-5, Middle: 6-14, Death: 15-19), flags legal deliveries & boundaries.
3. **Stage 03: Gold Transformations (`databricks/03_transformation.py`)**: Builds Star Schema dimension tables (`dim_player`, `dim_team`, `dim_venue`, `dim_season`) enriched with player headshots & team logos.
4. **Stage 04: Player Analytics Engine (`databricks/04_player_analytics.py`)**: Computes career/season batting/bowling statistics, phase breakdowns, and consistency index scores.
5. **Stage 05: Team Intelligence Engine (`databricks/05_team_analytics.py`)**: Computes franchise win rates, head-to-head records, and team phase run rates.
6. **Stage 06: Matchup Intelligence Engine (`databricks/06_matchup_analytics.py`)**: Computes 31,370 direct batter-bowler pair records.
7. **Stage 07: Scouting Engine (`databricks/07_scouting.py`)**: Calculates multi-factor composite recruitment scores across 415 qualified candidates.
