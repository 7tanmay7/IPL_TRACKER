"""
IPL Cricket Intelligence — FastAPI REST Backend
Author: Senior Full-Stack & Data Engineer
Description: Exposes analytical REST endpoints for Executive Overview, Team Intelligence, Player Intelligence, Matchup Intelligence, Opposition Intelligence, Scouting Engine, Data Quality, and Ask-the-Data Assistant.
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
import sys
import os

sys.path.append(os.path.dirname(__file__))

from database import get_duckdb_con
from services.overview import get_overview_data
from services.team import get_teams_list, get_team_detail
from services.player import get_players_list, get_player_detail
from services.matchup import get_matchup_data
from services.opposition import get_opposition_analysis
from services.scouting import compute_custom_scouting_matrix
from services.data_quality import get_data_quality_report
from services.ask_data import process_natural_language_query

app = FastAPI(
    title="IPL Cricket Intelligence API",
    description="Portfolio-grade Cricket Scouting & Analytics Engine",
    version="2.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global DuckDB Connection Singleton
duck_con = get_duckdb_con()

class ScoutingWeightsRequest(BaseModel):
    weights: Optional[Dict[str, float]] = {
        'run_prod': 0.30,
        'strike_rate': 0.25,
        'consistency': 0.20,
        'death_impact': 0.15,
        'powerplay_impact': 0.10
    }
    min_balls: Optional[int] = 50
    role: Optional[str] = 'All'

class AskDataRequest(BaseModel):
    question: str

@app.get("/api/health")
def health_check():
    return {"status": "ONLINE", "engine": "DuckDB + PySpark Parquet Gold Layer"}

@app.get("/api/overview")
def overview_endpoint(season: Optional[str] = Query(None)):
    return get_overview_data(duck_con, season)

@app.get("/api/teams")
def teams_list_endpoint():
    return get_teams_list(duck_con)

@app.get("/api/teams/{team_name}")
def team_detail_endpoint(team_name: str):
    res = get_team_detail(duck_con, team_name)
    if not res:
        raise HTTPException(status_code=404, detail="Team not found")
    return res

@app.get("/api/players")
def players_list_endpoint():
    return get_players_list(duck_con)

@app.get("/api/players/{player_name}")
def player_detail_endpoint(player_name: str):
    res = get_player_detail(duck_con, player_name)
    if not res:
        raise HTTPException(status_code=404, detail="Player profile not found")
    return res

@app.get("/api/matchups")
def matchup_endpoint(batter: str = Query(...), bowler: str = Query(...)):
    return get_matchup_data(duck_con, batter, bowler)

@app.get("/api/opposition/{team_name}")
def opposition_endpoint(team_name: str):
    res = get_opposition_analysis(duck_con, team_name)
    if not res:
        raise HTTPException(status_code=404, detail="Opponent team not found")
    return res

@app.post("/api/scouting")
def scouting_endpoint(req: ScoutingWeightsRequest):
    return compute_custom_scouting_matrix(
        duck_con,
        weights=req.weights,
        min_balls=req.min_balls,
        role_filter=req.role
    )

@app.get("/api/data-quality")
def data_quality_endpoint():
    return get_data_quality_report(duck_con)

@app.post("/api/ask")
def ask_data_endpoint(req: AskDataRequest):
    if not req.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return process_natural_language_query(duck_con, req.question)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
