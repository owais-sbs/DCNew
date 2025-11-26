// @ts-nocheck
// ^^ Disabling TypeScript checks for this example file as we have
// placeholder data (teacher, stats) that doesn't fully match the types
// Remove this line in your real project once all data is wired up.

import React, { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  Flag,
  MessageSquare,
  Copy,
  Plus,
  X,
  Loader2,
  MoreVertical
} from "lucide-react"
import axiosInstance from "./axiosInstance"
import SessionDetailsModal from "./SessionDetailsModal"

/**
 * Dashboard.tsx
 * Full-featured dashboard UI (lessons list + widgets).
 */

/* -------------------------
   Types
   ------------------------- */
type Lesson = {
  id: string
  time: string
  duration: string
  className: string
  subject: string
  classroom: string
  location: string
  teacherNames: string[]
  totalStudents: number
  presentCount: number
  absentCount: number
}


type ApiSession = {
  ClassId: number
  SessionId: number
  TeacherNames: string[]
  ClassRoomName: string
  ClassTitle: string
  ClassSubject: string
  StartTime: string
  EndTime: string
  DayOfWeek: string
  TotalStudents: number
  PresentCount: number
  AbsentCount: number
}

type ApiResponse = {
  IsSuccess: boolean
  Data: ApiSession[]
}

/* -------------------------
   Date/Time Helpers
   ------------------------- */
function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  } catch (e) {
    return "12:00 AM"
  }
}

