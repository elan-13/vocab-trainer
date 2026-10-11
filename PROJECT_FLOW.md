# Spaced Repetition Vocabulary Trainer — End-to-End Project Flow

> **Audience:** Technical Recruiters, Hiring Managers, and Senior Engineering Evaluators.  
> **Summary:** This document provides a complete walkthrough of the architecture, data flow, algorithm mechanics, and user journey of the Spaced Repetition Vocabulary Trainer application.

---

## 1. Executive Architecture Overview

The system is built as a **5-tier decoupled full-stack architecture** designed for production readiness, predictability, and high maintainability:

```mermaid
flowchart TD
    subgraph Client["1. Presentation Tier (React 19 + Vite)"]
        UI_Dash["Dashboard Hub"]
        UI_Review["Interactive Flashcards (TTS Audio)"]
        UI_Upcoming["Upcoming Schedule & Filters"]
        UI_Stats["Analytics (Recharts)"]
        AxiosClient["Axios Client (X-API-Key Interceptor)"]
    end

    subgraph Security["2. Transport & Security Tier (FastAPI)"]
        CORS["CORS Middleware (Port & Regex Whitelist)"]
        AuthFilter["API Key Guard (Security Dependency)"]
        LogFilter["Timing & Request Logger"]
        ErrorHandler["Global AppError Handler (4xx/5xx)"]
    end

    subgraph Domain["3. Business Logic Tier"]
        SRSLogic["SM-2 SRS Scheduling Engine"]
        Ebbinghaus["Ebbinghaus Retention Meter"]
        StatsEngine["Streak & Accuracy Calculator"]
    end

    subgraph Persistence["4. Data Access Tier"]
        WordRepo["Word Repository"]
        ReviewRepo["Review Repository"]
        SQLA["SQLAlchemy ORM"]
        DB[("SQLite Database (vocab.db)")]
        AlembicLineage["Alembic Migrations"]
    end

    subgraph Automation["5. SDK & Client Tier"]
        OpenAPI["OpenAPI 3.1 Spec (openapi.json)"]
        SDK["Python Client SDK (srs_sdk)"]
        LiveTests["Live Server Integration Suite"]
    end

    %% Flow connections
    Client -->|HTTP + X-API-Key| Security
    Security --> Domain
    Domain --> Persistence
    Persistence --> DB
    AlembicLineage -.-> DB
    Security -.->|Schema Export| OpenAPI
    OpenAPI --> SDK
    SDK -.->|End-to-End Testing| LiveTests
```

---

## 2. UML Use Case Diagram

This diagram visualizes how the different actors (Language Learner, Python SDK Developer, and System Poller) interact with the functional capabilities of the system.

```mermaid
graph LR
    classDef actorStyle fill:#1e293b,stroke:#64748b,stroke-width:2px,color:#f8fafc;
    classDef ucStyle fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#e2e8f0;

    User(("👤 Language Learner<br/>(Web UI)")):::actorStyle
    Dev(("💻 Developer / Script<br/>(Python SDK)")):::actorStyle
    Poller(("⏰ Background Poller<br/>(30s Visibility)")):::actorStyle

    subgraph SystemBoundary[" 🌟 Spaced Repetition Vocabulary System Boundary "]
        UC_Import(["1-Click Starter Decks Import<br/>(8 Curated Languages)"]):::ucStyle
        UC_Add(["Add Custom Word & Translation"]):::ucStyle
        UC_Review(["Review Due Flashcards Queue"]):::ucStyle
        UC_TTS(["Listen Native Audio Pronunciation<br/>(Web Speech API)"]):::ucStyle
        UC_Score(["Rate Recall Quality (0–5)<br/>(SuperMemo SM-2 Math)"]):::ucStyle
        UC_Battery(["Inspect Visual Memory Battery<br/>(Ebbinghaus Forgetting Curve)"]):::ucStyle
        UC_Schedule(["Filter Upcoming Schedule by Language"]):::ucStyle
        UC_Analytics(["Track Accuracy & Streak Analytics"]):::ucStyle
        UC_Auth(["Authenticate Requests<br/>(Header: X-API-Key)"]):::ucStyle
        UC_SDK(["Automated Programmatic CRUD<br/>(srs_sdk Client Library)"]):::ucStyle
    end

    User --> UC_Import
    User --> UC_Add
    User --> UC_Review
    User --> UC_TTS
    User --> UC_Score
    User --> UC_Battery
    User --> UC_Schedule
    User --> UC_Analytics

    Poller --> UC_Review

    Dev --> UC_Auth
    Dev --> UC_SDK

    UC_Review -.->|<<requires>>| UC_Auth
    UC_Add -.->|<<requires>>| UC_Auth
    UC_Score -.->|<<triggers>>| UC_Battery
    UC_Score -.->|<<updates>>| UC_Analytics
```

