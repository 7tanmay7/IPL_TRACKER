# Data Dictionary & Field Specifications

## 1. Dimension Tables

### `dim_player`
| Field | Type | Description |
| :--- | :--- | :--- |
| `player_id` | INT | Primary key |
| `player_name` | VARCHAR | Standardized short name (e.g. V Kohli) |
| `player_full_name`| VARCHAR | Complete registered name (e.g. Virat Kohli) |
| `bat_style` | VARCHAR | Batting hand style (Right hand Bat, Left hand Bat) |
| `bowl_style` | VARCHAR | Bowling delivery style |
| `player_image` | VARCHAR | Headshot photo URL |

### `dim_team`
| Field | Type | Description |
| :--- | :--- | :--- |
| `team_id` | INT | Primary key |
| `team_name` | VARCHAR | Standardized franchise name (e.g. Mumbai Indians) |
| `team_name_short`| VARCHAR | Short code (e.g. MI, CSK, RCB) |
| `image_url` | VARCHAR | Franchise logo URL |

---

## 2. Fact Tables

### `fact_delivery`
| Field | Type | Description |
| :--- | :--- | :--- |
| `match_id` | VARCHAR | Match identifier |
| `innings` | INT | Innings number (1 or 2) |
| `over` | INT | 0-indexed over (0 to 19) |
| `ball` | INT | Ball index within over |
| `batter` | VARCHAR | Striking batter |
| `bowler` | VARCHAR | Delivery bowler |
| `batter_runs` | INT | Runs scored off bat |
| `extra_runs` | INT | Sundries (wides, noballs, legbyes, byes) |
| `total_runs` | INT | Total delivery runs |
| `is_legal` | BOOLEAN | TRUE if not wide and not no-ball |
| `is_wicket` | BOOLEAN | TRUE if dismissal occurred |
| `match_phase` | VARCHAR | Powerplay (0-5), Middle Overs (6-14), Death Overs (15-19) |
