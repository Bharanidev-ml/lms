import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import CourseCard from '../components/CourseCard.jsx'
import { getCourses, getProgress } from '../api.js'

const statCards = [
  { key: 'enrolled_courses', label: 'Enrolled Courses', color: 'bg-blue-50 text-blue-700' },
  { key: 'completed_courses', label: 'Completed Courses', color: 'bg-green-50 text-green-700' },
  { key: 'lessons_completed', label: 'Lessons Completed', color: 'bg-amber-50 text-amber-700' },
  { key: 'overall_progress_percent', label: 'Overall Progress', color: 'bg-purple-50 text-purple-700', suffix: '%' },
]

export default function Dashboard() {
  const [courses, setCourses] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userJson = localStorage.getItem('lms_user')
  const user = userJson ? JSON.parse(userJson) : { name: 'Admin' }

  useEffect(() => {
    async function load() {
      try {
        const [coursesData, progressData] = await Promise.all([
          getCourses(),
          getProgress(),
        ])
        setCourses(coursesData)
        setProgress(progressData)
      } catch (err) {
        setError('Unable to load dashboard data. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Header title="Dashboard" subtitle="Overview of your learning activity" />

        <main className="p-4 md:p-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 md:p-8 text-white mb-8">
            <h2 className="text-2xl font-bold mb-1">Welcome back, {user.name} 👋</h2>
            <p className="text-primary-100">Continue your learning journey.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Loading dashboard...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card) => (
                  <div
                    key={card.key}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold mb-3 ${card.color}`}
                    >
                      {(progress?.[card.key] ?? 0)}
                      {card.suffix || ''}
                    </div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4">My Courses</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
