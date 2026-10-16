import { useEffect, useRef, useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { ChevronDown, LogOut } from "lucide-react"
import { useAuth } from "../AuthContext"

const navLinks = [
  { label: "Dashboard", to: "/student/dashboard" },
  { label: "Calendar", to: "/student/calendar" },
  { label: "Classes", to: "/student/classes" },
  { label: "Holidays", to: "/student/holidays" },
  { label: "Requests", to: "/student/requests" }
]

export default function StudentPortalLayout() {
  const { user, logout } = useAuth()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const studentName = user?.name || user?.email || "Student"
  const initials = studentName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("")

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileMenuOpen(false)
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 px-6 flex items-center border-b border-gray-200">
          <img src="/src/assets/logo.webp" alt="DCE English Language School" className="h-12 w-12 object-contain" />
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
              <div className="text-sm font-medium text-gray-900">{studentName}</div>
              <div className="text-xs text-gray-500">Student</div>
            </div>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <span className="h-10 w-10 rounded-full bg-indigo-500 text-white grid place-items-center text-sm font-semibold">
                  {initials}
                </span>
                <ChevronDown size={16} className="text-gray-500" aria-hidden="true" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full z-30 mt-3 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg" role="menu">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <div className="truncate text-sm font-semibold text-gray-900">{studentName}</div>
                    <div className="truncate text-xs text-gray-500">{user?.email}</div>
                    <div className="mt-1 text-xs text-gray-500">Student</div>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileMenuOpen(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600 focus:bg-gray-50 focus:outline-none"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Log out
                  </button>
                </div>
              )}
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

