const BASE_URL = 'http://localhost:8000/api'

async function handleResponse(res) {
  if (!res.ok) {
    let detail = 'Something went wrong'
    try {
      const data = await res.json()
      detail = data.detail || detail
    } catch (e) {
      // ignore json parse errors
    }
    throw new Error(detail)
  }
  return res.json()
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(res)
}

export async function getCourses() {
  const res = await fetch(`${BASE_URL}/courses`)
  return handleResponse(res)
}

export async function getCourse(courseId) {
  const res = await fetch(`${BASE_URL}/courses/${courseId}`)
  return handleResponse(res)
}

export async function getLesson(lessonId) {
  const res = await fetch(`${BASE_URL}/lessons/${lessonId}`)
  return handleResponse(res)
}

export async function completeLesson(lessonId) {
  const res = await fetch(`${BASE_URL}/lessons/${lessonId}/complete`, {
    method: 'POST',
  })
  return handleResponse(res)
}

export async function getProgress() {
  const res = await fetch(`${BASE_URL}/progress`)
  return handleResponse(res)
}

export async function getQuiz(courseId) {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/quiz`)
  return handleResponse(res)
}

export async function submitQuiz(courseId, answers) {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
  return handleResponse(res)
}
