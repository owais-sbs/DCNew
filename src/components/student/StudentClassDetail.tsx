import { useState, useMemo, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { RefreshCw, ChevronLeft, Paperclip } from "lucide-react"
import { getStudentId, useStudentClasses } from "./useStudentClasses"
import { useAuth } from "../AuthContext"
import axiosInstance from "../axiosInstance"

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

export default function StudentClassDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"lessons" | "class-notes" | "attachments" | "assignments" | "gradebook">("lessons")
  const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState<boolean>(false)
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null)
  
  // Get studentId from user context or localStorage
  const studentId = user?.studentId || getStudentId()
  
  const { classes, loading, error } = useStudentClasses(studentId || 0)
  const numericId = Number(id)
  const classData = useMemo(() => classes.find((cls) => cls.id === numericId), [classes, numericId])
  const rawClass = classData?.raw

  // Fetch attendance data when component loads or when classId/studentId changes
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!numericId || !studentId) return

      setLoadingAttendance(true)
      setAttendanceError(null)
      try {
        const response = await axiosInstance.get("/Class/GetAttendanceForStudentInClass", {
          params: { 
            classId: numericId,
            studentId: studentId
          }
        })

        console.log("Attendance response:", response.data)
        if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
          setAttendanceData(response.data.Data)
        } else {
          setAttendanceData([])
          setAttendanceError(response.data?.Message || "No attendance data available.")
        }
      } catch (err: any) {
        console.error("Error fetching attendance:", err)
        setAttendanceError(err?.message || "Failed to load attendance data.")
        setAttendanceData([])
      } finally {
        setLoadingAttendance(false)
      }
    }

    fetchAttendance()
  }, [numericId, studentId])

  // Fetch attachments when attachments tab is active or when classId changes
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!numericId) return
      // Only fetch when attachments tab is active
      if (activeTab !== "attachments") return

      setLoadingAttachments(true)
      setAttachmentsError(null)
      try {
        const response = await axiosInstance.get("/Attachment/GetByClassId", {
          params: { id: numericId }
        })

        console.log("Attachments response:", response.data)
        if (response.data?.IsSuccess && response.data?.Data?.Data) {
          setAttachments(Array.isArray(response.data.Data.Data) ? response.data.Data.Data : [])
        } else {
          setAttachments([])
          setAttachmentsError(response.data?.Message || "No attachments available.")
        }
      } catch (err: any) {
        console.error("Error fetching attachments:", err)
        setAttachmentsError(err?.message || "Failed to load attachments.")
        setAttachments([])
      } finally {
        setLoadingAttachments(false)
      }
    }

    fetchAttachments()
  }, [numericId, activeTab])

  const getAttendanceButtonClass = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-emerald-500 text-white hover:bg-emerald-600"
      case "Tardy":
        return "bg-amber-400 text-white hover:bg-amber-500"
      case "Late":
        return "bg-orange-500 text-white hover:bg-orange-600"
      case "Missed":
        return "bg-pink-500 text-white hover:bg-pink-600"
      case "Absent":
        return "bg-rose-500 text-white hover:bg-rose-600"
      case "Excused":
        return "bg-gray-300 text-gray-700 hover:bg-gray-400"
      default:
        return "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading class details...</div>
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">{error}</div>
  }

  if (!classData) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Class not found.{" "}
        <button className="text-indigo-600 hover:underline" onClick={() => navigate("/student/classes")}>
          Go back to classes
        </button>
      </div>
    )
  }

  const formatDate = (value?: string | null) => {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }

  const formatTime = (startTime?: string, endTime?: string) => {
    if (!startTime) return "—"
    const start = startTime ? new Date(`2000-01-01T${startTime}`).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : ""
    const end = endTime ? new Date(`2000-01-01T${endTime}`).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : ""
    return start && end ? `${start}-${end}` : start || "—"
  }

  const formatDateValue = (dateString?: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/student/classes")}
          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {classData.title || "Class Details"}
          </h1>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 mb-1">Class Code</div>
            <div className="font-medium text-gray-900">{classData.code || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Awarding Body</div>
            <div className="font-medium text-gray-900">{rawClass?.AwardingBody || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Schedule</div>
            <div className="font-medium text-gray-900">{rawClass?.ClassSubject || "General English"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Teacher</div>
            <div className="font-medium text-gray-900">{rawClass?.TeacherName || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Classroom</div>
            <div className="font-medium text-gray-900">{rawClass?.ClassRoom || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Description</div>
            <div className="font-medium text-gray-900">{classData.description || "No description"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Start Date</div>
            <div className="font-medium text-gray-900">{formatDate(classData.startDate)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">End Date</div>
            <div className="font-medium text-gray-900">{formatDate(classData.endDate)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-6 px-6">
            <button
              onClick={() => setActiveTab("lessons")}
              className={`relative py-4 text-sm font-medium ${
                activeTab === "lessons" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Lessons
              {activeTab === "lessons" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("class-notes")}
              className={`relative py-4 text-sm font-medium ${
                activeTab === "class-notes" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Class notes
              {activeTab === "class-notes" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("attachments")}
              className={`relative py-4 text-sm font-medium ${
                activeTab === "attachments" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Attachments
              {activeTab === "attachments" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`relative py-4 text-sm font-medium ${
                activeTab === "assignments" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Assignments
              {activeTab === "assignments" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("gradebook")}
              className={`relative py-4 text-sm font-medium ${
                activeTab === "gradebook" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Gradebook
              {activeTab === "gradebook" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {activeTab === "lessons" && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">Your attendance, notes and performance for each lesson of the class.</p>
              <div className="flex items-center gap-3">
                {attendanceData.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {formatDateValue(attendanceData[attendanceData.length - 1]?.AttendanceDate)} - {formatDateValue(attendanceData[0]?.AttendanceDate)}
                  </span>
                )}
                <button 
                  onClick={() => {
                    if (numericId && studentId) {
                      setLoadingAttendance(true)
                      axiosInstance.get("/Class/GetAttendanceForStudentInClass", {
                        params: { 
                          classId: numericId,
                          studentId: studentId
                        }
                      }).then((response) => {
                        if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
                          setAttendanceData(response.data.Data)
                        }
                      }).catch((err) => {
                        console.error("Error refreshing attendance:", err)
                      }).finally(() => {
                        setLoadingAttendance(false)
                      })
                    }
                  }}
                  className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200"
                  disabled={loadingAttendance}
                >
                  <RefreshCw size={16} className={`text-gray-600 ${loadingAttendance ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loadingAttendance && (
              <div className="text-sm text-gray-500 py-4">Loading attendance data...</div>
            )}

            {attendanceError && !loadingAttendance && (
              <div className="text-sm text-red-500 py-4">{attendanceError}</div>
            )}

            {!loadingAttendance && !attendanceError && attendanceData.length === 0 && (
              <div className="text-sm text-gray-500 py-4">No attendance records found.</div>
            )}

            {!loadingAttendance && attendanceData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Class</th>
                      <th className="px-4 py-3 text-left font-medium">Attendance</th>
                      <th className="px-4 py-3 text-left font-medium">Behaviour</th>
                      <th className="px-4 py-3 text-left font-medium">Grade</th>
                      <th className="px-4 py-3 text-left font-medium">Personal lesson notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((entry) => (
                      <tr key={entry.SessionId} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-gray-900">{formatDateValue(entry.AttendanceDate)}</div>
                          <div className="text-xs text-gray-500">{formatTime(entry.SessionStartTime, entry.SessionEndTime)}</div>
                          {entry.SessionDayOfWeek && (
                            <div className="text-xs text-gray-400">{entry.SessionDayOfWeek}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            <span className="text-gray-700">{entry.ClassTitle || classData?.title || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {entry.AttendanceStatus && entry.AttendanceStatus !== "NotTaken" ? (
                            <button
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getAttendanceButtonClass(entry.AttendanceStatus)}`}
                            >
                              {entry.AttendanceStatus}
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400">—</td>
                        <td className="px-4 py-3 text-gray-400">—</td>
                        <td className="px-4 py-3 text-gray-400">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingAttendance && attendanceData.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Showing {attendanceData.length} entries</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "class-notes" && (
          <div className="p-6">
            <p className="text-sm text-gray-600">No class notes available.</p>
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="p-6">
            {loadingAttachments ? (
              <div className="text-sm text-gray-500 py-4">Loading attachments...</div>
            ) : attachmentsError && !loadingAttachments ? (
              <div className="text-sm text-red-500 py-4">{attachmentsError}</div>
            ) : attachments.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Paperclip size={32} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No attachments available</h3>
                <p className="text-gray-600">There are no attachments for this class yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.Id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Paperclip size={20} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {attachment.FileName || attachment.URL?.split("/").pop() || "Attachment"}
                        </span>
                      </div>
                    </div>
                    {attachment.CreatedOn && (
                      <div className="text-xs text-gray-500 mb-2">
                        Uploaded on {formatDateValue(attachment.CreatedOn)}
                      </div>
                    )}
                    {attachment.URL && (
                      <a
                        href={attachment.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline mt-2 inline-block"
                      >
                        View file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="p-6">
            <p className="text-sm text-gray-600">No assignments available.</p>
          </div>
        )}

        {activeTab === "gradebook" && (
          <div className="p-6">
            <p className="text-sm text-gray-600">No gradebook data available.</p>
          </div>
        )}
      </div>
    </div>
  )
}

