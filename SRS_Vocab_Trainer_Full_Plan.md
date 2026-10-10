# Spaced Repetition Vocabulary Trainer: Full-Scope Plan

**Goal:** Deliver the complete challenge with nothing cut, including the bonus features.
**Timeline:** 3 days (about 20 hours of focused work), matching the spec's 2-3 day limit.
**Stack:** FastAPI + SQLite + Alembic, ReactJS + Axios, generated Python SDK, Windows `.bat` scripts. No Docker.

> This plan restores everything the 6-hour version trimmed. Items marked **(restored)** were cut earlier.

---

## 1. What was restored

| Feature | 6-hour version | This plan |
|---|---|---|
| Code structure **(restored)** | Flat files | Modular layers: routers, services, repositories, schemas, core |
| Test coverage **(restored)** | About 10 tests | About 25-30 tests, with a coverage report |
| Duplicate words **(restored)** | Optional | 409 Conflict, backed by a unique index (second Alembic migration) |
| Global error handling and logging **(restored)** | "Handled gracefully" | Global exception handler, consistent error JSON, request logging |
| Pagination **(restored)** | None | `limit` / `offset` on history and upcoming |
| Frontend routing **(restored)** | Tab switcher | React Router with 4 pages |
| Frontend error and loading states **(restored)** | None | Loading spinners, error banners, empty states |
| Styling **(restored)** | None | Light, clean CSS (still not fancy) |
| Charts bonus **(restored)** | Skipped | Accuracy-over-time line chart and score-distribution bar chart |
| Real-time bonus **(restored)** | Refetch only | Auto-refreshing due count (polling every 30s) |
| SDK tests **(restored)** | One script | A pytest file that exercises the generated SDK against a live test server |
| Alembic extras **(restored)** | One migration | Two migrations plus a tested downgrade path |

---

## 2. The problem in plain words

A flashcard app. Users add words, then rate how well they remembered each one (0-5). The score decides when the word comes back.

```
React UI --Axios--> FastAPI --> SQLite
                      |
                      +--> openapi.json --> generated Python SDK
```

---

## 3. Core SRS logic (unchanged, most heavily graded)

Per word, track: `repetition`, `interval` (days), `easiness_factor` (EF, starts at **2.5**), `next_review`.

| Review # | Score 5 | Score 3-4 | Score 0-2 |
|---|---|---|---|
| 1st | interval = **5 days** | interval = **2 days** | interval = **1 day**, repetition = 0 |
| 2nd and later | `round(prev * EF)` | `max(prev + 1, round(prev * 1.2))` | interval = **1 day**, repetition = 0 |

EF update (every review, floor 1.3):

```
EF_new = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
```

| Score | EF change | From 2.5 |
|---|---|---|
| 5 | +0.10 | 2.60 |
| 4 | 0.00 | 2.50 |
| 3 | -0.14 | 2.36 |
| 2 | -0.32 | 2.18 |
| 1 | -0.54 | 1.96 |
| 0 | -0.80 | 1.70 |

Worked example:
- Word A, score 5: 5 days, EF 2.6. Again score 5: EF 2.7, interval round(5 * 2.7) = **14 days**.
- Word B, score 1: **1 day**, repetition 0, EF 1.96.

Due rule: `GET /words/due/` returns words whose latest `next_review <= today`. Words with no reviews are due.

### Metric definitions (write these in the README)

| Metric | Definition |
|---|---|
| Accuracy | Reviews with score >= 3, divided by total reviews |
| Streak | Consecutive calendar days with at least one review, counting back from today |
| Difficult words | Words with the lowest current EF, tie-broken by most failed reviews |

---

## 4. Target project structure

```
project/
  main.py                    # root entry: runs uvicorn (required by runapplication.bat)
  app/
    __init__.py
    api.py                   # builds the FastAPI app, includes routers, handlers
    deps.py                  # get_db dependency
    core/
      config.py              # settings (DB URL, CORS origins)
      logging.py             # logging setup
      errors.py              # custom exceptions + global handlers
    db/
      database.py            # engine, session, SQLite PRAGMA foreign_keys=ON
      models.py              # Word, Review
    schemas/
      word.py                # request/response models
      review.py
      history.py
    repositories/
      word_repo.py           # database queries only
      review_repo.py
    services/
      srs.py                 # pure algorithm (no DB)
      word_service.py        # business logic
      stats_service.py       # accuracy, streak, difficult words
    routers/
      words.py
  alembic/
    versions/                # 2 migrations
  tests/
    conftest.py
    test_srs.py
    test_words_api.py
    test_review_api.py
    test_due_upcoming.py
    test_history.py
    test_errors.py
    test_migrations.py
  frontend/
  srs_sdk/                   # generated
  sdk_tests/
  seed_data.sql
  requirements.txt
  setupdev.bat
  runapplication.bat
  README.md
```

