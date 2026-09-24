import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { getCourse } from '../api.js'

export default function CourseDetails() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getCourse(courseId)
        setCourse(data)
      } catch (err) {
        setError('Course not found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  function statusIcon(lesson) {
    if (lesson.completed) return '✓'
    return '○'
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Header title="Course" subtitle="Lessons and quiz overview" />
        <main className="p-4 md:p-8 max-w-3xl">
          <Link to="/dashboard" className="text-sm text-primary-600 hover:underline">
            ← Back to Dashboard
          </Link>

          {error && (
            <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 mt-6">Loading course...</p>
          ) : course ? (
            <div className="mt-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{course.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Instructor: {course.instructor} &bull; {course.level}
                    </p>
                  </div>
                  {course.course_completed && (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700">
                      Completed 🎉
                    </span>
                  )}
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>

                <ProgressBar percent={course.progress_percent} />

                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                    Lessons
                  </h3>
                  <div className="space-y-2">
                    {course.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => navigate(`/courses/${course.id}/lessons/${lesson.id}`)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/40 transition-colors text-left"
                      >
                        <span className="flex items-center gap-3 text-sm font-medium text-gray-700">
                          <span
                            className={
                              lesson.completed
                                ? 'text-green-600 font-bold'
                                : 'text-gray-400 font-bold'
                            }
                          >
                            {statusIcon(lesson)}
                          </span>
                          {lesson.title}
                        </span>
                        <span className="text-xs text-gray-400">Lesson {lesson.order}</span>
                      </button>
                    ))}

                    <button
                      onClick={() => course.quiz_unlocked && navigate(`/courses/${course.id}/quiz`)}
                      disabled={!course.quiz_unlocked}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors ${
                        course.quiz_unlocked
                          ? 'border-gray-100 hover:border-primary-200 hover:bg-primary-50/40 cursor-pointer'
                          : 'border-gray-100 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center gap-3 text-sm font-medium text-gray-700">
                        <span className="font-bold">
                          {course.quiz_unlocked ? '📝' : '🔒'}
                        </span>
                        Final Quiz
                      </span>
                      <span className="text-xs text-gray-400">
                        {course.quiz_unlocked ? 'Available' : 'Locked'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
