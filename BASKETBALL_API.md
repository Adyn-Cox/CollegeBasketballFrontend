# Basketball API – Quick Reference

Copy/paste examples for every endpoint the frontend uses. Base URL: backend `/api` (e.g. `http://localhost:5000/api` or via Next.js rewrite `/backend/api`).

---

## Team Endpoints

```bash
# Get team by ID
GET /api/teams/37                    # Arizona
GET /api/teams/1027                  # San Diego State

# Search teams by name
GET /api/teams?search=arizona        # Returns all teams with "arizona" in name
GET /api/teams?search=duke&limit=10  # Search with limit

# Get team's schedule
GET /api/teams/37/schedule           # Arizona's full schedule
GET /api/teams/37/schedule?season=2026

# Get team's games (with filters)
GET /api/teams/37/games              # All games
GET /api/teams/37/games?past_only=true    # Only completed games
GET /api/teams/37/games?upcoming_only=true # Only future games
GET /api/teams/37/games?status=final      # Only finished games

# Get team stats
GET /api/teams/37/stats              # Default season (2026)
GET /api/teams/37/stats?season=2026

# Only teams that can be used for predictions (D1 with KenPom data)
GET /api/teams?predictable=true&limit=500   # All ~364 predictable teams (head-to-head dropdowns)
GET /api/teams?predictable=true&search=duke
GET /api/teams?predictable=true&search=san%20diego
GET /api/teams?predictable=true&conference=SEC
```

| Endpoint | What it returns |
|----------|------------------|
| `GET /api/teams` | All 1400+ teams |
| `GET /api/teams?predictable=true` | Only D1 teams with prediction data (~364) |
| `GET /api/teams?predictable=true&search=X` | Search within predictable teams |

---

## ML Matchup Endpoint (primary for frontend)

Format: `/api/ml/matchup/{home_team_id}/{away_team_id}`  
**Important:** First ID = **home** team, second ID = **away** team.

```bash
GET /api/ml/matchup/874/1229         # Oregon (home) vs UCLA (away)
GET /api/ml/matchup/415/1171         # Georgia (home) vs Tennessee (away)
GET /api/ml/matchup/1027/243         # San Diego State (home) vs Colorado State (away)

# With season (optional)
GET /api/ml/matchup/874/1229?season=2026
```

**ML Matchup response shape:**

```json
{
  "home_team_id": 874,
  "home_team_school": "Oregon",
  "away_team_id": 1229,
  "away_team_school": "UCLA",
  "home_win_probability": 0.2274,
  "predicted_home_score": 70.5,
  "predicted_away_score": 73.5,
  "predicted_margin": -3.1,
  "confidence_score": 0.5453,
  "predicted_winner": "UCLA",
  "model_version": "kenpom_fallback"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `home_win_probability` | number | 0–1 scale |
| `predicted_margin` | number | Negative = away wins |
| `confidence_score` | number | 0–1 scale |
| `features` | object? | Optional; model inputs if present |

**TypeScript type:**

```typescript
interface MLMatchupResponse {
  home_team_id: number;
  home_team_school: string;
  away_team_id: number;
  away_team_school: string;
  home_win_probability: number;   // 0-1
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_margin: number;
  confidence_score: number;       // 0-1
  predicted_winner: string;
  model_version: string;
  features?: Record<string, number>;
}
```

---

## KenPom Endpoints

```bash
# Get team's KenPom rating
GET /api/kenpom/ratings/37           # Arizona's rating
GET /api/kenpom/ratings/37?season=2026

# Get all KenPom ratings (paginated)
GET /api/kenpom/ratings?season=2026&limit=50&offset=0

# KenPom matchup analysis
GET /api/kenpom/matchup/874/1229     # Oregon vs UCLA

# Four Factors
GET /api/kenpom/four-factors/37      # Arizona's four factors
GET /api/kenpom/four-factors/37?season=2026
```

---

## Games Endpoints

```bash
# Today's games
GET /api/games/today

# This week's games
GET /api/games/week
GET /api/games/week?start_date=2026-01-28

# Specific game
GET /api/games/12345
```

---

## Conferences

```bash
# Get all conferences
GET /api/conferences
```

---

## User Endpoints (requires auth)

```bash
# Favorites
GET /api/users/me/favorites
POST /api/users/me/favorites              # body: { "team_id": 37 }
DELETE /api/users/me/favorites/37

# Predictions
GET /api/users/me/predictions
GET /api/users/me/prediction-stats
POST /api/predictions                     # body: { "game_id": 123, "predicted_winner_id": 37 }
```

---

## Finding Team IDs

The frontend needs **numeric team IDs**. Use search to get them:

```bash
GET /api/teams?search=san%20diego%20state
```

Example response:

```json
{
  "teams": [
    {
      "id": 1027,
      "school": "San Diego State",
      "abbreviation": "SDSU"
    }
  ]
}
```

Use the `id` value in all other endpoints (stats, schedule, ML matchup, KenPom).

---

## Common Team IDs (for testing)

| Team              | ID   |
|-------------------|------|
| Arizona           | 37   |
| Duke              | 321  |
| UCLA              | 1229 |
| Oregon            | 874  |
| Tennessee         | 1171 |
| Georgia           | 415  |
| San Diego State   | 1027 |
| Colorado State    | 243  |
| Kansas            | 539  |
| Kentucky          | 549  |

---

## Common Frontend Mistakes

1. **Wrong order in matchup URL**
   - ❌ `/api/ml/matchup/away_id/home_id`
   - ✅ `/api/ml/matchup/home_id/away_id`

2. **Missing team ID in stats**
   - ❌ `/api/teams/stats?team=arizona`
   - ✅ `/api/teams/37/stats`

3. **Using name instead of ID**
   - ❌ `/api/ml/matchup/arizona/duke`
   - ✅ `/api/ml/matchup/37/321`

4. **KenPom ratings without season**
   - ❌ `/api/kenpom/ratings` (will error)
   - ✅ `/api/kenpom/ratings?season=2026`

---

## Handling Backend Gaps

- **404 on `/api/teams/{id}/stats`** – Some teams have no stats in the backend; show a friendly message and avoid calling ML matchup for that team if needed.
- **400/500 on `/api/ml/matchup/{home}/{away}`** – Some ID pairs may lack ML data; show “Prediction unavailable” and do not treat as a hard error.
- Prefer **`/api/games/today`** and **`/api/games/week`** over date-filtered game endpoints that may not exist.