Rule of thumb: routers only handle HTTP, services hold the rules, repositories only talk to the database.

---

## 5. Phases and schedule

### DAY 1: Backend (about 8 hours)

#### Phase 1: Setup (1 hour)
- [ ] Check tools: `java -version`, `node -v`, `python --version`
- [ ] Create the folder structure above and a venv
- [ ] `requirements.txt`: fastapi, uvicorn, sqlalchemy, alembic, pytest, pytest-cov, httpx, pydantic
- [ ] `git init`, add `.gitignore` (env, node_modules, `*.db`, `__pycache__`)
- [ ] **Done when:** `python main.py` serves `/docs`.

#### Phase 2: Database and migrations (1.5 hours)
- [ ] SQLAlchemy models matching the spec schema exactly (CHECK on score, `ON DELETE CASCADE`)
- [ ] `PRAGMA foreign_keys=ON` on every connection
- [ ] Alembic migration 1: create `words` and `reviews`
- [ ] Alembic migration 2 **(restored)**: unique index on `(lower(word), language)` to block duplicates
- [ ] Test `alembic downgrade -1` and `upgrade head` both work **(restored)**
- [ ] `seed_data.sql`: about 8 words, 10+ reviews across several dates (some due, some future)
- [ ] **Done when:** upgrade, downgrade and seed all run clean.

#### Phase 3: SRS algorithm (1 hour)
- [ ] Pure function `calculate_next(repetition, interval, ef, score) -> (repetition, interval, ef)`
- [ ] Constants for rule values (5 days, 2 days, 1.2 multiplier, EF floor 1.3)
- [ ] Unit tests from the worked example in section 3
- [ ] **Done when:** all rules in the table pass.

#### Phase 4: Core, errors and logging (1 hour) **(restored)**
- [ ] `core/config.py` for settings and CORS origins
- [ ] `core/logging.py`: log each request (method, path, status, time)
- [ ] `core/errors.py`: `WordNotFound`, `DuplicateWord` exceptions
- [ ] Global handlers returning one consistent JSON shape: `{"detail": "...", "code": "..."}`
- [ ] A catch-all handler so unexpected errors return a clean 500, not a stack trace
- [ ] **Done when:** a forced error returns clean JSON and is logged.

#### Phase 5: Endpoints (2.5 hours)
- [ ] `POST /words/`: 201 on success, **409 on duplicate** (case-insensitive, same language) **(restored)**
- [ ] `GET /words/due/`
- [ ] `POST /words/{word_id}/review/`: validate score 0-5, save a `reviews` row, return the new schedule
- [ ] `GET /words/history/` with `limit` and `offset` **(restored)**: accuracy, streak, difficult words, recent reviews
- [ ] `DELETE /words/{word_id}`: 204 on success, 404 if missing
- [ ] Extra: `GET /words/upcoming/` with `limit` and `offset` **(restored)**
- [ ] `Depends(get_db)` for dependency injection everywhere
- [ ] Pydantic validation: score `ge=0, le=5`, trimmed non-empty strings, max lengths
- [ ] Tags and clear `operation_id` per route so the generated SDK has clean method names
- [ ] **Done when:** every endpoint works in Swagger UI, including error cases.

#### Phase 6: Stats service (1 hour)
- [ ] Accuracy, streak and difficult-words functions from the definitions in section 3
- [ ] Keep them pure and separate so they are easy to test
- [ ] **Done when:** numbers match the hand-calculated example data.

### DAY 2: Tests and frontend (about 8 hours)

#### Phase 7: Backend tests (2.5 hours) **(restored: 25-30 tests)**
- [ ] `conftest.py`: temp SQLite DB, `get_db` override, fixtures for words and reviews
- [ ] `test_srs.py` (about 8): each score band, first vs later reviews, EF floor 1.3, interval rounding
- [ ] `test_words_api.py` (about 6): add, add invalid, duplicate returns 409, delete, delete missing returns 404, cascade removes reviews
- [ ] `test_review_api.py` (about 5): score 5, score 3, score 1, invalid score 7 returns 422, unknown word returns 404
- [ ] `test_due_upcoming.py` (about 4): only due words returned, new words are due, future words excluded, upcoming ordered by date
- [x] `test_history.py` (about 4): accuracy, streak with a gap, difficult words order, pagination
- [x] `test_errors.py` (about 2): consistent error JSON shape, catch-all 500
- [x] `test_migrations.py` (about 1): upgrade then downgrade works
- [x] Run `pytest --cov=app` and aim for 85%+
- [x] **Done when:** all green and the coverage number is in the README.

