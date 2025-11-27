import { useState } from "react"
import { Calendar, Star, Flag, Bell, MapPin } from "lucide-react"

const enrolledClasses = [
  {
    title: "Advanced_AM_DCE1_PART 1",
    subject: "General English with Exam Preparation, C1",
    schedule: "Friday (9:00-10:30), Monday (9:00-10:30) and 3 more"
  },
  {
    title: "Advanced_AM_DCE1_PART 2",
    subject: "General English with Exam Preparation, C1",
    schedule: "Friday (9:00-10:30), Monday (9:00-10:30) and 3 more"
  },
  {
    title: "Advanced_PM_DCE1_PART 1",
    subject: "General English with Exam Preparation, C1",
    schedule: "Friday (9:00-10:30), Monday (9:00-10:30) and 3 more"
  }
]

const upcomingLessons = [
  {
    date: "27-11-2025",
    time: "9:00 - 10:30",
    title: "Advanced_AM_DCE1_PART 1",
    location: "Limerick",
    teacher: "Colm Delmar1"
  }
]

const pastLessons = [
  {
    date: "27-11-2025",
    time: "9:00 - 10:30",
    title: "Advanced_AM_DCE1_PART 1",
    location: "Limerick",
    teacher: "Colm Delmar1"
  },
  {
    date: "26-11-2025",
    time: "9:00 - 10:30",
    title: "Advanced_AM_DCE1_PART 1",
    location: "Limerick",
    teacher: "Colm Delmar1"
  },
  {
    date: "25-11-2025",
    time: "9:00 - 10:30",
    title: "Advanced_AM_DCE1_PART 1",
    location: "Limerick",
    teacher: "Colm Delmar1"
  }
]

export default function StudentDashboard() {
  const [lessonTab, setLessonTab] = useState<"upcoming" | "past">("upcoming")

  const lessons = lessonTab === "upcoming" ? upcomingLessons : pastLessons

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Attendance</h3>
              <p className="text-xs text-gray-500">Your attendance this term</p>
            </div>
            <Calendar className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="mt-4 h-32 w-32 mx-auto border-4 border-gray-200 rounded-full grid place-items-center text-gray-500 text-sm">
            0%
          </div>
          <div className="mt-4 flex items-center justify-around text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span>Present</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span>Absent</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500"></span>Late</span>
          </div>
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
            {lessons.map((lesson, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between relative"
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
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Enrolled classes</h3>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View all</button>
          </div>
          <div className="divide-y divide-gray-100">
            {enrolledClasses.map((cls, idx) => (
              <div key={idx} className="py-3 flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500"></span>
                <div>
                  <div className="text-sm font-medium text-indigo-600">{cls.title}</div>
                  <div className="text-xs text-gray-500">{cls.subject}</div>
                  <div className="text-xs text-gray-500 mt-1">{cls.schedule}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

