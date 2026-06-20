from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app import db
from app.models import Lesson, LessonProgress, ActivityEvent, Enrollment
from app.utils import current_user_id
from datetime import datetime

lessons_bp = Blueprint('lessons', __name__, url_prefix='/api/lessons')

@lessons_bp.route('/<int:lesson_id>', methods=['GET'])
@jwt_required()
def get_lesson(lesson_id):
    lesson = Lesson.query.get_or_404(lesson_id)
    student_id = current_user_id()
    progress = LessonProgress.query.filter_by(student_id=student_id, lesson_id=lesson.id).first()
    
    return jsonify({
        "id": lesson.id,
        "courseId": lesson.course_id,
        "title": lesson.title,
        "description": lesson.description,
        "estimatedMinutes": lesson.estimated_minutes,
        "status": progress.status if progress else 'NOT_STARTED',
        "timeSpentMinutes": progress.time_spent_minutes if progress else 0
    }), 200

@lessons_bp.route('/<int:lesson_id>/complete', methods=['POST'])
@jwt_required()
def complete_lesson(lesson_id):
    student_id = current_user_id()
    lesson = Lesson.query.get_or_404(lesson_id)
    
    data = request.get_json() or {}
    time_spent = int(data.get('timeSpentMinutes', lesson.estimated_minutes))
    
    progress = LessonProgress.query.filter_by(student_id=student_id, lesson_id=lesson.id).first()
    if not progress:
        progress = LessonProgress(student_id=student_id, lesson_id=lesson.id)
        db.session.add(progress)
        
    progress.status = 'COMPLETED'
    progress.time_spent_minutes = (progress.time_spent_minutes or 0) + time_spent
    progress.completed_at = datetime.utcnow()
    
    db.session.add(ActivityEvent(
        student_id=student_id,
        course_id=lesson.course_id,
        lesson_id=lesson.id,
        type='LESSON_COMPLETED',
        duration_minutes=time_spent
    ))
    db.session.add(ActivityEvent(
        student_id=student_id,
        course_id=lesson.course_id,
        lesson_id=lesson.id,
        type='TIME_SPENT',
        duration_minutes=time_spent
    ))
    
    total_lessons = Lesson.query.filter_by(course_id=lesson.course_id).count()
    completed = LessonProgress.query.join(Lesson).filter(
        LessonProgress.student_id == student_id,
        LessonProgress.lesson_id == Lesson.id,
        Lesson.course_id == lesson.course_id,
        LessonProgress.status == 'COMPLETED'
    ).count()
    
    enrollment = Enrollment.query.filter_by(student_id=student_id, course_id=lesson.course_id).first()
    if not enrollment:
        enrollment = Enrollment(student_id=student_id, course_id=lesson.course_id)
        db.session.add(enrollment)
        
    enrollment.progress_percent = int((completed / total_lessons) * 100) if total_lessons > 0 else 0
    
    db.session.commit()
    
    return jsonify({"message": "Lesson marked as complete", "progressPercent": enrollment.progress_percent}), 200
