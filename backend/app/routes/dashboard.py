from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from app import db
from app.models import Enrollment, LessonProgress, Course, Lesson, ActivityEvent
from app.utils import current_user_id, role_required
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/student', methods=['GET'])
@jwt_required()
@role_required('STUDENT')
def student_dashboard():
    student_id = current_user_id()

    # 1. Completed Lessons
    completed_lessons = LessonProgress.query.filter_by(
        student_id=student_id, status='COMPLETED'
    ).count()

    # 2. Total Time Spent
    total_time_result = db.session.query(func.sum(LessonProgress.time_spent_minutes)).filter_by(
        student_id=student_id
    ).scalar()
    total_time_spent = int(total_time_result) if total_time_result else 0

    # 3. Average Progress
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    if enrollments:
        average_progress = sum(e.progress_percent for e in enrollments) / len(enrollments)
    else:
        average_progress = 0

    # 4. Courses Progress
    courses_data = []
    for enrollment in enrollments:
        course = Course.query.get(enrollment.course_id)
        total_lessons = Lesson.query.filter_by(course_id=course.id).count()
        completed = LessonProgress.query.join(Lesson).filter(
            LessonProgress.student_id == student_id,
            LessonProgress.lesson_id == Lesson.id,
            Lesson.course_id == course.id,
            LessonProgress.status == 'COMPLETED'
        ).count()
        
        courses_data.append({
            "id": course.id,
            "title": course.title,
            "progressPercent": enrollment.progress_percent,
            "completedLessons": completed,
            "totalLessons": total_lessons
        })

    # 5. Time Series (Last 7 days)
    now = datetime.utcnow()
    time_series = []
    for i in range(6, -1, -1):
        date = (now - timedelta(days=i)).date()
        start = datetime.combine(date, datetime.min.time())
        end = start + timedelta(days=1)
        minutes = db.session.query(func.sum(ActivityEvent.duration_minutes)).filter(
            ActivityEvent.student_id == student_id,
            ActivityEvent.created_at >= start,
            ActivityEvent.created_at < end
        ).scalar()
        time_series.append({
            "date": date.strftime('%Y-%m-%d'),
            "minutes": int(minutes) if minutes else 0
        })

    # 6. Completion Distribution
    in_progress = LessonProgress.query.filter_by(student_id=student_id, status='IN_PROGRESS').count()
    total_lessons_enrolled = sum(c['totalLessons'] for c in courses_data)
    not_started = max(0, total_lessons_enrolled - completed_lessons - in_progress)
    
    completion_distribution = [
        {"name": "Completed", "value": completed_lessons},
        {"name": "In Progress", "value": in_progress},
        {"name": "Not Started", "value": not_started}
    ]

    # 7. Recommendations
    recommendations = []
    for c in courses_data:
        if c['progressPercent'] < 40 and c['progressPercent'] > 0:
            recommendations.append({
                "title": f"Continue {c['title']}",
                "reason": f"You are {c['progressPercent']}% through this course."
            })
            break

    in_progress_lesson = LessonProgress.query.filter_by(student_id=student_id, status='IN_PROGRESS').first()
    if in_progress_lesson:
        lesson = Lesson.query.get(in_progress_lesson.lesson_id)
        recommendations.append({
            "title": f"Finish {lesson.title}",
            "reason": "This lesson is already in progress."
        })

    last_activity = ActivityEvent.query.filter_by(student_id=student_id).order_by(ActivityEvent.created_at.desc()).first()
    if not last_activity or last_activity.created_at < now - timedelta(days=3):
        recommendations.append({
            "title": "Resume your learning streak",
            "reason": "You have not studied in the last 3 days."
        })

    week_minutes = sum(point["minutes"] for point in time_series)
    if week_minutes < 90:
        recommendations.append({
            "title": "Try a short lesson this week",
            "reason": "Your study time is low this week."
        })

    if not recommendations:
        recommendations.append({
            "title": "Start a new lesson",
            "reason": "Keep up the good work!"
        })

    return jsonify({
        "completedLessons": completed_lessons,
        "totalTimeSpent": total_time_spent,
        "averageProgress": round(average_progress),
        "courses": courses_data,
        "timeSeries": time_series,
        "completionDistribution": completion_distribution,
        "recommendations": recommendations[:2]
    }), 200
