import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import { getQuiz, submitQuiz } from '../api.js'

const OPTION_KEYS = ['A', 'B', 'C', 'D']

export default function Quiz() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getQuiz(courseId)
        setQuiz(data)
      } catch (err) {
        setError('Quiz not found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  function selectAnswer(questionId, option) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  async function handleSubmit() {
    if (!quiz) return
    if (Object.keys(answers).length < quiz.questions.length) {
      setError('Please answer all questions before submitting.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const result = await submitQuiz(courseId, answers)
      navigate(`/courses/${courseId}/result`, { state: { result, courseId } })
    } catch (err) {
      setError('Could not submit quiz. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Header title="Final Quiz" subtitle="Answer all questions to complete the course" />
        <main className="p-4 md:p-8 max-w-3xl">
          <Link to={`/courses/${courseId}`} className="text-sm text-primary-600 hover:underline">
            ← Back to Course
          </Link>

          {error && (
            <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 mt-6">Loading quiz...</p>
          ) : quiz ? (
            <div className="mt-4 space-y-5">
              {quiz.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <p className="font-semibold text-gray-800 mb-4">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="space-y-2">
                    {OPTION_KEYS.map((key) => {
                      const optionText = q[`option_${key.toLowerCase()}`]
                      const selected = answers[q.id] === key
                      return (
                        <button
                          key={key}
                          onClick={() => selectAnswer(q.id, key)}
                          className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                            selected
                              ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-full border text-xs font-bold ${
                              selected
                                ? 'border-primary-500 bg-primary-500 text-white'
                                : 'border-gray-300 text-gray-400'
                            }`}
                          >
                            {key}
                          </span>
                          {optionText}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