---

## 3. Flashcard Active Recall Interactive Flow Diagram

This activity flow illustrates the complete decision tree during an active learning session: from card presentation, audio pronunciation, user recall evaluation, SM-2 branch computation, database persistence, to memory battery updates.

```mermaid
flowchart TD
    StartSession([User Starts Review Session]) --> FetchDue[/GET /words/due/ with X-API-Key/]
    FetchDue --> CheckEmpty{Are cards due?}
    CheckEmpty -- No --> AllDone[Display 'All Caught Up!' Celebration Screen]
    CheckEmpty -- Yes --> LoadCard[Present Top Flashcard in Queue]

    LoadCard --> CardStateFront[Card Front: Displays Word & Target Language]
    CardStateFront --> AudioChoice{User clicks Speaker or presses 'P'?}
    AudioChoice -- Yes --> PlayTTS[Web Speech API: Play Pronunciation with Locale Tag]
    PlayTTS --> CardStateFront
    AudioChoice -- No --> FlipAction[User presses Space or clicks 'Flip Card']

    FlipAction --> CardStateBack[Card Back: Reveals Native Translation & 0-5 Scoring Scale]
    CardStateBack --> ScoreSelection{User Rates Recall Quality}

    ScoreSelection -- "Score 0-2 (Failed Recall)" --> SM2_Fail["Reset Repetition = 0<br/>Interval = 1 Day (Due Today)<br/>Decrease EF by up to -0.80"]
    ScoreSelection -- "Score 3-4 (Hesitant / Good)" --> SM2_Good["Repetition += 1<br/>1st Review: Interval = 2 Days<br/>Later: Interval = max(prev+1, round(prev * 1.2))<br/>Slight EF adjustment"]
    ScoreSelection -- "Score 5 (Perfect Recall)" --> SM2_Perfect["Repetition += 1<br/>1st Review: Interval = 5 Days<br/>Later: Interval = round(prev * EF)<br/>Increase EF (+0.10)"]

    SM2_Fail --> PersistTx[/POST /words/{id}/review/ to Backend/]
    SM2_Good --> PersistTx
    SM2_Perfect --> PersistTx

    PersistTx --> DBWrite[(Atomic DB Transaction:<br/>Insert Review Log + Update Word Schedule)]
    DBWrite --> UpdateUI[Recalculate Ebbinghaus Memory Battery & Streak]
    UpdateUI --> PopCard[Remove Card from Active Due Queue]
    PopCard --> CheckMore{Remaining cards in queue?}
    CheckMore -- Yes --> LoadCard
    CheckMore -- No --> AllDone
```

---

## 4. Level-1 Data Flow Diagram (DFD Level 1)

This diagram documents the movement of data between external actors, processing entities, and persistent data stores.

