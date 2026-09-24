from sqlalchemy.orm import Session
import models


LESSON_CONTENT = {
    "Introduction to Python": (
        "Python is a high-level, interpreted programming language known for its "
        "clean syntax and readability. It is widely used in web development, data "
        "science, automation, and artificial intelligence. In this lesson, you'll "
        "learn why Python is such a popular first language, how to install it, and "
        "how to write and run your very first Python script: print('Hello, World!')."
    ),
    "Variables and Data Types": (
        "Variables are containers for storing data values. Python has several "
        "built-in data types including int (whole numbers), float (decimal "
        "numbers), str (text), and bool (True/False). Unlike some other languages, "
        "Python is dynamically typed, meaning you don't need to declare a variable's "
        "type explicitly - Python figures it out automatically based on the value "
        "you assign."
    ),
    "Conditions and Loops": (
        "Conditional statements (if, elif, else) let your program make decisions "
        "based on certain conditions. Loops (for and while) let you repeat a block "
        "of code multiple times. Together, these control-flow tools are the "
        "foundation of programming logic, allowing your programs to react to data "
        "and repeat tasks efficiently instead of writing repetitive code."
    ),
    "Functions": (
        "Functions are reusable blocks of code that perform a specific task. You "
        "define a function using the 'def' keyword, followed by a name and "
        "parentheses. Functions can accept parameters and return values, which "
        "helps you organize your code, avoid repetition, and make your programs "
        "easier to read, test, and maintain."
    ),
}


def seed_data(db: Session):
    # Avoid reseeding if data already exists
    if db.query(models.User).first():
        return

    admin = models.User(name="Admin", email="admin@example.com", password="admin123")
    db.add(admin)
    db.commit()
    db.refresh(admin)

    course = models.Course(
        title="Python Fundamentals",
        description=(
            "Learn the fundamentals of Python programming, including variables, "
            "data types, conditions, loops and functions."
        ),
        instructor="John Smith",
        level="Beginner",
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    lesson_titles = [
        "Introduction to Python",
        "Variables and Data Types",
        "Conditions and Loops",
        "Functions",
    ]
    for i, title in enumerate(lesson_titles, start=1):
        lesson = models.Lesson(
            course_id=course.id,
            title=title,
            content=LESSON_CONTENT[title],
            order=i,
        )
        db.add(lesson)
    db.commit()

    quiz = models.Quiz(course_id=course.id, title="Final Quiz", passing_score=60)
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    questions = [
        {
            "text": "What keyword is used to define a function in Python?",
            "option_a": "function",
            "option_b": "def",
            "option_c": "func",
            "option_d": "define",
            "correct_option": "B",
        },
        {
            "text": "Which data type is used for whole numbers?",
            "option_a": "string",
            "option_b": "float",
            "option_c": "int",
            "option_d": "boolean",
            "correct_option": "C",
        },
        {
            "text": "Which symbol is used for comments in Python?",
            "option_a": "//",
            "option_b": "<!-- -->",
            "option_c": "#",
            "option_d": "**",
            "correct_option": "C",
        },
        {
            "text": "Which keyword is used for a condition?",
            "option_a": "if",
            "option_b": "when",
            "option_c": "check",
            "option_d": "condition",
            "correct_option": "A",
        },
        {
            "text": "Which loop is commonly used to iterate over a sequence?",
            "option_a": "repeat",
            "option_b": "foreach",
            "option_c": "for",
            "option_d": "iterate",
            "correct_option": "C",
        },
    ]
    for i, q in enumerate(questions, start=1):
        question = models.Question(
            quiz_id=quiz.id,
            text=q["text"],
            option_a=q["option_a"],
            option_b=q["option_b"],
            option_c=q["option_c"],
            option_d=q["option_d"],
            correct_option=q["correct_option"],
            order=i,
        )
        db.add(question)
    db.commit()

    # Enroll admin in the course by default
    enrollment = models.Enrollment(user_id=admin.id, course_id=course.id, completed=False)
    db.add(enrollment)
    db.commit()
