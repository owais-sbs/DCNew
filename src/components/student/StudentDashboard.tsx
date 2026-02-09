import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Star, Flag, CheckSquare, FileText } from "lucide-react"
import { useStudentClasses, getStudentId } from "./useStudentClasses"
import { useAuth } from "../AuthContext"
import axiosInstance from "../axiosInstance"

type LessonRow = {
  scheduleId: number
  classId: number
  date: string | null
  startTime: string | null
  endTime: string | null
  className: string
  dayOfWeek: string | null
  attendance: string | null
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [attendanceStats, setAttendanceStats] = useState<{ Status: string; Percentage: number }[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)
  const [studentData, setStudentData] = useState<any>(null)
  const [loadingStudent, setLoadingStudent] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedClassName, setSelectedClassName] = useState<string>("")
  const [lessons, setLessons] = useState<LessonRow[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [lessonsPage, setLessonsPage] = useState(1)
  const [lessonsTotalCount, setLessonsTotalCount] = useState(0)
  const lessonsPageSize = 10

  const studentId = user?.studentId || getStudentId()

  const { classes: enrolledClasses, loading: classesLoading } = useStudentClasses(studentId || 0)

  const presentStat = attendanceStats.find((s) => s.Status === "Present")
  const attendancePercentage = presentStat?.Percentage ?? null

  // GetStudentAttendanceStats
  useEffect(() => {
    if (!studentId) return
    setLoadingAttendance(true)
    setAttendanceError(null)
    axiosInstance
      .get("/Dashboard/GetStudentAttendanceStats", { params: { studentId } })
      .then((response) => {
        if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
          setAttendanceStats(response.data.Data)
        } else {
          setAttendanceStats([])
          setAttendanceError(response.data?.Message || "No attendance data available.")
        }
      })
      .catch((err) => {
        setAttendanceStats([])
        setAttendanceError(err?.message || "Failed to load attendance data.")
      })
      .finally(() => setLoadingAttendance(false))
  }, [studentId])

  // GetById for FinishedCourseDate and profile data
  useEffect(() => {
    if (!studentId) return
    setLoadingStudent(true)
    axiosInstance
      .get(`/Student/GetById/${studentId}`)
      .then((res) => {
        if (res.data?.IsSuccess && res.data?.Data) setStudentData(res.data.Data)
        else setStudentData(null)
      })
      .catch(() => setStudentData(null))
      .finally(() => setLoadingStudent(false))
  }, [studentId])

  const finishedCourseDate = studentData?.FinishedCourseDate
    ? new Date(studentData.FinishedCourseDate)
    : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let daysLeft: number | null = null
  if (finishedCourseDate && !Number.isNaN(finishedCourseDate.getTime())) {
    finishedCourseDate.setHours(0, 0, 0, 0)
    daysLeft = Math.ceil((finishedCourseDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
  }

  // Fewer days left = good news (course almost done) → green; more days = neutral/warning
  const daysLeftColor =
    daysLeft === null
      ? ""
      : daysLeft <= 14
        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
        : daysLeft <= 60
          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
          : "bg-amber-100 text-amber-800 border-amber-200"

  const formatCourseDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

  const fetchLessons = useCallback(
    async (classId: number, page: number = 1) => {
      if (!studentId) return
      setSelectedClassId(classId)
      const cls = enrolledClasses.find((c) => c.id === classId)
      setSelectedClassName(cls?.title ?? "Class")
      setLoadingLessons(true)
      setLessonsPage(page)
      try {
        const response = await axiosInstance.get("/Class/GetAttendanceForStudentInClasspagination", {
          params: {
            classId,
            studentId,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            page,
            pageSize: lessonsPageSize,
          },
        })
        if (response.data?.IsSuccess && response.data?.Data) {
          const result = response.data.Data
          const mapped = (result.Items || []).map((s: any) => ({
            scheduleId: s.SessionId,
            classId,
            date: s.AttendanceDate || s.SessionStartTime,
            startTime: s.SessionStartTime,
            endTime: s.SessionEndTime,
            className: s.ClassTitle ?? "—",
            dayOfWeek: s.SessionDayOfWeek ?? null,
            attendance: s.AttendanceStatus ?? null,
          }))
          setLessons(mapped)
          setLessonsTotalCount(result.TotalCount ?? 0)
        } else {
          setLessons([])
          setLessonsTotalCount(0)
        }
      } catch {
        setLessons([])
        setLessonsTotalCount(0)
      } finally {
        setLoadingLessons(false)
      }
    },
    [studentId, enrolledClasses, fromDate, toDate, lessonsPageSize]
  )

  useEffect(() => {
    if (!selectedClassId) return
    fetchLessons(selectedClassId, lessonsPage)
  }, [fromDate, toDate])

  const handleViewLessons = (classId: number) => {
    setLessonsPage(1)
    fetchLessons(classId, 1)
  }

  const handleBackToClasses = () => {
    setSelectedClassId(null)
    setSelectedClassName("")
    setLessons([])
    setLessonsPage(1)
  }

  const handleClassClick = (classId: number) => {
    navigate(`/student/classes/${classId}`)
  }

  const getAttendanceBadgeClass = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-600"
    switch (status.toLowerCase()) {
      case "present":
        return "bg-emerald-100 text-emerald-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "late":
        return "bg-amber-100 text-amber-800"
      case "excused":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const formatLessonDate = (dateString: string | null) => {
    if (!dateString) return "—"
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }

  const formatLessonTime = (start: string | null, end: string | null) => {
    if (!start) return "—"
    const s = new Date(start)
    const e = end ? new Date(end) : null
    const startStr = s.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const endStr = e ? e.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : null
    return endStr ? `${startStr} – ${endStr}` : startStr
  }

  return (
  <div className="space-y-4 sm:space-y-6">

    {/* ===== COURSE END + DAYS LEFT (highlighted) ===== */}
    {loadingStudent && (
      <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-6 w-48 bg-gray-200 rounded mt-2" />
      </div>
    )}
    {!loadingStudent && finishedCourseDate && (
      <div className={`rounded-xl border-2 p-4 sm:p-5 ${daysLeftColor}`}>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="text-xs sm:text-sm font-semibold opacity-90">Finished course date</div>
            <div className="text-base sm:text-lg font-bold mt-0.5">{formatCourseDate(finishedCourseDate)}</div>
          </div>
          <div className="sm:text-right">
            <div className="text-xs sm:text-sm font-semibold opacity-90">
              {daysLeft !== null && daysLeft < 0
                ? "Course ended"
                : "Days left until course end"}
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-0.5">
              {daysLeft !== null ? (daysLeft < 0 ? `${Math.abs(daysLeft)} days ago` : `${daysLeft} days`) : "—"}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ===== TOP CARDS ===== */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Attendance - from GetStudentAttendanceStats */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-4 sm:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <CheckSquare size={16} /> Attendance
        </h3>
        {loadingAttendance ? (
          <div className="mt-4 flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="mt-3 sm:mt-4 flex justify-center">
              <div className="relative h-28 w-28 sm:h-36 sm:w-36">
                <svg className="-rotate-90 h-28 w-28 sm:h-36 sm:w-36" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="60" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                  {attendancePercentage !== null && (
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="#10b981"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 60}
                      strokeDashoffset={2 * Math.PI * 60 * (1 - attendancePercentage / 100)}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl sm:text-2xl font-bold">{attendancePercentage ?? 0}%</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">Present</div>
                </div>
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex flex-wrap justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
              {attendanceStats.map((stat) => (
                <span key={stat.Status} className="flex items-center gap-1">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      stat.Status === "Present"
                        ? "bg-green-500"
                        : stat.Status === "Absent"
                          ? "bg-red-500"
                          : stat.Status === "Late"
                            ? "bg-yellow-400"
                            : "bg-blue-400"
                    }`}
                  />
                  {stat.Status} {stat.Percentage}%
                </span>
              ))}
              {attendanceStats.length === 0 && !attendanceError && (
                <>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 bg-green-500 rounded-full" /> Present</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 bg-red-500 rounded-full" /> Absent</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 bg-yellow-400 rounded-full" /> Late</span>
                </>
              )}
            </div>
            {attendanceError && <p className="mt-2 text-xs text-red-600 text-center">{attendanceError}</p>}
          </>
        )}
      </div>

      {/* Stars + Flags */}
      <div className="space-y-3 sm:space-y-4">
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Star size={20} className="text-amber-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-amber-900">Gold Star</div>
              <div className="text-lg sm:text-xl font-bold text-amber-800">0</div>
            </div>
          </div>
        </div>

        <div className="bg-rose-50/80 border border-rose-200/60 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Flag size={20} className="text-rose-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-rose-900">Red Flags</div>
              <div className="text-lg sm:text-xl font-bold text-rose-800">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-4 sm:p-5 flex flex-col shadow-sm">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-semibold text-gray-800">Announcements</h3>
          <button type="button" className="text-xs text-blue-600 hover:underline touch-manipulation">View all</button>
        </div>
        <p className="text-sm text-gray-500 mt-3 sm:mt-4">No unread announcements</p>
      </div>
    </div>

    {/* ===== ENROLLED CLASSES & LESSONS (like Student Profile) ===== */}
    <div className="bg-white border border-gray-200/80 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Enrolled classes</h3>
        <button
          type="button"
          onClick={() => navigate("/student/classes")}
          className="text-xs text-blue-600 hover:underline touch-manipulation"
        >
          View all
        </button>
      </div>

      {selectedClassId ? (
        <div>
          <button
            type="button"
            onClick={handleBackToClasses}
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
          >
            ← Back to classes
          </button>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Lessons – {selectedClassName}</h4>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setLessonsPage(1); }}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setLessonsPage(1); }}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
            />
          </div>
          {loadingLessons ? (
            <div className="py-8 text-center text-gray-500 text-sm">Loading lessons...</div>
          ) : lessons.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">No lessons found for this class.</div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[400px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="text-left py-3 px-3 font-medium">Date</th>
                    <th className="text-left py-3 px-3 font-medium">Time</th>
                    <th className="text-left py-3 px-3 font-medium">Day</th>
                    <th className="text-left py-3 px-3 font-medium">Class</th>
                    <th className="text-left py-3 px-3 font-medium">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson, i) => (
                    <tr key={lesson.scheduleId || i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-900">{formatLessonDate(lesson.date)}</td>
                      <td className="py-3 px-3 text-gray-700">{formatLessonTime(lesson.startTime, lesson.endTime)}</td>
                      <td className="py-3 px-3 text-gray-700">{lesson.dayOfWeek ?? "—"}</td>
                      <td className="py-3 px-3 text-gray-700">{lesson.className}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getAttendanceBadgeClass(lesson.attendance)}`}>
                          {lesson.attendance ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {lessonsTotalCount > lessonsPageSize && (
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {(lessonsPage - 1) * lessonsPageSize + 1}–{Math.min(lessonsPage * lessonsPageSize, lessonsTotalCount)} of {lessonsTotalCount}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={lessonsPage <= 1}
                  onClick={() => { const p = lessonsPage - 1; setLessonsPage(p); fetchLessons(selectedClassId!, p); }}
                  className="px-2 py-1 rounded border border-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={lessonsPage * lessonsPageSize >= lessonsTotalCount}
                  onClick={() => { const p = lessonsPage + 1; setLessonsPage(p); fetchLessons(selectedClassId!, p); }}
                  className="px-2 py-1 rounded border border-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {classesLoading ? (
            <div className="py-6 text-center text-sm text-gray-500">Loading classes...</div>
          ) : enrolledClasses.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">No enrolled classes.</div>
          ) : (
            enrolledClasses.map((cls) => (
              <div
                key={cls.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => handleClassClick(cls.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleClassClick(cls.id)}
                >
                  <div className="text-sm font-medium text-blue-600 truncate">{cls.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{formatDateRange(cls.startDate, cls.endDate)}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleViewLessons(cls.id); }}
                  className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-lg px-3 py-1.5 self-start sm:self-center"
                >
                  <FileText size={14} />
                  View lessons
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  </div>
)

}

const formatDateValue = (value?: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return "Dates TBD"
  if (start && end) return `${formatDateValue(start)} - ${formatDateValue(end)}`
  if (start) return `Starts ${formatDateValue(start)}`
  return `Ends ${formatDateValue(end)}`
}

