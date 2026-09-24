from pydantic import BaseModel
from typing import List, Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    user: UserOut
    message: str = "Login successful"


class LessonOut(BaseModel):
    id: int
    title: str
    order: int
    completed: bool = False

    class Config:
        from_attributes = True


class LessonDetailOut(BaseModel):
    id: int
    course_id: int
    title: str
    content: str
    order: int
    completed: bool = False

    class Config:
        from_attributes = True


class CourseOut(BaseModel):
    id: int
    title: str
    description: str
    instructor: str
    level: str
    total_lessons: int
    completed_lessons: int
    progress_percent: int
    quiz_unlocked: bool
    course_completed: bool

    class Config:
        from_attributes = True


class CourseDetailOut(CourseOut):
    lessons: List[LessonOut]


class CompleteLessonResponse(BaseModel):
    message: str
    lesson_id: int
    course_progress_percent: int
    next_lesson_id: Optional[int] = None
    quiz_unlocked: bool


class ProgressOut(BaseModel):
    enrolled_courses: int
    completed_courses: int
    lessons_completed: int
    total_lessons: int
    overall_progress_percent: int


class QuestionOut(BaseModel):
    id: int
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    order: int

    class Config:
        from_attributes = True


class QuizOut(BaseModel):
    id: int
    title: str
    passing_score: int
    questions: List[QuestionOut]


class QuizSubmitRequest(BaseModel):
    answers: dict  # {"1": "B", "2": "C", ...}  question_id -> selected option


class QuizSubmitResponse(BaseModel):
    score: int
    total_questions: int
    percentage: int
    passed: bool
    course_completed: bool
