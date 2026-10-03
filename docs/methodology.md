# Analytics & Data Engineering Methodology

## 1. Metric Formulas

- **Batting Average**:
  $$\text{Batting Average} = \frac{\text{Total Batting Runs}}{\text{Total Dismissals}}$$
  *(If dismissals = 0, average equals total runs scored).*

- **Batting Strike Rate**:
  $$\text{Strike Rate} = \frac{\text{Total Batting Runs}}{\text{Legal Deliveries Faced}} \times 100$$

- **Bowling Economy**:
  $$\text{Economy} = \frac{\text{Runs Conceded (Excluding Byes \& Legbyes)}}{\text{Overs Bowled}}$$
  Where $\text{Overs Bowled} = \frac{\text{Legal Deliveries Bowled}}{6}$.

- **Player Consistency Index**:
  Calculated as a normalized coefficient of variation:
  $$\text{Consistency Score} = 100 - \left( \frac{\sigma_{\text{runs}}}{\mu_{\text{runs}}} \times 30 \right)$$
  Higher scores represent lower run output variance across innings.

- **Composite Scouting Recruitment Score**:
  Configurable weighted percentile sum:
  $$\text{Scouting Score} = w_1 \cdot \text{Runs}_{pct} + w_2 \cdot \text{SR}_{pct} + w_3 \cdot \text{Consistency}_{pct} + w_4 \cdot \text{DeathSR}_{pct} + w_5 \cdot \text{PPSR}_{pct}$$

## 2. Match Phase Definitions

- **Powerplay**: Overs 1 to 6 (represented as 0-indexed overs 0..5)
- **Middle Overs**: Overs 7 to 15 (represented as 0-indexed overs 6..14)
- **Death Overs**: Overs 16 to 20 (represented as 0-indexed overs 15..19)
