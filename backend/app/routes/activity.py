from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ActivityEvent
from app.utils import current_user_id, require_role
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/activity", tags=["activity"])

class ActivityRequest(BaseModel):
    courseId: Optional[int] = None
    lessonId: Optional[int] = None
    type: str
    durationMinutes: Optional[int] = 0

@router.get("")
def get_activity(user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("STUDENT")), db: Session = Depends(get_db)):
    events = db.query(ActivityEvent).filter(ActivityEvent.student_id == user_id).order_by(ActivityEvent.created_at.desc()).limit(50).all()
    return [{
        "id": event.id,
        "courseId": event.course_id,
        "lessonId": event.lesson_id,
        "type": event.type,
        "durationMinutes": event.duration_minutes,
        "createdAt": event.created_at.isoformat()
    } for event in events]

@router.post("", status_code=201)
def post_activity(data: ActivityRequest, user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("STUDENT")), db: Session = Depends(get_db)):
    if not data.type:
        return JSONResponse(status_code=400, content={"message": "Missing event type"})

    if data.type not in ['LESSON_STARTED', 'LESSON_COMPLETED', 'TIME_SPENT']:
        return JSONResponse(status_code=400, content={"message": "Invalid activity type"})

    if data.durationMinutes is not None and data.durationMinutes < 0:
        return JSONResponse(status_code=400, content={"message": "durationMinutes must be non-negative"})

    event = ActivityEvent(
        student_id=user_id,
        course_id=data.courseId,
        lesson_id=data.lessonId,
        type=data.type,
        duration_minutes=data.durationMinutes or 0
    )
    db.add(event)
    db.commit()

    return {"message": "Activity recorded"}
