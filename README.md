# Progressive Student Dashboard

A full-stack learning progress dashboard built for the hackathon problem statement. It helps students understand their course progress and helps mentors quickly identify students who may need support.

## What it does

- Tracks student progress across courses and lessons.
- Shows completed lessons, time spent, average progress, and active courses.
- Visualizes learning insights with trend and completion charts.
- Recommends next steps for students.
- Provides separate student and mentor experiences.
- Includes seeded demo data so reviewers can run the project quickly.

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI, SQLAlchemy, JWT authentication, bcrypt |
| Database | SQLite by default, PostgreSQL supported with `DATABASE_URL` |

## Project structure

```txt
student-dashboard/
├── backend/                 # FastAPI app, database models, seed data
├── frontend/                # React/Vite frontend
├── docs/                    # API docs and screenshots
├── demo.html                # Hackathon presentation deck
├── PRESENTATION_BRIEF.md    # Short submission/presentation brief
├── problem-stament.md       # Original problem statement
└── .env.example             # Environment variable template
```

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 20+
- npm

SQLite is used by default, so no database server is required for the local demo.

---

## 1. Start the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
python3 seed.py
uvicorn run:app --host 127.0.0.1 --port 5001 --reload
```

Backend health check:

```txt
http://127.0.0.1:5001/api/health
```

---

## 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```txt
http://localhost:5173
```

The frontend uses this API URL by default:

```txt
http://127.0.0.1:5001/api
```

If needed, create `frontend/.env` from `frontend/.env.example` and adjust `VITE_API_URL`.

## Demo accounts

After running `python3 seed.py`, use these accounts:

| Role | Email | Password |
| --- | --- | --- |
| Student | `student@example.com` | `password123` |
| Mentor | `mentor@example.com` | `password123` |

## Key user flows

### Student

- Log in as the demo student.
- View learning summary cards.
- Review progress charts.
- Open a course.
- Mark lessons complete.
- See progress and activity update.

### Mentor

- Log in as the demo mentor.
- View assigned students.
- Check overall progress and time spent.
- Open a student detail page to understand where help may be needed.

## Database notes

### Default local demo

No setup needed. SQLite is used automatically when `DATABASE_URL` is empty or unset.

### PostgreSQL option

Set `DATABASE_URL` in `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/student_dashboard
```

Then reseed:

```bash
cd backend
source venv/bin/activate
python3 seed.py
```

## Useful commands

### Backend

```bash
cd backend
source venv/bin/activate
python3 seed.py
uvicorn run:app --host 127.0.0.1 --port 5001 --reload
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run lint
./node_modules/.bin/tsc -b --pretty false
```

## Demo and submission materials

- Presentation deck: [`demo.html`](demo.html)
- Brief project summary: [`PRESENTATION_BRIEF.md`](PRESENTATION_BRIEF.md)
- Screenshots: [`docs/screenshots/`](docs/screenshots/)
- API reference: [`docs/api.md`](docs/api.md)

## Notes for reviewers

- The app is ready to run locally with seeded data.
- New student signups are automatically enrolled in existing courses.
- Passwords must be at least 8 characters long.
- Student and mentor roles have separate dashboard experiences.
- SQLite is the easiest path for local review; PostgreSQL is available for deployment-style testing.
