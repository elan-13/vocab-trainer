# Spaced Repetition Vocabulary Trainer (SRS)

A production-grade, full-stack Spaced Repetition Vocabulary Trainer application built with FastAPI, SQLite, Alembic, React, and an auto-generated Python SDK.

---

## 1. System Overview & Architecture

The application applies an SM-2 inspired Spaced Repetition System (SRS) algorithm to optimize human vocabulary retention. Flashcards due for review are calculated based on user recall feedback (scores 0–5), adjusting interval days, repetitions, and easiness factors dynamically.

```mermaid
graph TD
    User([User]) <--> ReactApp[React + Vite Frontend (Port 3000)]
    ReactApp <-->|REST API + Axios| FastAPI[FastAPI Backend (Port 8000)]
    FastAPI <-->|SQLAlchemy ORM| SQLite[(SQLite Database: vocab.db)]
    FastAPI <--> Alembic[Alembic Migrations]
    FastAPI -.->|OpenAPI Schema| OpenAPIGen[OpenAPI Generator CLI]
    OpenAPIGen --> PythonSDK[srs_sdk Python Client]
    PythonSDK <-->|Live Integration| FastAPI
```

---

## 2. Prerequisites

- **Python**: 3.10+ (tested on Python 3.10.8)
- **Node.js**: 18+ (tested on Node 24.7.0 and npm 10.8.2)
- **Java**: 11+ (tested on Java SE 24.0.2 - required by `openapi-generator-cli`)
- **OS**: Windows (PowerShell or Command Prompt)

---

## 3. Quickstart & Installation

### Option A: Automated Batch Scripts (Windows)

1. **Install and Migrate**:
   ```cmd
   setupdev.bat
   ```
   *Creates the `env` venv, installs requirements, executes Alembic migrations, installs frontend packages, and installs `srs_sdk` in editable mode.*

2. **Run Both Servers**:
   ```cmd
   runapplication.bat
   ```
   *Launches FastAPI at `http://localhost:8000` and Vite React at `http://localhost:3000` concurrently.*

### Option B: Manual Setup

#### 1. Backend Setup
```powershell
python -m venv env
.\env\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python main.py
```
*Backend runs at `http://localhost:8000`. Interactive Swagger UI: `http://localhost:8000/docs`.*

#### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## 4. Test Suite & Coverage

The test suite covers the pure SRS algorithm, FastAPI endpoints, repository layers, error shapes, database migrations, and an end-to-end live server integration test for the Python SDK.

To execute tests with coverage:
```powershell
$env:PYTHONPATH="."
.\env\Scripts\python -m pytest --cov=app --cov-report=term-missing
```

### Coverage Report: **99%**
```
Name                              Stmts   Miss  Cover   Missing
---------------------------------------------------------------
app\__init__.py                       0      0   100%
app\api.py                           23      1    96%   30
app\core\__init__.py                  0      0   100%
app\core\config.py                    5      0   100%
app\core\errors.py                   21      0   100%
app\core\logging.py                  17      0   100%
app\db\database.py                   13      0   100%
app\db\models.py                     23      0   100%
app\deps.py                           6      0   100%
app\repositories\__init__.py          0      0   100%
app\repositories\review_repo.py      12      0   100%
app\repositories\word_repo.py        27      0   100%
app\routers\__init__.py               0      0   100%
app\routers\words.py                 30      0   100%
app\schemas\__init__.py               0      0   100%
app\schemas\history.py                9      0   100%
app\schemas\review.py                15      0   100%
app\schemas\word.py                  16      0   100%
app\services\__init__.py              0      0   100%
app\services\srs.py                  19      0   100%
app\services\stats_service.py        42      1    98%   32
app\services\word_service.py         35      0   100%
---------------------------------------------------------------
TOTAL                               313      2    99%
======================== 40 passed in 1.46s ========================
```

---

## 5. Spaced Repetition (SRS) Algorithm

The scheduling logic is encapsulated in `app/services/srs.py`:

```
calculate_next(repetition, interval, ef, score) -> (repetition, interval, ef)
```

### Easiness Factor (EF)
- Initial EF: `2.5`
- Minimum EF floor: `1.3`
- Formula:
  $$\Delta EF = 0.1 - (5 - \text{score}) \times (0.08 + (5 - \text{score}) \times 0.02)$$
  $$EF_{\text{new}} = \max(1.3, EF_{\text{old}} + \Delta EF)$$

### Scheduling Rules

| Condition | Rule |
|---|---|
| **Score < 3 (Failed Review)** | Repetition resets to `0`, Interval resets to `0` (word due today). EF decreases. |
| **First Review (Repetition == 0)** | • Score $\ge 4$: interval = `5` days<br>• Score $= 3$: interval = `2` days<br>• Repetition increments to `1`. |
| **Later Reviews (Repetition > 0)** | • Interval = $\text{round}(\text{previous\_interval} \times EF_{\text{new}} \times 1.2)$<br>• Repetition increments by `1`. |

