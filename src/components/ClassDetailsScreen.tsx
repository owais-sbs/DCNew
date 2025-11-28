import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "./axiosInstance";
import UnenrollStudentModal from "./UnenrollStudentModal";
import AddStudentForm from "./AddStudentForm";
import SessionDetailsModal from "./SessionDetailsModal";
import {
  Edit,
  MessageSquare,
  Printer,
  MoreHorizontal,
  ChevronDown,
  Calendar,
  DollarSign,
  GraduationCap,
  MapPin,
  BookOpen,
  Clock,
  Users,
  Plus,
  Eye,
  Download,
  Copy,
  FileText,
  Paperclip,
  CheckSquare,
  FormInput,
  Award,
  Info,
  X,
  Loader2,
  Star,
  Flag,
  StickyNote,
  Users2,
} from "lucide-react";

const tabs = [
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "students", label: "Students", icon: Users },
];

export default function ClassDetailsScreen() {
  const { id } = useParams(); // id from URL (string)
  const [activeTab, setActiveTab] = useState("lessons");
  const [classInfo, setClassInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchClass = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/Class/GetClassById`, {
          params: { classId: Number(id) },
        });
        if (response?.data?.IsSuccess) {
          setClassInfo(response.data.Data);
        } else {
          console.error("API returned error", response.data);
        }
      } catch (err) {
        console.error("Error loading class:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatSchedule = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) return "No schedule";
    const scheduleText = sessions
      .map((s) => {
        const day = s.DayOfWeek || "";
        const startTime = s.StartTime
          ? new Date(s.StartTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        const endTime = s.EndTime
          ? new Date(s.EndTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        return `${day} (${startTime}-${endTime})`;
      })
      .join(", ");
    return scheduleText;
  };

  const formatRepeats = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "";
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `Repeats weekly from ${start} to ${end}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "lessons":
        return (
          <LessonsContent
            classId={id!}
            sessionsFromParent={classInfo?.Sessions}
          />
        );
      case "students":
        return <StudentsContent />;
      default:
        return <LessonsContent classId={id!} />;
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-6 flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="px-6 py-6 text-center text-gray-600">
        Class not found
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-6">
        {/* Class Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${classInfo.IsActive ? "bg-green-500" : "bg-red-500"}`}></div>
              <h1 className="text-2xl font-bold text-gray-800">
                {classInfo.ClassTitle || "Untitled Class"}
              </h1>
              <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
                <ChevronDown className="h-3 w-3" />
              </button>
              <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print
                <ChevronDown className="h-3 w-3" />
              </button>
              <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <MoreHorizontal className="h-4 w-4" />
                More
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            {classInfo.ClassDescription || `${classInfo.ClassSubject || ""}${classInfo.ClassLevel ? `, ${classInfo.ClassLevel}` : ""}`.trim() || "No description"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Class code:</span>
              <span className="text-sm font-medium">{classInfo.ClassId || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Subject:</span>
              <span className="text-sm font-medium">
                {classInfo.ClassSubject || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Schedule:</span>
              <span className="text-sm font-medium">
                {formatSchedule(classInfo.Sessions || [])}
              </span>
              <Edit className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-sm font-medium">
                {classInfo.TeacherHourlyFees ? `€${classInfo.TeacherHourlyFees}/hr` : "No fee"}
              </span>
              <Edit className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Teacher:</span>
              <span className="text-sm font-medium text-blue-600 cursor-pointer">
                Teacher ID: {classInfo.TeacherId || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Level:</span>
              <span className="text-sm font-medium">{classInfo.ClassLevel || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Start date:</span>
              <span className="text-sm font-medium">
                {classInfo.StartDate ? formatDate(classInfo.StartDate) : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">End date:</span>
              <span className="text-sm font-medium">
                {classInfo.EndDate ? formatDate(classInfo.EndDate) : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm font-medium">
                {classInfo.IsActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {classInfo.StartDate && classInfo.EndDate && (
            <p className="text-xs text-gray-500 mb-2">
              {formatRepeats(classInfo.StartDate, classInfo.EndDate)}
            </p>
          )}
        </div>

        {/* Tabs - underline style */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative -mb-px px-1 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </span>
                <span
                  className={`absolute left-0 right-0 bottom-0 h-[2px] ${
                    isActive ? "bg-blue-600" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}

// Individual tab content components
function LessonsContent({
  classId,
  sessionsFromParent,
}: {
  classId: string;
  sessionsFromParent?: any[];
}) {
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [studentsInSession, setStudentsInSession] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [updatingStudent, setUpdatingStudent] = useState<number | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
  const [scheduledId, setScheduledId] = useState<number | null>(null);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // yyyy-mm-dd
  });
  
  const { id } = useParams();

  console.log(id)
  const navigate = useNavigate();


  

  useEffect(() => {
    if (!id) return;
    const fetchClass = async () => {
      try {
        const response = await axiosInstance.get(`/Class/GetClassById`, {
          params: { classId: Number(id) },
        });
        if (response?.data?.IsSuccess) {
          setClassInfo(response.data.Data);
        } else {
          console.error("API returned error", response.data);
        }
      } catch (err) {
        console.error("Error loading class:", err);
      }
    };
    fetchClass();
    fetchLessons();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      return "12:00 AM";
    }
  };

  const calculateDuration = (startString: string, endString: string): string => {
    try {
      const start = new Date(startString).getTime();
      const end = new Date(endString).getTime();
      const diffMs = end - start;
      if (diffMs <= 0) return "N/A";

      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0) {
        return `${hours} hr${hours > 1 ? "s" : ""}${
          minutes > 0 ? ` ${minutes} min${minutes > 1 ? "s" : ""}` : ""
        }`;
      }
      return `${minutes} min${minutes > 1 ? "s" : ""}`;
    } catch (e) {
      return "N/A";
    }
  };

  const ProgressBar = ({ green, red, gray }: { green: number; red: number; gray: number }) => {
    const total = green + red + gray || 1;
    const g = (green / total) * 100;
    const r = (red / total) * 100;
    const gr = 100 - g - r;
    return (
      <div className="h-3 w-48 rounded-full bg-gray-200 overflow-hidden flex text-xs relative">
        {green > 0 && (
          <div className="h-full flex items-center justify-center text-white font-semibold" style={{ width: `${g}%`, backgroundColor: "#2f9c6a", minWidth: green > 0 ? '20px' : '0' }}>
            {green}
          </div>
        )}
        {red > 0 && (
          <div className="h-full flex items-center justify-center text-white font-semibold" style={{ width: `${r}%`, backgroundColor: "#ef5a66", minWidth: red > 0 ? '20px' : '0' }}>
            {red}
          </div>
        )}
        {gr > 0 && (
          <div className="h-full bg-gray-300" style={{ width: `${gr}%` }} />
        )}
      </div>
    );
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/Class/GetSessionsForClass`, {
        params: { classId: Number(id) },
      });

      if (res.data?.IsSuccess && Array.isArray(res.data.Data)) {
        const mapped = res.data.Data.map((s: any) => ({
          scheduleId: s.ScheduleId,
          time: formatTime(s.StartTime),
          duration: calculateDuration(s.StartTime, s.EndTime),
          className: s.ClassTitle,
          subject: s.ClassSubject,
          classroom: s.ClassRoomName || s.DayOfWeek,
          location: s.ClassRoomName || s.DayOfWeek,
          teacherNames: s.TeacherNames || [],
          totalStudents: s.TotalStudents || 0,
          presentCount: s.PresentCount || 0,
          absentCount: s.AbsentCount || 0,
        }));

        setLessons(mapped);
      } else {
        console.error("API returned bad structure:", res.data);
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForSession = async (scheduleId: number) => {
    try {
      setLoadingStudents(true);

      const response = await axiosInstance.get(
        `/Class/GetStudentsForSession?scheduleId=${scheduleId}&date=${currentDate}`
      );

      if (response.data?.IsSuccess) {
        const mapped = response.data.Data.map((s: any) => ({
          id: s.StudentId,
          name: s.StudentName,
          status: s.AttendanceStatus,
          classId: s.ClassId,
        }));

        setStudentsInSession(mapped);
      }
    } catch (err) {
      console.log("Error fetching students for sesssion:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedLessonIdx !== null) {
      const selectedLesson = lessons[selectedLessonIdx];
      setScheduledId(selectedLesson.scheduleId);
      if (selectedLesson?.scheduleId) {
        fetchStudentsForSession(selectedLesson.scheduleId);
      }
    }
  }, [selectedLessonIdx, showEnrollModal!]);

  const markAttendance = async (
    classId: number,
    studentId: number,
    status: "Present" | "Absent" | "Late" | "Excused" | "None"
  ) => {
    try {
      setUpdatingStudent(studentId);

      const payload = {
        classId: classId,
        scheduleId: scheduledId,
        studentId,
        date: currentDate,
        attendanceStatus: status,
      };

      const response = await axiosInstance.post("/Class/MarkAttendance", null, {
        params: payload,
      });
      if (response.data.IsSuccess) {
        fetchStudentsForSession(scheduledId!);
      }
    } catch (err) {
      console.log("Error marking attendance", err);
      alert("Failed to mark attnedance");
    } finally {
      setUpdatingStudent(null);
    }
  };

  // const fetchLessons = async () => {
  //   try {
  //     const response = await axiosInstance.get(`/Class/GetClassById`, {
  //       params: { classId }  // <-- correct API parameter
  //     });

  //     // ✅ map backend model to your UI format
  //     const formatted = (response.data.lessons || []).map((item: any) => ({
  //       date: item.date,                       // e.g., "17-10-2025"
  //       weekday: item.weekday,                 // e.g., "Fri"
  //       time: `${item.startTime} - ${item.endTime}`,
  //       room: item.classroom,
  //       teacher: {
  //         name: item.teacherName,
  //         initials: typeof item.teacherName === "string"
  //           ? item.teacherName.split(" ").map((n: any[]) => n?.[0] ?? "").join("")
  //           : ""
  //       },
  //       students: item.studentsCount ?? 0
  //     }));

  //     setLessons(formatted);
  //   } catch (error) {
  //     console.error("Error fetching lessons:", error);
  //   }
  // };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Lessons</h2>
          <p className="text-gray-600">
            View and manage lessons for this class
          </p>
        </div>
        <button
          onClick={() => setShowAddLessonModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add lesson
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>Date: Most relevant</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>Sort: Ascending</option>
        </select>
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <Clock className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {lessons.map((l, i) => (
          <article
            key={i}
            onClick={() => setSelectedLessonIdx(i)}
            className="group cursor-pointer bg-white border-t border-r border-b border-white border-l-2 border-l-red-500 rounded-xl transition-transform duration-150 flex items-center hover:shadow-sm"
          >
            <div className="py-2 px-3 grid grid-cols-[75px_1fr_auto] gap-3 items-center w-full">
              {/* Left: Time and Duration */}
              <div>
                <div className="text-gray-900 font-semibold text-base">{l.time}</div>
                <div className="text-xs text-gray-500 mt-0.5">{l.duration}</div>
              </div>

              {/* Middle: Class Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold text-sm">{l.className}</span>
                  {l.subject && <span className="text-xs text-gray-500">({l.subject})</span>}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin size={12} />
                  <span>{l.classroom}</span>
                </div>
              </div>

              {/* Right: Icons, Teacher, and Progress Bar */}
              <div className="flex flex-col items-end gap-1.5">
                {/* Top row: Stats icons */}
                <div className="flex items-center gap-2.5 text-gray-600">
                  <div className="flex items-center gap-1 text-xs">
                    <Users2 size={14} className="text-gray-500" />
                    {l.totalStudents}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Plus size={14} className="text-gray-500" />
                    0
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Copy size={14} className="text-gray-500" />
                    0
                  </div>
                </div>

                {/* Middle row: Teacher */}
                {l.teacherNames.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-700 truncate max-w-[120px]">
                      {l.teacherNames.join(", ")}
                    </div>
                    <div className="h-7 w-7 rounded-full grid place-items-center text-white text-[10px] font-semibold bg-blue-500 flex-shrink-0">
                      {l.teacherNames[0].split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Bottom row: More Stats and Progress Bar */}
                <div className="flex items-center gap-2.5 text-gray-600">
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={14} className="text-gray-500" />
                    0
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Flag size={14} className="text-gray-500" />
                    0
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <StickyNote size={14} className="text-gray-500" />
                    0
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar 
                      green={l.presentCount} 
                      red={l.absentCount} 
                      gray={l.totalStudents - l.presentCount - l.absentCount} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showAddLessonModal && (
        <AddLessonModal
          classId={classId}
          onClose={() => setShowAddLessonModal(false)}
          onSuccess={() => {
            setShowAddLessonModal(false);
            fetchLessons();
          }}
        />
      )}

      {selectedLessonIdx !== null && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
          onClick={() => setSelectedLessonIdx(null)}
        >
          <div
            className="w-full max-w-7xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {lessons[selectedLessonIdx].date} •{" "}
                  {lessons[selectedLessonIdx].room}
                </div>
                <div className="text-sm text-gray-600">
                  {lessons[selectedLessonIdx].weekday},{" "}
                  {lessons[selectedLessonIdx].time}
                </div>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedLessonIdx(null)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-0">
              {/* Main content: Students grid */}
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Students 9
                  </h3>
                  <div className="flex items-center gap-2">
                    {["Attendance", "Behaviour", "Grade", "Message"].map(
                      (label) => (
                        <button
                          key={label}
                          className="px-3 h-8 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
                        >
                          {label}
                          <svg
                            className="w-4 h-4 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.44l3.71-4.21a.75.75 0 111.08 1.04l-4.25 4.83a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Students {studentsInSession.length}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {loadingStudents ? (
                    <div className="flex items-center justify-center h-40 col-span-full">
                      <Loader2
                        className="animate-spin text-blue-500"
                        size={32}
                      />
                    </div>
                  ) : studentsInSession.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 col-span-full">
                      No students enrolled in this session.
                    </div>
                  ) : (
                    studentsInSession.map((student, i) => (
                      <div
                        key={student.studentId}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow relative"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://i.pravatar.cc/80?img=${(i % 70) + 1}`}
                            alt={student.studentName}
                            className="h-12 w-12 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              const target =
                                e.currentTarget as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />

                          <div className="flex-1 min-w-0">
                            {/* ✅ Attendance Pill */}

                            <div className="text-[16px] font-semibold text-gray-900 truncate">
                              {student.name}
                            </div>
                            <div className="relative mt-3 group w-[260px]">
                              {/* Default pill */}
                              <button
                                className={`w-full h-12 rounded-full border text-[15px] font-semibold transition-all
                             ${
                               student.status === "Present"
                                 ? "bg-green-100 text-green-700 border-green-300"
                                 : student.status === "Absent"
                                 ? "bg-red-100 text-red-700 border-red-300"
                                 : student.status === "Late"
                                 ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                 : student.status === "Excused"
                                 ? "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"
                                 : "bg-white text-gray-700 border-gray-300"
                             }
                           `}
                                disabled={
                                  student.status === "Excused" ||
                                  updatingStudent === student.id
                                }
                              >
                                {updatingStudent === student.id ? (
                                  <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                                ) : (
                                  student.status || "Take attendance"
                                )}
                              </button>

                              {/* Hover actions - hidden if Excused */}
                              {student.status !== "Excused" && (
                                <div className="absolute inset-0 hidden group-hover:flex z-20 pointer-events-auto">
                                  <div className="w-full h-12 rounded-full border border-gray-300 bg-white overflow-hidden flex text-[15px] font-medium">
                                    {/* Present */}
                                    <button
                                      className="flex-1 hover:bg-green-50 text-green-700"
                                       onClick={() => {
  const toggle = student.status === "Present" ? "None" : "Present";
  markAttendance(student.classId, student.id, toggle);
}}

                                    >
                                      Present
                                    </button>
                                    <div className="w-px bg-gray-300" />

                                    {/* Absent */}
                                    <button
                                      className="flex-1 hover:bg-red-50 text-red-700"
                                         onClick={() => {
  const toggle = student.status === "Absent" ? "None" : "Absent";
  markAttendance(student.classId, student.id, toggle);
}}
                                    >
                                      Absent
                                    </button>
                                    <div className="w-px bg-gray-300" />

                                    {/* Late */}
                                    <button
                                      className="flex-1 hover:bg-yellow-50 text-yellow-700"
                                      onClick={() => {
  const toggle = student.status === "Late" ? "None" : "Late";
  markAttendance(student.classId, student.id, toggle);
}}
                                    >
                                      Late
                                    </button>
                                    <div className="w-px bg-gray-300" />

                                    {/* Excused */}
                                    {/* <button
                    className="flex-1 hover:bg-gray-100 text-gray-700"
                    onClick={() => markAttendance(student.classId, student.id, "Excused")}
                  >
                    Excused
                  </button> */}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right side buttons */}
                         <div className="relative">
  <button
    className="h-9 w-9 grid place-items-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
    onClick={() => setMenuOpenFor(menuOpenFor === student.id ? null : student.id)}
  >
    ⋯
  </button>

  {/* Dropdown */}
  {menuOpenFor === student.id && (
    <div className="
      absolute right-0 mt-2 w-48 bg-white shadow-xl 
      rounded-xl border border-gray-200 z-50
      animate-fadeIn
    ">
      <button
        className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 text-left"
        onClick={() => {
  const toggle = student.status === "Excused" ? "None" : "Excused";
  markAttendance(student.classId, student.id, toggle);
  setMenuOpenFor(null);
}}

      >
        <input type="checkbox" checked={student.status === "Excused"} readOnly />
        <span>Mark as excused</span>
      </button>

      <button className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 text-left">
        ✏️ Add / edit note
      </button>

      <button className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 text-left">
        👁 View profile
      </button>

      <button className="flex items-center gap-2 w-full px-4 py-3 hover:bg-red-50 text-red-600 text-left" onClick={() => {
    setSelectedStudent(student);
    setShowUnenrollModal(true);
    setMenuOpenFor(null);
  }}>
        🗑 Remove from class
      </button>
    </div>
  )}
</div>
                        </div>

                        {/* Dropdown menu */}
                        
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right sidebar */}
              <aside className="border-l border-gray-200 p-6 bg-gray-50">
                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-gray-800 mb-3">Edit</div>
                    <div className="space-y-2">
                      {[
                        { label: "Teacher", path: "/people/teachers" },
                        { label: "Date & time", path: "/calendar" },
                        { label: "Cancel lesson", path: "/notes/classes" },
                        { label: "Location", path: "/calendar/classroom" },
                        {
                          label: "Class details",
                          path: "/notes/class-details",
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => navigate(item.path)}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-3">
                      Actions
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Add students", path: null },
                        {
                          label: "Add prospects",
                          path: "/people/prospects/new",
                        },
                        {
                          label: "Add attachment",
                          path: "/notes/class-details",
                        },
                        {
                          label: "Add assignment",
                          path: "/notes/class-details",
                        },
                        { label: "Invite to portal", path: "/compose" },
                        {
                          label: "Print register",
                          path: "/reports/attendance",
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            item.path
                              ? navigate(item.path)
                              : setShowEnrollModal(true);
                          }}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
      

      {showEnrollModal && (
        <EnrollStudentsModal scheduleId = {scheduledId ?? 0} classId1 = {id ?? ""} onClose={() => setShowEnrollModal(false)} />
      )}

        {showUnenrollModal && (
        <UnenrollStudentModal
          student={selectedStudent}
          classId={selectedStudent.classId}
          onClose={() => setShowUnenrollModal(false)}
          onSuccess={() => {
            fetchStudentsForSession(scheduledId)
          }}
        />
      )}


      
    </>
    
  );
}

function StudentsContent() {
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Students</h2>
          <p className="text-gray-600">
            View and manage students enrolled in this class
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Grouped by student</span>
            <div className="w-10 h-6 bg-blue-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-800">
            <BookOpen className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Enroll students
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Student name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Present hours
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Enrolled
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              {
                name: "Abdul Hameed",
                id: "DCE3277",
                phone: "",
                email: "abdulhameed@onepathsolutions.com",
                enrolled: "02-10-2025",
                status: "Unenrolled",
              },
              {
                name: "Eduardo Augusto Manuel Antonio",
                id: "DCE2345",
                phone: "0833445736",
                email: "edupendela@gmail.com",
                enrolled: "02-01-2025",
                status: "Unenrolled",
              },
              {
                name: "Etelvina Pomponet Souza Soares Bisneta",
                id: "DCE2164",
                phone: "0833814206",
                email: "etelvinapomponet@icloud.com",
                enrolled: "16-01-2025",
                status: "Unenrolled",
              },
              {
                name: "Muhammead Patel",
                id: "DCE2221",
                phone: "76893534",
                email: "pmoha698@gmail.com",
                enrolled: "02-01-2025",
                status: "Unenrolled",
              },
              {
                name: "Pablo Bogdan Begara Lopez",
                id: "DCE2369",
                phone: "",
                email: "paulbega808@gmail.com",
                enrolled: "02-01-2025",
                status: "Unenrolled",
              },
              {
                name: "Anujin Enkhtsatsral",
                id: "DCE2314",
                phone: "0899868570",
                email: "goimonshn@gmail.com",
                enrolled: "02-01-2025",
                status: "Archived",
              },
              {
                name: "Brisa Del Mar Montes Ascencio",
                id: "DCE2320",
                phone: "0838521309",
                email: "mar.montes369@gmail.com",
                enrolled: "16-01-2025",
                status: "Archived",
              },
            ].map((student, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">{student.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.phone || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.email}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">00:00</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.enrolled}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === "Unenrolled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 text-gray-600 hover:text-gray-800">
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
      

      {/* {showEnrollModal && (
        <EnrollStudentsModal onClose={() => setShowEnrollModal(false)} />
      )} */}
    </>
  );
}

function FeesContent() {
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Fees</h2>
        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              true
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Grouped by student
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              false
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Individual fees
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <BookOpen className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Set a price for this class
        </h3>
        <p className="text-gray-600 mb-6">
          Fees owed for this class will appear here once you set a price for
          this class and enroll students.
        </p>
        <button
          onClick={() => setShowEditPriceModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
        >
          <Plus className="h-4 w-4" />
          Set the class price
        </button>
      </div>

      {showEditPriceModal && (
        <EditPriceModal onClose={() => setShowEditPriceModal(false)} />
      )}
    </>
  );
}

function ReceiptsContent() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Receipts</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <FileText className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No payments received for this class
        </h3>
        <p className="text-gray-600 mb-6">
          Receipts for payments made for this class will appear here.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
          <Plus className="h-4 w-4" />
          New payment
        </button>
      </div>
    </>
  );
}

function NotesContent() {
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showCopyNotesModal, setShowCopyNotesModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddNoteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New note
          </button>
          <button
            onClick={() => setShowCopyNotesModal(true)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy notes
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <FileText className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Add notes about Advanced_AM_DCE1_PART 1
        </h3>
        <p className="text-gray-600 mb-6">
          Notes concerning Advanced_AM_DCE1_PART 1 will appear here.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setShowAddNoteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New note
          </button>
          <button
            onClick={() => setShowCopyNotesModal(true)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy notes
          </button>
        </div>
      </div>

      {showAddNoteModal && (
        <AddNoteModal onClose={() => setShowAddNoteModal(false)} />
      )}
      {showCopyNotesModal && (
        <CopyNotesModal onClose={() => setShowCopyNotesModal(false)} />
      )}
    </>
  );
}

function AttachmentsContent() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Attachments</h2>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add attachment
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy attachments
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <Paperclip className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Add attachments
        </h3>
        <p className="text-gray-600 mb-6">
          You can add and store relevant documents and files here.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add attachment
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy attachments
          </button>
        </div>
      </div>
    </>
  );
}

function AssignmentsContent() {
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          Assignments
          <Info className="h-4 w-4 text-gray-400" />
        </h2>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add assignment
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy assignments
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <CheckSquare className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Assignments will appear here once a teacher has added them.
        </h3>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setShowAddAssignmentModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add assignment
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy assignments
          </button>
        </div>
      </div>

      {showAddAssignmentModal && (
        <AddAssignmentModal onClose={() => setShowAddAssignmentModal(false)} />
      )}
    </>
  );
}

function FormsContent() {
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          Forms
          <Info className="h-4 w-4 text-gray-400" />
        </h2>
        <button
          onClick={() => setShowCreateFormModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add form
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <FormInput className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Forms will appear here once they have been added
        </h3>
        <button
          onClick={() => setShowCreateFormModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
        >
          <Plus className="h-4 w-4" />
          Add form
        </button>
      </div>

      {showCreateFormModal && (
        <CreateFormModal onClose={() => setShowCreateFormModal(false)} />
      )}
    </>
  );
}

function GradebooksContent() {
  const [showAddGradebookModal, setShowAddGradebookModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          Gradebooks
          <Info className="h-4 w-4 text-gray-400" />
        </h2>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy gradebook template
          </button>
          <button
            onClick={() => setShowAddGradebookModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add and edit gradebooks
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Student name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Class grade
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Notes
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: "Abdul Hameed", id: "DCE3277" },
              { name: "Anujin Enkhtsatsral", id: "DCE2314" },
              { name: "Brisa Del Mar Montes Ascencio", id: "DCE2320" },
              { name: "Busang Dube", id: "DCE2071" },
              { name: "Cindy Lorena Lopez Villatoro", id: "DCE2230" },
              { name: "Eduardo Augusto Manuel Antonio", id: "DCE2345" },
            ].map((student, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">{student.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder=""
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder=""
                  />
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 text-gray-600 hover:text-gray-800">
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddGradebookModal && (
        <AddGradebookModal onClose={() => setShowAddGradebookModal(false)} />
      )}
    </>
  );
}

// Modal components (simplified for now)
function AddLessonModal({
  classId,
  onClose,
  onSuccess,
}: {
  classId: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState({
    dayOfWeek: "Monday",
    startTime: "",
    endTime: "",
    teacherId: "",
  });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        setTeacherError(null);
        const response = await axiosInstance.get("/Teacher/GetAllTeachers", {
          signal: controller.signal,
        });
        if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
          setTeachers(response.data.Data);
        } else {
          setTeachers([]);
          setTeacherError("No teachers available.");
        }
      } catch (error: any) {
        if (controller.signal.aborted) return;
        console.error("Failed to load teachers", error);
        setTeacherError("Failed to load teachers. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTeachers(false);
        }
      }
    };
    fetchTeachers();
    return () => controller.abort();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.dayOfWeek || !form.startTime || !form.endTime) {
      setSubmitError("Day, start time and end time are required.");
      return;
    }
    if (!form.teacherId) {
      setSubmitError("Please select a teacher.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setSubmitError("End time must be after start time.");
      return;
    }

    const dayKey = form.dayOfWeek;
    const payload = {
      ClassId: Number(classId),
      TeacherId: Number(form.teacherId),
      Schedule: {
        [dayKey]: [
          {
            StartTime: form.startTime,
            EndTime: form.endTime,
          },
        ],
      },
    };

    try {
      setSubmitting(true);
      const response = await axiosInstance.post(
        "/Class/AddSessionsToClass",
        payload
      );
      if (response.data?.IsSuccess) {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      } else {
        setSubmitError(
          response.data?.Message || "Failed to add lesson. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Failed to add lesson", error);
      setSubmitError(
        error?.response?.data?.Message ||
          "Failed to add lesson. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Add a new lesson
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <p className="text-gray-600">
            Select the lesson day, times, and teacher. Only one teacher can be
            assigned per lesson.
          </p>
          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {submitError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day of week *
            </label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => handleInputChange("dayOfWeek", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start time *
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End time *
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher *
            </label>
            <select
              value={form.teacherId}
              onChange={(e) => handleInputChange("teacherId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
              disabled={loadingTeachers}
            >
              <option value="">
                {loadingTeachers ? "Loading teachers..." : "Select teacher"}
              </option>
              {teachers.map((teacher) => (
                <option key={teacher.Id} value={teacher.Id}>
                  {[teacher.Name, teacher.Surname].filter(Boolean).join(" ")}
                </option>
              ))}
            </select>
            {teacherError && (
              <p className="text-xs text-red-600 mt-1">{teacherError}</p>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-70"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              )}
              Add lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EnrollStudentsModal({ scheduleId, classId1, onClose }: { scheduleId: number, classId1: string, onClose: () => void }) {
  const navigate = useNavigate();
   const [showEnrollModal, setShowEnrollModal] = useState(true);
const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false)
   const [allStudents, setAllStudents] = useState<any[]>([])
   const [alreadyEnrolled, setAlreadyEnrolled] = useState<number[]>([])
   const [selectedToEnroll, setSelectedToEnroll] = useState<number[]>([])
   const [sessionClassId, setSessionClassId] = useState<number | null>(null)


   const fetchAllStudents = async () => {
    try{
      setIsLoadingAllStudents(true)
      const res = await axiosInstance.get("/Student/GetAll")
      const enrollRes = await axiosInstance.get(`/Class/GetStudentsForSession?scheduleId=${scheduleId}`)

      if(res.data?.IsSuccess){
        setAllStudents(res.data.Data)
      }

      if(enrollRes.data?.IsSuccess){
        const ids = enrollRes.data.Data.map((s: any) => s.StudentId)
        setAlreadyEnrolled(ids)
        // Get classId from the first student in the session (all students in a session belong to the same class)
        if(enrollRes.data.Data.length > 0 && enrollRes.data.Data[0].ClassId) {
          setSessionClassId(enrollRes.data.Data[0].ClassId)
        }
      }


    }catch(err){
      console.log("Error fetching student list", err)
    }finally{
      setIsLoadingAllStudents(false)
    }
  }


  useEffect(() => {
    if(showEnrollModal){
      fetchAllStudents()
    }
  }, [showEnrollModal])


  
  const enrollStudents = async () => {
    if(!scheduleId || selectedToEnroll.length === 0)
      return 
    
    const sessionId = scheduleId 

    try{
      const response = await axiosInstance.post(`/Class/EnrollStudentToClassInBulk`, selectedToEnroll, { params: { sessionId }})
      
      if(response.data?.IsSuccess){
        onClose()
        setSelectedToEnroll([])
      }
    }catch(err){
      console.log("Error enrolling students", err)
      alert("Failed to enroll students")
    }
  }
  const [showAddStudent, setShowAddStudent] = useState(false);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Enroll students
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Enroll students in 'Advanced_AM_DCE1_PART 1' Select the date on
            which the students will be enrolled in the class and then select
            which students to enroll.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment date *
              </label>
              <input
                type="text"
                defaultValue="21-10-2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unenrollment date (optional)
              </label>
              <input
                type="text"
                placeholder="Select date..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Select from existing students
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy from another class
            </button>
            <button
              onClick={() => setShowAddStudent(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add new student
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">All students</h4>
              <div className="border border-gray-200 rounded-lg h-64 overflow-y-auto">
                     {isLoadingAllStudents ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="animate-spin text-blue-500" size={28} />
                  </div>
                ) : (
                  allStudents.map((s: any) => {
                    const disabled = alreadyEnrolled.includes(s.Id)
                    const selected = selectedToEnroll.includes(s.Id)
                
                    return (
                      <div
                        key={s.Id}
                        onClick={() => !disabled && setSelectedToEnroll(prev =>
                          prev.includes(s.Id) ? prev.filter(id => id !== s.Id) : [...prev, s.Id]
                        )}
                        className={`p-2 flex justify-between cursor-pointer ${
                          disabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : selected
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {s.FirstName} {s.Surname}
                        {disabled && <span className="text-xs">(Enrolled)</span>}
                      </div>
                    )
                  })
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use shift and control keys to select multiple students
              </p>
            </div>
             <div>
                    <h4 className="font-medium text-gray-800 mb-2">Enrolled students</h4>
                    {selectedToEnroll.length === 0 ? (
  <div className="h-full flex items-center justify-center text-gray-400">
    No students selected
  </div>
) : (
  selectedToEnroll.map((id) => {
    const student = allStudents.find((s) => s.Id === id)
    return (
      <div key={id} className="p-2 flex justify-between bg-white border-b">
        {student?.FirstName} {student?.Surname}
        <button
          className="text-red-500 text-xs"
          onClick={() =>
            setSelectedToEnroll(prev => prev.filter(x => x !== id))
          }
        >
          Remove
        </button>
      </div>
    )
  })
)}

                  </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={() => {
                  onClose()
                  setSelectedToEnroll([])
                  }}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={enrollStudents}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save changes
          </button>
        </div>
        {showAddStudent && (
          <AddStudentForm
            isOpen={showAddStudent}
            onClose={() => setShowAddStudent(false)}
          />
        )}
      </div>
    </div>
  );
}

function EditPriceModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit price</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add a price
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-2">
              <X className="h-4 w-4" />
              No fee
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hourly fee
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Monthly fee
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Custom fee
            </button>
          </div>
          <p className="text-gray-600">There are no fees for this class.</p>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function AddNoteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add a note</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <button className="p-1 text-gray-600 hover:text-gray-800">
                B
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                I
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                U
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                S
              </button>
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                ≡
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                ≡
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                ≡
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                ≡
              </button>
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <button className="p-1 text-gray-600 hover:text-gray-800 bg-yellow-200">
                A
              </button>
              <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                <option>14</option>
              </select>
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                •
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                1.
              </button>
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                🔗
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                📹
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                🖼️
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                📎
              </button>
            </div>
            <textarea
              className="w-full h-32 border-none resize-none focus:outline-none"
              placeholder="Start typing your note..."
            ></textarea>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2">
                <X className="h-4 w-4" />
                Private
              </button>
              <button className="px-3 py-1 text-gray-600 border border-gray-300 rounded-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Shared
              </button>
              <button className="px-3 py-1 text-gray-600 border border-gray-300 rounded-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Admin
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Note type:</span>
              <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                <option>General</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Notify</span>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex items-center gap-2 mt-2 text-blue-600 text-sm">
              <span>0 people selected</span>
              <button className="hover:underline">View</button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add note
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyNotesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Copy notes</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Select from which class to copy notes.
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Select Class"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-8"
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

function AddAssignmentModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Complete the below fields to add a new assignment
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due date *
            </label>
            <input
              type="text"
              defaultValue="21-10-2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  B
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  I
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  U
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  S
                </button>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  ≡
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  ≡
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  ≡
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  ≡
                </button>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <button className="p-1 text-gray-600 hover:text-gray-800 bg-yellow-200">
                  A
                </button>
                <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                  <option>16</option>
                </select>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  •
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  1.
                </button>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  🔗
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  📹
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  🖼️
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-800">
                  📎
                </button>
              </div>
              <textarea
                className="w-full h-32 border-none resize-none focus:outline-none"
                placeholder="Start typing instructions..."
              ></textarea>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments
            </label>
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <Paperclip className="h-12 w-12 text-blue-200 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Add attachments
              </h3>
              <p className="text-gray-600 mb-4">
                You can add and store relevant documents and files here.
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Add attachment
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add assignment
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateFormModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Create form</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Basic</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            ></textarea>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-2">
              <X className="h-4 w-4" />
              Private
            </button>
            <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Shared
            </button>
            <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin
            </button>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Form fields
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Select form fields
                </h4>
                <div className="space-y-2">
                  {[
                    "Text field",
                    "Text area",
                    "Checkbox group",
                    "Radio group",
                    "Dropdown",
                  ].map((field, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FormInput className="h-4 w-4 text-gray-400" />
                      {field}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Drag and drop form fields here
                </h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
                  <span className="text-gray-500">Drop form fields here</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create form
          </button>
        </div>
      </div>
    </div>
  );
}

function AddGradebookModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Add and edit gradebooks
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Multiple gradebooks
            </span>
            <div className="w-10 h-6 bg-gray-200 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Copy grades from another class
            </span>
            <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy grades from another class
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">
                      Grade name
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">
                      Grade type
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">
                      Grade weight
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">
                      Grade order
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">
                      Grade date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select className="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                        <option>Percentage</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <X className="h-4 w-4 text-red-500 cursor-pointer" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="text-blue-600 text-sm hover:underline mt-2">
              + Add grade
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">
              Save this gradebook as a template
            </span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
