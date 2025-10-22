import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Printer, ChevronDown } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import TeacherCalendar from "./TeacherCalendar"
import ClassesCalendar from "./ClassesCalendar"

type Event = {
  id: string
  start: string
  end: string
  room: string
  color: "red" | "yellow" | "blue"
  title: string
  subtitle: string
  teacher: string
  students: number
}

const events: Event[] = [
  { id: "e1", start: "09:00", end: "11:00", room: "Room1", color: "yellow", title: "Room1 D7", subtitle: "B1 am", teacher: "Oriana Teacher", students: 16 },
  { id: "e2", start: "09:00", end: "11:00", room: "Room10", color: "red", title: "Room10 D7", subtitle: "B2 new am", teacher: "Maeve Teacher", students: 12 },
  { id: "e3", start: "10:45", end: "12:15", room: "France", color: "blue", title: "France p2", subtitle: "A1 20 25", teacher: "Kurtys Teacher", students: 9 },
  { id: "e4", start: "13:00", end: "15:00", room: "Room3", color: "red", title: "Room3 D7", subtitle: "AM Part 2", teacher: "Saba Teacher", students: 10 },
  { id: "e5", start: "11:15", end: "13:15", room: "Room4", color: "yellow", title: "Room4 D7", subtitle: "PM 1", teacher: "Sara Teacher", students: 11 },
  { id: "e6", start: "14:00", end: "16:00", room: "Room8", color: "blue", title: "Room8 D7", subtitle: "Advanced", teacher: "Isabela Teacher", students: 13 },
]

const hours = ["7", "8", "9", "10", "11", "12", "13", "14", "15", "16"]

