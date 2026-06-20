from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models import Course, Lesson, LessonProgress, Enrollment, ActivityEvent
from app.utils import current_user_id

courses_bp = Blueprint('courses', __name__, url_prefix='/api/courses')

@courses_bp.route('', methods=['GET'])
@jwt_required()
def get_courses():
    courses = Course.query.all()
    result = [{"id": c.id, "title": c.title, "description": c.description, "level": c.level} for c in courses]
    return jsonify(result), 200

@courses_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    lessons = Lesson.query.filter_by(course_id=course.id).order_by(Lesson.order).all()
    student_id = current_user_id()

    lessons_data = []
    for lesson in lessons:
        progress = LessonProgress.query.filter_by(student_id=student_id, lesson_id=lesson.id).first()
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

    activity = ActivityEvent.query.filter_by(
        student_id=student_id,
        course_id=course.id
    ).order_by(ActivityEvent.created_at.desc()).limit(20).all()

    return jsonify({
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
    }), 200

@courses_bp.route('/<int:course_id>/progress', methods=['GET'])
@jwt_required()
def get_course_progress(course_id):
    student_id = current_user_id()
    enrollment = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    progress = enrollment.progress_percent if enrollment else 0
    return jsonify({"courseId": course_id, "progressPercent": progress}), 200
