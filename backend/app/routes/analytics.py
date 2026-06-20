from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from app import db
from app.models import ActivityEvent, Enrollment, LessonProgress
from app.utils import current_user_id, role_required

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
@role_required('STUDENT')
def summary():
    student_id = current_user_id()
    completed_lessons = LessonProgress.query.filter_by(student_id=student_id, status='COMPLETED').count()
    total_time = db.session.query(func.sum(LessonProgress.time_spent_minutes)).filter_by(student_id=student_id).scalar() or 0
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    average_progress = round(sum(enrollment.progress_percent for enrollment in enrollments) / len(enrollments)) if enrollments else 0

    return jsonify({
        "completedLessons": completed_lessons,
        "totalTimeSpent": int(total_time),
        "averageProgress": average_progress,
        "activeCourses": len(enrollments)
    }), 200

@analytics_bp.route('/time-series', methods=['GET'])
@jwt_required()
@role_required('STUDENT')
def time_series():
    student_id = current_user_id()
    now = datetime.utcnow()
    series = []

    for i in range(13, -1, -1):
        date = (now - timedelta(days=i)).date()
        start = datetime.combine(date, datetime.min.time())
        end = start + timedelta(days=1)
        minutes = db.session.query(func.sum(ActivityEvent.duration_minutes)).filter(
            ActivityEvent.student_id == student_id,
            ActivityEvent.type == 'TIME_SPENT',
            ActivityEvent.created_at >= start,
            ActivityEvent.created_at < end
        ).scalar() or 0
        series.append({"date": date.strftime('%Y-%m-%d'), "minutes": int(minutes)})

    return jsonify(series), 200
