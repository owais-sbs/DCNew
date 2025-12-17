const days = [
  "Mon 15 Dec",
  "Tue 16 Dec",
  "Wed 17 Dec",
  "Thu 18 Dec",
  "Fri 19 Dec",
  "Sat 20 Dec",
  "Sun 21 Dec",
]

const hours = Array.from({ length: 9 }, (_, i) => i) // 0–8 rows (like image)

const lessons = [
  { dayIndex: 0, row: 1, title: "test", time: "1:30 - 2:30", color: "bg-red-500" },
]

export default function StudentCalendar() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>

      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-full border border-gray-200 grid place-items-center">←</button>
          <button className="h-9 w-9 rounded-full border border-gray-200 grid place-items-center">→</button>
          <button className="h-9 px-4 rounded-full border border-gray-200 text-sm">
            Today
          </button>
        </div>

        <div className="text-lg font-medium text-gray-900">
          Dec 15 – 21, 2025
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm">
          <button className="px-4 py-2 bg-white">Month</button>
          <button className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium">
            Week
          </button>
          <button className="px-4 py-2 bg-white">Day</button>
        </div>
      </div>

      {/* ================= CALENDAR ================= */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        {/* Days header */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200 text-sm font-medium text-gray-700">
          <div />
          {days.map((day) => (
            <div key={day} className="py-3 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">

          {/* Time column */}
          <div className="border-r border-gray-200">
            {hours.map((h) => (
              <div
                key={h}
                className="h-20 text-xs text-gray-500 flex items-start justify-center pt-2 border-b border-gray-100"
              >
                {h}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((_, dayIndex) => (
            <div
              key={dayIndex}
              className={`relative border-r border-gray-100 ${
                dayIndex === 2 ? "bg-amber-50" : "bg-white"
              }`}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-20 border-b border-dashed border-gray-200"
                />
              ))}

              {/* Events */}
              {lessons
                .filter((l) => l.dayIndex === dayIndex)
                .map((lesson, idx) => (
                  <div
                    key={idx}
                    className={`absolute left-2 right-2 top-[${lesson.row * 80}px] ${lesson.color}
                      text-white text-xs rounded-md p-2 shadow`}
                    style={{ top: lesson.row * 80 + 8 }}
                  >
                    <div className="font-semibold">{lesson.time}</div>
                    <div>{lesson.title}</div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
