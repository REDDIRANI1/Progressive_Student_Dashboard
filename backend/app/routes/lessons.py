from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Lesson, LessonProgress, ActivityEvent, Enrollment
from app.utils import current_user_id, require_role
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/lessons", tags=["lessons"])

class CompleteLessonRequest(BaseModel):
    timeSpentMinutes: Optional[int] = None

@router.get("/{lesson_id}")
def get_lesson(lesson_id: int, user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("STUDENT")), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
        
    progress = db.query(LessonProgress).filter(LessonProgress.student_id == user_id, LessonProgress.lesson_id == lesson.id).first()
    
    return {
        "id": lesson.id,
        "courseId": lesson.course_id,
        "title": lesson.title,
        "description": lesson.description,
        "estimatedMinutes": lesson.estimated_minutes,
        "status": progress.status if progress else 'NOT_STARTED',
        "timeSpentMinutes": progress.time_spent_minutes if progress else 0
    }

@router.post("/{lesson_id}/complete")
def complete_lesson(lesson_id: int, data: CompleteLessonRequest = None, user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("STUDENT")), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
        
    time_spent = lesson.estimated_minutes
    if data and data.timeSpentMinutes is not None:
        time_spent = data.timeSpentMinutes
    if time_spent < 0:
        return JSONResponse(status_code=400, content={"message": "timeSpentMinutes must be non-negative"})
        
    progress = db.query(LessonProgress).filter(LessonProgress.student_id == user_id, LessonProgress.lesson_id == lesson.id).first()
    if not progress:
        progress = LessonProgress(student_id=user_id, lesson_id=lesson.id)
        db.add(progress)
        
    progress.status = 'COMPLETED'
    progress.time_spent_minutes = (progress.time_spent_minutes or 0) + time_spent
    progress.completed_at = datetime.utcnow()
    
    db.add(ActivityEvent(
        student_id=user_id,
        course_id=lesson.course_id,
        lesson_id=lesson.id,
        type='LESSON_COMPLETED',
        duration_minutes=time_spent
    ))
    db.add(ActivityEvent(
        student_id=user_id,
        course_id=lesson.course_id,
        lesson_id=lesson.id,
        type='TIME_SPENT',
        duration_minutes=time_spent
    ))
    
    total_lessons = db.query(Lesson).filter(Lesson.course_id == lesson.course_id).count()
    completed = db.query(LessonProgress).join(Lesson).filter(
        LessonProgress.student_id == user_id,
        LessonProgress.lesson_id == Lesson.id,
        Lesson.course_id == lesson.course_id,
        LessonProgress.status == 'COMPLETED'
    ).count()
    
    enrollment = db.query(Enrollment).filter(Enrollment.student_id == user_id, Enrollment.course_id == lesson.course_id).first()
    if not enrollment:
        enrollment = Enrollment(student_id=user_id, course_id=lesson.course_id)
        db.add(enrollment)
        
    enrollment.progress_percent = int((completed / total_lessons) * 100) if total_lessons > 0 else 0
    
    db.commit()
    
    return {"message": "Lesson marked as complete", "progressPercent": enrollment.progress_percent}
