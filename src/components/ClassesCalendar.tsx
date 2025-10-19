import { useState } from "react"
import { ChevronDown, CalendarDays } from "lucide-react"

type ClassEvent = {
  id: string
  className: string
  color: "red" | "yellow" | "blue"
  title: string
  start: string // "09:00"
  end: string   // "11:00"
  room: string
  students: number
  subtitle?: string
}

// sample events (use start/end for positioning on the time grid)
const classEvents: ClassEvent[] = [
  { id: "c1", className: "Room 1", color: "red", title: "Beginner AM", start: "09:00", end: "11:00", room: "Room 1", students: 14, subtitle: "Morning batch" },
  { id: "c2", className: "Room 4", color: "yellow", title: "Intermediate PM", start: "11:15", end: "13:15", room: "Room 4", students: 12, subtitle: "A1 group" },
  { id: "c3", className: "Room 8", color: "blue", title: "Advanced", start: "14:00", end: "16:00", room: "Room 8", students: 10 },
  { id: "c4", className: "Online Lesson", color: "red", title: "Conversation", start: "10:00", end: "12:00", room: "Online", students: 8 },
  { id: "c5", className: "France", color: "yellow", title: "Part 2", start: "13:00", end: "15:00", room: "France", students: 11 },
  { id: "c6", className: "Galway", color: "blue", title: "Grammar", start: "15:00", end: "17:00", room: "Galway", students: 9 },
]

// Full class list for header (as you provided)
const classList = [
  "Class 1", "Cork", "France", "Galway", "Kildere (02)", "Kildere (2)",
  "Leitrim", "Leitrim (05)", "Limerick", "Limerick (06)", "Meath",
  "Monaghan (06)", "Online Lesson", "Online Video Lesson", "Part 1", "Part 2",
  "Room", "Room 1", "Room 11", "Room 12", "Room 2", "Room 3", "Room 4", "Room 5",
  "Room 6", "Room 7", "Room 8", "Room 9", "Room10", "Room11",
  "Sligo (3)", "Tipperary (04)", "room3"
]

// hours used for vertical time grid
const hours = ["7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"]

export default function ClassesCalendar() {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("2025-10-17")
  const [viewMode, setViewMode] = useState<"day" | "day2">("day")

  // filter events by selectedClass if chosen
  const filteredEvents = selectedClass
    ? classEvents.filter(ev => ev.className === selectedClass || ev.room === selectedClass)
    : classEvents

  // helper: convert "HH:MM" to minutes since 0:00
  const toMinutes = (hhmm: string) => {
    const [hh, mm] = hhmm.split(":").map((s) => parseInt(s, 10) || 0)
    return hh * 60 + mm
  }

  // grid metrics
  const gridStartHour = 7 // 7:00
  const pxPerHour = 64 // visual pixels per hour (matches other calendar)
  const gridTotalHeight = (hours.length) * pxPerHour

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mt-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-indigo-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">
            Classes Calendar — Total ({classList.length}) Classes
          </h2>
        </div>

        <div className="flex gap-2">
          {["Teacher", "Level", "Type"].map((f) => (
            <button
              key={f}
              className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
            >
              {f}: All <ChevronDown size={14} className="text-gray-500" />
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE TOGGLE (Day / Day2) + Date */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              viewMode === "day" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode("day2")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              viewMode === "day2" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
            }`}
          >
            Day2
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* CLASS NAMES SCROLLABLE HEADER */}
      <div className="overflow-x-auto border-y border-gray-200 py-3 mb-4">
        <div className="flex gap-2 min-w-max">
          {classList.map((className) => (
            <button
              key={className}
              onClick={() =>
                setSelectedClass((prev) => (prev === className ? null : className))
              }
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                selectedClass === className
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-100 hover:bg-indigo-100 text-gray-700 border-gray-200"
              }`}
            >
              {className}
            </button>
          ))}
        </div>
      </div>

      {/* === CALENDAR GRID (for both Day and Day2) === */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[60px_1fr]">
          {/* TIME RULER COLUMN */}
          <div className="bg-white">
            {hours.map((h) => (
              <div key={h} className="h-16 border-t border-gray-200 text-xs text-gray-500 grid place-items-center">
                {h}:00
              </div>
            ))}
          </div>

          {/* CANVAS COLUMN */}
          <div className="relative" style={{ height: gridTotalHeight }}>
            {/* horizontal hour rows */}
            {hours.map((h, idx) => (
              <div key={h} className="h-16 border-t border-gray-200" />
            ))}

            {/* Place events on canvas */}
            {filteredEvents.map((ev, i) => {
              // If viewMode === 'day2' we slightly shift left positions to simulate alternate stacking
              const startMin = toMinutes(ev.start)
              const endMin = toMinutes(ev.end)
              const top = ((startMin - gridStartHour * 60) / 60) * pxPerHour
              const height = ((endMin - startMin) / 60) * pxPerHour

              // Spread horizontally so events don't perfectly overlap — stable but deterministic
              const baseLeft = 12 + (i % 4) * 140
              const left = viewMode === "day2" ? baseLeft + 40 : baseLeft

              const colorClass = ev.color === "red" ? "bg-red-500" : ev.color === "yellow" ? "bg-yellow-400" : "bg-blue-500"

              return (
                <div
                  key={ev.id + (viewMode === "day2" ? "-2" : "")}
                  onMouseEnter={() => setHoverId(ev.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className={`absolute rounded-md text-white text-xs p-3 shadow-md transition-all ${colorClass}`}
                  style={{ top, left, height, width: 120 }}
                >
                  <div className="font-semibold truncate">{ev.title}</div>
                  <div className="truncate text-[11px]">{ev.start} - {ev.end}</div>
                  <div className="truncate text-[11px]">{ev.room}</div>

                  {/* Hover tooltip (fixed beside the event like your Calendar) */}
                  {hoverId === ev.id && (
                    <div className="absolute left-full ml-2 top-0 w-64 bg-white text-gray-700 rounded-xl border border-gray-200 shadow-lg p-3 z-20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`h-3 w-3 rounded-full ${colorClass}`} />
                        <div className="font-semibold text-blue-700">{ev.title}</div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div>{ev.subtitle ?? ""}</div>
                        <div className="mt-1"><strong>Time:</strong> {ev.start} - {ev.end}</div>
                        <div><strong>Room:</strong> {ev.room}</div>
                        <div className="text-blue-600 mt-1"><strong>Students:</strong> {ev.students} </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* fallback empty state (if filteredEvents empty) */}
      {filteredEvents.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No classes found for the selected filter/date.
        </div>
      )}
    </div>
  )
}
