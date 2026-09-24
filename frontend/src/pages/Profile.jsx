import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import { getProgress } from '../api.js'

export default function Profile() {
  const [progress, setProgress] = useState(null)
  const userJson = localStorage.getItem('lms_user')
  const user = userJson ? JSON.parse(userJson) : { name: 'Admin', email: '' }

  useEffect(() => {
    getProgress().then(setProgress).catch(() => {})
  }, [])

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Header title="Profile" subtitle="Your account details" />
        <main className="p-4 md:p-8 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            {progress && (
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Enrolled Courses
                  </p>
                  <p className="text-lg font-bold text-gray-800">{progress.enrolled_courses}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Completed Courses
                  </p>
                  <p className="text-lg font-bold text-gray-800">{progress.completed_courses}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Lessons Completed
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {progress.lessons_completed} / {progress.total_lessons}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Overall Progress
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {progress.overall_progress_percent}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
