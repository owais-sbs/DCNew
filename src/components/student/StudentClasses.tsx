import { useState } from "react"
import { useNavigate } from "react-router-dom"

const classes = [
  {
    id: 1,
    title: "Advanced_AM_DCE1_PART 1",
    subject: "General English with Exam Preparation, C1",
    teacher: "Colm Delmar1",
    schedule: "Friday (9:00-10:30), Monday (9:00-10:30), and 3 more",
    status: "Active"
  },
  {
    id: 2,
    title: "Advanced_AM_DCE1_PART 2",
    subject: "General English with Exam Preparation, C1",
    teacher: "Colm Delmar1",
    schedule: "Friday (9:00-10:30), Monday (9:00-10:30), and 3 more",
    status: "Unenrolled"
  },
  {
    id: 3,
    title: "Advanced_PM_DCE1_PART 1",
    subject: "General English with Exam Preparation, C1",
    teacher: "Colm Delmar1",
    schedule: "Friday (9:00-10:30), Monday (9:00-10:30), and 3 more",
    status: "Unenrolled"
  }
]

const lessons = Array.from({ length: 20 }, (_, index) => ({
  date: `${25 + index}-11-2025`,
  time: "9:00-10:30",
  title: "Advanced_AM_DCE1_PART 1",
  location: "Limerick",
  attendance: index === 0 ? "Present" : "",
  behaviour: "",
  grade: "",
  notes: ""
}))

const attendanceSummary = [
  { label: "Present", time: "0", count: 0, percentage: 0, color: "bg-emerald-500" },
  { label: "Absent", time: "0", count: 0, percentage: 0, color: "bg-rose-500" },
  { label: "Late", time: "0", count: 0, percentage: 0, color: "bg-amber-400" },
  { label: "Excused", time: "1 hour 30 minutes", count: 1, percentage: "-", color: "bg-gray-300" }
]

export default function StudentClasses() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"classes" | "lessons" | "attendance" | "grades" | "assignments">("classes")

  const renderTabContent = () => {
    switch (activeTab) {
      case "classes":
        return (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Classes you have been enrolled in</h3>
                <p className="text-xs text-gray-500">Showing {classes.length} classes</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                Show only active classes
              </label>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Class</th>
                  <th className="px-4 py-3 text-left font-medium">Teacher</th>
                  <th className="px-4 py-3 text-left font-medium">Recurring day/time</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, idx) => (
                  <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        <div>
                          <button
                            onClick={() => navigate(`/student/classes/${cls.id}`)}
                            className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline text-left"
                          >
                            {cls.title}
                          </button>
                          <div className="text-xs text-gray-500">{cls.subject}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{cls.teacher}</td>
                    <td className="px-4 py-3 text-gray-700">{cls.schedule}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cls.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {cls.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">
                        📄
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
              <div>
                Showing 1 - {classes.length} of {classes.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">‹</button>
                <span className="text-gray-900 font-medium">1</span>
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 border border-gray-200">›</button>
              </div>
            </div>
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
                {lessons.map((lesson, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{lesson.date}</div>
                      <div className="text-xs text-gray-500">{lesson.time}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        <div>
                          <div className="text-indigo-600 font-medium">{lesson.title}</div>
                          <div className="text-xs text-gray-500">General English with Exam Preparation, C1</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{lesson.attendance}</td>
                    <td className="px-4 py-3 text-gray-700">{lesson.behaviour}</td>
                    <td className="px-4 py-3 text-gray-700">{lesson.grade}</td>
                    <td className="px-4 py-3 text-gray-700">{lesson.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 flex items-center justify-between border-t border-gray-100 text-xs text-gray-500">
              <div>Showing 1 - 25 of {lessons.length} entries</div>
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
              <div className="flex-1 min-h-[200px] border border-gray-200 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-48 h-48 text-gray-200">
                  <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="12" fill="none" />
                  <circle cx="100" cy="100" r="90" stroke="#d946ef" strokeWidth="12" fill="none" strokeDasharray="565.48" strokeDashoffset="420" />
                  <circle cx="100" cy="100" r="90" stroke="#f97316" strokeWidth="12" fill="none" strokeDasharray="565.48" strokeDashoffset="480" />
                  <circle cx="100" cy="100" r="90" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="565.48" strokeDashoffset="530" />
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
                    {attendanceSummary.map((item) => (
                      <tr key={item.label} className="border-t border-gray-100">
                        <td className="px-4 py-3 flex items-center gap-2 text-gray-700">
                          <span className={`h-2 w-2 rounded-full ${item.color}`}></span>
                          {item.label}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{item.time}</td>
                        <td className="px-4 py-3 text-gray-700">{item.count}</td>
                        <td className="px-4 py-3 text-gray-700">{item.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

