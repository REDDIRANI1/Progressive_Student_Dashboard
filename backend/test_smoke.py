import requests
import os
import sys

BASE_URL = "http://127.0.0.1:5001"

def print_result(name, result):
    if result:
        print(f"✅ {name}")
    else:
        print(f"❌ {name}")
        sys.exit(1)

def run_tests():
    # 1. Health check
    res = requests.get(f"{BASE_URL}/api/health")
    print_result("GET /api/health", res.status_code == 200 and res.json().get("status") == "ok")

    # 2. Signup
    signup_data = {
        "name": "Test Student",
        "email": "teststudent@example.com",
        "password": "password123",
        "role": "STUDENT"
    }
    # We ignore 409 if it already exists, but for smoke test 201 is expected
    res = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_data)
    print_result("POST /api/auth/signup", res.status_code in [201, 409])

    # 3. Login
    login_data = {
        "email": "student@example.com",
        "password": "password123"
    }
    res = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    print_result("POST /api/auth/login", res.status_code == 200 and "access_token" in res.json())
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Auth Me
    res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print_result("GET /api/auth/me", res.status_code == 200 and res.json().get("role") == "STUDENT")

    # 5. Dashboard Student
    res = requests.get(f"{BASE_URL}/api/dashboard/student", headers=headers)
    print_result("GET /api/dashboard/student", res.status_code == 200 and "completedLessons" in res.json())

    # 6. Analytics Summary
    res = requests.get(f"{BASE_URL}/api/analytics/summary", headers=headers)
    print_result("GET /api/analytics/summary", res.status_code == 200 and "totalTimeSpent" in res.json())

    # 7. Analytics Time Series
    res = requests.get(f"{BASE_URL}/api/analytics/time-series", headers=headers)
    print_result("GET /api/analytics/time-series", res.status_code == 200 and isinstance(res.json(), list))

    # 8. Courses
    res = requests.get(f"{BASE_URL}/api/courses", headers=headers)
    print_result("GET /api/courses", res.status_code == 200 and isinstance(res.json(), list) and len(res.json()) > 0)
    course_id = res.json()[0]["id"]

    # 9. Course Detail
    res = requests.get(f"{BASE_URL}/api/courses/{course_id}", headers=headers)
    print_result("GET /api/courses/{course_id}", res.status_code == 200 and "lessons" in res.json())
    lesson_id = res.json()["lessons"][0]["id"]

    # 10. Course Progress
    res = requests.get(f"{BASE_URL}/api/courses/{course_id}/progress", headers=headers)
    print_result("GET /api/courses/{course_id}/progress", res.status_code == 200 and "progressPercent" in res.json())

    # 11. Lesson Detail
    res = requests.get(f"{BASE_URL}/api/lessons/{lesson_id}", headers=headers)
    print_result("GET /api/lessons/{lesson_id}", res.status_code == 200 and "status" in res.json())

    # 12. Complete Lesson
    res = requests.post(f"{BASE_URL}/api/lessons/{lesson_id}/complete", json={"timeSpentMinutes": 15}, headers=headers)
    print_result("POST /api/lessons/{lesson_id}/complete", res.status_code == 200 and "progressPercent" in res.json())

    # 13. Activity Get
    res = requests.get(f"{BASE_URL}/api/activity", headers=headers)
    print_result("GET /api/activity", res.status_code == 200 and isinstance(res.json(), list))

    # 14. Activity Post
    res = requests.post(f"{BASE_URL}/api/activity", json={"type": "TIME_SPENT", "durationMinutes": 10}, headers=headers)
    print_result("POST /api/activity", res.status_code == 201)

    # 15. Export CSV
    res = requests.get(f"{BASE_URL}/api/export/progress.csv", headers=headers)
    print_result("GET /api/export/progress.csv", res.status_code == 200 and "text/csv" in res.headers.get("Content-Type", "") and len(res.text) > 0)

    # Mentor Routes
    login_data_mentor = {
        "email": "mentor@example.com",
        "password": "password123"
    }
    res = requests.post(f"{BASE_URL}/api/auth/login", json=login_data_mentor)
    print_result("Mentor Login", res.status_code == 200)
    mentor_token = res.json()["access_token"]
    mentor_headers = {"Authorization": f"Bearer {mentor_token}"}

    # 16. Mentor Students
    res = requests.get(f"{BASE_URL}/api/mentor/students", headers=mentor_headers)
    print_result("GET /api/mentor/students", res.status_code == 200 and isinstance(res.json(), list) and len(res.json()) > 0)
    student_id = res.json()[0]["id"]

    # 17. Mentor Student Dashboard
    res = requests.get(f"{BASE_URL}/api/mentor/students/{student_id}/dashboard", headers=mentor_headers)
    print_result("GET /api/mentor/students/{student_id}/dashboard", res.status_code == 200 and "completedLessons" in res.json())

    print("All smoke tests passed!")

if __name__ == "__main__":
    run_tests()
