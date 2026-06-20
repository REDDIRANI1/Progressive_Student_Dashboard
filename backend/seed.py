import random
from datetime import datetime, timedelta
from app import create_app, db
from app.models import User, Course, Lesson, Enrollment, LessonProgress, ActivityEvent, MentorStudent

def seed_data():
    app = create_app()
    with app.app_context():
        print("Dropping existing tables...")
        db.drop_all()
        print("Creating tables...")
        db.create_all()

        print("Seeding Users...")
        mentor = User(name="Demo Mentor", email="mentor@example.com", role="MENTOR")
        mentor.set_password("password123")
        db.session.add(mentor)

        demo_student = User(name="Demo Student", email="student@example.com", role="STUDENT")
        demo_student.set_password("password123")
        db.session.add(demo_student)

        students = [demo_student]
        for i in range(3):
            student = User(name=f"Student {i+1}", email=f"student{i+1}@example.com", role="STUDENT")
            student.set_password("password123")
            db.session.add(student)
            students.append(student)

        db.session.commit()

        print("Linking Mentor to Students...")
        for student in students:
            db.session.add(MentorStudent(mentor_id=mentor.id, student_id=student.id))
        db.session.commit()

        print("Seeding Courses and Lessons...")
        courses_data = [
            {"title": "Mathematics Basics", "description": "Learn the basics of math."},
            {"title": "Biology 101", "description": "Introduction to biology."},
            {"title": "English Writing", "description": "Improve your writing skills."}
        ]
        
        courses = []
        for c_data in courses_data:
            course = Course(title=c_data["title"], description=c_data["description"])
            db.session.add(course)
            courses.append(course)
        db.session.commit()

        lessons = []
        for course in courses:
            for i in range(1, 11): # 10 lessons per course
                lesson = Lesson(
                    course_id=course.id,
                    title=f"Lesson {i} of {course.title}",
                    order=i,
                    estimated_minutes=random.randint(15, 45)
                )
                db.session.add(lesson)
                lessons.append(lesson)
        db.session.commit()

        print("Seeding Enrollments and Progress for Demo Student...")
        now = datetime.utcnow()
        for course in courses:
            db.session.add(Enrollment(student_id=demo_student.id, course_id=course.id, progress_percent=random.randint(20, 80)))
            
            course_lessons = [l for l in lessons if l.course_id == course.id]
            for idx, lesson in enumerate(course_lessons):
                status = "NOT_STARTED"
                time_spent = 0
                completed_at = None
                
                if idx < 4:
                    status = "COMPLETED"
                    time_spent = lesson.estimated_minutes
                    completed_at = now - timedelta(days=random.randint(1, 14))
                elif idx == 4:
                    status = "IN_PROGRESS"
                    time_spent = random.randint(5, lesson.estimated_minutes - 5)
                
                db.session.add(LessonProgress(
                    student_id=demo_student.id,
                    lesson_id=lesson.id,
                    status=status,
                    time_spent_minutes=time_spent,
                    completed_at=completed_at
                ))
        db.session.commit()

        print("Seeding Activity Events...")
        for i in range(30):
            days_ago = random.randint(1, 14)
            event_date = now - timedelta(days=days_ago)
            db.session.add(ActivityEvent(
                student_id=demo_student.id,
                course_id=random.choice(courses).id,
                lesson_id=random.choice(lessons).id,
                type="TIME_SPENT",
                duration_minutes=random.randint(10, 50),
                created_at=event_date
            ))
        db.session.commit()

        print("Seeding Complete!")

if __name__ == '__main__':
    seed_data()
