import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar.jsx'

export default function CourseCard({ course }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">Instructor: {course.instructor}</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700">
          {course.level}
        </span>
      </div>

      <div className="flex gap-4 text-sm text-gray-500 mb-4">
        <span>{course.total_lessons} Lessons</span>
        <span>&bull;</span>
        <span>1 Quiz</span>
      </div>

      <ProgressBar percent={course.progress_percent} />

      <button
        onClick={() => navigate(`/courses/${course.id}`)}
        className="mt-5 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        Continue Learning →
      </button>
    </div>
  )
}
