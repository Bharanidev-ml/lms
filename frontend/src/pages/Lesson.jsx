import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import { getLesson, getCourse, completeLesson } from '../api.js'

export default function Lesson() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [completing, setCompleting] = useState(false)
  const [quizUnlocked, setQuizUnlocked] = useState(false)
  const [nextLessonId, setNextLessonId] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      setSuccess('')
      try {
        const [lessonData, courseData] = await Promise.all([
          getLesson(lessonId),
          getCourse(courseId),
        ])
        setLesson(lessonData)
        setCourse(courseData)
        setQuizUnlocked(courseData.quiz_unlocked)
        const idx = courseData.lessons.findIndex((l) => l.id === Number(lessonId))
        const next = courseData.lessons[idx + 1]
        setNextLessonId(next ? next.id : null)
      } catch (err) {
        setError('Lesson not found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [lessonId, courseId])

  async function handleComplete() {
    setCompleting(true)
    setError('')
    try {
      const result = await completeLesson(lessonId)
      setSuccess('Lesson marked as complete!')
      setQuizUnlocked(result.quiz_unlocked)
      setNextLessonId(result.next_lesson_id)
      setLesson((prev) => ({ ...prev, completed: true }))
    } catch (err) {
      setError('Could not mark lesson complete. Please try again.')
    } finally {
      setCompleting(false)
    }
  }

  const currentIndex = course ? course.lessons.findIndex((l) => l.id === Number(lessonId)) : -1
  const prevLesson = course && currentIndex > 0 ? course.lessons[currentIndex - 1] : null
  const isLastLesson = course && currentIndex === course.lessons.length - 1

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Header title="Lesson" subtitle={course?.title} />
        <main className="p-4 md:p-8 max-w-3xl">
          <Link to={`/courses/${courseId}`} className="text-sm text-primary-600 hover:underline">
            ← Back to Course
          </Link>

          {error && (
            <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 mt-6">Loading lesson...</p>
          ) : lesson ? (
            <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <p className="text-sm font-semibold text-primary-600 mb-1">
                Lesson {lesson.order}
              </p>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{lesson.title}</h2>

              <div className="aspect-video w-full bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-white ml-1" />
                </div>
              </div>

              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">
                Lesson Content
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">{lesson.content}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => prevLesson && navigate(`/courses/${courseId}/lessons/${prevLesson.id}`)}
                  disabled={!prevLesson}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                {lesson.completed ? (
                  <div className="flex gap-3">
                    {nextLessonId && (
                      <button
                        onClick={() => navigate(`/courses/${courseId}/lessons/${nextLessonId}`)}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                      >
                        Next Lesson →
                      </button>
                    )}
                    {isLastLesson && quizUnlocked && (
                      <button
                        onClick={() => navigate(`/courses/${courseId}/quiz`)}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        Go to Quiz →
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white transition-colors"
                  >
                    {completing ? 'Saving...' : 'Mark Complete'}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
