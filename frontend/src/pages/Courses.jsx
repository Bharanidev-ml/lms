import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import CourseCard from '../components/CourseCard.jsx'
import { getCourses } from '../api.js'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch (err) {
        setError('Unable to load courses. Is the backend running?')
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
        <Header title="My Courses" subtitle="All courses you're enrolled in" />
        <main className="p-4 md:p-8">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {loading ? (
            <p className="text-gray-500">Loading courses...</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
