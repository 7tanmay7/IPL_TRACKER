-- ====================================================================
-- IPL Cricket Intelligence Platform - Star Schema & DDL Specifications
-- Author: Data Engineering Team
-- ====================================================================

-- 1. DIMENSION TABLES
CREATE TABLE IF NOT EXISTS dim_player (
    player_id INT PRIMARY KEY,
    player_name VARCHAR(255) NOT NULL,
    player_full_name VARCHAR(255),
    bat_style VARCHAR(100),
    bowl_style VARCHAR(100),
    field_pos VARCHAR(100),
    player_image VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS dim_team (
    team_id INT PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    team_name_short VARCHAR(50),
    image_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS dim_venue (
    venue_id INT PRIMARY KEY,
    venue_name VARCHAR(255) NOT NULL,
    city VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS dim_season (
    season_id INT PRIMARY KEY,
    season_year VARCHAR(50) NOT NULL
);

-- 2. FACT TABLES
CREATE TABLE IF NOT EXISTS fact_match (
    match_id VARCHAR(100) PRIMARY KEY,
    season_year VARCHAR(50),
    match_date DATE,
    venue VARCHAR(255),
    city VARCHAR(255),
    team1 VARCHAR(255),
    team2 VARCHAR(255),
    toss_winner VARCHAR(255),
    toss_decision VARCHAR(50),
    winner VARCHAR(255),
    win_by_runs INT,
    win_by_wickets INT,
    result VARCHAR(50),
    player_of_match VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS fact_delivery (
    match_id VARCHAR(100),
    innings INT,
    over INT,
    ball INT,
    batting_team VARCHAR(255),
    bowling_team VARCHAR(255),
    batter VARCHAR(255),
    bowler VARCHAR(255),
    non_striker VARCHAR(255),
    batter_runs INT,
    extra_runs INT,
    total_runs INT,
    wides INT,
    noballs INT,
    legbyes INT,
    byes INT,
    is_legal BOOLEAN,
    is_wicket BOOLEAN,
    dismissal_type VARCHAR(100),
    player_dismissed VARCHAR(255),
    match_phase VARCHAR(50),
    is_four BOOLEAN,
    is_six BOOLEAN,
    is_boundary BOOLEAN,
    is_dot BOOLEAN
);
