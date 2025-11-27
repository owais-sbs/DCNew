import { NavLink, Outlet } from "react-router-dom"

const navLinks = [
  { label: "Dashboard", to: "/student/dashboard" },
  { label: "Calendar", to: "/student/calendar" },
  { label: "Classes", to: "/student/classes" }
]

export default function StudentPortalLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 px-6 flex items-center border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Teach ’n Go</span>
        </div>
        <nav className="flex-1 py-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 h-11 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-indigo-600 bg-indigo-50 border-l-4 border-indigo-500"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-6 text-xs text-gray-400">© 2025 DCE English Language School</div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="text-lg font-semibold text-gray-900">DCE English Language School</div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">Abdullah Jan</div>
              <div className="text-xs text-gray-500">Student</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-500 text-white grid place-items-center text-sm font-semibold">
              AJ
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

