import random
from datetime import datetime, timedelta
from app import create_app, db
from app.models import User, Course, Lesson, Enrollment, LessonProgress, ActivityEvent, MentorStudent

COURSES = [
    {"title": "Mathematics Basics", "description": "Learn arithmetic, algebra, fractions, and problem solving.", "level": "Beginner"},
    {"title": "Biology 101", "description": "Explore cells, genetics, ecosystems, and human biology.", "level": "Beginner"},
    {"title": "English Writing", "description": "Improve grammar, essays, structure, and persuasive writing.", "level": "Intermediate"},
]


def seed_progress_for_student(student, courses, lessons, now):
    for course in courses:
        course_lessons = [lesson for lesson in lessons if lesson.course_id == course.id]
        completed_count = random.randint(2, 7)
        has_in_progress = completed_count < len(course_lessons)

        for idx, lesson in enumerate(course_lessons):
            status = "NOT_STARTED"
            time_spent = 0
            completed_at = None
            updated_at = now - timedelta(days=random.randint(0, 14))

            if idx < completed_count:
                status = "COMPLETED"
                time_spent = lesson.estimated_minutes + random.randint(0, 10)
                completed_at = now - timedelta(days=random.randint(0, 14))
            elif idx == completed_count and has_in_progress:
                status = "IN_PROGRESS"
                time_spent = random.randint(5, max(6, lesson.estimated_minutes - 1))

            if status != "NOT_STARTED":
                db.session.add(LessonProgress(
                    student_id=student.id,
                    lesson_id=lesson.id,
                    status=status,
                    time_spent_minutes=time_spent,
                    completed_at=completed_at,
                    updated_at=updated_at
                ))

        progress_percent = int((completed_count / len(course_lessons)) * 100)
        db.session.add(Enrollment(student_id=student.id, course_id=course.id, progress_percent=progress_percent))

        for _ in range(random.randint(8, 14)):
            lesson = random.choice(course_lessons)
            event_date = now - timedelta(days=random.randint(0, 13), hours=random.randint(0, 23))
            minutes = random.randint(10, 50)
            db.session.add(ActivityEvent(
                student_id=student.id,
                course_id=course.id,
                lesson_id=lesson.id,
                type="TIME_SPENT",
                duration_minutes=minutes,
                created_at=event_date
            ))


def seed_data():
    app = create_app()
    with app.app_context():
        print("Dropping existing tables...")
        db.drop_all()
        print("Creating tables...")
        db.create_all()

        print("Seeding users...")
        mentor = User(name="Demo Mentor", email="mentor@example.com", role="MENTOR")
        mentor.set_password("password123")
        db.session.add(mentor)

        students = []
        demo_student = User(name="Demo Student", email="student@example.com", role="STUDENT")
        demo_student.set_password("password123")
        students.append(demo_student)
        db.session.add(demo_student)

        for i in range(1, 5):
            student = User(name=f"Student {i}", email=f"student{i}@example.com", role="STUDENT")
            student.set_password("password123")
            students.append(student)
            db.session.add(student)
        db.session.commit()

        print("Linking mentor to students...")
        for student in students:
            db.session.add(MentorStudent(mentor_id=mentor.id, student_id=student.id))
        db.session.commit()

        print("Seeding courses and lessons...")
        courses = []
        for course_data in COURSES:
            course = Course(**course_data)
            db.session.add(course)
            courses.append(course)
        db.session.commit()

        lessons = []
        lesson_topics = ["Foundations", "Key Concepts", "Practice", "Problem Solving", "Review", "Quiz Prep", "Applied Skills", "Case Study", "Project", "Final Review"]
        for course in courses:
            for order, topic in enumerate(lesson_topics, start=1):
                lesson = Lesson(
                    course_id=course.id,
                    title=f"{topic}: {course.title}",
                    description=f"{topic} lesson for {course.title}.",
                    order=order,
                    estimated_minutes=random.randint(15, 45)
                )
                db.session.add(lesson)
                lessons.append(lesson)
        db.session.commit()

        print("Seeding progress and activity...")
        now = datetime.utcnow()
        for student in students:
            seed_progress_for_student(student, courses, lessons, now)
        db.session.commit()

        print("Seeding complete!")

if __name__ == '__main__':
    seed_data()
