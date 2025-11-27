// @ts-nocheck
// ^^ Disabling TypeScript checks for this example file as we have
// placeholder data (teacher, stats) that doesn't fully match the types
// Remove this line in your real project once all data is wired up.

import React, { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import UnenrollStudentModal from "./UnenrollStudentModal"


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
  Loader2
} from "lucide-react"
import AddStudentForm from "./AddStudentForm"
import axiosInstance from "./axiosInstance"

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
  room: string
  subtitle?: string
  location: string
  teacher: { name: string; initials: string; color: string }
  students: number
  stats: { green: number; red: number; gray: number }
  accent: string
}


type ApiSession = {
  ClassId: number
  SessionId: number
  ClassTitle: string
  ClassSubject: string
  StartTime: string
  EndTime: string
  DayOfWeek: string
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
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
  } catch (e) {
    return "00:00"
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

  // enroll students modal
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  // date state for "Today" + date picker
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10) // yyyy-mm-dd
  })
  // datepicker dropdown open
  const [dateOpen, setDateOpen] = useState(false)
  // Add lesson modal
  const [addOpen, setAddOpen] = useState(false)
  
  const [sessionStudents, setSessionStudents] = useState<any[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)

  const [allStudents, setAllStudents] = useState<any[]>([])
  const [selectedToEnroll, setSelectedToEnroll] = useState<number[]>([])
  const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false)
  const [alreadyEnrolled, setAlreadyEnrolled] = useState<number[]>([])
  const [updatingStudent, setUpdatingStudent] = useState<number | null>(null)
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);




  const fetchAllStudents = async () => {
    try{
      setIsLoadingAllStudents(true)
      const res = await axiosInstance.get("/Student/GetAll")
      const enrollRes = await axiosInstance.get(`/Class/GetStudentsForSession?scheduleId=${selected}`)

      if(res.data?.IsSuccess){
        setAllStudents(res.data.Data)
      }

      if(enrollRes.data?.IsSuccess){
        const ids = enrollRes.data.Data.map((s: any) => s.StudentId)
        setAlreadyEnrolled(ids)
      }


    }catch(err){
      console.log("Error fetching student list", err)
    }finally{
      setIsLoadingAllStudents(false)
    }
  }


  useEffect(() => {
    if(showEnrollModal){
      fetchAllStudents()
    }
  }, [showEnrollModal])


  const enrollStudents = async () => {
    if(!selected || selectedToEnroll.length === 0)
      return 
    
    const classId = sessionStudents[0]?.classId 
    const sessionId = selected 

    try{
      const response = await axiosInstance.post(`/Class/EnrollStudentToClassInBulk`, selectedToEnroll, { params: { classId, sessionId }})
      
      if(response.data?.IsSuccess){
        setShowEnrollModal(false)
        setSelectedToEnroll([])
        fetchStudents()
      }
    }catch(err){
      console.log("Error enrolling students", err)
      alert("Failed to enroll students")
    }
  }

  const fetchStudents = async () => {
      try{
        setIsLoadingStudents(true)

        const response = await axiosInstance.get(`/Class/GetStudentsForSession?scheduleId=${selected}&date=${currentDate}`)
        if(response.data?.IsSuccess){
          const mapped = response.data.Data.map((s: any) => ({
            id: s.StudentId,
            name: s.StudentName,
            status: s.AttendanceStatus,
            classId: s.ClassId
          }))

          setSessionStudents(mapped)
        }
      }catch(err){
        console.log("Error fetching students.", err)
        setSessionStudents([])
      }finally{
        setIsLoadingStudents(false)
      }
    }

  useEffect(() => {
    if(!selected)
      return 

    

    fetchStudents()
  }, [selected, currentDate])

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
            room: item.ClassTitle,
            subtitle: item.ClassSubject,
            location: item.DayOfWeek,
            // --- Placeholder data (replace with real data when available) ---
            teacher: {
              name: "TBD Teacher",
              initials: "TBD",
              color: index % 2 === 0 ? "bg-blue-500" : "bg-purple-500"
            },
            students: 0, // API doesn't provide this
            stats: { green: 0, red: 0, gray: 0 }, // API doesn't provide this
            accent: "border-l-2 border-blue-500" // Hardcoded accent
            // --- End Placeholder data ---
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

  const markAttendance = async (classId: number, studentId: number, status: "Present" | "Absent" | "Late" | "Excused" | "None") => {
    try{
      setUpdatingStudent(studentId)

      const payload = {
        classId: classId,
        scheduleId: selected,
        studentId,
        date: currentDate,
        attendanceStatus: status 
      }

      const response = await axiosInstance.post("/Class/MarkAttendance", null, { params: payload })
      if(response.data.IsSuccess){
        fetchStudents()
      }
    }catch(err){
      console.log("Error marking attendance", err)
      alert("Failed to mark attnedance")
    }finally{
      setUpdatingStudent(null)
    }
  }

  console.log(lessons)
  console.log(selected)
    console.log(sessionStudents)

  return (
    <div className="bg-slate-50 min-h-screen -mt-4">
      <div className="px-6 pt-4 pb-6">
        {/* Top row: Greeting */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Wellcome, Asif</h1>
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
                      className={`group cursor-pointer bg-white border-t border-r border-b border-white border-l-4 ${l.accent} rounded-xl transition-transform duration-150 flex items-center ${
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

      {/* Lesson details modal (click on a lesson card) */}
      {selected && (
  <div
    className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
    onClick={() => setSelected(null)}
  >
    {(() => {
      const lesson = lessons.find((l) => l.id === selected)
      if (!lesson) return null

      return (
        <div
          className="w-full max-w-7xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-full bg-indigo-500 text-white grid place-items-center text-sm font-semibold">
                {lesson.teacher.initials}
              </div>
              <div className="text-sm text-gray-700 mr-2">{lesson.teacher.name}</div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {lesson.time} - {lesson.room} ({lesson.subtitle || lesson.location})
                </div>
                <div className="text-sm text-gray-600">
                  {formatDateFriendly(currentDate)} #{lesson.id} {lesson.room}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setSelected(null)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-0">
            {/* Main content */}
            <div className="p-6">
              {/* Students section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Students {sessionStudents.length}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/people/students')}
                      className="px-3 h-9 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 hover:bg-gray-50"
                    >
                      Select/deselect all
                    </button>

                    {["Attendance", "Behaviour", "Grade", "Message"].map((label) => (
                      <button
                        key={label}
                        className="px-3 h-9 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
                      >
                        {label}
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.44l3.71-4.21a.75.75 0 111.08 1.04l-4.25 4.83a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Students grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {isLoadingStudents ? (
                    <div className="flex items-center justify-center h-40 col-span-full">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                  ) : sessionStudents.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 col-span-full">
                      No students enrolled in this session.
                    </div>
                  ) : (
                    sessionStudents.map((student, i) => (
                      <div
                        key={student.id}
                        className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://i.pravatar.cc/80?img=${(i % 70) + 1}`}
                            alt={student.name}
                            className="h-12 w-12 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                          <div className="flex-1 min-w-0">
          <div className="text-[16px] font-semibold text-gray-900 truncate">{student.name}</div>

                            {/* Attendance Status Pill */}
                             <div className="relative mt-3 group w-[260px]">
  {/* Default pill */}
 {/* ✅ Attendance Pill */}
<button
              className={`w-full h-12 rounded-full border text-[15px] font-semibold transition-all
                ${student.status === "Present" ? "bg-green-100 text-green-700 border-green-300"
                : student.status === "Absent" ? "bg-red-100 text-red-700 border-red-300"
                : student.status === "Late" ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                : student.status === "Excused" ? "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300" }
              `}
              disabled={student.status === "Excused" || updatingStudent === student.id}
            >
              {updatingStudent === student.id ? (
                <Loader2 className="animate-spin w-5 h-5 mx-auto" />
              ) : (
                student.status || "Take attendance"
              )}
            </button>
{student.status !== "Excused" && (
              <div className="absolute inset-0 hidden group-hover:flex z-20 pointer-events-auto">
                <div className="w-full h-12 rounded-full border border-gray-300 bg-white overflow-hidden flex text-[15px] font-medium">

                  {/* Present */}
                  <button
                    className="flex-1 hover:bg-green-50 text-green-700"
                    onClick={() => {
  const toggle = student.status === "Present" ? "None" : "Present";
  markAttendance(student.classId, student.id, toggle);
}}

                  >
                    Present
                  </button>
                  <div className="w-px bg-gray-300" />

                  {/* Absent */}
                  <button
                    className="flex-1 hover:bg-red-50 text-red-700"
                    onClick={() => {
  const toggle = student.status === "Absent" ? "None" : "Absent";
  markAttendance(student.classId, student.id, toggle);
}}

                  >
                    Absent
                  </button>
                  <div className="w-px bg-gray-300" />

                  {/* Late */}
                  <button
                    className="flex-1 hover:bg-yellow-50 text-yellow-700"
                    onClick={() => {
  const toggle = student.status === "Late" ? "None" : "Late";
  markAttendance(student.classId, student.id, toggle);
}}

                  >
                    Late
                  </button>
                  <div className="w-px bg-gray-300" />

                  {/* Excused */}
                  {/* <button
                    className="flex-1 hover:bg-gray-100 text-gray-700"
                    onClick={() => markAttendance(student.classId, student.id, "Excused")}
                  >
                    Excused
                  </button> */}

                </div>
              </div>
            )}
</div>

                          </div>

                          <div className="flex items-center gap-2">
                            <button className="h-9 w-9 grid place-items-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50">
                              <svg
                                className="w-4 h-4 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <div className="relative">
  <button
    className="h-9 w-9 grid place-items-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
    onClick={() => setMenuOpenFor(menuOpenFor === student.id ? null : student.id)}
  >
    ⋯
  </button>

  {/* Dropdown */}
  {menuOpenFor === student.id && (
    <div className="
      absolute right-0 mt-2 w-48 bg-white shadow-xl 
      rounded-xl border border-gray-200 z-50
      animate-fadeIn
    ">
      <button
        className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 text-left"
        onClick={() => {
  const toggle = student.status === "Excused" ? "None" : "Excused";
  markAttendance(student.classId, student.id, toggle);
  setMenuOpenFor(null);
}}

      >
        <input type="checkbox" checked={student.status === "Excused"} readOnly />
        <span>Mark as excused</span>
      </button>

      <button className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 text-left">
        ✏️ Add / edit note
      </button>

      <button className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 text-left">
        👁 View profile
      </button>

      <button
  className="flex items-center gap-2 w-full px-4 py-3 hover:bg-red-50 text-red-600 text-left"
  onClick={() => {
    setSelectedStudent(student);
    setShowUnenrollModal(true);
    setMenuOpenFor(null);
  }}
>
  🗑 Remove from class
</button>

    </div>
  )}
</div>

                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Prospects section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Prospects 0</h3>
                  <button
                    onClick={() => navigate('/people/prospects/new')}
                    className="px-4 h-9 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                  >
                    + Add prospects
                  </button>
                </div>
              </div>

              {/* Notes sections */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Teacher notes</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/notes')}
                      className="h-8 w-8 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                    >
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => navigate('/notes')}
                      className="px-4 h-9 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    >
                      + Add teacher notes
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Student notes</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/notes')}
                      className="h-8 w-8 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                    >
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => navigate('/notes')}
                      className="px-4 h-9 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    >
                      + Add student notes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <aside className="border-l border-gray-200 p-6 bg-gray-50">
              <div className="space-y-6">
                {/* Edit section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800">Edit</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Teacher", icon: "🎓", path: "/people/teachers" },
                      { label: "Date & time", icon: "📅", path: "/calendar" },
                      { label: "Cancel lesson", icon: "❌", path: "/notes/classes" },
                      { label: "Location", icon: "📍", path: "/calendar/classroom" },
                      { label: "Class details", icon: "📄", path: "/notes/class-details" }
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800">Actions</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Add students", icon: "👥", onClick: () => setShowEnrollModal(true) },
                      { label: "Add prospects", icon: "👥", onClick: () => navigate('/people/prospects/new') },
                      { label: "Add attachment", icon: "📎", onClick: () => navigate('/notes/class-details') },
                      { label: "Add assignment", icon: "📋", onClick: () => navigate('/notes/class-details') },
                      { label: "Invite to portal", icon: "➡️", onClick: () => navigate('/compose') },
                      { label: "Print register", icon: "🖨️", onClick: () => navigate('/reports/attendance') }
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )
    })()}
  </div>
)}


      {/* Enroll Student Modals */}
      {showEnrollModal && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={() => setShowEnrollModal(false)}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Enroll students</h2>
                <button onClick={() => setShowEnrollModal(false)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">Select the date and students to enroll in this class.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment date *</label>
                    <input type="text" defaultValue={new Date().toLocaleDateString('en-GB')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unenrollment date (optional)</label>
                    <input type="text" placeholder="Select date..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 inline-flex items-center gap-2">
                    <Copy size={16} />
                    Copy from another class
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2" onClick={() => setShowAddStudent(true)}>
                    <Plus size={16} />
                    Add new student
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">All students</h4>
                    {isLoadingAllStudents ? (
  <div className="flex items-center justify-center h-40">
    <Loader2 className="animate-spin text-blue-500" size={28} />
  </div>
) : (
  allStudents.map((s: any) => {
    const disabled = alreadyEnrolled.includes(s.Id)
    const selected = selectedToEnroll.includes(s.Id)

    return (
      <div
        key={s.Id}
        onClick={() => !disabled && setSelectedToEnroll(prev =>
          prev.includes(s.Id) ? prev.filter(id => id !== s.Id) : [...prev, s.Id]
        )}
        className={`p-2 flex justify-between cursor-pointer ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : selected
            ? "bg-blue-50 text-blue-700 font-medium"
            : "hover:bg-gray-50"
        }`}
      >
        {s.FirstName} {s.Surname}
        {disabled && <span className="text-xs">(Enrolled)</span>}
      </div>
    )
  })
)}

                    <p className="text-xs text-gray-500 mt-2">Use shift and control keys to select multiple students</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Enrolled students</h4>
                    {selectedToEnroll.length === 0 ? (
  <div className="h-full flex items-center justify-center text-gray-400">
    No students selected
  </div>
) : (
  selectedToEnroll.map((id) => {
    const student = allStudents.find((s) => s.Id === id)
    return (
      <div key={id} className="p-2 flex justify-between bg-white border-b">
        {student?.FirstName} {student?.Surname}
        <button
          className="text-red-500 text-xs"
          onClick={() =>
            setSelectedToEnroll(prev => prev.filter(x => x !== id))
          }
        >
          Remove
        </button>
      </div>
    )
  })
)}

                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button onClick={() => {
                  setShowEnrollModal(false)
                  setSelectedToEnroll([])
                  }} className="px-6 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={enrollStudents} className="px-6 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save changes</button>
              </div>
            </div>
          </div>
          {showAddStudent && (
            <AddStudentForm isOpen={showAddStudent} onClose={() => setShowAddStudent(false)} />
          )}
       

        </>
      )}
         {showUnenrollModal && (
  <UnenrollStudentModal
    student={selectedStudent}
    classId={selectedStudent.classId}
    onClose={() => setShowUnenrollModal(false)}
    onSuccess={() => {
      fetchStudents()
    }}
  />
)}
    </div>
  )
}