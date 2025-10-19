import { useState } from "react"
import { ChevronDown } from "lucide-react"

type TeacherEvent = {
  id: string
  teacher: string
  color: "red" | "yellow" | "blue"
  subject: string
  time: string
  room: string
  students: number
}

const teacherEvents: TeacherEvent[] = [
  { id: "t1", teacher: "Oriana Teacher", color: "yellow", subject: "Beginner AM", time: "09:00 - 11:00", room: "Room 1", students: 16 },
  { id: "t2", teacher: "Maeve Teacher", color: "red", subject: "Intermediate AM", time: "09:00 - 11:00", room: "Room 10", students: 12 },
  { id: "t3", teacher: "Kurtys Teacher", color: "blue", subject: "Advanced", time: "10:45 - 12:15", room: "France", students: 9 },
  { id: "t4", teacher: "Saba Teacher", color: "red", subject: "PM Part 2", time: "13:00 - 15:00", room: "Room 3", students: 10 },
  { id: "t5", teacher: "Sara Teacher", color: "yellow", subject: "PM 1", time: "11:15 - 13:15", room: "Room 4", students: 11 },
  { id: "t6", teacher: "Isabela Teacher", color: "blue", subject: "Conversation", time: "14:00 - 16:00", room: "Room 8", students: 13 },
]

const teacherList = [
  "Abbey Teacher", "Adao Lopes Teacher", "Ane 1", "Anne Smiddy Elisabeth",
  "Aoife Sinead Buckley", "Ava Collopy", "Beni Teacher", "Carla Kerr",
  "Cathrine Teacher", "Colm Delmar1", "Conor O'Riordan", "Daiana Teacher",
  "David Teacher", "Diana Cruz", "Dimitrina Teacher", "Dimitro Teacher",
  "Dmytro Olgin Teacher", "Edmund Patrick Teacher", "Eloisa Teacher", "Isabela Teacher",
  "Ivan Curcic Teacher", "Jhonatan Teacher", "Kate Kate", "Kinga Teacher",
  "Kurtys Teacher", "Lucimara De Souza Mendes", "Maeve Catherine Finnegan",
  "Maeve Teacher", "Marta Guinovart - Ferre", "NATALIA GONZÁLEZ RODRÍGUEZ",
  "Olga Teacher", "Oriana Teacher", "Oscar Teacher", "Penny Teacher",
  "Saba Teacher", "Sara Lagarto Teacher", "Sarah Teacher", "Sophie Teacher",
  "Stefan Teacher", "Victoria Teacher", "Walid Teacher"
]

export default function TeacherCalendar() {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"day" | "day2">("day")

  const filteredEvents = selectedTeacher
    ? teacherEvents.filter(ev => ev.teacher === selectedTeacher)
    : teacherEvents

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mt-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Teacher Calendar</h2>
        <div className="flex gap-2">
          {["Level", "Classroom", "Type"].map((f) => (
            <button
              key={f}
              className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
            >
              {f}: All <ChevronDown size={14} className="text-gray-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Teacher List */}
      <div className="overflow-x-auto pb-3 mb-4 border-b border-gray-200">
        <div className="flex gap-2 min-w-max">
          {teacherList.map((teacher) => (
            <button
              key={teacher}
              onClick={() =>
                setSelectedTeacher((prev) =>
                  prev === teacher ? null : teacher
                )
              }
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                selectedTeacher === teacher
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-100 hover:bg-indigo-100 text-gray-700 border-gray-200"
              }`}
            >
              {teacher}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Calendar Tabs (Day / Day 2) ---- */}
      <div className="flex justify-end items-center gap-2 mb-5">
        {["day", "day2"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveView(tab as "day" | "day2")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              activeView === tab
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-gray-100 hover:bg-indigo-100 border-gray-200 text-gray-700"
            }`}
          >
            {tab === "day" ? "Day" : "Day 2"}
          </button>
        ))}
      </div>

      {/* ---- Calendar Grid (like ClassesCalendar) ---- */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-8 text-sm font-medium bg-gray-50 border-b border-gray-200">
          <div className="p-2 text-center">Time</div>
          {["Room 1", "Room 2", "Room 3", "Room 4", "Room 5", "Room 6", "Online"].map((col) => (
            <div key={col} className="p-2 text-center">{col}</div>
          ))}
        </div>

        {/* Time Rows */}
        {[
          "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
          "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
        ].map((time) => (
          <div key={time} className="grid grid-cols-8 text-xs border-b border-gray-100 hover:bg-gray-50 transition">
            <div className="p-2 font-medium text-gray-600 bg-gray-50">{time}</div>
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="p-2 h-10 border-l border-gray-100 relative">
                {/* Example Lesson Blocks */}
                {filteredEvents.map((ev) => {
                  const isThisSlot = ev.time.includes(time.slice(0, 2))
                  if (!isThisSlot) return null
                  const bgColor =
                    ev.color === "red"
                      ? "bg-red-500"
                      : ev.color === "yellow"
                      ? "bg-yellow-400"
                      : "bg-blue-500"

                  return (
                    <div
                      key={ev.id + time}
                      className={`${bgColor} absolute inset-1 rounded-md text-white text-[11px] flex items-center justify-center shadow-sm hover:scale-[1.02] transition-transform`}
                    >
                      {ev.teacher}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No events found for the selected teacher.
        </div>
      )}
    </div>
  )
}
