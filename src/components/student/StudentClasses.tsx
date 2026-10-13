import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../AuthContext"
import { useStudentClasses } from "./useStudentClasses"
import { useStudentAttendance } from "./useStudentAttendance"

export default function StudentClasses() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const studentId = user?.studentId ?? null
  const [activeTab, setActiveTab] = useState<"classes" | "lessons" | "attendance" | "grades" | "assignments">("classes")
  const { classes: studentClasses, loading: classesLoading, error: classesError } = useStudentClasses(studentId)
  const { attendance: attendanceRecords, loading: recordsLoading, error: recordsError } = useStudentAttendance(studentId)
  const [attendanceClassId, setAttendanceClassId] = useState<number | undefined>()
  const { attendance, loading: attendanceLoading, error: attendanceError } = useStudentAttendance(studentId, attendanceClassId)
  const attendanceStatuses = ["Present", "Absent", "Late", "Excused"] as const
  const attendanceColors: Record<(typeof attendanceStatuses)[number], string> = {
    Present: "#10b981",
    Absent: "#f43f5e",
    Late: "#fbbf24",
    Excused: "#9ca3af"
  }
  const attendanceCounts = Object.fromEntries(attendanceStatuses.map((status) => [
    status,
    attendance.filter((record) => record.status === status).length
  ])) as Record<(typeof attendanceStatuses)[number], number>
  const attendanceTotal = Object.values(attendanceCounts).reduce((total, count) => total + count, 0)
  const attendanceDuration = (status: (typeof attendanceStatuses)[number]) => {
    const minutes = attendance
      .filter((record) => record.status === status && record.startTime && record.endTime)
      .reduce((total, record) => total + Math.max(0, (new Date(record.endTime!).getTime() - new Date(record.startTime!).getTime()) / 60000), 0)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}m`
  }
  const attendanceCircle = attendanceStatuses.reduce((segments, status) => {
    const share = attendanceTotal ? (attendanceCounts[status] / attendanceTotal) * 565.48 : 0
    const offset = segments.offset
    segments.circles.push({ status, share, offset })
    segments.offset += share
    return segments
  }, { offset: 0, circles: [] as { status: string; share: number; offset: number }[] }).circles

  const renderTabContent = () => {
    switch (activeTab) {
      case "classes":
        return (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Classes you have been enrolled in</h3>
                <p className="text-xs text-gray-500">
                  {classesLoading ? "Loading classes..." : `Showing ${studentClasses.length} classes`}
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                Show only active classes
              </label>
            </div>

            {classesLoading ? (
              <div className="py-10 text-center text-sm text-gray-500">Loading classes...</div>
            ) : classesError ? (
              <div className="py-10 text-center text-sm text-red-500">{classesError}</div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Class title</th>
                      <th className="px-4 py-3 text-left font-medium">Class code</th>
                      <th className="px-4 py-3 text-left font-medium">Description</th>
                      <th className="px-4 py-3 text-left font-medium">Start date</th>
                      <th className="px-4 py-3 text-left font-medium">End date</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentClasses.map((cls) => (
                      <tr key={cls.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/student/classes/${cls.id}`)}
                            className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline text-left"
                          >
                            {cls.title || "Untitled class"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{cls.code || "—"}</td>
                        <td className="px-4 py-3 text-gray-700">{cls.description || "No description"}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDateValue(cls.startDate)}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDateValue(cls.endDate)}</td>
                        <td className="px-4 py-3 text-gray-400">
                          <button
                            onClick={() => navigate(`/student/classes/${cls.id}`)}
                            className="h-8 px-3 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
                  <div>
                    Showing 1 - {studentClasses.length} of {studentClasses.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">‹</button>
                    <span className="text-gray-900 font-medium">1</span>
                    <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">›</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )
      case "lessons":
        return (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Classes</h3>
                <p className="text-xs text-gray-500">Follow your class lessons and track progress</p>
              </div>
              <div className="flex items-center gap-3">
                <select className="h-9 px-3 rounded-xl border border-gray-200 text-sm text-gray-600">
                  <option>Behaviour: All</option>
                </select>
                <select className="h-9 px-3 rounded-xl border border-gray-200 text-sm text-gray-600">
                  <option>Class: All</option>
                </select>
                <input
                  type="text"
                  value="01-01-2015 - 01-01-2030"
                  readOnly
                  className="h-9 px-3 rounded-xl border border-gray-200 text-sm text-gray-600"
                />
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium text-left">Date</th>
                  <th className="px-4 py-3 font-medium text-left">Class</th>
                  <th className="px-4 py-3 font-medium text-left">Attendance</th>
                  <th className="px-4 py-3 font-medium text-left">Behaviour</th>
                  <th className="px-4 py-3 font-medium text-left">Grade</th>
                  <th className="px-4 py-3 font-medium text-left">Personal lesson notes</th>
                </tr>
              </thead>
              <tbody>
                {recordsError ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-red-500">{recordsError}</td></tr>
                ) : recordsLoading ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading attendance...</td></tr>
                ) : attendanceRecords.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No attendance records found.</td></tr>
                ) : attendanceRecords.map((record, idx) => (
                  <tr key={record.attendanceId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{formatDateValue(record.date)}</div>
                      <div className="text-xs text-gray-500">{formatTimeValue(record.startTime)}{record.endTime ? ` - ${formatTimeValue(record.endTime)}` : ""}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        <div className="text-indigo-600 font-medium">{record.classTitle || "Class"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{record.status || "Not marked"}</td>
                    <td className="px-4 py-3 text-gray-400">—</td>
                    <td className="px-4 py-3 text-gray-400">—</td>
                    <td className="px-4 py-3 text-gray-400">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 flex items-center justify-between border-t border-gray-100 text-xs text-gray-500">
              <div>Showing {attendanceRecords.length} recorded entries</div>
              <div className="flex items-center gap-2">
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">‹</button>
                <span className="text-gray-900 font-medium">1</span>
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">›</button>
              </div>
            </div>
          </div>
        )
      case "attendance":
        return (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Classes</h3>
                <p className="text-xs text-gray-500">Check your classes attendance here</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={attendanceClassId ?? "all"}
                  onChange={(event) => setAttendanceClassId(event.target.value === "all" ? undefined : Number(event.target.value))}
                  className="h-9 px-3 rounded-xl border border-gray-200 text-sm text-gray-600"
                >
                  <option value="all">Class: All</option>
                  {studentClasses.map((cls) => <option key={cls.id} value={cls.id}>{cls.title || `Class ${cls.id}`}</option>)}
                </select>
                <span className="h-9 px-3 grid place-items-center rounded-xl border border-gray-200 text-sm text-gray-600">All dates</span>
              </div>
            </div>
            {attendanceError ? (
              <div className="py-8 text-center text-sm text-red-500">{attendanceError}</div>
            ) : attendanceLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">Loading attendance...</div>
            ) : attendanceTotal === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No attendance records found.</div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-h-[200px] border border-gray-200 rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-48 h-48">
                    <circle cx="100" cy="100" r="90" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                    {attendanceCircle.map((segment) => (
                      <circle
                        key={segment.status}
                        cx="100"
                        cy="100"
                        r="90"
                        stroke={attendanceColors[segment.status as keyof typeof attendanceColors]}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${segment.share} ${565.48 - segment.share}`}
                        strokeDashoffset={-segment.offset}
                        transform="rotate(-90 100 100)"
                      />
                    ))}
                  </svg>
                </div>
                <div className="flex-1">
                  <table className="w-full text-sm border border-gray-200 rounded-2xl overflow-hidden">
                    <thead className="bg-gray-50 text-gray-500 text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Attendance</th>
                        <th className="px-4 py-3 text-left font-medium">Time</th>
                        <th className="px-4 py-3 text-left font-medium">Count</th>
                        <th className="px-4 py-3 text-left font-medium">Percentage (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceStatuses.map((status) => (
                        <tr key={status} className="border-t border-gray-100">
                          <td className="px-4 py-3 flex items-center gap-2 text-gray-700">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: attendanceColors[status] }}></span>
                            {status}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{attendanceDuration(status)}</td>
                          <td className="px-4 py-3 text-gray-700">{attendanceCounts[status]}</td>
                          <td className="px-4 py-3 text-gray-700">{Math.round((attendanceCounts[status] / attendanceTotal) * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      case "grades":
        return (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
            <div className="text-sm font-semibold text-gray-700 mb-2">Classes</div>
            <p className="text-gray-500 mb-8">Track your class grades</p>
            <div className="text-4xl text-blue-300 mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Abdul's grade results</h3>
            <p className="text-sm text-gray-600">Class grades will appear here when they have been added to a gradebook.</p>
          </div>
        )
      case "assignments":
        return (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Keep track of all of your assignments</h3>
              </div>
              <select className="h-9 px-3 rounded-xl border border-gray-200 text-sm text-gray-600">
                <option>Class: All</option>
              </select>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Class</th>
                  <th className="px-4 py-3 text-left font-medium">Assignment title</th>
                  <th className="px-4 py-3 text-left font-medium">Due date</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="p-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
              <div>Showing 0 - 0 of 0 entries</div>
              <div className="flex items-center gap-2">
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">‹</button>
                <span className="text-gray-900 font-medium">1</span>
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">›</button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Classes</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[
            { id: "classes", label: "Classes" },
            { id: "lessons", label: "Lessons" },
            { id: "attendance", label: "Attendance" },
            { id: "grades", label: "Grades" },
            { id: "assignments", label: "Assignments" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-full border text-sm ${
                activeTab === tab.id
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600 font-semibold"
                  : "border-gray-200 bg-white text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {renderTabContent()}
    </div>
  )
}

const formatDateValue = (value?: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

const formatTimeValue = (value?: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

