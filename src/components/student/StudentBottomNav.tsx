import { useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Calendar, BookOpen, FileText, User } from "lucide-react"

const items = [
  { path: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/student/calendar", icon: Calendar, label: "Calendar" },
  { path: "/student/classes", icon: BookOpen, label: "Classes" },
  { path: "/student/files", icon: FileText, label: "Files" },
  { path: "/student/profile", icon: User, label: "Profile" },
]

export default function StudentBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {items.map(({ path, icon: Icon, label }) => {
          const isActive =
            path === "/student/dashboard"
              ? location.pathname === path
              : location.pathname.startsWith(path)
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 transition-colors touch-manipulation ${
                isActive ? "text-[#1a73e8]" : "text-gray-500"
              }`}
              aria-label={label}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} className="flex-shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-full px-0.5">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
