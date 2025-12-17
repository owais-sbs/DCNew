import { useState, useMemo, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { RefreshCw, ChevronLeft, Paperclip, CalendarDays, Clock } from "lucide-react"
import { getStudentId, useStudentClasses } from "./useStudentClasses"
import { useAuth } from "../AuthContext"
import axiosInstance from "../axiosInstance"

/* ================= TYPES ================= */

type AttendanceEntry = {
  SessionId: number
  AttendanceStatus: string
  AttendanceDate: string
  SessionDayOfWeek: string
  SessionStartTime: string
  SessionEndTime: string
  ClassTitle: string
}

type Attachment = {
  Id: number
  FileName?: string
  URL?: string
  CreatedOn?: string
}

/* ================= COMPONENT ================= */

export default function StudentClassDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<
    "lessons2" | "class-notes" | "attachments" | "assignments" | "gradebook"
  >("lessons2")

  const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)

  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null)

  const studentId = user?.studentId || getStudentId()
  const numericId = Number(id)

  const { classes, loading, error } = useStudentClasses(studentId || 0)
  const classData = useMemo(
    () => classes.find((cls) => cls.id === numericId),
    [classes, numericId]
  )
  const rawClass = classData?.raw

  /* ================= FETCH ATTENDANCE ================= */

  useEffect(() => {
    if (!numericId || !studentId) return

    setLoadingAttendance(true)
    setAttendanceError(null)

    axiosInstance
      .get("/Class/GetAttendanceForStudentInClass", {
        params: { classId: numericId, studentId }
      })
      .then((res) => {
        if (res.data?.IsSuccess && Array.isArray(res.data.Data)) {
          setAttendanceData(res.data.Data)
        } else {
          setAttendanceData([])
          setAttendanceError("No attendance records found.")
        }
      })
      .catch(() => setAttendanceError("Failed to load attendance data."))
      .finally(() => setLoadingAttendance(false))
  }, [numericId, studentId])

  /* ================= FETCH ATTACHMENTS ================= */

  useEffect(() => {
    if (activeTab !== "attachments" || !numericId) return

    setLoadingAttachments(true)
    setAttachmentsError(null)

    axiosInstance
      .get("/Attachment/GetByClassId", { params: { id: numericId } })
      .then((res) => {
        if (res.data?.IsSuccess && Array.isArray(res.data?.Data?.Data)) {
          setAttachments(res.data.Data.Data)
        } else {
          setAttachments([])
        }
      })
      .catch(() => setAttachmentsError("Failed to load attachments."))
      .finally(() => setLoadingAttachments(false))
  }, [activeTab, numericId])

  /* ================= HELPERS ================= */

  const formatDate = (v?: string | null) =>
    v ? new Date(v).toLocaleDateString("en-GB") : "—"

  const formatTime = (s?: string, e?: string) =>
    s
      ? `${new Date(`2000-01-01T${s}`).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit"
        })}${
          e
            ? "-" +
              new Date(`2000-01-01T${e}`).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit"
              })
            : ""
        }`
      : "—"

  const badgeClass = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-emerald-100 text-emerald-700 border-emerald-300"
      case "Absent":
        return "bg-rose-100 text-rose-700 border-rose-300"
      case "Late":
        return "bg-amber-100 text-amber-700 border-amber-300"
      case "Excused":
        return "bg-gray-100 text-gray-700 border-gray-300"
      default:
        return "bg-gray-50 text-gray-500 border-gray-200"
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>
  if (error) return <div className="p-6 text-sm text-red-500">{error}</div>
  if (!classData) return null

  /* ================= UI ================= */

  return (
    <div className="space-y-6 m-4">
      {/* ================= HEADER ================= */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate("/student/classes")}
          className="h-9 w-9 border rounded-lg grid place-items-center hover:bg-gray-100"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <h1 className="text-lg font-semibold text-gray-900">
              {classData.title}
              <span className="text-sm text-gray-500 ml-1">
                ({classData.code || "—"})
              </span>
            </h1>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} />
              Monday (13:45-15:00), Tuesday (13:45-15:00) and 8 more
            </div>
            <div>👨‍🏫 Teacher: {rawClass?.TeacherName || "—"}</div>
            <div>🏫 Classroom: {rawClass?.ClassRoom || "—"}</div>
            <div>📘 Total lessons: {rawClass?.TotalLessons || 1298}</div>
            <div>⏱ Total lesson hours: {rawClass?.TotalLessonHours || "1947:00"}</div>
            <div>🕒 Total hours taught: {rawClass?.TotalHoursTaught || "09:00"}</div>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="bg-white rounded-xl border">
        <div className="border-b border-gray-200 bg-white">
  <div className="flex items-center gap-8 px-6">
    {[
      { id: "lessons", label: "Lessons", icon: "📖" },
      { id: "class-notes", label: "Class notes", icon: "📝" },
      { id: "attachments", label: "Attachments", icon: "📎" },
      { id: "assignments", label: "Assignments", icon: "📋" },
      { id: "gradebook", label: "Gradebook", icon: "🎓" }
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id as typeof activeTab)}
        className={`relative flex items-center gap-2 py-4 text-sm font-medium transition-colors
          ${
            activeTab === tab.id
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
      >
        <span className="text-base leading-none">{tab.icon}</span>
        <span>{tab.label}</span>

        {/* active underline */}
        {activeTab === tab.id && (
          <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-blue-600 rounded-full" />
        )}
      </button>
    ))}
  </div>
</div>


        {/* ================= LESSONS ================= */}
        {activeTab === "lessons" && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <p className="text-sm text-gray-600">
                Your attendance, notes and performance for each lesson of the class
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm border px-3 py-1 rounded-lg">
                  Date: 01-01-2013 - 01-01-2030
                </span>
                <button className="h-8 w-8 border rounded-lg grid place-items-center">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Class</th>
                    <th className="px-4 py-3 text-left">Attendance</th>
                    <th className="px-4 py-3 text-left">Behaviour</th>
                    <th className="px-4 py-3 text-left">Grade</th>
                    <th className="px-4 py-3 text-left">Personal lesson notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((a, i) => (
                    <tr
                      key={a.SessionId}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3">
                        <div className="text-indigo-600 font-medium">
                          {formatDate(a.AttendanceDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(a.SessionStartTime, a.SessionEndTime)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-red-500" />
                          <div>
                            <div>{a.ClassTitle}</div>
                            <div className="text-xs text-gray-500">{classData.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {a.AttendanceStatus ? (
                          <span
                            className={`px-4 py-1 text-xs border rounded-full ${badgeClass(
                              a.AttendanceStatus
                            )}`}
                          >
                            {a.AttendanceStatus}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400">—</td>
                      <td className="px-4 py-3 text-gray-400">—</td>
                      <td className="px-4 py-3 text-gray-400">Click to view</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Showing 1-25 of {attendanceData.length} entries
            </div>
          </div>
        )}

        {/* ================= OTHER TABS ================= */}
        {activeTab !== "lessons" && (
          <div className="p-10 text-center text-gray-500 text-sm">
            No data available.
          </div>
        )}
      </div>
    </div>
  )
}
