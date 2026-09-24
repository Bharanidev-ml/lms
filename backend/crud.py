from sqlalchemy.orm import Session
import models


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_or_create_enrollment(db: Session, user_id: int, course_id: int):
    enrollment = (
        db.query(models.Enrollment)
        .filter(models.Enrollment.user_id == user_id, models.Enrollment.course_id == course_id)
        .first()
    )
    if not enrollment:
        enrollment = models.Enrollment(user_id=user_id, course_id=course_id, completed=False)
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)
    return enrollment


def get_completed_lesson_ids(db: Session, user_id: int, course_id: int):
    rows = (
        db.query(models.Progress)
        .join(models.Lesson, models.Progress.lesson_id == models.Lesson.id)
        .filter(
            models.Progress.user_id == user_id,
            models.Lesson.course_id == course_id,
            models.Progress.completed == True,  # noqa: E712
        )
        .all()
    )
    return {row.lesson_id for row in rows}


def build_course_out(db: Session, course: models.Course, user_id: int):
    import schemas

    total_lessons = len(course.lessons)
    completed_ids = get_completed_lesson_ids(db, user_id, course.id)
    completed_lessons = len(completed_ids)
    progress_percent = (
        int((completed_lessons / total_lessons) * 100) if total_lessons else 0
    )
    quiz_unlocked = total_lessons > 0 and completed_lessons == total_lessons
    enrollment = get_or_create_enrollment(db, user_id, course.id)

    return schemas.CourseOut(
        id=course.id,
        title=course.title,
        description=course.description,
        instructor=course.instructor,
        level=course.level,
        total_lessons=total_lessons,
        completed_lessons=completed_lessons,
        progress_percent=progress_percent,
        quiz_unlocked=quiz_unlocked,
        course_completed=enrollment.completed,
    )


def build_lesson_list(db: Session, course: models.Course, user_id: int):
    import schemas

    completed_ids = get_completed_lesson_ids(db, user_id, course.id)
    return [
        schemas.LessonOut(
            id=lesson.id,
            title=lesson.title,
            order=lesson.order,
            completed=lesson.id in completed_ids,
        )
        for lesson in course.lessons
    ]
