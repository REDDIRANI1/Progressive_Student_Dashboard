from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes import auth, dashboard, analytics, courses, lessons, activity, mentor, export

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(activity.router)
app.include_router(mentor.router)
app.include_router(export.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API is running"}