#### Phase 8: Frontend foundation (1 hour)
- [x] Create the app in `frontend/`, install `axios`, `react-router-dom`, and a chart library (`recharts`)
- [x] `api.js`: one Axios instance with a base URL and an error interceptor
- [x] CORS enabled in the backend for `http://localhost:3000`
- [x] Layout with a navigation bar showing a **live due-count badge**
- [x] **Done when:** the app loads and talks to the backend.

#### Phase 9: Frontend pages (3.5 hours)
- [x] **Add Word** (`/add`): form with validation messages, shows the 409 duplicate error nicely **(restored)**
- [x] **Review** (`/review`): card shows the word, "Show definition" button, then 0-5 buttons with labels (0 blackout ... 5 perfect). Shows progress like "3 of 10", and a "you're done" empty state.
- [x] **Upcoming** (`/upcoming`): table of words and next-review dates, grouped by day, with pagination
- [x] **Progress** (`/progress`): accuracy %, streak, difficult-words list, plus **charts (restored)**:
  - [x] Line chart: accuracy per day
  - [x] Bar chart: how many reviews got each score (0-5)
- [x] Every page handles loading, error and empty states **(restored)**
- [x] Light CSS: readable fonts, spacing, buttons, color-coded score buttons **(restored)**
- [x] **Done when:** you can add, review, and see changes reflected in Upcoming and Progress.

#### Phase 10: Real-time updates (1 hour) **(restored)**
- [x] Poll `GET /words/due/` every 30 seconds to refresh the navbar badge
- [x] Refresh Upcoming and Progress after each submitted review
- [x] Pause polling when the browser tab is hidden
- [x] Optional stretch: swap polling for Server-Sent Events if time remains
- [x] **Done when:** the badge updates without a manual refresh.

### DAY 3: SDK, scripts, docs and polish (about 4-5 hours)

#### Phase 11: SDK generation and tests (1.5 hours)
- [x] Start the backend, then:
  ```bash
  npm install -g @openapitools/openapi-generator-cli
  openapi-generator-cli generate -i http://localhost:8000/openapi.json -g python -o srs_sdk
  ```
- [x] Confirm `from srs_sdk.api.words_api import WordsApi` works
- [x] `sdk_tests/test_sdk.py` **(restored)**: against a running test server, add a word, fetch due, submit a review, fetch history, delete the word
- [x] Add a short `examples/sdk_demo.py`
- [x] **Done when:** the SDK tests pass.

#### Phase 12: Batch scripts (1 hour)
- [x] `setupdev.bat`: venv, `pip install`, `alembic upgrade head`, `npm install`, optional seed load
- [x] `runapplication.bat`: `start "backend" cmd /k ...` and `start "frontend" cmd /k ...` so both servers stay running
- [x] Add error checks (`if errorlevel 1`) with clear messages
- [x] **Done when:** both scripts work on a clean folder.

#### Phase 13: README (1 hour)
- [x] Overview and architecture diagram
- [x] Prerequisites: Python, Node, **Java (needed for the SDK generator)**
- [x] Setup, run, tests and coverage, SDK generation
- [x] SRS rules table, metric definitions, and the note on the custom first-review rule
- [x] Endpoint list with example requests and responses
- [x] Project structure and design decisions
- [x] Known limitations

#### Phase 14: Final clean-run check (1 hour)
- [x] Fresh clone: delete `env`, `node_modules`, and the `.db` file
- [x] Run `setupdev.bat`, then `runapplication.bat`
- [x] Walk through: add word, review with 5, review another with 1, check Upcoming, check Progress and charts, delete a word
- [x] Run `pytest` and the SDK tests one last time

---

## 6. Time summary

| Day | Focus | Hours |
|---|---|---|
| Day 1 | Setup, DB, algorithm, errors and logging, endpoints, stats | about 8 |
| Day 2 | Tests, frontend pages, charts, real-time | about 8 |
| Day 3 | SDK and SDK tests, scripts, README, final run | about 4-5 |
| **Total** | | **about 20-21** |

If you run behind, drop things in this order: SSE stretch, then chart polish, then styling polish. Never drop the SRS rules, the 5 endpoints, the tests, the SDK, the scripts, or the README.

---

## 7. Must-get-right list

1. SRS rules match the spec examples exactly
2. `/words/due/` only returns `next_review <= today`
3. Proper error codes: 404, 409, 422 and a clean 500
4. SDK generated with the CLI, not hand-written
5. Both `.bat` scripts work from a clean machine
6. Tests present and passing
7. README with install and run steps

## 8. Final submission checklist

- [x] Backend source (modular)
- [x] SQLite DB and 2 Alembic migrations
- [x] `seed_data.sql`
- [x] React frontend with routing, charts and live updates
- [x] `srs_sdk/` (generated) and `sdk_tests/`
- [x] `setupdev.bat` and `runapplication.bat`
- [x] `tests/` with coverage report
- [x] `README.md`

