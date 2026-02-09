import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useStudentClasses, getStudentId } from "./useStudentClasses"
import { useAuth } from "../AuthContext"
import axiosInstance from "../axiosInstance"

type CalendarLesson = {
  scheduleId: number
  classId: number
  className: string
  date: string | null
  startTime: string | null
  endTime: string | null
  dayOfWeek: string | null
  attendance: string | null
}

function getWeekStart(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  return `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
}

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function StudentCalendar() {
  const { user } = useAuth()
  const studentId = user?.studentId ?? getStudentId()
  const { classes: enrolledClasses } = useStudentClasses(studentId || 0)

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [lessons, setLessons] = useState<CalendarLesson[]>([])
  const [loading, setLoading] = useState(false)

  const weekEnd = getWeekEnd(weekStart)
  const fromDate = toYMD(weekStart)
  const toDate = toYMD(weekEnd)

  const fetchLessonsForWeek = useCallback(async () => {
    if (!studentId || !enrolledClasses?.length) {
      setLessons([])
      return
    }
    setLoading(true)
    try {
      const all: CalendarLesson[] = []
      for (const cls of enrolledClasses) {
        try {
          const res = await axiosInstance.get("/Class/GetAttendanceForStudentInClasspagination", {
            params: {
              classId: cls.id,
              studentId,
              fromDate,
              toDate,
              page: 1,
              pageSize: 100,
            },
          })
          if (res.data?.IsSuccess && res.data?.Data?.Items) {
            const items = res.data.Data.Items
            items.forEach((s: any) => {
              all.push({
                scheduleId: s.SessionId,
                classId: cls.id,
                className: s.ClassTitle ?? cls.title ?? "—",
                date: s.AttendanceDate || s.SessionStartTime,
                startTime: s.SessionStartTime,
                endTime: s.SessionEndTime,
                dayOfWeek: s.SessionDayOfWeek ?? null,
                attendance: s.AttendanceStatus ?? null,
              })
            })
          }
        } catch {
          // skip this class
        }
      }
      setLessons(all)
    } catch {
      setLessons([])
    } finally {
      setLoading(false)
    }
  }, [studentId, enrolledClasses, fromDate, toDate])

  useEffect(() => {
    fetchLessonsForWeek()
  }, [fetchLessonsForWeek])

  const goPrev = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  const goNext = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const goToday = () => {
    setWeekStart(getWeekStart(new Date()))
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const hours = Array.from({ length: 14 }, (_, i) => i + 7)

  const getLessonDayIndex = (dateStr: string | null): number => {
    if (!dateStr) return -1
    const d = new Date(dateStr)
    const start = new Date(weekStart)
    start.setHours(0, 0, 0, 0)
    const diff = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    if (diff < 0 || diff > 6) return -1
    return diff
  }

  const getLessonHour = (startTime: string | null): number => {
    if (!startTime) return 0
    const d = new Date(startTime)
    return d.getHours() + d.getMinutes() / 60
  }

  const lessonsByDay = days.map((day) => {
    const dayStr = toYMD(day)
    return lessons.filter((l) => {
      const d = l.date ? toYMD(new Date(l.date)) : ""
      return d === dayStr
    })
  })

  const getAttendanceStyle = (attendance: string | null) => {
    if (!attendance) return { bg: "bg-slate-500", badge: "bg-slate-100 text-slate-600" }
    switch (attendance.toLowerCase()) {
      case "present":
        return { bg: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" }
      case "absent":
        return { bg: "bg-red-500", badge: "bg-red-100 text-red-700" }
      case "late":
        return { bg: "bg-amber-500", badge: "bg-amber-100 text-amber-700" }
      case "excused":
        return { bg: "bg-blue-500", badge: "bg-blue-100 text-blue-700" }
      default:
        return { bg: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-700" }
    }
  }

  const attendanceLabel = (attendance: string | null) =>
    attendance && attendance.trim() ? attendance.trim() : "—"

  const formatTime = (start: string | null, end: string | null) => {
    if (!start) return "—"
    const s = new Date(start)
    const e = end ? new Date(end) : null
    const a = s.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const b = e ? e.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : null
    return b ? `${a} – ${b}` : a
  }

  const isToday = (d: Date) => toYMD(d) === toYMD(new Date())

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Calendar</h1>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 touch-manipulation"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 touch-manipulation"
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="h-9 px-3 sm:px-4 rounded-full border border-gray-200 text-sm hover:bg-gray-50 touch-manipulation"
          >
            Today
          </button>
        </div>
        <div className="text-sm sm:text-base font-medium text-gray-900 text-center sm:text-left order-first sm:order-none">
          {formatWeekRange(weekStart)}
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm self-center">
          <span className="px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-600 font-medium">Week</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
          Loading lessons...
        </div>
      ) : (
        <>
          {/* Mobile: list by day */}
          <div className="block md:hidden space-y-4">
            {days.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`bg-white border rounded-xl overflow-hidden ${isToday(day) ? "border-indigo-200 ring-1 ring-indigo-100" : "border-gray-200"}`}
              >
                <div className={`px-3 py-2.5 text-sm font-semibold ${isToday(day) ? "bg-indigo-50 text-indigo-800" : "bg-gray-50 text-gray-700"}`}>
                  {day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                </div>
                <div className="divide-y divide-gray-100">
                  {lessonsByDay[dayIndex].length === 0 ? (
                    <div className="px-3 py-4 text-xs text-gray-400">No lessons</div>
                  ) : (
                    lessonsByDay[dayIndex].map((lesson) => {
                      const style = getAttendanceStyle(lesson.attendance)
                      return (
                        <div key={lesson.scheduleId} className="px-3 py-2.5 flex items-start gap-2">
                          <span className={`w-1.5 rounded-full flex-shrink-0 mt-1.5 h-8 ${style.bg}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 truncate">{lesson.className}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.badge}`}>
                                {attendanceLabel(lesson.attendance)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">{formatTime(lesson.startTime, lesson.endTime)}</div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: week grid */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-[56px_repeat(7,1fr)] min-w-[700px] text-sm">
              <div className="border-b border-r border-gray-200 bg-gray-50" />
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`border-b border-r border-gray-200 py-2 text-center font-medium last:border-r-0 ${isToday(day) ? "bg-indigo-50/50 text-indigo-800" : "text-gray-700"}`}
                >
                  {day.toLocaleDateString("en-GB", { weekday: "short" })}
                  <br />
                  <span className="text-xs font-normal text-gray-500">{day.getDate()}</span>
                </div>
              ))}
            </div>
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-[56px_repeat(7,1fr)] min-w-[700px]">
                <div className="border-r border-b border-gray-100 py-1 text-xs text-gray-400 text-center">
                  {hour}:00
                </div>
                {days.map((day, dayIndex) => (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className="relative border-r border-b border-gray-100 last:border-r-0 min-h-[48px]"
                  >
                    {lessons
                      .filter((l) => {
                        const di = getLessonDayIndex(l.date)
                        if (di !== dayIndex) return false
                        const h = getLessonHour(l.startTime)
                        return h >= hour && h < hour + 1
                      })
                      .map((lesson) => {
                        const style = getAttendanceStyle(lesson.attendance)
                        return (
                          <div
                            key={lesson.scheduleId}
                            className={`absolute left-1 right-1 top-1 bottom-1 rounded text-white text-xs p-1.5 overflow-hidden flex flex-col ${style.bg}`}
                          >
                            <div className="font-semibold truncate">{lesson.className}</div>
                            <div className="opacity-90 truncate">{formatTime(lesson.startTime, lesson.endTime)}</div>
                            <span className={`mt-auto inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${style.badge} bg-white/95 backdrop-blur`}>
                              {attendanceLabel(lesson.attendance)}
                            </span>
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
