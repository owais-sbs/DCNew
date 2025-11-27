const days = ["Mon 24 Nov", "Tue 25 Nov", "Wed 26 Nov", "Thu 27 Nov", "Fri 28 Nov", "Sat 29 Nov", "Sun 30 Nov"]
const hours = Array.from({ length: 13 }, (_, i) => `${6 + i}:00`)

const lessons = [
  { dayIndex: 2, time: "9:00 - 10:30", title: "Advanced_AM_DCE1_PART 1", color: "bg-gray-500" },
  { dayIndex: 3, time: "9:00 - 10:30", title: "Advanced_AM_DCE1_PART 1", color: "bg-red-500" },
  { dayIndex: 4, time: "9:00 - 10:30", title: "Advanced_AM_DCE1_PART 1", color: "bg-red-500" }
]

export default function StudentCalendar() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">←</button>
          <button className="h-9 px-3 rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">→</button>
          <button className="h-9 px-4 rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">Today</button>
          <div className="text-sm font-medium text-gray-900">Nov 24 – 30, 2025</div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-full overflow-hidden text-sm text-gray-600">
            <button className="px-3 py-1 hover:bg-gray-50">Month</button>
            <button className="px-3 py-1 bg-indigo-50 text-indigo-600 font-medium">Week</button>
            <button className="px-3 py-1 hover:bg-gray-50">Day</button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 text-sm text-gray-600">
          <div className="w-16 px-2 py-3"></div>
          <div className="grid grid-cols-7 flex-1">
            {days.map((day) => (
              <div key={day} className="px-4 py-3 text-center font-medium">
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className="flex">
          <div className="w-16 border-r border-gray-200 text-xs text-gray-500">
            {hours.map((hour) => (
              <div key={hour} className="h-16 px-2 py-1">{hour}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1">
            {days.map((_, index) => (
              <div key={index} className={`border-l border-gray-100 h-[832px] relative ${index === 3 ? "bg-amber-50" : ""}`}>
                {lessons
                  .filter((lesson) => lesson.dayIndex === index)
                  .map((lesson, idx) => (
                    <div
                      key={idx}
                      className={`${lesson.color} text-white text-xs rounded-lg p-2 w-11/12 mx-auto mt-6 shadow-sm`}
                    >
                      <div className="font-medium">{lesson.time}</div>
                      <div>{lesson.title}</div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

