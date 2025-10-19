// src/components/Dashboard.tsx
import React, { useMemo, useState } from "react"
import {
  BookOpen,
  MapPin,
  Users2,
  StickyNote,
  BarChart3,
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Info,
  Star,
  Flag
} from "lucide-react"

/**
 * Dashboard.tsx
 * Full-featured dashboard UI (lessons list + widgets).
 *
 * Notes:
 * - This file expects your app's sidebar width to be 80px (pl-[80px]).
 * - Tailwind classes are used throughout. Adjust spacing tokens to match your project if needed.
 * - Add/Ended lessons and modal are UI-only placeholders — wire up with your API/state as needed.
 */

/* -------------------------
   Types and sample data
   ------------------------- */
type Lesson = {
  id: string
  time: string
  duration: string
  room: string
  subtitle?: string
  location: string
  teacher: { name: string; initials: string; color: string }
  students: number
  stats: { green: number; red: number; gray: number }
  accent: string
}

const makeSampleLessons = (): Lesson[] => {
  const base: Lesson[] = [
    {
      id: "l1",
      time: "09:00",
      duration: "2 hours",
      room: "Room8 D7",
      subtitle: "A1 am",
      location: "Part 1",
      teacher: { name: "Sara Lagarto Teacher", initials: "SL", color: "bg-rose-500" },
      students: 9,
      stats: { green: 4, red: 2, gray: 2 },
      accent: "border-l-4 border-rose-500"
    },
    {
      id: "l2",
      time: "09:00",
      duration: "2 hours",
      room: "Room11 D7",
      subtitle: "A2|200525|am",
      location: "Part 1",
      teacher: { name: "Saba Teacher", initials: "ST", color: "bg-blue-500" },
      students: 11,
      stats: { green: 4, red: 2, gray: 1 },
      accent: "border-l-4 border-amber-500"
    },
    {
      id: "l3",
      time: "09:00",
      duration: "2 hours",
      room: "Room12 D7",
      subtitle: "B2 new am",
      location: "Room 12",
      teacher: { name: "Edmund Patrick Teacher", initials: "EP", color: "bg-purple-500" },
      students: 14,
      stats: { green: 12, red: 1, gray: 1 },
      accent: "border-l-4 border-yellow-500"
    },
    {
      id: "l4",
      time: "09:00",
      duration: "2 hours",
      room: "Room5 D7",
      subtitle: "A1(2) am",
      location: "Part 1",
      teacher: { name: "Isabela Teacher", initials: "IT", color: "bg-teal-500" },
      students: 12,
      stats: { green: 5, red: 2, gray: 1 },
      accent: "border-l-4 border-orange-500"
    },
    {
      id: "l5",
      time: "10:30",
      duration: "1.5 hours",
      room: "Room1 D7",
      subtitle: "B1 am",
      location: "Part 2",
      teacher: { name: "Oriana Teacher", initials: "OT", color: "bg-pink-500" },
      students: 15,
      stats: { green: 8, red: 3, gray: 4 },
      accent: "border-l-4 border-amber-400"
    }
  ]

  // Duplicate some entries to populate a scrollable list
  const items: Lesson[] = []
  for (let i = 0; i < 8; i++) {
    base.forEach((b, idx) => {
      items.push({
        ...b,
        id: `${b.id}-${i}`,
        room: `${b.room.split(" ")[0]} ${idx + 1} D${7 + i}`,
        time: b.time
      })
    })
  }

  return items
}

const lessonsSample = makeSampleLessons()

/* -------------------------
   Small UI helpers
   ------------------------- */
function ProgressBar({ green, red, gray }: { green: number; red: number; gray: number }) {
  const total = green + red + gray || 1
  const g = (green / total) * 100
  const r = (red / total) * 100
  const gr = 100 - g - r
  return (
    <div className="h-3 w-56 rounded-full bg-gray-200 overflow-hidden flex text-xs">
      <div className="h-full" style={{ width: `${g}%`, backgroundColor: "#2f9c6a" }} />
      <div className="h-full" style={{ width: `${r}%`, backgroundColor: "#ef5a66" }} />
      <div className="h-full bg-gray-300" style={{ width: `${gr}%` }} />
    </div>
  )
}

function Donut({ present = 45, absent = 22 }: { present?: number; absent?: number }) {
  const total = present + absent || 1
  const presentPct = (present / total) * 100
  const absentPct = (absent / total) * 100
  const radius = 48
  const stroke = 12
  const circumference = 2 * Math.PI * radius
  const presentDash = (presentPct / 100) * circumference
  const absentDash = (absentPct / 100) * circumference

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <g transform="translate(60,60)">
        <circle r={radius} fill="none" stroke="#e6eef3" strokeWidth={stroke} />
        <circle
          r={radius}
          fill="none"
          stroke="#2f9c6a"
          strokeWidth={stroke}
          strokeDasharray={`${presentDash} ${circumference - presentDash}`}
          strokeLinecap="round"
          transform="rotate(-90)"
        />
        <circle
          r={radius}
          fill="none"
          stroke="#ef5a66"
          strokeWidth={stroke}
          strokeDasharray={`${absentDash} ${circumference - absentDash}`}
          strokeLinecap="round"
          transform={`rotate(${(-90 + (presentPct / 100) * 360)})`}
        />
      </g>
    </svg>
  )
}

