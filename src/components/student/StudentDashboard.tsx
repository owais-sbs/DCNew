import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Star, Flag, Bell, MapPin, X, CheckSquare, BarChart, FileText, PenTool, Paperclip } from "lucide-react"
import { useStudentClasses, getStudentId } from "./useStudentClasses"
import { useAuth } from "../AuthContext"
import { useStudentUpcomingSession, UpcomingSession } from "./useStudentUpcomingSession"
import { useStudentCompletedSessions, CompletedSession } from "./useStudentCompletedSessions"
import axiosInstance from "../axiosInstance"

const upcomingLessons = [
  {
    id: 1,
    date: "28-11-2025",
    time: "9:00 - 10:30",
    title: "Advanced_AM_DCE1_PART 1",
    location: "Limerick",
    teacher: "Colm Delmar1",
    attendance: "late",
    attendanceText: "Abdul was late for this lesson",
    goldStars: 0,
    redFlags: 0,
    grade: null,
    lessonNotes: null,
    personalNotes: null,
    attachments: 0
  }
]

type Lesson = {
  id: number
  date: string
  time: string
  title: string
  location: string
  teacher: string
  attendance: string
  attendanceText: string
  goldStars: number
  redFlags: number
  grade: number | null
  lessonNotes: string | null
  personalNotes: string | null
  attachments: number
  classId?: number | null
  teacherId?: number | null
  dayOfWeek?: string | null
}

