// @ts-nocheck
import React, { useMemo, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Printer, ChevronDown, Loader2, MessageSquare, Copy, Plus, X } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import TeacherCalendar from "./TeacherCalendar"
import ClassesCalendar from "./ClassesCalendar"
import AddStudentForm from "./AddStudentForm"
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
  // new optional: full ISO start/end for day/week/month mapping
  isoStart?: string
  isoEnd?: string
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
const hours = [
  "0","1","2","3","4","5","6","7","8","9","10","11","12",
  "13","14","15","16","17","18","19","20","21","22","23"
]

// --- HELPERS ---
const getApiDateString = (date: Date): string => date.toISOString().split('T')[0];

const getEventTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' });
};

// new helpers for week/month rendering
const startOfWeek = (date: Date, weekStartsOn = 1) => { // weekStartsOn: 1 => Monday
  const d = new Date(date);
  const day = (d.getDay() + 7 - weekStartsOn) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0,0,0,0);
  return d;
};

const addDays = (d: Date, days: number) => {
  const t = new Date(d);
  t.setDate(t.getDate() + days);
  return t;
};

const getMonthMatrix = (date: Date) => {
  // returns array of Date for a typical month grid (6 rows x 7 cols)
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfWeek(first, 1); // start from Monday
  const matrix: Date[] = [];
  for (let i = 0; i < 42; i++) matrix.push(addDays(start, i));
  return matrix;
};

const eventsByDate = (events: Event[]) => {
  // key: yyyy-mm-dd => Event[]
  const map: Record<string, Event[]> = {};
  events.forEach(ev => {
    if (!ev.isoStart) return;
    const d = new Date(ev.isoStart);
    const key = d.toISOString().split('T')[0];
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  });
  return map;
}