function calculateDuration(startString: string, endString: string): string {
  try {
    const start = new Date(startString).getTime()
    const end = new Date(endString).getTime()
    const diffMs = end - start
    if (diffMs <= 0) return "N/A"

    const totalMinutes = Math.floor(diffMs / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}${
        minutes > 0 ? ` ${minutes} min` : ""
      }`
    }
    return `${minutes} min`
  } catch (e) {
    return "N/A"
  }
}

// --- REMOVED: makeSampleLessons and lessonsSample ---

/* -------------------------
   Small UI helpers
   ------------------------- */
function ProgressBar({ green, red, gray }: { green: number; red: number; gray: number }) {
  const total = green + red + gray || 1
  const g = (green / total) * 100
  const r = (red / total) * 100
  const gr = 100 - g - r
  return (
    <div className="h-3 w-48 rounded-full bg-gray-200 overflow-hidden flex text-xs relative">
      {green > 0 && (
        <div className="h-full flex items-center justify-center text-white font-semibold" style={{ width: `${g}%`, backgroundColor: "#2f9c6a", minWidth: green > 0 ? '20px' : '0' }}>
          {green}
        </div>
      )}
      {red > 0 && (
        <div className="h-full flex items-center justify-center text-white font-semibold" style={{ width: `${r}%`, backgroundColor: "#ef5a66", minWidth: red > 0 ? '20px' : '0' }}>
          {red}
        </div>
      )}
      {gr > 0 && (
        <div className="h-full bg-gray-300" style={{ width: `${gr}%` }} />
      )}
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
          strokeDasharray={`${absentDash} ${circumference - presentDash}`}
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
  const navigate = useNavigate()
  
  // selected lesson card (opens details modal)
  const [selected, setSelected] = useState<string | null>(null)
  // which card is hovered
  const [hovered, setHovered] = useState<string | null>(null)

  // CHANGED: State is now empty array, with setLessons
  const [lessons, setLessons] = useState<Lesson[]>([])
  
  // CHANGED: Added loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // date state for "Today" + date picker
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10) // yyyy-mm-dd
  })
  // datepicker dropdown open
  const [dateOpen, setDateOpen] = useState(false)
  // Add lesson modal
  const [addOpen, setAddOpen] = useState(false)

  // This useEffect will now work correctly
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // TODO: Update this endpoint to use `currentDate`
        // e.g. /Class/GetSessionsFlattened?date=${currentDate}
        const response = await axiosInstance.get<ApiResponse>("/Class/GetTodaySessionFlattened")

        if (response.data && response.data.IsSuccess) {
          // Map API data to our Lesson[] type
          const mappedLessons: Lesson[] = response.data.Data.map((item, index) => ({
            id: item.SessionId.toString(),
            time: formatTime(item.StartTime),
            duration: calculateDuration(item.StartTime, item.EndTime),
            className: item.ClassTitle,
            subject: item.ClassSubject,
            classroom: item.ClassRoomName || item.DayOfWeek,
            location: item.ClassRoomName || item.DayOfWeek,
            teacherNames: item.TeacherNames || [],
            totalStudents: item.TotalStudents || 0,
            presentCount: item.PresentCount || 0,
            absentCount: item.AbsentCount || 0
          }))
          setLessons(mappedLessons)
        } else {
          setError("Failed to fetch lessons. Please try again.")
        }
      } catch (err) {
        console.error("Error fetching lessons:", err)
        setError("An error occurred while fetching lessons.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLessons()
    // This hook re-runs whenever `currentDate` changes
  }, [currentDate])

  // compute attendance totals for the widget
  const attendance = useMemo(() => {
    let present = 0
    let absent = 0
    lessons.forEach((l) => {
      present += l.presentCount
      absent += l.absentCount
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
    <div className="bg-slate-50 min-h-screen -mt-4">
      <div className="px-6 pt-4 pb-6">
        {/* Top row: Greeting */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Welcome, Asif</h1>
        </div>

        {/* MAIN GRID: Left lessons list + Right widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-6 mt-4">
          {/* Left column (lessons list) */}
          <main>
            {/* Section header */}
            <div className="mb-3 flex items-center gap-3">
              <BookOpen className="text-indigo-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Lessons</h2>
              {/* CHANGED: Dynamic lesson count */}
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-white border border-gray-200 rounded-full text-gray-600">
                {lessons.length}
              </span>
              {/* Controls inline on the right */}
              <div className="ml-auto flex items-center gap-2">
                <button
                  title="Previous"
                  className="h-10 w-10 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition"
                  onClick={() => {
                    const d = new Date(currentDate)
                    d.setDate(d.getDate() - 1)
                    setCurrentDate(d.toISOString().slice(0, 10))
                  }}
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  title="Next"
                  className="h-10 w-10 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition"
                  onClick={() => {
                    const d = new Date(currentDate)
                    d.setDate(d.getDate() + 1)
                    setCurrentDate(d.toISOString().slice(0, 10))
                  }}
                >
                  <ArrowRight size={18} />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setDateOpen((v) => !v)}
                    className="h-10 px-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50"
                    aria-expanded={dateOpen}
                  >
                    <CalendarIcon size={18} className="text-blue-500" />
                    {/* CHANGED: Friendly date display */}
                    <span>{formatDateFriendly(currentDate)}</span>
                    <svg className="ml-1 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.44l3.71-4.21a.75.75 0 111.08 1.04l-4.25 4.83a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" /></svg>
                  </button>
                  {dateOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-lg z-30 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d.toISOString().slice(0, 10)) }} className="p-1 hover:bg-gray-100 rounded">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="text-lg font-semibold text-gray-800">{new Date(currentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                        <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d.toISOString().slice(0, 10)) }} className="p-1 hover:bg-gray-100 rounded">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-4">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (<div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>))}
                        {(() => {
                          const date = new Date(currentDate); const year = date.getFullYear(); const month = date.getMonth(); const firstDay = new Date(year, month, 1); const startDate = new Date(firstDay); startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
                          const days: any[] = [];
                          for (let i = 0; i < 42; i++) { const currentDay = new Date(startDate); currentDay.setDate(startDate.getDate() + i); const isCurrentMonth = currentDay.getMonth() === month; const isSelected = currentDay.toISOString().slice(0, 10) === currentDate; const isToday = currentDay.toDateString() === new Date().toDateString();
                            days.push(<button key={i} onClick={() => { setCurrentDate(currentDay.toISOString().slice(0, 10)); setDateOpen(false) }} className={`h-8 w-8 rounded-full text-sm ${isSelected ? 'bg-blue-600 text-white' : isToday ? 'bg-blue-100 text-blue-600 font-semibold' : isCurrentMonth ? 'text-gray-900 hover:bg-gray-100' : 'text-gray-400'}`}>{currentDay.getDate()}</button>) }
                          return days;
                        })()}
                      </div>
                      <div className="flex justify-center">
                        <button onClick={() => { const today = new Date(); setCurrentDate(today.toISOString().slice(0, 10)); setDateOpen(false) }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Today</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CHANGED: Added Loading/Error/Empty states */}
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <span className="ml-3 text-gray-600">Loading lessons...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg p-4">
                <span className="text-red-700">{error}</span>
              </div>
            )}
            {!isLoading && !error && lessons.length === 0 && (
              <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <span className="text-gray-600">No lessons found for this date.</span>
              </div>
            )}
            
            {/* Cards list */}
            {!isLoading && !error && (
              <div className="space-y-4">
                {lessons.map((l) => {
                  const isSelected = selected === l.id
                  const isHovered = hovered === l.id
                  return (
                    <article
                      key={l.id}
                      onMouseEnter={() => setHovered(l.id)}
                      onMouseLeave={() => setHovered((h) => (h === l.id ? null : h))}
                      onClick={() => setSelected(l.id)}
                      role="button"
                      tabIndex={0}
                      // CHANGED: Dynamic accent color
                      className={`group cursor-pointer bg-white border-t border-r border-b border-white border-l-2 border-l-red-500 rounded-xl transition-transform duration-150 flex items-center ${
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
                      <div className="py-2 px-3 grid grid-cols-[75px_1fr_auto] gap-3 items-center w-full">
                        {/* Left: Time and Duration */}
                        <div>
                          <div className="text-gray-900 font-semibold text-base">{l.time}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{l.duration}</div>
                        </div>

                        {/* Middle: Class Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-gray-900">
                            <span className="font-semibold text-sm">{l.className}</span>
                            {l.subject && <span className="text-xs text-gray-500">({l.subject})</span>}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin size={12} />
                            <span>{l.classroom}</span>
                          </div>
                        </div>

                        {/* Right: Icons, Teacher, and Progress Bar */}
                        <div className="flex flex-col items-end gap-1.5">
                          {/* Top row: Stats icons */}
                          <div className="flex items-center gap-2.5 text-gray-600">
                            <div className="flex items-center gap-1 text-xs">
                              <Users2 size={14} className="text-gray-500" />
                              {l.totalStudents}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Plus size={14} className="text-gray-500" />
                              0
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Copy size={14} className="text-gray-500" />
                              0
                            </div>
                          </div>

                          {/* Middle row: Teacher */}
                          {l.teacherNames.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-700 truncate max-w-[120px]">
                                {l.teacherNames.join(", ")}
                              </div>
                              <div className="h-7 w-7 rounded-full grid place-items-center text-white text-[10px] font-semibold bg-blue-500 flex-shrink-0">
                                {l.teacherNames[0].split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                          )}

                          {/* Bottom row: More Stats and Progress Bar */}
                          <div className="flex items-center gap-2.5 text-gray-600">
                            <div className="flex items-center gap-1 text-xs">
                              <Star size={14} className="text-gray-500" />
                              0
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Flag size={14} className="text-gray-500" />
                              0
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <StickyNote size={14} className="text-gray-500" />
                              0
                            </div>
                            <div className="flex items-center gap-2">
                              <ProgressBar 
                                green={l.presentCount} 
                                red={l.absentCount} 
                                gray={l.totalStudents - l.presentCount - l.absentCount} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

          </main>

          {/* Right column: widgets */}
          <aside className="flex flex-col gap-4">
            {/* Announcement Card (above Unread notes) */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📢</span>
                  </div>
                  <div className="font-semibold text-gray-800">Announcements</div>
                </div>
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-gray-400" />
                  <button
                    onClick={() => navigate("/compose?type=announcement")}
                    className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-500">No unread announcements</div>
            </section>

            {/* 1. Unread notes Card */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📝</span>
                  </div>
                  <div className="font-semibold text-gray-800">Unread notes</div>
                </div>
                <Info size={16} className="text-gray-400" />
              </div>
              <div className="mt-3 text-sm text-gray-500">No unread notes</div>
            </section>

            {/* 3. Notifications Card */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🔔</span>
                  </div>
                  <div className="font-semibold text-gray-800">Notifications</div>
                </div>
                <Info size={16} className="text-gray-400" />
              </div>
              <div className="mt-3 text-sm text-gray-500">No new notifications</div>
            </section>

            {/* 4. Birthdays Card */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🎂</span>
                  </div>
                  <div className="font-semibold text-gray-800">Birthdays</div>
                </div>
                <div className="text-sm text-gray-400">Students</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 border-l-2 border-blue-200 pl-3">
                  <img
                    src="https://i.pravatar.cc/40?img=1"
                    alt="Maximiliano"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">Maximiliano Luis Muller</div>
                    <div className="text-xs text-gray-500">Turns 31 today</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-sm">🎂</span>
                    <MessageSquare size={14} className="text-blue-500" />
                  </div>
                </div>

                <div className="flex items-center gap-3 border-l-2 border-blue-200 pl-3">
                  <img
                    src="https://i.pravatar.cc/40?img=2"
                    alt="Maria"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">Maria Fernanda Avila Roca</div>
                    <div className="text-xs text-gray-500">Turns 30 today</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-sm">🎂</span>
                    <MessageSquare size={14} className="text-blue-500" />
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Checklist Card */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm">✓</span>
                  </div>
                  <div className="font-semibold text-gray-800">Checklist</div>
                </div>
                <button className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">+</button>
              </div>
            </section>

            {/* 6. Lessons Card */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-indigo-600" />
                  <div className="font-semibold text-gray-800">Lessons</div>
                </div>
                <div className="text-sm text-gray-500">89</div>
              </div>

              <div className="mt-3 flex items-center gap-4">
                <div>
                  <div className="h-24 w-24 rounded-full border-4 border-gray-200 flex items-center justify-center">
                    <span className="text-sm text-gray-500">0%</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-2">Attendance</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-500" /> <span>Present: 0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-500" /> <span>Absent: 0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-amber-400" /> <span>Late: 0</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Behaviours Card */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="font-semibold text-gray-800 mb-3">Behaviours</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-lg border border-yellow-400 grid place-items-center text-yellow-500 relative">
                    <Star />
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">0</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">Gold stars</div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-lg border border-rose-300 grid place-items-center text-rose-500 relative">
                    <Flag />
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">0</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">Red Flags</div>
                </div>
              </div>
            </section>

            {/* 8. Payments Card */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">$</span>
                </div>
                <div className="font-semibold text-gray-800">Payments</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-green-600">Payments received: 0</div>
                <div className="text-sm text-red-600">Payments due: 0</div>
              </div>
            </section>

            {/* 9. Communication Card */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-80">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center">
                  <MessageSquare size={14} className="text-blue-600" />
                </div>
                <div className="font-semibold text-gray-800">Communication</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-blue-600">SMS sent: 0</div>
                <div className="text-sm text-blue-600">Emails sent: 0</div>
              </div>
            </section>
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

      {selected && (
        <SessionDetailsModal
          context="dashboard"
          lesson={lessons.find((l) => l.id === selected) || null}
          sessionId={selected}
          currentDate={currentDate}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}