/* -------------------------
   Main component
   ------------------------- */
export default function Dashboard() {
  // selected lesson card
  const [selected, setSelected] = useState<string | null>(null)
  // which card is hovered
  const [hovered, setHovered] = useState<string | null>(null)
  // lessons data; in real app replace with props or fetch
  const [lessons] = useState<Lesson[]>(lessonsSample)
  // date state for "Today" + date picker
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10) // yyyy-mm-dd
  })
  // datepicker dropdown open
  const [dateOpen, setDateOpen] = useState(false)
  // Add lesson modal
  const [addOpen, setAddOpen] = useState(false)

  // compute attendance totals for the widget
  const attendance = useMemo(() => {
    let present = 0
    let absent = 0
    lessons.forEach((l) => {
      present += l.stats.green
      absent += l.stats.red
    })
    return { present, absent }
  }, [lessons])

  // helper to format date for display
  const formatDateFriendly = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    } catch {
      return iso
    }
  }

  return (
    <div className="pl-[80px] pt-6 bg-slate-50 min-h-screen">
      <div className="px-6 pb-8">
        {/* Top row: Greeting + controls (these sit above the lessons cards) */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Good day, Asif</h1>
            <div className="mt-2 text-sm text-gray-600">Here's what's happening today — {formatDateFriendly(currentDate)}</div>
          </div>

          {/* Controls block (arrows, Today + datepicker, Add & ended lessons) */}
          <div className="flex items-center gap-3">
            {/* Left/Right arrows */}
            <div className="flex items-center gap-2">
              <button
                title="Previous"
                className="h-10 w-10 grid place-items-center rounded-full border border-blue-100 bg-white hover:bg-blue-50 text-blue-600 transition"
                onClick={() => {
                  // simple prev day
                  const d = new Date(currentDate)
                  d.setDate(d.getDate() - 1)
                  setCurrentDate(d.toISOString().slice(0, 10))
                }}
              >
                <ArrowLeft size={18} />
              </button>

              <button
                title="Next"
                className="h-10 w-10 grid place-items-center rounded-full border border-blue-100 bg-white hover:bg-blue-50 text-blue-600 transition"
                onClick={() => {
                  const d = new Date(currentDate)
                  d.setDate(d.getDate() + 1)
                  setCurrentDate(d.toISOString().slice(0, 10))
                }}
              >
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Today + date picker dropdown */}
            <div className="relative">
              <button
                onClick={() => setDateOpen((v) => !v)}
                className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white text-blue-700 text-sm hover:bg-blue-50 shadow-sm"
                aria-expanded={dateOpen}
              >
                <CalendarIcon size={18} className="text-indigo-600" />
                {/* show friendly label */}
                <span>Today</span>
                <span className="text-xs text-gray-500 ml-1">· {formatDateFriendly(currentDate)}</span>
                <svg className="ml-1 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.44l3.71-4.21a.75.75 0 111.08 1.04l-4.25 4.83a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Date dropdown (simple) */}
              {dateOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-gray-200 shadow-lg z-30 p-3">
                  <div className="text-sm text-gray-700 mb-2">Select date</div>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => setDateOpen(false)}
                      className="px-3 h-9 rounded-lg border border-gray-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setDateOpen(false)
                      }}
                      className="px-3 h-9 rounded-lg bg-indigo-600 text-white"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Show ended lessons small pill */}
            <button
              className="h-10 px-3 rounded-full bg-indigo-50 text-indigo-700 text-sm"
              onClick={() => {
                // toggle behavior placeholder
                alert("Showing 9 ended lessons (placeholder)")
              }}
            >
              Show 9 ended lessons
            </button>

            {/* Add new (open modal) */}
            <button
              className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm"
              onClick={() => setAddOpen(true)}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Add lesson
            </button>
          </div>
        </div>

        {/* MAIN GRID: Left lessons list + Right widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-6">
          {/* Left column (lessons list) */}
          <main>
            {/* Section header */}
            <div className="mb-4 flex items-center gap-3">
              <BookOpen className="text-indigo-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Lessons</h2>
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-white border border-gray-200 rounded-full text-gray-600">59</span>
            </div>

            {/* Cards list (scrollable) */}
            <div className="space-y-4 max-h-[72vh] overflow-auto pr-2">
              {lessons.map((l) => {
                const isSelected = selected === l.id
                const isHovered = hovered === l.id
                return (
                  <article
                    key={l.id}
                    onMouseEnter={() => setHovered(l.id)}
                    onMouseLeave={() => setHovered((h) => (h === l.id ? null : h))}
                    onClick={() => setSelected((s) => (s === l.id ? null : l.id))}
                    role="button"
                    tabIndex={0}
                    className={`group cursor-pointer bg-white border border-gray-200 rounded-xl transition-transform duration-150 flex items-center ${l.accent} ${
                      isSelected
                        ? "ring-2 ring-indigo-200 shadow-md transform -translate-y-1 scale-[1.01]"
                        : isHovered
                        ? "shadow-sm transform -translate-y-0.5 scale-[1.005]"
                        : ""
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelected((s) => (s === l.id ? null : l.id))
                      }
                    }}
                  >
                    <div className="p-4 grid grid-cols-[90px_1fr_auto] gap-4 items-center w-full">
                      {/* time */}
                      <div>
                        <div className="text-gray-900 font-semibold text-sm">{l.time}</div>
                        <div className="text-xs text-gray-500 mt-1">{l.duration}</div>
                      </div>

                      {/* details */}
                      <div>
                        <div className="flex items-center gap-2 text-gray-900">
                          <span className="font-semibold">{l.room}</span>
                          {l.subtitle && <span className="text-sm text-gray-500">({l.subtitle})</span>}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <MapPin size={14} />
                          <span>{l.location}</span>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1 text-sm">
                            <Users2 size={16} className="text-gray-500" />
                            {l.students}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <StickyNote size={16} className="text-gray-500" />
                            0
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-gray-500" />
                            <ProgressBar {...l.stats} />
                          </div>
                        </div>
                      </div>

                      {/* teacher area */}
                      <div className="justify-self-end flex items-center gap-3">
                        <div className="hidden sm:block text-sm text-gray-700 max-w-[160px] truncate">{l.teacher.name}</div>
                        <div className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold ${l.teacher.color}`}>{l.teacher.initials}</div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* bottom area: extra boxes like screenshot 2 */}
            <div className="mt-6 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Star className="text-yellow-400" />
                    <div className="font-semibold">Gold stars</div>
                  </div>
                  <div className="text-sm text-gray-500">0</div>
                </div>
                <div className="mt-4 text-sm text-gray-600">Recognition & rewards for students</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Flag className="text-rose-500" />
                    <div className="font-semibold">Red Flags</div>
                  </div>
                  <div className="text-sm text-gray-500">0</div>
                </div>
                <div className="mt-4 text-sm text-gray-600">Behavioural alerts</div>
              </div>
            </div>
          </main>

          {/* Right column: widgets */}
          <aside className="flex flex-col gap-4">
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-600" />
                  <div className="font-semibold text-gray-800">Lessons</div>
                </div>
                <div className="text-sm text-gray-500">59</div>
              </div>

              <div className="mt-3 flex items-center gap-4">
                <div>
                  <Donut present={attendance.present} absent={attendance.absent} />
                </div>

                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-2">Attendance</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-500" /> <span>Present: {attendance.present}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-500" /> <span>Absent: {attendance.absent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-amber-400" /> <span>Late: 0</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="font-semibold text-gray-800 mb-3">Behaviours</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-lg border border-yellow-400 grid place-items-center text-yellow-500">
                    <Star />
                  </div>
                  <div className="text-sm font-medium text-gray-700">Gold stars</div>
                  <div className="text-xs text-gray-500">0</div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-lg border border-rose-300 grid place-items-center text-rose-500">
                    <Flag />
                  </div>
                  <div className="text-sm font-medium text-gray-700">Red Flags</div>
                  <div className="text-xs text-gray-500">0</div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-800">Announcements</div>
                <Info size={16} className="text-gray-400" />
              </div>
              <div className="mt-3 text-sm text-gray-500">No unread announcements</div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-800">Unread notes</div>
                <Info size={16} className="text-gray-400" />
              </div>
              <div className="mt-3 text-sm text-gray-500">No unread notes</div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-800">Notifications</div>
                <Info size={16} className="text-gray-400" />
              </div>
              <div className="mt-3 text-sm text-gray-500">No new notifications</div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-800">Birthdays</div>
                <div className="text-sm text-gray-400">Students</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-sm font-semibold">MH</div>
                  <div>
                    <div className="text-sm text-indigo-700">Margarita Huanca Esposa</div>
                    <div className="text-xs text-gray-500">Turns 43 today</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-sm font-semibold">DG</div>
                  <div>
                    <div className="text-sm text-indigo-700">Dennys Rolando Molina Gonzalez</div>
                    <div className="text-xs text-gray-500">Turns 33 today</div>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-4">
              <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
                <div className="font-semibold text-gray-800">Extra Widget</div>
                <div className="mt-2 text-sm text-gray-500">Add more info here</div>
              </section>

              <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
                <div className="font-semibold text-gray-800">Quick Actions</div>
                <div className="mt-2 text-sm text-gray-500">Create lesson, message, etc.</div>
              </section>
            </div>
          </aside>
        </div>
      </div>

      {/* Add Lesson Modal (simple placeholder) */}
      {addOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add new lesson</h3>
              <button
                onClick={() => setAddOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Room" className="border rounded-lg px-3 py-2" />
              <input placeholder="Teacher" className="border rounded-lg px-3 py-2" />
              <input type="time" className="border rounded-lg px-3 py-2" />
              <input type="time" className="border rounded-lg px-3 py-2" />
              <textarea placeholder="Notes" className="col-span-1 md:col-span-2 border rounded-lg px-3 py-2" />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button onClick={() => { setAddOpen(false); alert("Saved (placeholder)"); }} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
