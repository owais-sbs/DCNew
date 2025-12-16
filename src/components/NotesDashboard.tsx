import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { NotebookPen, CalendarDays } from "lucide-react"
import ClassesScreen from "./ClassesScreen"

type TabId = "classes" | "events"

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: "classes", label: "Classes", icon: NotebookPen },
  { id: "events", label: "Events", icon: CalendarDays }
]

export default function NotesDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState<TabId>("classes")

  useEffect(() => {
    if (location.pathname.includes("/notes/events")) {
      setActive("events")
    } else {
      setActive("classes")
    }
  }, [location.pathname])

  const go = (id: TabId) => {
    setActive(id)
    navigate(id === "classes" ? "/notes/classes" : "/notes/events")
  }

  return (
    <div className="px-6 py-6">
      {/* Top header with title and actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Classes &amp; Events</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/notes/add-class")}
            className="h-9 px-4 rounded border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50"
          >
            New Class
          </button>
          <button
            type="button"
            onClick={() => navigate("/notes/events")}
            className="h-9 px-4 rounded border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Dotted separator */}
      <div className="mt-3 border-t border-dotted border-gray-300" />

      {/* Tabs row */}
      <div className="mt-4 flex items-end gap-1 border-b border-gray-300 pb-0.5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => go(id)}
              className={`inline-flex items-center gap-2 px-3 h-8 rounded-t-md border ${
                isActive
                  ? "border-gray-400 border-b-white bg-white text-gray-900"
                  : "border-gray-300 bg-[#f5f5f5] text-gray-700 hover:bg-gray-200"
              }`}
              style={{ marginBottom: -1 }}
            >
              <Icon size={16} className="text-gray-600" />
              <span className="text-sm">{label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {active === "classes" && (
        <div className="mt-6">
          <ClassesScreen />
        </div>
      )}

      {active === "events" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded bg-gray-100 grid place-items-center">
                <CalendarDays size={20} className="text-gray-500" />
              </div>
              <div className="text-xl font-semibold text-gray-800">0/0 Events</div>
            </div>
            <button className="h-9 px-4 inline-flex items-center gap-2 rounded border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50">
              Export
            </button>
          </div>

          <div className="mt-4 border border-gray-400 rounded-sm bg-white px-4 py-6 text-sm text-gray-600">
            No events
          </div>
        </div>
      )}
    </div>
  )
}