export default function Calendar({ showTeacher = false }: { showTeacher?: boolean }) {
  const [tab, setTab] = useState(showTeacher ? "Teacher" : "Default")
  const [hoverId, setHoverId] = useState<string | null>(null)
  const dayString = useMemo(() => "Monday October 13, 2025", [])
  const navigate = useNavigate()
  const location = useLocation()

  // dropdown state
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const datasets: Record<string, string[]> = {
    Student: [
      "Abdurrakhim Umirbyek",
      "Abraham Emmanuel Acosta Garcia",
      "Adiyadorj Erdev",
      "Adriana Jaimes Garcia",
      "Adriana Martins De Abreu",
      "Adriana Xavier Arruda",
      "Aldo Valencia Pantoja",
      "Alejandro Diaz Salinas"
    ],
    Teacher: [
      "Abbey teacher",
      "Adao Lopes Teacher",
      "Anne Smiddy Elisabeth",
      "Aoife Sinead Buckley",
      "Ava Collopy",
      "Beni Teacher",
      "Carla Kerr"
    ],
    Class: [
      "AM B1 WALID/ABBEY",
      "Advanced_AM_DCE1_PART 1",
      "Advanced_PM_DCE1_PART 1",
      "Cork Classroom C1 AM ABAIGH/ANNE",
      "Elementary_AM_DCE1_PART 1"
    ],
    Level: ["P2", "B1", "C1", "A1", "B2", "A2(2) pm", "A1(2) pm"],
    Subject: ["General English with Exam Preparation"],
    Classroom: [
      "Class 1",
      "Cork",
      "France",
      "Galway",
      "Limerick",
      "Online Lesson",
      "Part 1",
      "Part 2"
    ],
    Type: ["Academic", "Non Academic"]
  }


  // Handle tab navigation
  const handleTabChange = (t: string) => {
    setTab(t)
    if (t === "Teacher") navigate("/calendar/teacher")
    else if (t === "Classroom") navigate("/calendar/classroom")
    else navigate("/calendar")
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="px-6 py-4">

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-3 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
          {["Default", "Teacher", "Classroom"].map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-4 h-10 rounded-xl text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-blue-50 text-blue-600 border border-blue-300 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 border border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
          <button className="ml-auto flex items-center gap-2 px-4 h-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
            <Printer size={16} /> Print
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm mb-3">
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 grid place-items-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600">
              <ChevronLeft size={18} />
            </button>
            <button className="h-10 w-10 grid place-items-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600">
              <ChevronRight size={18} />
            </button>
            <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-100">
              Today
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {["Student", "Teacher", "Class", "Level", "Subject", "Classroom", "Type"].map((f) => (
              <div key={f} className="relative">
                <button
                  onClick={() => {
                    setQuery("")
                    setOpenFilter((o) => (o === f ? null : f))
                  }}
                  className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                  aria-expanded={openFilter === f}
                >
                  {f}: All <ChevronDown size={14} className="text-gray-500" />
                </button>
                {openFilter === f && (
                  <div className={`absolute z-50 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 top-full ${f === 'Classroom' || f === 'Type' ? 'right-0' : 'left-0'}`}>
                    <input
                      autoFocus
                      className="w-full h-9 px-3 rounded-lg border border-gray-200 mb-2 text-sm"
                      placeholder=""
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="text-xs text-gray-500 px-2 py-1">All</div>
                    <div className="max-h-72 overflow-auto">
                      {(query ? (datasets[f] || []).filter((x) => x.toLowerCase().includes(query.toLowerCase())) : (datasets[f] || [])).map((it) => (
                        <div key={it} className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={() => setOpenFilter(null)}>
                          {it}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* View Buttons */}
        <div className="flex justify-end mb-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {(["Month", "Week", "Day"] as const).map((v) => (
              <button
                key={v}
                className={`px-4 h-10 text-sm font-medium ${
                  v === "Day"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Date Header - moved up */}
        <div className="text-center mb-1 text-xl font-semibold text-gray-800 -mt-2">
          {dayString}
        </div>

        {/* DEFAULT CALENDAR GRID */}
        {tab === "Default" && !showTeacher && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-[60px_1fr]">
              {/* Time Column */}
              <div className="bg-white">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="h-16 border-t border-gray-200 text-xs text-gray-500 grid place-items-center"
                  >
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Events */}
              <div className="relative">
                {hours.map((h) => (
                  <div key={h} className="h-16 border-t border-gray-200" />
                ))}

                {events.map((ev, i) => {
                  const startHour = parseInt(ev.start.split(":")[0])
                  const endHour = parseInt(ev.end.split(":")[0])
                  const top = (startHour - 7) * 64 + (parseInt(ev.start.split(":")[1]) / 60) * 64
                  const height = ((endHour - startHour) * 64) + ((parseInt(ev.end.split(":")[1]) - parseInt(ev.start.split(":")[1])) / 60) * 64
                  const left = i * 130 + 10
                  const color =
                    ev.color === "red"
                      ? "bg-red-500"
                      : ev.color === "blue"
                      ? "bg-blue-500"
                      : "bg-yellow-400"

                  return (
                    <div
                      key={ev.id}
                      onMouseEnter={() => setHoverId(ev.id)}
                      onMouseLeave={() => setHoverId(null)}
                      className={`absolute rounded-md text-white text-xs p-2 shadow-md transition-all ${color}`}
                      style={{ top, left, height, width: 120 }}
                    >
                      <div className="font-semibold truncate">{ev.title}</div>
                      <div className="truncate">{ev.start} - {ev.end}</div>
                      <div className="truncate">{ev.room}</div>

                      {hoverId === ev.id && (
                        <div className="absolute left-full ml-2 top-0 w-60 bg-white text-gray-700 rounded-xl border border-gray-200 shadow-lg p-3 z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`h-3 w-3 rounded-full ${color}`} />
                            <div className="font-semibold text-blue-700">{ev.title}</div>
                          </div>
                          <div className="text-xs text-gray-500">{ev.subtitle}</div>
                          <div className="mt-2 space-y-1 text-sm">
                            <div>{ev.start} - {ev.end}</div>
                            <div>Monday, 13-10-2025</div>
                            <div>Room: {ev.room}</div>
                            <div className="text-blue-600">{ev.teacher}</div>
                            <div className="text-blue-600">{ev.students} students</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TEACHER + CLASSROOM VIEWS */}
        {tab === "Teacher" && <TeacherCalendar />}
        {tab === "Classroom" && <ClassesCalendar />}
      </div>
    </div>
  )
}