```mermaid
flowchart LR
    classDef entityStyle fill:#1e293b,stroke:#94a3b8,stroke-width:2px,color:#f8fafc;
    classDef processStyle fill:#0f766e,stroke:#2dd4bf,stroke-width:2px,color:#f0fdfa;
    classDef storeStyle fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#e0e7ff;

    UserEntity["Learner<br/>(React UI)"]:::entityStyle
    SDKEntity["Developer<br/>(Python SDK)"]:::entityStyle

    P1["1.0<br/>API Security &<br/>Header Gate"]:::processStyle
    P2["2.0<br/>Spaced Repetition<br/>Scheduler (SM-2)"]:::processStyle
    P3["3.0<br/>Vocabulary & Deck<br/>Manager"]:::processStyle
    P4["4.0<br/>Retention Analytics &<br/>Streak Engine"]:::processStyle

    D1[("D1: words Table<br/>(Words, EF, Schedule)")]:::storeStyle
    D2[("D2: reviews Table<br/>(Historical Recall Scores)")]:::storeStyle

    UserEntity -->|HTTP Request + X-API-Key| P1
    SDKEntity -->|HTTP Request + X-API-Key| P1

    P1 -->|Authorized Payload| P2
    P1 -->|Authorized Payload| P3
    P1 -->|Authorized Query| P4

    P3 <-->|Read / Write Vocabulary| D1
    P2 <-->|Fetch Word Parameters| D1
    P2 -->|Log Review Outcome| D2
    P4 <-->|Aggregate Historical Metrics| D2
    P4 <-->|Query Card Easiness| D1

    P2 -->|Updated Interval & EF| UserEntity
    P3 -->|Due Card Deck & Deletion Conf| UserEntity
    P4 -->|Streak, Accuracy, Difficult Words| UserEntity
```

---

