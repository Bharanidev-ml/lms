from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import crud
from database import engine, get_db, SessionLocal
from seed import seed_data

# Create tables
models.Base.metadata.create_all(bind=engine)

# Seed demo data on startup
db_session = SessionLocal()
try:
    seed_data(db_session)
finally:
    db_session.close()

app = FastAPI(title="LMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- AUTH ----------

@app.post("/api/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, payload.email)
    if not user or user.password != payload.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return schemas.LoginResponse(user=user)


# ---------- COURSES ----------

@app.get("/api/courses", response_model=list[schemas.CourseOut])
def list_courses(user_id: int = 1, db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    return [crud.build_course_out(db, c, user_id) for c in courses]


@app.get("/api/courses/{course_id}", response_model=schemas.CourseDetailOut)
def get_course(course_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course_out = crud.build_course_out(db, course, user_id)
    lessons = crud.build_lesson_list(db, course, user_id)
    return schemas.CourseDetailOut(**course_out.model_dump(), lessons=lessons)


@app.get("/api/courses/{course_id}/lessons", response_model=list[schemas.LessonOut])
def list_lessons(course_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return crud.build_lesson_list(db, course, user_id)


# ---------- LESSONS ----------

@app.get("/api/lessons/{lesson_id}", response_model=schemas.LessonDetailOut)
def get_lesson(lesson_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    completed_ids = crud.get_completed_lesson_ids(db, user_id, lesson.course_id)
    return schemas.LessonDetailOut(
        id=lesson.id,
        course_id=lesson.course_id,
        title=lesson.title,
        content=lesson.content,
        order=lesson.order,
        completed=lesson.id in completed_ids,
    )


@app.post("/api/lessons/{lesson_id}/complete", response_model=schemas.CompleteLessonResponse)
def complete_lesson(lesson_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    progress = (
        db.query(models.Progress)
        .filter(models.Progress.user_id == user_id, models.Progress.lesson_id == lesson_id)
        .first()
    )
    if not progress:
        progress = models.Progress(user_id=user_id, lesson_id=lesson_id, completed=True)
        db.add(progress)
    else:
        progress.completed = True
    db.commit()

    course = db.query(models.Course).filter(models.Course.id == lesson.course_id).first()
    completed_ids = crud.get_completed_lesson_ids(db, user_id, course.id)
    total_lessons = len(course.lessons)
    progress_percent = (
        int((len(completed_ids) / total_lessons) * 100) if total_lessons else 0
    )
    quiz_unlocked = total_lessons > 0 and len(completed_ids) == total_lessons

    next_lesson = (
        db.query(models.Lesson)
        .filter(models.Lesson.course_id == course.id, models.Lesson.order == lesson.order + 1)
        .first()
    )

    return schemas.CompleteLessonResponse(
        message="Lesson marked as complete",
        lesson_id=lesson.id,
        course_progress_percent=progress_percent,
        next_lesson_id=next_lesson.id if next_lesson else None,
        quiz_unlocked=quiz_unlocked,
    )


# ---------- PROGRESS ----------

@app.get("/api/progress", response_model=schemas.ProgressOut)
def get_progress(user_id: int = 1, db: Session = Depends(get_db)):
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.user_id == user_id).all()
    enrolled_courses = len(enrollments)
    completed_courses = sum(1 for e in enrollments if e.completed)

    all_lesson_ids = []
    for e in enrollments:
        course = db.query(models.Course).filter(models.Course.id == e.course_id).first()
        all_lesson_ids.extend([lesson.id for lesson in course.lessons])

    completed_lessons = (
        db.query(models.Progress)
        .filter(
            models.Progress.user_id == user_id,
            models.Progress.lesson_id.in_(all_lesson_ids) if all_lesson_ids else False,
            models.Progress.completed == True,  # noqa: E712
        )
        .count()
    )

    total_lessons = len(all_lesson_ids)
    overall_progress = (
        int((completed_lessons / total_lessons) * 100) if total_lessons else 0
    )

    return schemas.ProgressOut(
        enrolled_courses=enrolled_courses,
        completed_courses=completed_courses,
        lessons_completed=completed_lessons,
        total_lessons=total_lessons,
        overall_progress_percent=overall_progress,
    )


# ---------- QUIZ ----------

@app.get("/api/courses/{course_id}/quiz", response_model=schemas.QuizOut)
def get_quiz(course_id: int, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.course_id == course_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return schemas.QuizOut(
        id=quiz.id,
        title=quiz.title,
        passing_score=quiz.passing_score,
        questions=quiz.questions,
    )


@app.post("/api/courses/{course_id}/quiz/submit", response_model=schemas.QuizSubmitResponse)
def submit_quiz(
    course_id: int,
    payload: schemas.QuizSubmitRequest,
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    quiz = db.query(models.Quiz).filter(models.Quiz.course_id == course_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = quiz.questions
    total_questions = len(questions)
    score = 0
    for question in questions:
        selected = payload.answers.get(str(question.id))
        if selected and selected.upper() == question.correct_option:
            score += 1

    percentage = int((score / total_questions) * 100) if total_questions else 0
    passed = percentage >= quiz.passing_score

    attempt = models.QuizAttempt(
        user_id=user_id,
        quiz_id=quiz.id,
        score=score,
        total_questions=total_questions,
        percentage=percentage,
        passed=passed,
    )
    db.add(attempt)

    course_completed = False
    if passed:
        enrollment = crud.get_or_create_enrollment(db, user_id, course_id)
        enrollment.completed = True
        course_completed = True

    db.commit()

    return schemas.QuizSubmitResponse(
        score=score,
        total_questions=total_questions,
        percentage=percentage,
        passed=passed,
        course_completed=course_completed,
    )


@app.get("/")
def root():
    return {"message": "LMS API is running"}
