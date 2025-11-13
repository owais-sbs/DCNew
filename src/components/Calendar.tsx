import { useMemo, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Printer, ChevronDown } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import TeacherCalendar from "./TeacherCalendar"
import ClassesCalendar from "./ClassesCalendar"
import axiosInstance from './axiosInstance'; 

// --- TYPE DEFINITIONS ---
type Event = {
  id: string
  start: string // "HH:mm"
  end: string   // "HH:mm"
  room: string
  color: "red" | "yellow" | "blue"
  title: string
  subtitle: string
  teacher: string
  students: number
}

type ApiSession = {
  ClassId: number;
  SessionId: number;
  ClassTitle: string;
  ClassSubject: string;
  StartTime: string; // ISO 8601 string
  EndTime: string;   // ISO 8601 string
  DayOfWeek: string;
};

type ApiResponse = {
  IsSuccess: boolean;
  Data: ApiSession[];
};


// --- CONFIGURATION ---
// A 24-hour clock runs from 0 (midnight) to 23 (11 PM).
const hours = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
  "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"
]

// --- HELPER FUNCTIONS ---
/**
 * Formats a Date object into "YYYY-MM-DD" for the API query.
 */
const getApiDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Formats an ISO 8601 string into "HH:mm" (24-hour) format.
 */
const getEventTime = (isoString: string): string => {
  const date = new Date(isoString);
  // Using 'en-GB' locale is a common way to get "HH:mm" format
  return date.toLocaleTimeString("en-GB", {
    hour: '2-digit',
    minute: '2-digit'
  });
};


