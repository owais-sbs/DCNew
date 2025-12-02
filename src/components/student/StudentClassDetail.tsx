import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { RefreshCw, ChevronLeft } from "lucide-react"
import { getStudentId, useStudentClasses } from "./useStudentClasses"
import { useAuth } from "../AuthContext"

const lessons = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  date: `${25 + index}-11-2023`,
  time: "9:00-10:30",
  class: "Advanced_AM_DCE1_PART 1 General English with Exam Preparation, C1",
  attendance: index < 3 ? ["Present", "Tardy", "Late", "Missed", "Absent"][index] : "",
  behaviour: "",
  grade: "",
  notes: ""
}))

export default function StudentClassDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"lessons" | "class-notes" | "attachments" | "assignments" | "gradebook">("lessons")
  
  // Get studentId from user context or localStorage
  const studentId = user?.studentId || getStudentId()
  
  const { classes, loading, error } = useStudentClasses(studentId || 0)
  const numericId = Number(id)
  const classData = useMemo(() => classes.find((cls) => cls.id === numericId), [classes, numericId])
  const rawClass = classData?.raw

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
                <span className="text-sm text-gray-500">01-01-2023 - 01-01-2000</span>
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">
                  <RefreshCw size={16} className="text-gray-600" />
                </button>
              </div>
            </div>

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
                  {lessons.map((lesson) => (
                    <tr key={lesson.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{lesson.date}</div>
                        <div className="text-xs text-gray-500">{lesson.time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500"></span>
                          <span className="text-gray-700">{lesson.class}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {lesson.attendance ? (
                          <button
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getAttendanceButtonClass(lesson.attendance)}`}
                          >
                            {lesson.attendance}
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

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Show</span>
                <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                <span className="text-sm text-gray-500">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  &lt;&lt;
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  &lt;
                </button>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  4
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  5
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  &gt;
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  &gt;&gt;
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "class-notes" && (
          <div className="p-6">
            <p className="text-sm text-gray-600">No class notes available.</p>
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="p-6">
            <p className="text-sm text-gray-600">No attachments available.</p>
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

