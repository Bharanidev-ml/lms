import { NavLink, useNavigate } from 'react-router-dom'

const linkBase =
  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors'

export default function Sidebar() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('lms_user')
    navigate('/login')
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="px-6 py-6 flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
          L
        </div>
        <span className="text-lg font-bold text-gray-800">LMS Portal</span>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/courses"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`
          }
        >
          My Courses
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`
          }
        >
          Profile
        </NavLink>
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
