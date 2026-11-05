# Mario Analytics

A full-stack Mario-style platformer with gameplay telemetry and ML-driven difficulty adaptation and analytics.

---

## Architecture & Tech Stack

- **Frontend:** React, Vite, Phaser 3 (Arcade Physics), react-router-dom, axios, Recharts
- **Backend:** Python FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2
- **Database:** PostgreSQL 16 (Docker)
- **Auth:** JWT (`python-jose`) + bcrypt (`passlib`)
- **Analytics & ML:** Pandas, scikit-learn, joblib
- **Testing & DevOps:** pytest, httpx, Docker Compose, GitHub Actions

---

## Directory Structure

```text
mario-analytics/
  docker-compose.yml
  README.md
  backend/
    app/
      main.py
      config.py
      routers/
      ml/
    alembic/
    tests/
    requirements.txt
    .env.example
  frontend/
    src/
      api/
      pages/
      components/
      game/
        config.js
        scenes/
        entities/
        levels/
        telemetry.js
        difficulty.js
```

---

## Getting Started

### 1. Database (PostgreSQL 16)

Start PostgreSQL using Docker Compose:

```bash
docker compose up -d
```

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `mario_analytics`
- **User:** `mario`
- **Password:** `mariopassword`

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Start the FastAPI backend server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Verify backend health check:

```bash
curl http://127.0.0.1:8000/health
# Response: {"status":"ok"}
```

Run backend unit tests:

```bash
pytest
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## Verification Summary

- **Backend Health Check:** `GET http://127.0.0.1:8000/health` returns `{"status":"ok"}`
- **Frontend Dev Server:** Running on `http://localhost:5173`
- **Backend Tests:** Run with `pytest` inside `backend/`