> **Note on Custom First-Review Rule**: Unlike basic SM-2 (which sets fixed 1 or 6 day intervals), this system applies a tailored first-review jump (5 days for scores 4–5, 2 days for score 3) to prevent repetitive early reviews of effortless vocabulary while reinforcing items requiring recall effort.

---

## 6. API Reference

All error responses adhere to a consistent JSON format:
```json
{
  "detail": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

### Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/words/` | Create a new vocabulary card | 201, 409 (duplicate), 422 |
| `GET` | `/words/due/` | Retrieve all flashcards due for review (`next_review <= now`) | 200 |
| `POST` | `/words/{word_id}/review/` | Submit recall score (0–5) and update SRS schedule | 200, 404, 422 |
| `GET` | `/words/upcoming/` | Paginated list of future reviews | 200 |
| `GET` | `/words/history/` | Accuracy %, streak days, difficult words, recent reviews | 200 |
| `DELETE` | `/words/{word_id}` | Delete card and cascade delete review records | 204, 404 |

#### Example Request: Create Word
```http
POST /words/
Content-Type: application/json

{
  "word": "Ineluctable",
  "language": "English",
  "translation": "Unable to be resisted or avoided; inescapable."
}
```
**Response (201 Created):**
```json
{
  "id": 1,
  "word": "Ineluctable",
  "language": "English",
  "translation": "Unable to be resisted or avoided; inescapable.",
  "repetition": 0,
  "interval": 0,
  "easiness_factor": 2.5,
  "next_review": "2026-10-11T00:00:00"
}
```

#### Example Request: Duplicate Conflict
If the same word is submitted for the same language (case-insensitive):
**Response (409 Conflict):**
```json
{
  "detail": "Word 'ineluctable' already exists for language 'English'",
  "code": "DUPLICATE_WORD"
}
```

#### Example Request: Submit Review
```http
POST /words/1/review/
Content-Type: application/json

{
  "score": 5
}
```
**Response (200 OK):**
```json
{
  "new_repetition": 1,
  "new_interval": 5,
  "new_easiness_factor": 2.6,
  "next_review": "2026-10-16T00:00:00"
}
```

---

## 7. Python SDK Generation & Usage

The Python SDK is generated using `@openapitools/openapi-generator-cli`.

### Regenerating the SDK
```powershell
# 1. Export schema
.\env\Scripts\python -c "import json; from app.api import app; open('openapi.json', 'w').write(json.dumps(app.openapi(), indent=2))"

# 2. Run generator
npx -y @openapitools/openapi-generator-cli generate -i openapi.json -g python -o srs_sdk --package-name srs_sdk

# 3. Install in editable mode
pip install -e .\srs_sdk
```

### SDK Code Example (`examples/sdk_demo.py`)
```python
from srs_sdk.api.words_api import WordsApi
from srs_sdk.configuration import Configuration
from srs_sdk.api_client import ApiClient
from srs_sdk.models.word_create import WordCreate
from srs_sdk.models.review_create import ReviewCreate

config = Configuration(host="http://localhost:8000")

with ApiClient(config) as client:
    words_api = WordsApi(client)
    
    # Create word
    word = words_api.create_word(
        WordCreate(word="Schmetterling", language="German", translation="Butterfly")
    )
    
    # Review with score 4
    result = words_api.review_word(word.id, ReviewCreate(score=4))
    print(f"Next review interval: {result.new_interval} days")
```

---

## 8. Frontend Features

- **Interactive Flashcards (`/review`)**: Word reveal, spacebar shortcut, color-coded score buttons (0–5) with keyboard shortcuts (0–5), card counter, progress bar, and celebratory empty state.
- **Add Vocabulary (`/add`)**: Form validation, duplicate detection banner (HTTP 409 handled cleanly), popular language selector + custom language input.
- **Upcoming Schedule (`/upcoming`)**: Words grouped by scheduled review date (Today, Tomorrow, In X Days), pagination, and word deletion.
- **Progress & Analytics (`/progress`)**:
  - Retention accuracy metric card
  - Review streak indicator (with flame badge)
  - Daily Retention Accuracy line chart (Recharts)
  - Score Distribution bar chart (Recharts)
  - Difficult words table (ranked by lowest EF and failures)
  - Paginated recent review activity log
- **Real-Time Polling**: Automatic 30-second interval polling of due words with background tab detection (`document.visibilityState` pauses polling when inactive).

---

## 9. Design Decisions & Known Limitations

### Design Decisions
- **Repository Pattern**: Strict decoupling between database operations (`app/repositories`), business domain rules (`app/services`), and HTTP endpoints (`app/routers`).
- **SQLite Foreign Key & Unique Index Support**: SQLite disables foreign keys by default. We enforce `PRAGMA foreign_keys=ON` on engine connect, and use Alembic migration 2 with raw SQL index `ix_words_lower_word_language ON words (lower(word), language)`.
- **Pure Statistics Engine**: `stats_service.py` functions operate purely over review and word collections, making them deterministically testable without requiring mock database queries.

### Known Limitations
- Single-user mode: Authentication is not implemented per spec; all records share a single SQLite workspace.
- Real-time updates currently utilize polling (every 30 seconds) rather than WebSockets or SSE.
