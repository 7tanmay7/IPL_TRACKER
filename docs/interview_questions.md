# Project Interview Questions & Technical Defense Guide

This document prepares the engineer/analyst to explain every design decision, data pipeline trade-off, and metric formula during technical interviews.

---

### Q1: Why did you choose Cricsheet over direct web scraping from Cricbuzz?
**Answer**: Direct web scraping of Cricbuzz violates terms of service and robots.txt policies and requires bypassing anti-bot systems. Cricsheet provides fully licensed, open public cricket data (CC-BY 4.0) with detailed ball-by-ball granularity across all 1,243 IPL matches.

---

### Q2: How do you handle legal deliveries when calculating Strike Rate and Economy?
**Answer**: Wides and no-balls are not counted as legal deliveries faced by batters or legal overs bowled by bowlers. However, runs scored off no-balls accrue to the batter, while wides accrue to extras. In our PySpark cleaning stage, we compute `is_legal = (wides == 0 AND noballs == 0)` and use `is_legal` for ball counts.

---

### Q3: How did you handle historical franchise team rebrands?
**Answer**: In `databricks/02_cleaning.py`, we implemented a standardization mapping dictionary:
- *Delhi Daredevils* $\rightarrow$ *Delhi Capitals*
- *Kings XI Punjab* $\rightarrow$ *Punjab Kings*
- *Rising Pune Supergiant* $\rightarrow$ *Rising Pune Supergiants*
- *Deccan Chargers* $\rightarrow$ *Sunrisers Hyderabad* (where applicable)

---

### Q4: Explain your Medallion (Bronze/Silver/Gold) architecture.
**Answer**:
- **Bronze**: Ingests 1,243 raw match JSONs as raw Parquet tables.
- **Silver**: Cleans data types, handles nulls, normalizes names, flags boundaries/dots, and derives match phases (Powerplay, Middle, Death).
- **Gold**: Builds dimensional star schema (`dim_player`, `dim_team`, `dim_venue`, `dim_season`) and aggregated analytical facts (`player_batting`, `player_bowling`, `matchup_analytics`, `scouting_candidates`).

---

### Q5: Why use DuckDB alongside PySpark?
**Answer**: PySpark handles heavy data processing and transformation over hundreds of thousands of delivery events. DuckDB acts as an ultra-fast in-memory analytical SQL engine for the REST backend API, allowing instant interactive SQL execution over Parquet tables without requiring a live Spark cluster server.

---

### Q6: How is the Consistency Index calculated?
**Answer**: It measures a batter's match-to-match score stability using the inverse coefficient of variation:
$$\text{Consistency} = 100 - \left( \frac{\sigma_{\text{match\_runs}}}{\mu_{\text{match\_runs}}} \times 30 \right)$$
A higher score indicates consistent run production rather than volatile feast-or-famine performances.

---

### Q7: How does your Scouting Engine work?
**Answer**: It normalizes candidate stats across 5 metrics (Run Production, Overall SR, Consistency Score, Death Over SR, Powerplay SR) into percentile scales (0-100) and computes a composite score based on customizable weights set by the franchise analyst.

---

### Q8: How do you handle small sample sizes in Batter-Bowler matchups?
**Answer**: If a batter has faced fewer than 10 legal balls against a bowler, the system flags `sample_warning: true` or displays an "Insufficient sample size" alert rather than presenting misleading conclusions.

---

### Q9: How are match phases defined in T20 cricket?
**Answer**:
- **Powerplay**: Overs 1–6 (0-indexed overs 0 to 5)
- **Middle Overs**: Overs 7–15 (0-indexed overs 6 to 14)
- **Death Overs**: Overs 16–20 (0-indexed overs 15 to 19)

---

### Q10: How does "Ask the Data" process natural language queries?
**Answer**: It parses user queries into structured analytical intents, maps them to optimized DuckDB SQL queries over Parquet tables, executes them in milliseconds, and returns both tabular results and a natural language summary.

---

### Q11: What are the main data limitations of open cricket datasets?
**Answer**: Open Cricsheet data does not track ball release speeds (km/h), pitch map coordinates, or hawk-eye tracking coordinates. These limitations are explicitly documented in `Data Quality`.

---

### Q12: How are run-rates per over (RPO) computed?
**Answer**: $\text{RPO} = \frac{\text{Total Runs}}{\text{Legal Deliveries} / 6.0}$.

---

### Q13: How is bowling economy rate calculated?
**Answer**: $\text{Economy} = \frac{\text{Total Runs Conceded} - \text{Byes} - \text{Legbyes}}{\text{Legal Deliveries Bowled} / 6.0}$.

---

### Q14: How does the system handle ties or no-result matches?
**Answer**: Ties and Super Overs are captured in `fact_match` under `result = 'tie'` or `'no result'` and excluded from standard win/loss percentage denominators.

---

### Q15: Why prioritize custom CSS and dark SaaS UX design over generic templates?
**Answer**: Sports analytics dashboards require high information density, deep dark charcoal backgrounds (`#0B0F17`), vivid accent colors (pitch green `#10B981`, gold `#F59E0B`), and clean Bloomberg/SaaS aesthetics for fast visual parsing by coaches and recruitment analysts.
