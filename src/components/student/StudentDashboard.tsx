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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Attendance</h3>
              <p className="text-xs text-gray-500">Your attendance this term</p>
            </div>
            <Calendar className="h-5 w-5 text-indigo-600" />
          </div>
          
          {loadingAttendance ? (
            <div className="mt-4 h-32 w-32 mx-auto grid place-items-center text-gray-500 text-sm">
              Loading...
            </div>
          ) : attendanceError ? (
            <div className="mt-4 text-center text-sm text-red-500">{attendanceError}</div>
          ) : attendancePercentage !== null ? (
            <>
              <div className="mt-4 flex items-center justify-center">
                <div className="relative h-40 w-40">
                  <svg className="transform -rotate-90 h-40 w-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={attendancePercentage >= 80 ? "#10b981" : attendancePercentage >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - attendancePercentage / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {attendancePercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Attendance</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 h-32 w-32 mx-auto border-4 border-gray-200 rounded-full grid place-items-center text-gray-500 text-sm">
              No data
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-yellow-700">
              <Star className="h-5 w-5" />
              <div>
                <h4 className="text-sm font-semibold">Gold Star</h4>
                <p className="text-2xl font-semibold">0</p>
              </div>
            </div>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-rose-700">
              <Flag className="h-5 w-5" />
              <div>
                <h4 className="text-sm font-semibold">Red Flags</h4>
                <p className="text-2xl font-semibold">0</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Announcements</h3>
              <p className="text-xs text-gray-500">No unread announcements</p>
            </div>
            <Bell className="h-5 w-5 text-indigo-600" />
          </div>
          <button className="mt-auto text-xs font-medium text-indigo-600 hover:text-indigo-700 text-right">View all</button>
        </div>
      </div>


      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" />
                Lessons
              </h3>
              <div className="flex items-center gap-6 text-sm mt-3">
                <button
                  onClick={() => setLessonTab("upcoming")}
                  className={`relative pb-1 ${
                    lessonTab === "upcoming" ? "text-indigo-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  Upcoming lessons
                  {lessonTab === "upcoming" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>}
                </button>
                <button
                  onClick={() => setLessonTab("past")}
                  className={`relative pb-1 ${
                    lessonTab === "past" ? "text-indigo-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  Past lessons
                  {lessonTab === "past" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>}
                </button>
              </div>
            </div>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View all lessons in calendar</button>
          </div>
          <div className="space-y-4">
            {lessons.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">{lessonsMessage || "No lessons available."}</div>
            ) : (
              lessons.map((lesson, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLessonClick(lesson)}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between relative cursor-pointer hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative pr-4">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-rose-400"></div>
                      <div className="pl-3 text-sm text-gray-600">
                        <div className="font-semibold text-gray-900">{lesson.date}</div>
                        <div>{lesson.time}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <MapPin size={14} className="text-gray-400" />
                          {lesson.location}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{lesson.title}</div>
                      {(lesson.classId !== undefined || lesson.teacherId !== undefined) && (
                        <div className="text-xs text-gray-500 mt-1">
                          Class ID: {lesson.classId ?? "—"} • Teacher ID: {lesson.teacherId ?? "—"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-200 text-purple-700 grid place-items-center text-xs font-semibold">
                        CD
                      </div>
                      <span className="text-sm font-medium text-gray-700">{lesson.teacher}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="text-lg">🗒</span>0
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Star size={14} /> 0
                      </span>
                      <span className="flex items-center gap-1 text-rose-500">
                        <Flag size={14} /> 0
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Enrolled classes</h3>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700" onClick={() => navigate("/student/classes")}>
              View all
            </button>
          </div>
          {classesLoading ? (
            <div className="py-6 text-center text-sm text-gray-500">Loading classes...</div>
          ) : classesError ? (
            <div className="py-6 text-center text-sm text-red-500">{classesError}</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {enrolledClasses.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => handleClassClick(cls.id)}
                  className="py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500"></span>
                  <div>
                    <div className="text-sm font-medium text-indigo-600 hover:text-indigo-700">{cls.title || "Untitled class"}</div>
                    <div className="text-xs text-gray-500">
                      {cls.code && <span className="mr-2">{cls.code}</span>}
                      {formatDateRange(cls.startDate, cls.endDate)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{cls.description || "No description available."}</div>
                  </div>
                </div>
              ))}
              {enrolledClasses.length === 0 && <div className="py-6 text-center text-sm text-gray-500">No classes found.</div>}
            </div>
          )}
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

