import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'

export default function Result() {
  const { state } = useLocation()
  const { courseId } = useParams()
  const navigate = useNavigate()

  const userJson = localStorage.getItem('lms_user')
  const user = userJson ? JSON.parse(userJson) : { name: 'Admin' }

  if (!state || !state.result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <p className="text-gray-600">No quiz result found.</p>
        <Link to={`/courses/${courseId}`} className="text-primary-600 hover:underline text-sm">
          ← Back to Course
        </Link>
      </div>
    )
  }

  const { result } = state
  const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function handlePrint() {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed 🎉</h1>
          <p className="text-sm text-gray-500 mb-6">Your Score</p>

          <div className="text-5xl font-extrabold text-primary-600 mb-1">
            {result.score} / {result.total_questions}
          </div>
          <div className="text-2xl font-bold text-gray-700 mb-6">{result.percentage}%</div>

          {result.passed ? (
            <div className="bg-green-50 text-green-700 font-medium px-4 py-3 rounded-lg">
              ✓ Congratulations! You passed.
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-700 font-medium px-4 py-3 rounded-lg">
              You didn't pass this time. Review the lessons and try again.
            </div>
          )}

          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="mt-6 px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Back to Course
          </button>
        </div>

        {result.passed && result.course_completed && (
          <div>
            <div
              id="certificate-print"
              className="bg-white rounded-2xl shadow-sm border-4 border-double border-primary-300 p-10 text-center"
            >
              <p className="text-xs font-bold tracking-[0.3em] text-primary-600 mb-1">
                CERTIFICATE OF
              </p>
              <p className="text-2xl font-extrabold text-gray-800 mb-6 tracking-wide">
                COMPLETION
              </p>
              <p className="text-sm text-gray-500 mb-2">This certifies that</p>
              <p className="text-3xl font-bold text-primary-700 mb-4">{user.name}</p>
              <p className="text-sm text-gray-500 mb-2">has successfully completed</p>
              <p className="text-xl font-bold text-gray-800 mb-6">Python Fundamentals</p>
              <p className="text-sm text-gray-400">{monthYear}</p>
            </div>

            <button
              onClick={handlePrint}
              className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Download Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
