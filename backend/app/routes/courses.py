from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Course, Lesson, LessonProgress, Enrollment, ActivityEvent
from app.utils import current_user_id, require_role

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("")
def get_courses(user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("STUDENT")), db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return [{"id": c.id, "title": c.title, "description": c.description, "level": c.level} for c in courses]

@router.get("/{course_id}")
def get_course(course_id: int, user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("STUDENT")), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
        
    lessons = db.query(Lesson).filter(Lesson.course_id == course.id).order_by(Lesson.order).all()
    
    lessons_data = []
    for lesson in lessons:
        progress = db.query(LessonProgress).filter(LessonProgress.student_id == user_id, LessonProgress.lesson_id == lesson.id).first()
        status = progress.status if progress else 'NOT_STARTED'
        time_spent = progress.time_spent_minutes if progress else 0
        
        lessons_data.append({
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "order": lesson.order,
            "estimatedMinutes": lesson.estimated_minutes,
            "status": status,
            "timeSpentMinutes": time_spent
        })

    activity = db.query(ActivityEvent).filter(
        ActivityEvent.student_id == user_id,
        ActivityEvent.course_id == course.id
    ).order_by(ActivityEvent.created_at.desc()).limit(20).all()

    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "lessons": lessons_data,
        "activity": [{
            "id": event.id,
            "lessonId": event.lesson_id,
            "type": event.type,
            "durationMinutes": event.duration_minutes,
            "createdAt": event.created_at.isoformat()
        } for event in activity]
    }

@router.get("/{course_id}/progress")
def get_course_progress(course_id: int, user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("STUDENT")), db: Session = Depends(get_db)):
    enrollment = db.query(Enrollment).filter(Enrollment.student_id == user_id, Enrollment.course_id == course_id).first()
    progress = enrollment.progress_percent if enrollment else 0
    return {"courseId": course_id, "progressPercent": progress}
