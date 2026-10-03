# 🏏 IPL Cricket Intelligence & Scouting Analytics Platform

> **Performance. Scouting. Matchups. Strategy.**

A portfolio-grade **IPL Cricket Intelligence & Scouting Analytics Platform** designed to simulate how a professional cricket franchise analytics team uses historical IPL data for player performance analysis, player scouting, batter-bowler matchups, opposition tactics, and recruitment decision support.

---

## 🚀 Key Features

1. **Executive Overview**: High-level IPL KPIs, season-by-season run rate trends, match phase breakdowns, and top performers.
2. **Team Intelligence**: Franchise win percentages, total runs/wickets, phase run rates (RPO), and head-to-head records.
3. **Player Intelligence**: Deep player profile with batting/bowling statistics, player headshots, consistency index, phase metrics, and opposition trends.
4. **Matchup Intelligence**: Batter vs Bowler head-to-head matrix (runs, balls faced, SR, dot %, dismissals, sample size validation).
5. **Opposition Intelligence**: Pre-match briefing on opponent strengths, phase tendencies, and empirical tactical observations.
6. **Scouting Intelligence Engine**: Multi-factor recruitment scoring engine with transparent, configurable analytical weights (Run Production, SR, Consistency, Death SR, Powerplay SR).
7. **Data Quality & Audit**: Data provenance, missing record audit, legal delivery validation, and dataset coverage rules.
8. **"Ask the Data" Assistant**: Natural language query interface translating questions into SQL queries executed against DuckDB Parquet tables.

---

## 🏗 System Architecture

```text
PUBLIC CRICKET DATA (Cricsheet) ──► DATABRICKS PYSPARK PIPELINE (01-07) ──► PARQUET GOLD TABLES
                                                                                   │
                                                                                   ▼
REACT + VITE + TAILWIND DASHBOARD ◄── FASTAPI REST BACKEND ◄── DUCKDB IN-MEMORY SQL ENGINE
```

---

## 🛠 Tech Stack

- **Data Engineering**: Databricks PySpark, Parquet/Delta format, Python 3.12, Pandas
- **SQL Analytics Engine**: DuckDB Embedded SQL Engine
- **Backend API**: FastAPI, Uvicorn, REST endpoints
- **Frontend Dashboard**: React, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons

---

## 📁 Repository Structure

```text
ipl-cricket-intelligence/
├── data/                       # Raw, Bronze, Silver, Gold Parquet datasets
├── databricks/                 # Databricks PySpark pipeline scripts (01-07)
├── sql/                        # Star schema DDL & analytical queries
├── backend/                    # FastAPI backend & DuckDB service layer
├── frontend/                   # React + Vite + Tailwind dashboard
├── docs/                       # Architecture, methodology, interview guide
└── README.md
```

---

## ⚡ How to Run

### 1. Data Engineering Pipeline (Databricks / PySpark)
```bash
python databricks/run_pipeline.py
```

### 2. Launch FastAPI Backend API
```bash
python -m uvicorn backend.main:app --reload --port 8000
```

### 3. Launch React Frontend Dashboard
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