// Attendance data is just a percentage number from the API

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lessonTab, setLessonTab] = useState<"upcoming" | "past">("upcoming")
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [attendanceStats, setAttendanceStats] = useState<{ Status: string; Percentage: number }[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)
  const [studentData, setStudentData] = useState<any>(null)
  const [loadingStudent, setLoadingStudent] = useState(false)

  const studentId = user?.studentId || getStudentId()

  const { classes: enrolledClasses } = useStudentClasses(studentId || 0)
  const { session: upcomingSession, loading: sessionLoading, error: sessionError } = useStudentUpcomingSession(studentId || 0)
  const { sessions: completedSessions, loading: completedLoading, error: completedError } = useStudentCompletedSessions(
    studentId || 0
  )

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

  const { list: upcomingLessonList, message: upcomingMessage } = buildUpcomingLessonList(
    upcomingSession,
    sessionLoading,
    sessionError
  )

  const lessons =
    lessonTab === "upcoming"
      ? upcomingLessonList
      : buildPastLessonsList(completedSessions, completedLoading, completedError).list

  const lessonsMessage =
    lessonTab === "upcoming"
      ? upcomingMessage
      : buildPastLessonsList(completedSessions, completedLoading, completedError).message

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
  }

  const handleClassClick = (classId: number) => {
    navigate(`/student/classes/${classId}`)
  }

  const renderLessonModal = () => {
    if (!selectedLesson) return null

    const isUpcoming = lessonTab === "upcoming"
    const attendanceBgColor = isUpcoming 
      ? "bg-yellow-50 border-l-4 border-l-yellow-400 border-yellow-200" 
      : "bg-emerald-50 border-l-4 border-l-emerald-400 border-emerald-200"

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedLesson(null)}>
        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                <span className="text-sm font-semibold text-gray-900">{selectedLesson.time}</span>
                <span className="text-sm font-semibold text-gray-900 truncate">{selectedLesson.title}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-500 mt-1">
                <span>{selectedLesson.date}</span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                  <span>{selectedLesson.location}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-xs font-semibold flex-shrink-0">
                  {String(selectedLesson.teacher || "?").slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 truncate">{selectedLesson.teacher}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLesson(null)}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation flex-shrink-0"
                aria-label="Close"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-3">
            <div className={`${attendanceBgColor} border rounded-lg p-3 sm:p-4`}>
              <div className="flex items-start gap-3">
                <CheckSquare className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Attendance</div>
                  <div className="text-sm text-gray-700">{selectedLesson.attendanceText}</div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" strokeWidth={2} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Gold stars</div>
                  <div className="text-sm text-gray-600">
                    {selectedLesson.goldStars > 0 ? `${selectedLesson.goldStars} gold star(s) awarded` : "No gold stars awarded"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start gap-3">
                <Flag className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Red flags</div>
                  <div className="text-sm text-gray-600">
                    {selectedLesson.redFlags > 0 ? `${selectedLesson.redFlags} red flag(s) given` : "No red flags given"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start gap-3">
                <BarChart className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Lesson grade</div>
                  <div className="text-sm text-gray-600">
                    {selectedLesson.grade !== null ? `${selectedLesson.grade}%` : "No grades given"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Lesson notes</div>
                  <div className="text-sm text-gray-600">
                    {selectedLesson.lessonNotes || "No lesson notes"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start gap-3">
                <PenTool className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Personal notes</div>
                  <div className="text-sm text-gray-600">
                    {selectedLesson.personalNotes || "No personal notes from the teacher"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start gap-3">
                <Paperclip className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Attachments</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Attachments</span>
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {selectedLesson.attachments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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

    {/* ===== LESSONS + CLASSES ===== */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

      {/* LESSONS */}
      <div className="xl:col-span-2 bg-white border border-gray-200/80 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900">Lessons</h3>
            <div className="flex gap-4 sm:gap-6 text-sm mt-2">
              {["upcoming", "past"].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLessonTab(t as any)}
                  className={`pb-1 touch-manipulation ${
                    lessonTab === t
                      ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {t === "upcoming" ? "Upcoming" : "Past"}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="text-xs text-blue-600 hover:underline touch-manipulation self-start sm:self-auto">
            View in calendar
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {lessons.map((lesson, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleLessonClick(lesson)}
              onKeyDown={(e) => e.key === "Enter" && handleLessonClick(lesson)}
              className="relative border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between gap-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l sm:rounded-l-lg" aria-hidden />

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pl-2 sm:pl-3">
                <span className="font-semibold text-gray-900">{lesson.date}</span>
                <span className="text-sm text-gray-500">{lesson.time}</span>
                <span className="flex items-center gap-1 text-xs text-gray-500 w-full sm:w-auto">
                  <MapPin size={12} className="flex-shrink-0" /> {lesson.location}
                </span>
              </div>

              <div className="flex-1 min-w-0 pl-2 sm:pl-4 sm:px-2">
                <div className="font-medium text-gray-800 truncate">{lesson.title}</div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-sm text-gray-500 pl-2 sm:pl-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {String(lesson.teacher || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate text-xs sm:text-sm">{lesson.teacher}</span>
                </div>
                <Star size={14} className="flex-shrink-0 text-amber-500" />
                <Flag size={14} className="flex-shrink-0 text-rose-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENROLLED CLASSES */}
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

        <div className="divide-y divide-gray-100">
          {enrolledClasses.map(cls => (
            <div
              key={cls.id}
              role="button"
              tabIndex={0}
              onClick={() => handleClassClick(cls.id)}
              onKeyDown={(e) => e.key === "Enter" && handleClassClick(cls.id)}
              className="py-3 flex gap-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-blue-600 truncate">
                  {cls.title}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatDateRange(cls.startDate, cls.endDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {renderLessonModal()}
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

const formatTimeRange = (start?: string | null, end?: string | null) => {
  if (!start) return "—"
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : null
  const startTime = startDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  const endTime = endDate ? endDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : null
  return endTime ? `${startTime} - ${endTime}` : startTime
}

const buildUpcomingLessonList = (session: UpcomingSession | null, loading: boolean, error: string | null) => {
  if (loading) {
    return { list: [], message: "Loading upcoming lesson..." }
  }
  if (error) {
    return { list: [], message: error }
  }
  if (!session) {
    return { list: [], message: "No upcoming lessons scheduled." }
  }

  const lesson: Lesson = {
    id: session.id,
    date: formatDateValue(session.startTime || session.date),
    time: formatTimeRange(session.startTime, session.endTime),
    title: `Class ID: ${session.classId ?? "—"}`,
    location: session.dayOfWeek || "Day not provided",
    teacher: session.teacherId ? `Teacher ID: ${session.teacherId}` : "Teacher not assigned",
    attendance: "upcoming",
    attendanceText: "Upcoming lesson",
    goldStars: 0,
    redFlags: 0,
    grade: null,
    lessonNotes: null,
    personalNotes: null,
    attachments: 0,
    classId: session.classId,
    teacherId: session.teacherId,
    dayOfWeek: session.dayOfWeek
  }

  return { list: [lesson], message: null }
}

const buildPastLessonsList = (sessions: CompletedSession[], loading: boolean, error: string | null) => {
  if (loading) {
    return { list: [], message: "Loading past lessons..." }
  }
  if (error) {
    return { list: [], message: error }
  }
  if (!sessions.length) {
    return { list: [], message: "No past lessons available." }
  }

  const list = sessions.map((session) => ({
    id: session.id,
    date: formatDateValue(session.startTime || session.date),
    time: formatTimeRange(session.startTime, session.endTime),
    title: `Class ID: ${session.classId ?? "—"}`,
    location: session.dayOfWeek || "Day not provided",
    teacher: session.teacherId ? `Teacher ID: ${session.teacherId}` : "Teacher not assigned",
    attendance: "present",
    attendanceText: "Abdul was present for this lesson",
    goldStars: 0,
    redFlags: 0,
    grade: null,
    lessonNotes: null,
    personalNotes: null,
    attachments: 0,
    classId: session.classId,
    teacherId: session.teacherId,
    dayOfWeek: session.dayOfWeek
  }))

  return { list, message: null }
}