// --- COMPONENT ---
export default function Calendar({ showTeacher = false }: { showTeacher?: boolean }) {
  const [tab, setTab] = useState(showTeacher ? "Teacher" : "Default")
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  
  const navigate = useNavigate()
  const location = useLocation()

  const dayString = useMemo(() => {
     return currentDate.toLocaleDateString("en-US", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  }, [currentDate])

  const datasets: Record<string, string[]> = {
     Student: [ "Abdurrakhim Umirbyek", "Abraham Emmanuel Acosta Garcia" ],
     Teacher: [ "Abbey teacher", "Adao Lopes Teacher" ],
     Class: [ "AM B1 WALID/ABBEY", "Advanced_AM_DCE1_PART 1" ],
     Level: ["P2", "B1", "C1", "A1", "B2", "A2(2) pm", "A1(2) pm"],
     Subject: ["General English with Exam Preparation"],
     Classroom: [ "Class 1", "Cork", "France" ],
     Type: ["Academic", "Non Academic"]
  }

  // --- DATA FETCHING EFFECT ---
  useEffect(() => {
    // Only fetch data if the main "Default" tab is active
    if (tab !== "Default" || showTeacher) return;

    const fetchEvents = async () => {
      setIsLoading(true);
      setEvents([]); // Clear old events
      try {
        const dateString = getApiDateString(currentDate);
        
        // This line correctly sends the selected date to the API
        const response = await axiosInstance.get<ApiResponse>(
          `/Class/GetTodaySessionFlatteneddate?date=${dateString}`
        );

        if (response.data && response.data.IsSuccess) {
          // Transform API data to the 'Event' type required by the UI
          const transformedEvents = response.data.Data.map((session: ApiSession, index: number): Event => {
            
            const colors: ("red" | "yellow" | "blue")[] = ["blue", "yellow", "red"];
            const color = colors[index % colors.length];

            return {
              id: session.SessionId.toString(),
              start: getEventTime(session.StartTime),
              end: getEventTime(session.EndTime),
              room: "N/A", // This info is not in the API response
              color: color,
              title: session.ClassTitle,
              subtitle: session.ClassSubject || "No subject details",
              teacher: "N/A", // This info is not in the API response
              students: 0, // This info is not in the API response
            };
          });

          setEvents(transformedEvents);
        } else {
          console.error("API request failed:", response.data);
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // This effect runs every time 'currentDate' or 'tab' changes
    fetchEvents();
  }, [currentDate, tab, showTeacher]); 


  // --- EVENT HANDLERS ---
  const handlePrevDay = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleTabChange = (t: string) => {
    setTab(t)
    if (t === "Teacher") navigate("/calendar/teacher")
    else if (t === "Classroom") navigate("/calendar/classroom")
    else navigate("/calendar")
  }

  // --- JSX RENDER ---
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="px-6 py-4">

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-3 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
          {["Default", "Teacher", "Classroom"].map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-4 h-10 rounded-xl text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-blue-50 text-blue-600 border border-blue-300 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 border border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
          <button className="ml-auto flex items-center gap-2 px-4 h-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
            <Printer size={16} /> Print
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm mb-3">
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevDay}
              className="h-10 w-10 grid place-items-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600">
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={handleNextDay}
              className="h-10 w-10 grid place-items-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600">
              <ChevronRight size={18} />
            </button>
            <button 
              onClick={handleToday}
              className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-100">
              Today
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {["Student", "Teacher", "Class", "Level", "Subject", "Classroom", "Type"].map((f) => (
              <div key={f} className="relative">
                <button
                  onClick={() => {
                    setQuery("")
                    setOpenFilter((o) => (o === f ? null : f))
                  }}
                  className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                  aria-expanded={openFilter === f}
                >
                  {f}: All <ChevronDown size={14} className="text-gray-500" />
                </button>
                {openFilter === f && (
                  <div className={`absolute z-50 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 top-full ${f === 'Classroom' || f === 'Type' ? 'right-0' : 'left-0'}`}>
                     <input
                       autoFocus
                       className="w-full h-9 px-3 rounded-lg border border-gray-200 mb-2 text-sm"
                       placeholder=""
                       value={query}
                       onChange={(e) => setQuery(e.target.value)}
                     />
                     <div className="text-xs text-gray-500 px-2 py-1">All</div>
                     <div className="max-h-72 overflow-auto">
                       {(query ? (datasets[f] || []).filter((x) => x.toLowerCase().includes(query.toLowerCase())) : (datasets[f] || [])).map((it) => (
                         <div key={it} className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={() => setOpenFilter(null)}>
                           {it}
                         </div>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* View Buttons */}
        <div className="flex justify-end mb-3">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {(["Month", "Week", "Day"] as const).map((v) => (
                    <button
                        key={v}
                        className={`px-4 h-10 text-sm font-medium ${
                            v === "Day"
                                ? "bg-indigo-600 text-white"
                                : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
        </div>

        {/* Date Header */}
        <div className="text-center mb-1 text-xl font-semibold text-gray-800 -mt-2">
          {dayString}
        </div>

        {/* DEFAULT CALENDAR GRID */}
        {tab === "Default" && !showTeacher && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-[60px_1fr]">
              
              {/* Time Column (0-23) */}
              <div className="bg-white">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="h-16 border-t border-gray-200 text-xs text-gray-500 grid place-items-center"
                  >
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Events */}
              <div className="relative">
                {/* Grid lines (0-23) */}
                {hours.map((h) => (
                  <div key={h} className="h-16 border-t border-gray-200" />
                ))}

                {/* Loading State */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                    <div className="text-gray-500 text-sm">Loading events...</div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && events.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-gray-500 text-sm">No events scheduled for this day.</div>
                  </div>
                )}

                {/* Event Mapping */}
                {events.map((ev, i) => {
                  const startHour = parseInt(ev.start.split(":")[0])
                  const startMinute = parseInt(ev.start.split(":")[1])
                  const endHour = parseInt(ev.end.split(":")[0])
                  const endMinute = parseInt(ev.end.split(":")[1])

                  // This calculation is now correct for the 0-23 grid
                  const top = (startHour * 64) + (startMinute / 60) * 64
                  
                  const startTotalMinutes = (startHour * 60) + startMinute
                  const endTotalMinutes = (endHour * 60) + endMinute
                  const durationInMinutes = endTotalMinutes - startTotalMinutes
                  const height = (durationInMinutes / 60) * 64

                  const left = i * 130 + 10
                  
                  const color =
                    ev.color === "red"
                      ? "bg-red-500"
                      : ev.color === "blue"
                      ? "bg-blue-500"
                      : "bg-yellow-400"

                  // Filter for events outside the 0-23 range
                  if (startHour < 0 || startHour > 23) {
                     return null; 
                  }

                  return (
                    <div
                      key={ev.id}
                      onMouseEnter={() => setHoverId(ev.id)}
                      onMouseLeave={() => setHoverId(null)}
                      className={`absolute rounded-md text-white text-xs p-2 shadow-md transition-all ${color}`}
                      style={{ top, left, height, width: 120 }}
                    >
                      <div className="font-semibold truncate">{ev.title}</div>
                      <div className="truncate">{ev.start} - {ev.end}</div>
                      <div className="truncate">{ev.room}</div>

                      {/* Hover Pop-up */}
                      {hoverId === ev.id && (
                        <div className="absolute left-full ml-2 top-0 w-60 bg-white text-gray-700 rounded-xl border border-gray-200 shadow-lg p-3 z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`h-3 w-3 rounded-full ${color}`} />
                            <div className="font-semibold text-blue-700">{ev.title}</div>
                          </div>
                          <div className="text-xs text-gray-500">{ev.subtitle}</div>
                          <div className="mt-2 space-y-1 text-sm">
                            <div>{ev.start} - {ev.end}</div>
                            <div>{dayString}</div>
                            <div>Room: {ev.room}</div>
                            <div className="text-blue-600">{ev.teacher}</div>
                            <div className="text-blue-600">{ev.students} students</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TEACHER + CLASSROOM VIEWS */}
        {tab === "Teacher" && <TeacherCalendar />}
        {tab === "Classroom" && <ClassesCalendar />}
      </div>
    </div>
  )
}