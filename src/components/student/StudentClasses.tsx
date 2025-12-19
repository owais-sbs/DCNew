// StudentClasses.tsx
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Edit2, BarChart2 } from "lucide-react"
import { useStudentClasses, getStudentId } from "./useStudentClasses"
import { useAuth } from "../AuthContext"
import { useStudentCompletedSessions } from "./useStudentCompletedSessions"

/**
 * StudentClasses
 * - UI updated to match screenshots (cards, table style, pills, badges, actions)
 * - Logic / hooks kept the same: useStudentClasses, useStudentCompletedSessions, getStudentId
 *
 * Note: this file assumes Tailwind CSS is available in the project.
 */

const attendanceSummary = [
  { label: "Present", time: "4 hours 30 minutes", count: 3, percentage: 60, color: "bg-emerald-500" },
  { label: "Absent", time: "1 hour 30 minutes", count: 1, percentage: 20, color: "bg-rose-500" },
  { label: "Late", time: "1 hour 30 minutes", count: 1, percentage: 20, color: "bg-amber-400" },
  { label: "Excused", time: "1 hour 30 minutes", count: 1, percentage: "-", color: "bg-gray-300" }
]

export default function StudentClasses() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"classes" | "lessons" | "attendance" | "grades" | "assignments">("classes")

  // Get studentId from user context or localStorage
  const studentId = user?.studentId || getStudentId()

  const { classes: studentClasses, loading: classesLoading, error: classesError } = useStudentClasses(studentId || 0)
  const { sessions: completedSessions, loading: completedLoading, error: completedError } = useStudentCompletedSessions(
    studentId || 0
  )

  // Map completed sessions to lessons format for the lessons tab (same as your logic)
  const lessons = completedSessions.map((session) => {
    const classInfo = studentClasses.find((cls) => cls.id === session.classId)
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return "—"
      try {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      } catch {
        return "—"
      }
    }
    const formatTime = (timeStr: string | null) => {
      if (!timeStr) return "—"
      try {
        const date = new Date(timeStr)
        return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      } catch {
        return "—"
      }
    }
    return {
      id: session.id,
      date: formatDate(session.date),
      time: formatTime(session.startTime),
      title: classInfo?.title || "Unknown Class",
      attendance: "Present", // TODO: use real API
      behaviour: "—",
      grade: "—",
      notes: "—"
    }
  })

  const renderTabContent = () => {
    switch (activeTab) {
      case "classes":
        return renderClassesTab()
      case "lessons":
        return renderLessonsTab()
      case "attendance":
        return renderAttendanceTab()
      case "grades":
        return renderGradesTab()
      case "assignments":
        return renderAssignmentsTab()
      default:
        return null
    }
  }

  function renderClassesTab() {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* top info bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Classes you have been enrolled in</h3>
            <p className="text-xs text-gray-500 mt-1">
              {classesLoading ? "Loading classes..." : `Showing ${studentClasses.length} classes`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-gray-500">
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only" />
                <div className="w-10 h-6 bg-gray-100 rounded-full p-1 flex items-center">
                  <div className="h-4 w-4 bg-white rounded-full shadow-sm transform translate-x-0"></div>
                </div>
              </div>
              Show only active classes
            </label>
          </div>
        </div>

        {/* table */}
        {classesLoading ? (
          <div className="py-12 text-center text-sm text-gray-500">Loading classes...</div>
        ) : classesError ? (
          <div className="py-12 text-center text-sm text-red-500">{classesError}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Class</th>
                    <th className="px-6 py-3 text-left font-medium">Teacher</th>
                    <th className="px-6 py-3 text-left font-medium">Recurring day/time</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentClasses.map((cls: any) => {
                    const teachers =
                      cls.teacherNames?.length > 0
                        ? cls.teacherNames.join(", ")
                        : cls.teacher || cls.teachers?.map((t: any) => t.name).join(", ") || "—"

                    // derive recurring string if available, fallback to dates
                    const recurring =
                      cls.recurringDays && cls.recurringDays.length
                        ? cls.recurringDays.slice(0, 3).map((d: string) => `${d} (${cls.timeRange ?? ""})`).join(", ") +
                          (cls.recurringDays.length > 3 ? ` and ${cls.recurringDays.length - 3} more` : "")
                        : cls.recurrenceText || cls.scheduleSummary || (cls.startDate && cls.endDate ? formatDateRange(cls.startDate, cls.endDate) : "—")

                    const isActive = !!cls.isActive || cls.status === "Active" || cls.status === "active"

                    return (
                      <tr key={cls.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 align-top">
                          <div className="flex items-start gap-3">
                            {/* left dot */}
                            <div className="mt-1">
                              <span className="inline-block h-3 w-3 rounded-full bg-rose-500" />
                            </div>

                            <div>
                              <button
                                onClick={() => navigate(`/student/classes/${cls.id}`)}
                                className="text-indigo-600 font-medium hover:underline text-left"
                              >
                                {cls.title || "Untitled class"}
                              </button>
                              <div className="text-xs text-gray-400 mt-1">{cls.code || cls.shortCode || ""}</div>
                              {cls.description && <div className="text-xs text-gray-400 mt-1">{cls.description}</div>}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 align-top text-gray-700">{teachers}</td>

                        <td className="px-6 py-4 align-top text-gray-700">
                          <div className="text-sm">
                            {recurring}
                          </div>
                        </td>

                        <td className="px-6 py-4 align-top">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                              isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {isActive ? "Active" : "Unenrolled"}
                          </span>
                        </td>

                        <td className="px-6 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/student/classes/${cls.id}`)}
                              className="h-9 w-9 grid place-items-center rounded-lg border border-gray-200 hover:bg-gray-50"
                              title="View / Edit"
                            >
                              <Edit2 size={16} className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => navigate(`/student/classes/${cls.id}/lessons`)}
                              className="h-9 w-9 grid place-items-center rounded-lg border border-gray-200 hover:bg-gray-50"
                              title="Lessons"
                            >
                              <BarChart2 size={16} className="text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* footer / pagination */}
            <div className="p-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
                  <span>25</span>
                  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.062a.75.75 0 111.12 1.01l-4.25 4.656a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>Showing 1 - {studentClasses.length} of {studentClasses.length} entries</div>
              </div>

              <div className="flex items-center gap-2">
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">‹</button>
                <div className="h-8 w-8 grid place-items-center rounded-full bg-indigo-50 text-indigo-600">1</div>
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">›</button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  function renderLessonsTab() {
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
            <button className="h-9 w-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">↻</button>
          </div>
        </div>

        {completedLoading ? (
          <div className="py-10 text-center text-sm text-gray-500">Loading lessons...</div>
        ) : completedError ? (
          <div className="py-10 text-center text-sm text-red-500">{completedError}</div>
        ) : lessons.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">No lessons found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium text-left">Date</th>
                    <th className="px-6 py-3 font-medium text-left">Class</th>
                    <th className="px-6 py-3 font-medium text-left">Attendance</th>
                    <th className="px-6 py-3 font-medium text-left">Behaviour</th>
                    <th className="px-6 py-3 font-medium text-left">Grade</th>
                    <th className="px-6 py-3 font-medium text-left">Personal lesson notes</th>
                  </tr>
                </thead>

                <tbody>
                  {lessons.map((lesson, idx) => (
                    <tr key={lesson.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="text-indigo-600 font-medium">{lesson.date}</div>
                        <div className="text-xs text-gray-500 mt-1">{lesson.time}</div>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <span className="inline-block h-3 w-3 rounded-full bg-rose-500" />
                          </div>
                          <div>
                            <div className="text-indigo-600 font-medium">{lesson.title}</div>
                            <div className="text-xs text-gray-400">General English with Exam Preparation, C1</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {/* placeholder badge */}
                        <div className="inline-block px-3 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700">Present</div>
                      </td>

                      <td className="px-6 py-4 text-gray-700">{lesson.behaviour}</td>
                      <td className="px-6 py-4 text-gray-700">{lesson.grade}</td>
                      <td className="px-6 py-4 text-gray-700">{lesson.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 flex items-center justify-between border-t border-gray-100 text-xs text-gray-500">
              <div>Showing 1 - {lessons.length} of {lessons.length} entries</div>
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
  }

  function renderAttendanceTab() {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Check your classes attendance here</h3>
            <p className="text-xs text-gray-500">Summary of attendance across your classes</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="h-9 px-3 rounded-xl border border-gray-200 text-sm text-gray-600">
              <option>Class: All</option>
            </select>
            <select className="h-9 px-3 rounded-xl border border-gray-200 text-sm text-gray-600">
              <option>Date: Total</option>
            </select>
            <button className="h-9 w-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">↻</button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex items-center justify-center">
            {/* donut placeholder (SVG) */}
            <svg viewBox="0 0 200 200" className="w-56 h-56">
              <circle cx="100" cy="100" r="90" stroke="#eef2f7" strokeWidth="18" fill="none" />
              <circle cx="100" cy="100" r="90" stroke="#10b981" strokeWidth="18" fill="none"
                strokeDasharray="565.48"
                strokeDashoffset="220" strokeLinecap="round" />
              <circle cx="100" cy="100" r="90" stroke="#ef4444" strokeWidth="18" fill="none"
                strokeDasharray="565.48"
                strokeDashoffset="360" strokeLinecap="round" />
              <circle cx="100" cy="100" r="90" stroke="#f59e0b" strokeWidth="18" fill="none"
                strokeDasharray="565.48"
                strokeDashoffset="410" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex-1">
            <table className="w-full text-sm border border-gray-100 rounded-2xl overflow-hidden">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Attendance</th>
                  <th className="px-6 py-3 text-left font-medium">Time</th>
                  <th className="px-6 py-3 text-left font-medium">Count</th>
                  <th className="px-6 py-3 text-left font-medium">Percentage (%)</th>
                </tr>
              </thead>
              <tbody>
                {attendanceSummary.map((item) => (
                  <tr key={item.label} className="border-t border-gray-100">
                    <td className="px-6 py-4 flex items-center gap-3 text-gray-700">
                      <span className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span>{item.label}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.time}</td>
                    <td className="px-6 py-4 text-gray-700">{item.count}</td>
                    <td className="px-6 py-4 text-gray-700">{item.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  function renderGradesTab() {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
        <div className="text-sm font-semibold text-gray-700 mb-2">Classes</div>
        <p className="text-gray-500 mb-8">Track your class grades</p>
        <div className="text-4xl text-blue-300 mb-4">📄</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Grades</h3>
        <p className="text-sm text-gray-600">Class grades will appear here when they have been added to a gradebook.</p>
      </div>
    )
  }

  function renderAssignmentsTab() {
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
              <th className="px-6 py-3 text-left font-medium">Class</th>
              <th className="px-6 py-3 text-left font-medium">Assignment title</th>
              <th className="px-6 py-3 text-left font-medium">Due date</th>
              <th className="px-6 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
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
  }

  // helpers
  function formatDateValue(value?: string | null) {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }

  function formatDateRange(start?: string | null, end?: string | null) {
    if (!start && !end) return "Dates TBD"
    if (start && end) return `${formatDateValue(start)} - ${formatDateValue(end)}`
    if (start) return `Starts ${formatDateValue(start)}`
    return `Ends ${formatDateValue(end)}`
  }

  return (
    <div className="space-y-4 m-4">
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

