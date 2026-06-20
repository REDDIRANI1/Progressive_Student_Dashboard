# Progressive Student Dashboard

## 1. Project Overview
A comprehensive web application that tracks student progress across multiple courses, recommends next steps, and visualizes learning insights. It features role-based access for students and mentors.

## 2. Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, React Router
- **Backend**: Python, FastAPI, SQLAlchemy, python-jose, bcrypt
- **Database**: SQLite (default local demo) or PostgreSQL (for production)

## 3. Features
- **Authentication**: JWT-based email/password login with Student and Mentor roles. Passwords must be at least 8 characters long.
- **Student Dashboard**: Shows completed lessons, total time spent, average progress, active courses, trend chart (time series), donut chart (completion distribution), and recommendations. New students are automatically enrolled in all available courses upon registration.
- **Course & Lesson Progress**: View lessons, mark them as complete, track estimated time spent, and automatically calculate course progress.
- **Mentor Dashboard**: Mentors can view all assigned students, monitor their overall progress, total time spent, see courses needing attention, and click into student details.
- **CSV Export**: Export progress data as `progress.csv`.

## 4. Setup Instructions

### Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables template from the repository root:
   ```bash
   cp ../.env.example .env
   ```
5. Seed the database (creates tables and demo data):
   ```bash
   python3 seed.py
   ```
6. Run the FastAPI server via uvicorn:
   ```bash
   uvicorn run:app --host 127.0.0.1 --port 5001 --reload
   ```

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 5. Environment Variables
Check `.env.example` in the repository root.

**Backend (`backend/.env`)**:
```env
SECRET_KEY=super-secret-key-for-dev-please-change-32chars
JWT_SECRET_KEY=super-secret-jwt-key-for-dev-please-change-32chars

# SQLite (Default Local Demo)
# Leave DATABASE_URL empty or unset to use the local SQLite demo database by default.
# DATABASE_URL=sqlite:///./app.db

# PostgreSQL (Production/Deployment)
# Set DATABASE_URL to your PostgreSQL connection string to use Postgres.
# DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/student_dashboard
```

## 6. Database Migration Commands
The project currently uses `Base.metadata.create_all()` in the seed script for rapid prototyping with SQLite. If Alembic is used later, you can configure it for migrations.
## 7. Seed Command
To generate the demo data, run from the `backend` folder:
```bash
python3 seed.py
```

## 8. Demo Login Credentials
- **Student**: `student@example.com` / `password123`
- **Mentor**: `mentor@example.com` / `password123`

## 9. API Documentation Link
[View API Documentation](docs/api.md)

## 10. Screenshots
- [Login Page](docs/screenshots/login.png)
- [Student Dashboard](docs/screenshots/student_dashboard.png)
- [Course Details](docs/screenshots/course_details.png)
- [Mentor Dashboard](docs/screenshots/mentor_dashboard.png)
