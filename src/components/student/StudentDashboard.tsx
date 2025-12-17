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
  const [attendancePercentage, setAttendancePercentage] = useState<number | null>(null)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)
  
  // Get studentId from user context or localStorage
  const studentId = user?.studentId || getStudentId()
  
  const { classes: enrolledClasses, loading: classesLoading, error: classesError } = useStudentClasses(studentId || 0)
  const { session: upcomingSession, loading: sessionLoading, error: sessionError } = useStudentUpcomingSession(studentId || 0)
  const { sessions: completedSessions, loading: completedLoading, error: completedError } = useStudentCompletedSessions(
    studentId || 0
  )

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentId) return

      setLoadingAttendance(true)
      setAttendanceError(null)
      try {
        const response = await axiosInstance.get("/dashboard/GetTotoalAttendaceByStudent", {
          params: { studentId: studentId }
        })

        console.log("Attendance response:", response.data)
        if (response.data?.IsSuccess) {
          // Data is just a percentage number (e.g., 33.33)
          const percentage = typeof response.data.Data === 'number' ? response.data.Data : null
          setAttendancePercentage(percentage)
        } else {
          setAttendancePercentage(null)
          setAttendanceError(response.data?.Message || "No attendance data available.")
        }
      } catch (err: any) {
        console.error("Error fetching attendance:", err)
        setAttendanceError(err?.message || "Failed to load attendance data.")
        setAttendancePercentage(null)
      } finally {
        setLoadingAttendance(false)
      }
    }

    fetchAttendance()
  }, [studentId])

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
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLesson(null)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="text-sm font-semibold text-gray-900">{selectedLesson.time}</div>
                <div className="text-sm font-semibold text-gray-900">{selectedLesson.title}</div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <span>{selectedLesson.date}</span>
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-gray-400" />
                  <span>{selectedLesson.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-200 text-purple-700 grid place-items-center text-xs font-semibold">
                  CD
                </div>
                <span className="text-sm font-medium text-gray-700">{selectedLesson.teacher}</span>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <div className={`${attendanceBgColor} border rounded-lg p-4`}>
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
  <div className="space-y-6">

    {/* ===== TOP CARDS ===== */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Attendance */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <CheckSquare size={16} /> Attendance
        </h3>

        <div className="mt-4 flex justify-center">
          <div className="relative h-36 w-36">
            <svg className="-rotate-90 h-36 w-36">
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
              <div className="text-2xl font-bold">{attendancePercentage ?? 0}%</div>
              <div className="text-xs text-gray-500">Present</div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 bg-green-500 rounded-full"></span> Present
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 bg-red-500 rounded-full"></span> Absent
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 bg-yellow-400 rounded-full"></span> Late
          </span>
        </div>
      </div>

      {/* Stars + Flags */}
      <div className="space-y-4">
        <div className="bg-yellow-50 border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Star size={18} />
            <div>
              <div className="text-sm font-semibold">Gold Star</div>
              <div className="text-xl font-semibold">0</div>
            </div>
          </div>
        </div>

        <div className="bg-rose-50 border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Flag size={18} />
            <div>
              <div className="text-sm font-semibold">Red Flags</div>
              <div className="text-xl font-semibold">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white border rounded-xl p-5 flex flex-col">
        <div className="flex justify-between">
          <h3 className="text-sm font-semibold">Announcements</h3>
          <button className="text-xs text-blue-600">View all</button>
        </div>
        <p className="text-sm text-gray-500 mt-4">No unread announcements</p>
      </div>
    </div>

    {/* ===== LESSONS + CLASSES ===== */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* LESSONS */}
      <div className="xl:col-span-2 bg-white border rounded-xl p-5">
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="font-semibold">Lessons</h3>
            <div className="flex gap-6 text-sm mt-2">
              {["upcoming", "past"].map(t => (
                <button
                  key={t}
                  onClick={() => setLessonTab(t as any)}
                  className={`pb-1 ${
                    lessonTab === t
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {t === "upcoming" ? "Upcoming lessons" : "Past lessons"}
                </button>
              ))}
            </div>
          </div>

          <button className="text-xs text-blue-600">
            View all lessons in calendar
          </button>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson, i) => (
            <div
              key={i}
              onClick={() => handleLessonClick(lesson)}
              className="relative border rounded-lg p-4 flex justify-between cursor-pointer hover:bg-gray-50"
            >
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-400 rounded-l"></span>

              <div>
                <div className="font-semibold">{lesson.date}</div>
                <div className="text-sm text-gray-500">{lesson.time}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin size={12} /> {lesson.location}
                </div>
              </div>

              <div className="flex-1 px-4">
                <div className="font-medium">{lesson.title}</div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 bg-purple-200 rounded-full flex items-center justify-center text-xs">
                    CD
                  </div>
                  {lesson.teacher}
                </div>

                <Star size={14} />
                <Flag size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENROLLED CLASSES */}
      <div className="bg-white border rounded-xl p-5">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">Enrolled classes</h3>
          <button
            onClick={() => navigate("/student/classes")}
            className="text-xs text-blue-600"
          >
            View all
          </button>
        </div>

        <div className="divide-y">
          {enrolledClasses.map(cls => (
            <div
              key={cls.id}
              onClick={() => handleClassClick(cls.id)}
              className="py-3 flex gap-2 cursor-pointer hover:bg-gray-50"
            >
              <span className="h-2 w-2 bg-red-500 rounded-full mt-2"></span>
              <div>
                <div className="text-sm text-blue-600 font-medium">
                  {cls.title}
                </div>
                <div className="text-xs text-gray-500">
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