// --- COMPONENT ---
export default function Calendar({ showTeacher = false }: { showTeacher?: boolean }) {
  const [tab, setTab] = useState(showTeacher ? "Teacher" : "Default")
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null) // selected event/session id -> opens modal

  // --- new state: view mode ---
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Day")

  // --- states reused from Dashboard modals ---
  const [sessionStudents, setSessionStudents] = useState<any[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)

  const [allStudents, setAllStudents] = useState<any[]>([])
  const [selectedToEnroll, setSelectedToEnroll] = useState<number[]>([])
  const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false)
  const [alreadyEnrolled, setAlreadyEnrolled] = useState<number[]>([])
  const [updatingStudent, setUpdatingStudent] = useState<number | null>(null)
  const [sessionClassId, setSessionClassId] = useState<number | null>(null)

  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)

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

  const fetchStudentCount = async (sessionId: number) => {
    try {
      const res = await axiosInstance.get(`/Class/GetStudentsForSession?scheduleId=${sessionId}`);
      if (res.data?.IsSuccess) return res.data.Data.length;
      return 0;
    } catch {
      return 0;
    }
  };

  // --- REFACTORED DATA FETCHING ---
  // Each function now just fetches and returns its data
  
  const fetchDayEvents = async (): Promise<Event[]> => {
    try {
      const dateString = getApiDateString(currentDate);
      const response = await axiosInstance.get<ApiResponse>(`/Class/GetTodaySessionFlatteneddate?date=${dateString}`);
      if (response.data && response.data.IsSuccess) {
        const transformedEvents = await Promise.all(
          response.data.Data.map(async (session, index) => {
            const colors = ["blue", "yellow", "red"] as const;
            const color = colors[index % colors.length];
            const studentCount = await fetchStudentCount(session.SessionId);
            return {
              id: session.SessionId.toString(),
              start: getEventTime(session.StartTime),
              end: getEventTime(session.EndTime),
              room: "N/A",
              color,
              title: session.ClassTitle,
              subtitle: session.ClassSubject || "No subject details",
              teacher: "N/A",
              students: studentCount,
              isoStart: session.StartTime,
              isoEnd: session.EndTime,
            };
          })
        );
        return transformedEvents;
      }
    } catch (error) {
      console.error("Error fetching day events:", error);
    }
    return [];
  };

  const fetchWeekEvents = async (): Promise<Event[]> => {
    const start = startOfWeek(currentDate, 1); // Monday
    const promises = [];

    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      const dateString = getApiDateString(d);
      promises.push(
        axiosInstance.get(`/Class/GetTodaySessionFlatteneddate?date=${dateString}`)
      );
    }

    let results: Event[] = [];
    try {
      const all = await Promise.all(promises);
      
      const colors = ["blue", "yellow", "red"] as const;
      let colorIndex = 0;

      for (let res of all) {
        if (res.data?.IsSuccess) {
          for (let session of res.data.Data) {
            const studentCount = await fetchStudentCount(session.SessionId);
            results.push({
              id: session.SessionId.toString(),
              start: getEventTime(session.StartTime),
              end: getEventTime(session.EndTime),
              room: "N/A",
              color: colors[colorIndex % colors.length], // Cycle colors
              title: session.ClassTitle,
              subtitle: session.ClassSubject || "No subject details",
              teacher: "N/A",
              students: studentCount,
              isoStart: session.StartTime,
              isoEnd: session.EndTime,
            });
            colorIndex++;
          }
        }
      }
    } catch (error) {
       console.error("Error fetching week events:", error);
    }
    return results;
  };

  const fetchMonthEvents = async (): Promise<Event[]> => {
    const matrix = getMonthMatrix(currentDate);
    const promises = [];

    matrix.forEach(date => {
      const dateString = getApiDateString(date);
      promises.push(
        axiosInstance.get(`/Class/GetTodaySessionFlatteneddate?date=${dateString}`)
      );
    });

    let results: Event[] = [];
    try {
      const all = await Promise.all(promises);
      
      const colors = ["blue", "yellow", "red"] as const;
      let colorIndex = 0;

      for (let res of all) {
        if (res.data?.IsSuccess) {
          for (let session of res.data.Data) {
            const studentCount = await fetchStudentCount(session.SessionId);
            results.push({
              id: session.SessionId.toString(),
              start: getEventTime(session.StartTime),
              end: getEventTime(session.EndTime),
              room: "N/A",
              color: colors[colorIndex % colors.length],
              title: session.ClassTitle,
              subtitle: session.ClassSubject || "No subject details",
              teacher: "N/A",
              students: studentCount,
              isoStart: session.StartTime,
              isoEnd: session.EndTime,
            });
            colorIndex++;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching month events:", error);
    }
    return results;
  };

  // --- NEW DATA FETCHING EFFECT ---
  // This effect now responds to viewMode changes
  useEffect(() => {
    const loadEvents = async () => {
      if (tab !== "Default" || showTeacher) return;
      
      setIsLoading(true);
      setEvents([]); // Clear old events
      
      try {
        let newEvents: Event[] = [];
        if (viewMode === "Day") {
          newEvents = await fetchDayEvents();
        } else if (viewMode === "Week") {
          newEvents = await fetchWeekEvents();
        } else if (viewMode === "Month") {
          newEvents = await fetchMonthEvents();
        }
        setEvents(newEvents);
      } catch (error) {
        console.error(`Error fetching ${viewMode} events:`, error);
        setEvents([]); // Ensure events are cleared on error
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [currentDate, tab, showTeacher, viewMode]); // <-- Added viewMode

  // --- Students / Enroll modal helpers (copied & adapted from Dashboard) ---
  const fetchStudents = async () => {
    if (!selected) return;
    try {
      setIsLoadingStudents(true);
      const response = await axiosInstance.get(`/Class/GetStudentsForSession?scheduleId=${selected}&date=${getApiDateString(currentDate)}`);
      if (response.data?.IsSuccess) {
        const mapped = response.data.Data.map((s: any) => ({
          id: s.StudentId,
          name: s.StudentName,
          status: s.AttendanceStatus,
          classId: s.ClassId,
          photo: s.Photo
        }));
        setSessionStudents(mapped);
      } else {
        setSessionStudents([]);
      }
    } catch (err) {
      console.error("Error fetching students.", err);
      setSessionStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      setIsLoadingAllStudents(true);
      const res = await axiosInstance.get("/Student/GetAll")
      const enrollRes = selected ? await axiosInstance.get(`/Class/GetStudentsForSession?scheduleId=${selected}`) : null

      if (res.data?.IsSuccess) {
        setAllStudents(res.data.Data)
      }

      if (enrollRes?.data?.IsSuccess) {
        const ids = enrollRes.data.Data.map((s: any) => s.StudentId)
        setAlreadyEnrolled(ids)
        // Get classId from the first student in the session (all students in a session belong to the same class)
        if(enrollRes.data.Data.length > 0 && enrollRes.data.Data[0].ClassId) {
          setSessionClassId(enrollRes.data.Data[0].ClassId)
        }
      }
    } catch (err) {
      console.log("Error fetching student list", err)
    } finally {
      setIsLoadingAllStudents(false)
    }
  }

  useEffect(() => {
    if (showEnrollModal) fetchAllStudents()
  }, [showEnrollModal, selected])

  useEffect(() => {
    if (!selected) return
    fetchStudents()
  }, [selected, currentDate])

  const enrollStudents = async () => {
    if (!selected || selectedToEnroll.length === 0) return

    const sessionId = selected

    try {
      const response = await axiosInstance.post(`/Class/EnrollStudentToClassInBulk`, selectedToEnroll, { params: { sessionId }})
      if (response.data?.IsSuccess) {
        setShowEnrollModal(false)
        setSelectedToEnroll([])
        fetchStudents()
        // Refetch event count for the main calendar
        const updatedEvents = events.map(ev => 
          ev.id === selected 
            ? { ...ev, students: ev.students + selectedToEnroll.length } 
            : ev
        );
        setEvents(updatedEvents);
      }
    } catch (err) {
      console.log("Error enrolling students", err)
      alert("Failed to enroll students")
    }
  }

  const markAttendance = async (classId: number, studentId: number, status: "Present" | "Absent" | "Late" | "Excused") => {
    try {
      setUpdatingStudent(studentId)
      const payload = {
        classId: classId,
        scheduleId: selected,
        studentId,
        date: getApiDateString(currentDate),
        attendanceStatus: status
      }
      const response = await axiosInstance.post("/Class/MarkAttendance", null, { params: payload })
      if (response.data.IsSuccess) {
        fetchStudents()
      }
    } catch (err) {
      console.log("Error marking attendance", err)
      alert("Failed to mark attendance")
    } finally {
      setUpdatingStudent(null)
    }
  }

  // --- UI helpers ---
  const handlePrevDay = () => {
    if (viewMode === "Day") {
      setCurrentDate(prev => { const d = new Date(prev); d.setDate(prev.getDate() - 1); return d; })
    } else if (viewMode === "Week") {
      setCurrentDate(prev => { const d = new Date(prev); d.setDate(prev.getDate() - 7); return d; })
    } else {
      // month
      setCurrentDate(prev => { const d = new Date(prev); d.setMonth(prev.getMonth() - 1); return d; })
    }
  }
  const handleNextDay = () => {
    if (viewMode === "Day") {
      setCurrentDate(prev => { const d = new Date(prev); d.setDate(prev.getDate() + 1); return d; })
    } else if (viewMode === "Week") {
      setCurrentDate(prev => { const d = new Date(prev); d.setDate(prev.getDate() + 7); return d; })
    } else {
      // month
      setCurrentDate(prev => { const d = new Date(prev); d.setMonth(prev.getMonth() + 1); return d; })
    }
  }
  const handleToday = () => setCurrentDate(new Date())
  const handleTabChange = (t: string) => {
    setTab(t)
    if (t === "Teacher") navigate("/calendar/teacher")
    else if (t === "Classroom") navigate("/calendar/classroom")
    else navigate("/calendar")
  }

  // Derived maps
  const eventsMap = useMemo(() => eventsByDate(events), [events]);

  // Week helpers
  const weekStart = useMemo(() => startOfWeek(currentDate, 1), [currentDate]);
  const weekDates = useMemo(() => Array.from({length:7}, (_,i) => addDays(weekStart, i)), [weekStart]);

  // Month matrix
  const monthMatrix = useMemo(() => getMonthMatrix(currentDate), [currentDate]);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="px-6 py-4">
        {/* Top header: title + Print Calendar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          <button className="inline-flex items-center gap-2 h-9 px-4  border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50">
            <Printer size={16} /> Print Calendar
          </button>
        </div>

        {/* Dotted separator */}
        <div className="mt-3 border-t border-dotted border-gray-300" />

        {/* Tabs + filter buttons in a single retro row */}
        <div className="mt-4 flex flex-wrap items-center gap-3 bg-white border border-gray-300 -sm px-3 py-2 ">
          {/* View tabs (Default / Teacher / Classroom) */}
          <div className="flex items-end gap-1">
            {["Default", "Teacher", "Classroom"].map((t) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`px-3 h-8 -t-md border text-sm ${
                  tab === t
                    ? "border-gray-400 border-b-white bg-white text-gray-900"
                    : "border-gray-300 bg-[#f5f5f5] text-gray-700 hover:bg-gray-200"
                }`}
                style={{ marginBottom: -1 }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Filter Bar – retro style, same row as tabs */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {["Student","Teacher","Class","Level","Subject","Classroom","Type"].map((f) => (
              <div key={f} className="relative">
                <button
                  onClick={() => { setQuery(""); setOpenFilter(o => o === f ? null : f)}}
                  className="h-9 px-3  border border-gray-300 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                  aria-expanded={openFilter === f}
                >
                  {f}: All <ChevronDown size={14} className="text-gray-500" />
                </button>
                {openFilter === f && (
                  <div className={`absolute z-50 mt-2 w-80 bg-white border border-gray-200 -2xl shadow-lg p-2 top-full ${f === 'Classroom' || f === 'Type' ? 'right-0' : 'left-0'}`}>
                    <input
                      autoFocus
                      className="w-full h-9 px-3 -lg border border-gray-200 mb-2 text-sm"
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

        {/* Navigation header row: arrows, Today, centered date, Month/Week/Day */}
        <div className=" border border-gray-300 -sm bg-white flex items-stretch">
          {/* Back / Forward / Today (left) */}
          <div className="flex items-stretch">
            <button
              onClick={handlePrevDay}
              className="h-8 w-8 grid place-items-center border-r border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextDay}
              className="h-8 w-8 grid place-items-center border-r border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={handleToday}
              className="h-8 px-3 border-r border-gray-300 text-gray-700 text-sm hover:bg-gray-100"
            >
              Today
            </button>
          </div>

          {/* Center date label */}
          <div className="flex-1 flex items-center justify-center text-sm font-semibold text-gray-800">
            {viewMode === "Day" && dayString}
            {viewMode === "Week" && (
              <>
                {weekStart.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}{" "}
                –{" "}
                {addDays(weekStart,6).toLocaleDateString("en-US", {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </>
            )}
            {viewMode === "Month" && (
              <>{currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</>
            )}
          </div>

          {/* View mode buttons (right) */}
          <div className="flex items-stretch">
            {(["Month","Week","Day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-4 h-8 text-sm font-medium border-l border-gray-300 ${
                  viewMode === v ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* ---------------- VIEWS ---------------- */}
        
        {/* Loading / No Events Common State */}
        {isLoading && (
          <div className="flex items-center justify-center h-96 bg-white border border-gray-200 -sm shadow-sm">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <div className="text-gray-500 text-sm ml-3">Loading events...</div>
          </div>
        )}

        {!isLoading && events.length === 0 && tab === "Default" && !showTeacher && (
          <div className="flex items-center justify-center h-96 bg-white border border-gray-200 -sm shadow-sm">
            <div className="text-gray-500 text-sm">No events scheduled for this {viewMode.toLowerCase()}.</div>
          </div>
        )}
        
        {/* DAY (unchanged) */}
        {viewMode === "Day" && !isLoading && events.length > 0 && tab === "Default" && !showTeacher && (
          <div className="bg-white border border-gray-200 -sm shadow-sm overflow-hidden">
            <div className="grid grid-cols-[60px_1fr]">
              <div className="bg-white">
                {hours.map((h) => (
                  <div key={h} className="h-16 border-t border-gray-200 text-xs text-gray-500 grid place-items-center">
                    {h}:00
                  </div>
                ))}
              </div>

              <div className="relative">
                {hours.map((h) => (
                  <div key={h} className="h-16 border-t border-gray-200" />
                ))}

                {events.map((ev, i) => {
                  const [startHour, startMinute] = ev.start.split(":").map(Number)
                  const [endHour, endMinute] = ev.end.split(":").map(Number)

                  const top = (startHour * 64) + (startMinute / 60) * 64
                  const startTotalMinutes = (startHour * 60) + startMinute
                  const endTotalMinutes = (endHour * 60) + endMinute
                  const durationInMinutes = endTotalMinutes - startTotalMinutes
                  const height = (durationInMinutes / 60) * 64
                  const left = i * 130 + 10 // Your original horizontal stacking logic

                  const color = ev.color === "red" ? "bg-red-500" : ev.color === "blue" ? "bg-blue-500" : "bg-yellow-400"

                  if (startHour < 0 || startHour > 23) return null

                  return (
                    <div
                      key={ev.id}
                      onMouseEnter={() => setHoverId(ev.id)}
                      onMouseLeave={() => setHoverId(null)}
                      onClick={() => setSelected(ev.id)} // open full modal on click
                      role="button"
                      tabIndex={0}
                      className={`absolute -sm text-white text-xs p-2 shadow-md transition-all ${color} cursor-pointer`}
                      style={{ top, left, height, width: 120 }}
                      onKeyDown={(e) => { if (e.key === "Enter") setSelected(ev.id) }}
                    >
                      <div className="font-semibold truncate">{ev.title}</div>
                      <div className="truncate">{ev.start} - {ev.end}</div>
                      <div className="truncate">{ev.room}</div>

                      {/* Hover Pop-up */}
                      {hoverId === ev.id && (
                        <div className="absolute left-full ml-2 top-0 w-60 bg-white text-gray-700 -sm border border-gray-200 shadow-lg p-3 z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`h-3 w-3 -full ${color}`} />
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

        {/* WEEK VIEW */}
        {viewMode === "Week" && !isLoading && events.length > 0 && tab === "Default" && !showTeacher && (
          <div className="bg-white border border-gray-200 -sm shadow-sm overflow-hidden">
            <div className="grid grid-cols-[60px_1fr]">
              <div className="bg-white">
                {/* Hour labels */}
                <div className="h-12 border-b border-gray-200" /> {/* Spacer for header */}
                {hours.map((h) => (
                  <div key={h} className="h-16 border-t border-gray-200 text-xs text-gray-500 grid place-items-center">
                    {h}:00
                  </div>
                ))}
              </div>

              <div className="relative">
                {/* Header row for week days */}
                <div className="grid grid-cols-7 sticky top-0 bg-white z-10 border-b border-gray-200">
                  {weekDates.map((d) => (
                    <div key={d.toISOString()} className="h-12 text-center text-gray-600 border-l border-gray-100 flex flex-col items-center justify-center">
                      <div className="text-sm font-medium">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                      <div className="text-xs text-gray-400">{d.getDate()}</div>
                    </div>
                  ))}
                </div>

                {/* Background grid */}
                <div className="absolute inset-0 top-12 grid grid-cols-7">
                  {/* Columns */}
                  {weekDates.map((d) => (
                    <div key={d.toISOString()} className="border-l border-gray-100">
                      {/* Hour rows */}
                      {hours.map((h) => (
                        <div key={h} className="h-16 border-t border-gray-100" />
                      ))}
                    </div>
                  ))}
                </div>


                {/* Place events: compute relative left/top per day */}
                {events.map((ev, idx) => {
                  if (!ev.isoStart) return null;
                  const evDate = new Date(ev.isoStart);
                  const dayKey = evDate.toISOString().split('T')[0];
                  // find index within weekDates
                  const dayIndex = weekDates.findIndex(d => d.toISOString().split('T')[0] === dayKey);
                  if (dayIndex === -1) return null;

                  const [startHour, startMinute] = ev.start.split(":").map(Number)
                  const [endHour, endMinute] = ev.end.split(":").map(Number)
                  const top = (startHour * 64) + (startMinute / 60) * 64
                  const startTotalMinutes = (startHour * 60) + startMinute
                  const endTotalMinutes = (endHour * 60) + endMinute
                  const durationInMinutes = endTotalMinutes - startTotalMinutes
                  const height = (durationInMinutes / 60) * 64

                  // Percentage-based positioning
                  const colWidthPercent = 100 / 7;
                  const color = ev.color === "red" ? "bg-red-500" : ev.color === "blue" ? "bg-blue-500" : "bg-yellow-400"

                  return (
                    <div
                      key={ev.id + "_" + idx}
                      onMouseEnter={() => setHoverId(ev.id)}
                      onMouseLeave={() => setHoverId(null)}
                      onClick={() => setSelected(ev.id)}
                      className={`absolute -sm text-white text-xs p-2 shadow-md transition-all ${color} cursor-pointer overflow-hidden`}
                      style={{ 
                        top: top + 48, // 48px for h-12 header
                        left: `calc(${dayIndex * colWidthPercent}% + 2px)`, 
                        width: `calc(${colWidthPercent}% - 4px)`, 
                        height, 
                        minHeight: '20px'
                      }}
                    >
                      <div className="font-semibold truncate">{ev.title}</div>
                      <div className="truncate">{ev.start} - {ev.end}</div>
                      
                      {/* *** NEW: Hover Pop-up for Week View *** */}
                      {hoverId === ev.id && (
                        <div className="absolute left-full ml-2 top-0 w-60 bg-white text-gray-700 -sm border border-gray-200 shadow-lg p-3 z-30">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`h-3 w-3 -full ${color}`} />
                            <div className="font-semibold text-blue-700">{ev.title}</div>
                          </div>
                          <div className="text-xs text-gray-500">{ev.subtitle}</div>
                          <div className="mt-2 space-y-1 text-sm">
                            <div>{ev.start} - {ev.end}</div>
                            {/* Show the event's specific day */}
                            <div>
                              {new Date(ev.isoStart).toLocaleDateString("en-US", { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
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

        {/* MONTH VIEW */}
        {viewMode === "Month" && !isLoading && events.length > 0 && tab === "Default" && !showTeacher && (
          <div className="bg-white border border-gray-200 -sm shadow-sm overflow-hidden p-4">
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-600 mb-2">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} className="text-center font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthMatrix.map((cellDate) => {
                const key = cellDate.toISOString().split('T')[0];
                const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
                const cellEvents = (eventsMap[key] || []).sort((a,b) => a.start.localeCompare(b.start));
                
                return (
                  <div 
                    key={key} 
                    className={`min-h-[100px] border -lg p-2 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}`}
                    onClick={() => {
                      setCurrentDate(cellDate);
                      setViewMode("Day");
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-sm font-semibold ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>{cellDate.getDate()}</div>
                    </div>
                    {isCurrentMonth && (
                      <div className="space-y-1 text-xs">
                        {cellEvents.slice(0,3).map(ev => (
                          <div 
                            key={ev.id} 
                            className="truncate text-[11px] bg-blue-50 text-blue-700 -sm px-2 py-0.5 cursor-pointer hover:bg-blue-100"
                            onClick={(e) => { e.stopPropagation(); setSelected(ev.id); }}
                          >
                            {ev.start} {ev.title}
                          </div>
                        ))}
                        {cellEvents.length > 3 && <div className="text-xs text-gray-500 mt-1 cursor-pointer hover:underline">+{cellEvents.length - 3} more</div>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TEACHER + CLASSROOM VIEWS */}
        {tab === "Teacher" && <TeacherCalendar />}
        {tab === "Classroom" && <ClassesCalendar />}

        {/* ---------- Lesson Details Modal (copied/adapted from Dashboard) ---------- */}
        {selected && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setSelected(null)}>
            {(() => {
              const ev = events.find(e => e.id === selected)
              if (!ev) return null
              
              const eventDayString = ev.isoStart ? new Date(ev.isoStart).toLocaleDateString("en-US", {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : dayString;

              return (
  <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" onClick={() => setSelected(null)}>
    <div className="w-full max-w-7xl h-[90vh] bg-[#f8fafc] -lg border border-gray-300 shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
      
      {/* 1. TOP HEADER (Dark Slate Style) */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-[#1e293b] border-b border-gray-200 text-white">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 -full bg-blue-600 text-white grid place-items-center text-sm font-bold border border-slate-700 shadow-sm">
            {ev.title.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-sm text-slate-200 mr-2 font-medium">{ev.title}</div>
          <div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">{ev.start} - {ev.end}</span>
              <span className="text-slate-400 font-normal text-sm">({ev.subtitle || ev.room})</span>
            </div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-tight">
              {eventDayString} <span className="text-slate-500">#{ev.id}</span> 📍 {ev.room}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setSelected(null)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. ACTIONS BAR (Light Gray Background) */}
      <div className="flex-shrink-0 px-6 py-2.5 bg-[#f1f5f9] border-b border-gray-300 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">
          Students <span className="ml-1 px-1.5 py-0.5 bg-slate-200  text-[11px] font-mono">{sessionStudents.length}</span>
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-3 h-8 -sm border border-gray-300 bg-white text-[11px] font-bold text-slate-700 hover:bg-gray-50 shadow-sm transition-all"
          >
            + Add students
          </button>

          <div className="w-px h-4 bg-gray-300 mx-1"></div>

          {["Attendance", "Behaviour", "Grade", "Message"].map((label) => (
            <button
              key={label}
              className="px-3 h-8 -sm border border-gray-300 bg-white text-[11px] font-bold text-slate-700 hover:bg-gray-50 flex items-center gap-1 shadow-sm"
            >
              {label}
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.44l3.71-4.21a.75.75 0 111.08 1.04l-4.25 4.83a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-0 overflow-hidden">
        {/* Main content - Scrollable */}
        <div className="p-6 overflow-y-auto bg-slate-50">
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isLoadingStudents ? (
                <div className="flex items-center justify-center h-40 col-span-full">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : sessionStudents.length === 0 ? (
                <div className="text-center text-slate-400 py-10 col-span-full border-2 border-dashed border-slate-200 ">
                  No students enrolled in this session.
                </div>
              ) : (
                sessionStudents.map((student) => (
                  <div key={student.id} className="bg-white border border-gray-200 -lg p-4 shadow-sm hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-4">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="h-11 w-11 -full object-cover border border-slate-200 shadow-inner"
                          onError={(e) => { const t = e.currentTarget; t.style.display = 'none' }}
                        />
                      ) : (
                        <div className="h-11 w-11 -full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shadow-inner">
                          {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 truncate">{student.name}</div>
                        
                        <div className="relative mt-2 group max-w-[240px]">
                          <button
                            className={`w-full h-8 -sm border text-[11px] font-bold uppercase tracking-tight transition-all
                              ${student.status === "Present" ? "bg-green-50 text-green-700 border-green-200"
                              : student.status === "Absent" ? "bg-red-50 text-red-700 border-red-200"
                              : student.status === "Late" ? "bg-amber-50 text-amber-700 border-amber-200"
                              : student.status === "Excused" ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                              : "bg-white text-slate-600 border-gray-300 hover:bg-slate-50 shadow-sm" }
                            `}
                            disabled={student.status === "Excused" || updatingStudent === student.id}
                          >
                            {updatingStudent === student.id ? (
                              <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                            ) : (
                              student.status ?? "Record Attendance"
                            )}
                          </button>

                          {student.status !== "Excused" && (
                            <div className="absolute inset-0 hidden group-hover:flex z-20 pointer-events-auto shadow-lg">
                              <div className="w-full h-8 border border-gray-400 bg-white overflow-hidden flex text-[10px] font-bold uppercase -sm">
                                <button className="flex-1 hover:bg-green-100 text-green-700" onClick={() => markAttendance(student.classId, student.id, "Present")}>Present</button>
                                <div className="w-px bg-gray-200" />
                                <button className="flex-1 hover:bg-red-100 text-red-700" onClick={() => markAttendance(student.classId, student.id, "Absent")}>Absent</button>
                                <div className="w-px bg-gray-200" />
                                <button className="flex-1 hover:bg-amber-100 text-amber-700" onClick={() => markAttendance(student.classId, student.id, "Late")}>Late</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button className="h-8 w-8 grid place-items-center -sm border border-gray-200 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="h-8 w-8 grid place-items-center -sm border border-gray-200 bg-white text-slate-400 hover:bg-slate-100 font-bold transition-all shadow-sm">⋯</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Prospects (0)</h3>
              <button onClick={() => navigate('/people/prospects/new')} className="px-3 h-8 -sm bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 shadow-sm">+ Add prospects</button>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Teacher notes</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/notes')} className="h-8 px-2 -sm border border-gray-200 bg-white hover:bg-slate-50 text-slate-400">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                <button onClick={() => navigate('/notes')} className="px-3 h-8 -sm bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 shadow-sm transition-all">+ Add teacher notes</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Student notes</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/notes')} className="h-8 px-2 -sm border border-gray-200 bg-white hover:bg-slate-50 text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                <button onClick={() => navigate('/notes')} className="px-3 h-8 -sm bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 shadow-sm transition-all">+ Add student notes</button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RIGHT SIDEBAR */}
        <aside className="border-l border-gray-300 bg-[#f8fafc] overflow-y-auto p-5">
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modify Lesson
              </div>
              <div className="space-y-1">
                {[
                  { label: "Teacher", icon: "🎓", path: "/people/teachers" },
                  { label: "Date & Time", icon: "📅", path: "/calendar" },
                  { label: "Cancel Lesson", icon: "❌", path: "/notes/classes" },
                  { label: "Location", icon: "📍", path: "/calendar/classroom" },
                  { label: "Class Details", icon: "📄", path: "/notes/class-details" }
                ].map((item) => (
                  <button key={item.label} onClick={() => navigate(item.path)} className="w-full h-9 px-3 -sm border border-gray-200 bg-white text-left text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-3 shadow-sm">
                    <span className="text-sm opacity-70 grayscale">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Management
              </div>
              <div className="space-y-1">
                {[
                  { label: "Add Students", icon: "👥", onClick: () => setShowEnrollModal(true) },
                  { label: "Add Prospects", icon: "👥", onClick: () => navigate('/people/prospects/new') },
                  { label: "Add Attachment", icon: "📎", onClick: () => navigate('/notes/class-details') },
                  { label: "Add Assignment", icon: "📋", onClick: () => navigate('/notes/class-details') },
                  { label: "Invite to Portal", icon: "➡️", onClick: () => navigate('/compose') },
                  { label: "Print Register", icon: "🖨️", onClick: () => navigate('/reports/attendance') }
                ].map((item) => (
                  <button key={item.label} onClick={item.onClick} className="w-full h-9 px-3 -sm border border-gray-200 bg-white text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm">
                    <span className="text-sm opacity-60">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
)
            })()}
          </div>
        )}

        {/* Enroll Student Modal */}
        {showEnrollModal && (
          <>
            {showEnrollModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowEnrollModal(false)}>
    <div
      className="bg-white -lg border border-gray-300 shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER - Dark Slate Style */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-[#1e293b] text-white -t-lg">
        <div className="flex items-center gap-3">
          <Plus size={18} className="text-blue-400" />
          <h2 className="text-base font-bold">Enroll Students</h2>
        </div>
        <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-5 overflow-y-auto flex-1 bg-white">
        <p className="text-slate-500 mb-5 text-[11px] font-bold uppercase tracking-widest border-l-2 border-blue-500 pl-3">
          Select the date and students to enroll in this class.
        </p>

        {/* DATE INPUTS - High Density */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 border border-slate-200 ">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Enrollment date *</label>
            <input 
              type="text" 
              defaultValue={new Date().toLocaleDateString('en-GB')} 
              className="w-full px-2 py-1.5 border border-gray-300  text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Unenrollment date (optional)</label>
            <input 
              type="text" 
              placeholder="Select date..." 
              className="w-full px-2 py-1.5 border border-gray-300  text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium" 
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 mb-5">
          <button className="h-8 px-3 text-blue-600 border border-blue-200  text-[11px] font-bold hover:bg-blue-50 inline-flex items-center gap-2 shadow-sm transition-colors">
            <Copy size={12} />
            Copy from class
          </button>
          <button 
            className="h-8 px-3 bg-blue-600 text-white  text-[11px] font-bold hover:bg-blue-700 inline-flex items-center gap-2 shadow-sm transition-colors" 
            onClick={() => setShowAddStudent(true)}
          >
            <Plus size={12} />
            Add new student
          </button>
        </div>

        {/* SELECTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Side: All Students */}
          <div className="flex flex-col">
            <h4 className="text-[10px] font-bold text-slate-700 mb-2 px-2 uppercase tracking-widest">All students</h4>
            <div className="border border-gray-300  bg-white h-72 overflow-y-auto shadow-inner p-1">
              {isLoadingAllStudents ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="animate-spin text-blue-500" size={28} />
                </div>
              ) : (
                allStudents.map((s: any) => {
                  const disabled = alreadyEnrolled.includes(s.Id);
                  const selectedFlag = selectedToEnroll.includes(s.Id);
                  return (
                    <div
                      key={s.Id}
                      onClick={() => !disabled && setSelectedToEnroll(prev =>
                        prev.includes(s.Id) ? prev.filter(id => id !== s.Id) : [...prev, s.Id]
                      )}
                      className={`px-3 py-2 text-[11px] border-b border-slate-50 flex justify-between items-center cursor-pointer transition-colors
                        ${ disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" : 
                           selectedFlag ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-600 font-medium" }`}
                    >
                      <span className="flex items-center gap-2">
                        <div className={`w-3 h-3 border -sm flex items-center justify-center ${selectedFlag ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                           {selectedFlag && <div className="w-1.5 h-1.5 bg-white -full"></div>}
                        </div>
                        {s.FirstName} {s.Surname}
                      </span>
                      {disabled && <span className="text-[9px] font-bold bg-slate-200 px-1  uppercase tracking-tighter">Enrolled</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side: Selected Students */}
          <div className="flex flex-col">
            <h4 className="text-[10px] font-bold text-slate-700 mb-2 px-2 uppercase tracking-widest flex justify-between">
              <span>Selected students</span>
              <span className="text-blue-600 font-mono">{selectedToEnroll.length}</span>
            </h4>
            <div className="border border-gray-300  bg-white h-72 overflow-y-auto shadow-inner p-1">
              {selectedToEnroll.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-300 text-xs italic opacity-60">No students selected</div>
              ) : (
                selectedToEnroll.map((id) => {
                  const student = allStudents.find((s) => s.Id === id);
                  return (
                    <div key={id} className="px-3 py-2 flex justify-between items-center bg-white border-b border-slate-50 text-[11px] hover:bg-slate-50">
                      <span className="font-bold text-slate-700">{student?.FirstName} {student?.Surname}</span>
                      <button 
                        className="text-red-500 font-bold hover:underline uppercase text-[9px] tracking-tighter" 
                        onClick={() => setSelectedToEnroll(prev => prev.filter(x => x !== id))}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-3 font-medium italic">Use shift and control keys to select multiple students</p>
      </div>

      {/* FOOTER - Light Gray Style */}
      <div className="flex-shrink-0 flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-[#f1f5f9] -b-lg">
        <button 
          onClick={() => { setShowEnrollModal(false); setSelectedToEnroll([]) }} 
          className="px-4 h-8  border border-gray-300 bg-white text-slate-600 text-[11px] font-bold hover:bg-gray-50 shadow-sm transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={enrollStudents} 
          className="px-5 h-8  bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 shadow-sm transition-all"
        >
          Save changes
        </button>
      </div>
    </div>
  </div>
)}

            {showAddStudent && <AddStudentForm isOpen={showAddStudent} onClose={() => setShowAddStudent(false)} onStudentAdded={fetchAllStudents} />}
          </>
        )}
      </div>
    </div>
  )
}