## 5. End-to-End User Journey Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Learner / User
    participant Frontend as React Frontend (Port 3000)
    participant Backend as FastAPI Backend (Port 8000)
    participant Domain as SRS Engine (SM-2)
    participant Database as SQLite Database

    Note over User,Database: Phase 1: Dashboard & Deck Ingestion
    User->>Frontend: Opens Dashboard (http://localhost:3000)
    Frontend->>Backend: GET /words/due/ (Header: X-API-Key)
    Backend->>Database: Query words where next_review <= today
    Database-->>Backend: Return due vocabulary cards
    Backend-->>Frontend: 200 OK [word_list]
    Frontend-->>User: Displays due cards count & memory battery

    Note over User,Database: Phase 2: Active Recall Review
    User->>Frontend: Clicks "Start Review"
    Frontend-->>User: Shows word card (Word, Language, TTS Speaker button)
    User->>Frontend: Flips card to view translation
    User->>Frontend: Rates memory quality (Score 0 to 5)

    Note over User,Database: Phase 3: SRS Mathematical Calculation
    Frontend->>Backend: POST /words/{id}/review/ { score: 5 }
    Backend->>Domain: Calculate new interval, repetition & Easiness Factor (EF)
    Domain-->>Backend: interval=5 days, repetition=1, EF=2.60, next_review=today+5
    Backend->>Database: Save review log & update word schedule (atomic transaction)
    Database-->>Backend: Confirmed
    Backend-->>Frontend: 200 OK { schedule details }
    Frontend-->>User: Visual success feedback & advances to next due card

    Note over User,Database: Phase 4: Analytics & Progress
    User->>Frontend: Visits "Progress & Analytics" tab
    Frontend->>Backend: GET /words/history/?limit=50
    Backend->>Domain: Calculate streak, accuracy rate & difficult words
    Domain-->>Backend: Stats summary
    Backend-->>Frontend: 200 OK { accuracy: 85%, streak: 4 days, ... }
    Frontend-->>User: Renders charts (Recharts) and memory battery levels
```

---

## 6. The Spaced Repetition (SRS) Engine Lifecycle & Decision Tree

The core algorithm is based on SuperMemo (SM-2) with optimized initial review intervals and deterministic interval calculations:

### 6.1 SRS Mathematical Decision Tree Diagram

```mermaid
flowchart TD
    InputScore["User Submits Recall Score (q: 0 to 5)"] --> CalcEF["Calculate New Easiness Factor (EF)<br/>ΔEF = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)<br/>Floor: EF ≥ 1.3"]
    CalcEF --> BranchScore{Recall Success?}
    
    BranchScore -- "Score 0, 1, 2 (Failed / Blackout)" --> ResetCard["Reset Repetition = 0<br/>Interval = 1 Day (Due today)<br/>Reduce EF (up to -0.80)"]
    BranchScore -- "Score 3, 4, 5 (Passed Recall)" --> BranchRep{Is this the 1st Review?}
    
    BranchRep -- "Yes (Repetition == 0)" --> CheckFirstScore{Score value?}
    CheckFirstScore -- "Score 5 (Perfect)" --> Jump5["Interval = 5 Days<br/>Repetition = 1"]
    CheckFirstScore -- "Score 3 or 4 (Good)" --> Jump2["Interval = 2 Days<br/>Repetition = 1"]
    
    BranchRep -- "No (Repetition ≥ 1)" --> CheckLaterScore{Score value?}
    CheckLaterScore -- "Score 5 (Perfect)" --> MultEF["Interval = round(Prev_Interval * EF)<br/>Repetition += 1"]
    CheckLaterScore -- "Score 3 or 4 (Good)" --> MultConst["Interval = max(Prev_Interval + 1, round(Prev_Interval * 1.2))<br/>Repetition += 1"]
    
    ResetCard --> SetDate["Set next_review = CURRENT_TIMESTAMP + Interval Days"]
    Jump5 --> SetDate
    Jump2 --> SetDate
    MultEF --> SetDate
    MultConst --> SetDate
    SetDate --> CommitDB[(Commit Updated Word Schedule to SQLite)]
```

### 6.2 Visual Memory Battery (Ebbinghaus Forgetting Curve)

The frontend visualizes neural stability and memory decay dynamically:

```mermaid
stateDiagram-v2
    [*] --> Peak: Card reviewed with Score 4-5
    Peak: 🔋 Peak Retention (85%–100%)\nNewly reinforced; high stability\nVisual: Emerald Green Gauge
    Solid: 🔋 Solid Memory (65%–84%)\nRetained firmly; low decay\nVisual: Cyan / Teal Gauge
    Fading: 🪫 Fading Recall (35%–64%)\nApproaching forgetting threshold\nVisual: Amber / Orange Gauge
    Critical: 🪫 Critical Decay (<35%)\nMemory threshold reached; DUE NOW!\nVisual: Crimson Red Pulse

    Peak --> Solid: Time passes (t / S)
    Solid --> Fading: Time passes (t / S)
    Fading --> Critical: Interval reached (t ≥ Interval)
    Critical --> Peak: Reviewed with Score 4 or 5
    Critical --> Critical: Reviewed with Score 0 to 2 (due reset)
```

---

## 7. Security & Authentication Flow

To meet production software standards, access control is enforced via custom HTTP headers:

```mermaid
flowchart LR
    IncomingReq["Incoming HTTP Request"] --> CheckHeader{"Header 'X-API-Key' Present?"}
    CheckHeader -- No --> Reject403["403 Forbidden\ncode: INVALID_API_KEY"]
    CheckHeader -- Yes --> ValidateVal{"Matches Server API_KEY?"}
    ValidateVal -- No --> Reject403
    ValidateVal -- Yes --> NextEndpoint["Proceed to Endpoint Logic\n(200 / 201 Response)"]
```

- **Protected Routes:** All data mutations and spaced repetition endpoints under `/words/*`.
- **Public Routes:** `/` (System health and welcome payload), `/docs` (Interactive Swagger portal), and `/openapi.json`.
- **Zero-Friction Local Testing:** The frontend Axios client and Python SDK automatically inject the development key (`srs-dev-secret-key-2026`) with `.env` override capability.

---

## 8. Python SDK & Integration Pipeline Flow

Beyond the REST API, the project maintains an automated client SDK generation lifecycle:

```mermaid
flowchart TD
    FastAPISchemas["FastAPI Pydantic Contracts\n(WordCreate, ReviewCreate, HistoryResponse)"] --> AutoExport["Export openapi.json"]
    AutoExport --> GeneratorTool["OpenAPI Generator CLI"]
    GeneratorTool --> GeneratedSDK["srs_sdk (Python Client Library)"]
    GeneratedSDK --> LiveIntegration["Live Server Integration Test\n(sdk_tests/test_sdk.py)"]
    LiveIntegration --> Verified["Production SDK Validated\n(100% Pass Rate)"]
```

Developers can interact with the system cleanly in Python:
```python
import os
from srs_sdk.configuration import Configuration
from srs_sdk.api_client import ApiClient
from srs_sdk.api.words_api import WordsApi

# Automatically authenticated via custom header
config = Configuration(host="http://localhost:8000")
with ApiClient(config, header_name="X-API-Key", header_value=os.getenv("API_KEY", "srs-dev-secret-key-2026")) as client:
    words_api = WordsApi(client)
    due_cards = words_api.get_due_words()
    print(f"Due flashcards count: {len(due_cards)}")
```

---

## 9. Frontend Component Architecture & Navigation Map

```mermaid
flowchart TD
    App["App.jsx (React Root & Router)"] --> Nav["Navbar.jsx<br/>(Due Badge & Tab Switcher)"]
    App --> Provider["VocabContext.jsx<br/>(Real-time State & 30s Polling)"]

    Provider --> P1["DashboardPage.jsx<br/>• Quick Stats Bar<br/>• 1-Click Starter Decks (8 Languages)<br/>• Due Cards Queue Preview"]
    Provider --> P2["ReviewPage.jsx<br/>• Flashcard (Front / Back Flip)<br/>• SpeakerButton.jsx (TTS Audio)<br/>• MemoryBattery.jsx (Health Gauge)<br/>• 0-5 Rating Buttons"]
    Provider --> P3["AddWordPage.jsx<br/>• Word Creation Form<br/>• Duplicate Word Conflict Guard"]
    Provider --> P4["UpcomingPage.jsx<br/>• Future Review Timeline<br/>• Language Filter Dropdown"]
    Provider --> P5["ProgressPage.jsx<br/>• Accuracy Over Time (Line Chart)<br/>• Score Distribution (Bar Chart)<br/>• Difficult Words Table"]
```

---

## 10. Database Entity-Relationship (ER) & Cascading Diagram

```mermaid
erDiagram
    WORDS ||--o{ REVIEWS : "cascades on delete"
    WORDS {
        int id PK "Primary Key (Auto Increment)"
        string word "Vocabulary term"
        string language "Target language"
        string translation "Native translation"
        int repetition "Consecutive successful reviews"
        int interval "Days until next review"
        float easiness_factor "SM-2 multiplier (Floor: 1.3)"
        datetime next_review "Timestamp when card becomes due"
    }
    REVIEWS {
        int id PK "Primary Key (Auto Increment)"
        int word_id FK "Foreign Key referencing words.id"
        int score "User recall score (0 to 5)"
        datetime review_date "Timestamp when review was submitted"
    }
```

---

## 11. 1-Click Startup Lifecycle Flowchart

```mermaid
flowchart TD
    UserClick["User runs .\\runapplication.ps1"] --> CheckEnv{"env\\Scripts\\python.exe exists?"}
    CheckEnv -- No --> ErrEnv["Display: Virtual environment not found"]
    CheckEnv -- Yes --> CheckNode{"frontend\\node_modules exists?"}
    CheckNode -- No --> ErrNode["Display: Frontend dependencies not found"]
    CheckNode -- Yes --> SpawnBack["Spawn Window 1:<br/>FastAPI Backend (port 8000)<br/>& python main.py"]
    SpawnBack --> SpawnFront["Spawn Window 2:<br/>Vite React Frontend (port 3000)<br/>npm run dev"]
    SpawnFront --> Ready["System Ready in Browser:<br/>• Frontend: http://localhost:3000<br/>• Backend API: http://localhost:8000<br/>• Swagger Docs: http://localhost:8000/docs"]
```

---

## 12. How to Run the Project (Quick Reference)

### 1-Click Startup (PowerShell)
```powershell
.\runapplication.ps1
```
*(Or in classic Command Prompt: `runapplication.bat`)*

### Service Endpoints
- **Frontend Web Application:** [http://localhost:3000](http://localhost:3000)
- **FastAPI REST Server:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Verification Commands
```powershell
# Run the complete test suite (26 tests including security):
.\env\Scripts\python.exe -m pytest tests/ sdk_tests/

# Run the standalone Python SDK demo:
.\env\Scripts\python.exe examples\sdk_demo.py
```

