import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "./axiosInstance";
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
        return <StudentsContent classId={Number(id)} />;
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

  {/* PAGE TITLE */}
  <div className="mb-4 flex items-center justify-between">
    <h1 className="text-xl font-semibold text-gray-900">
      Class Details
    </h1>

    {/* ACTION BUTTONS */}
    <div className="flex items-center gap-2">
      <button className="px-3 py-1.5 border rounded text-sm flex items-center gap-1 text-gray-700 hover:bg-gray-50">
        <MessageSquare size={14} />
        Message
        <ChevronDown size={12} />
      </button>
      <button className="px-3 py-1.5 border rounded text-sm flex items-center gap-1 text-gray-700 hover:bg-gray-50">
        <Printer size={14} />
        Print
        <ChevronDown size={12} />
      </button>
      <button className="px-3 py-1.5 border rounded text-sm flex items-center gap-1 text-gray-700 hover:bg-gray-50">
        <MoreHorizontal size={14} />
        More
        <ChevronDown size={12} />
      </button>
    </div>
  </div>

  {/* DOTTED LINE */}
  <div className="border-b border-dotted border-gray-300 mb-6" />

  {/* CLASS TITLE */}
  <div className="flex items-center gap-3 mb-4">
    <span
      className={`h-4 w-4 rounded-full ${
        classInfo.IsActive ? "bg-red-500" : "bg-gray-400"
      }`}
    />
    <h2 className="text-lg font-semibold text-gray-900">
      {classInfo.ClassTitle}
    </h2>
    <span className="text-sm text-gray-600">
      ({classInfo.ClassSubject}, {classInfo.ClassLevel})
    </span>
    <button className="text-blue-600 text-sm hover:underline">
      (edit)
    </button>
  </div>

  {/* INFO LIST */}
  <ul className="space-y-2 text-sm text-gray-700">
    <li className="flex items-center gap-2">
      <span className="text-gray-500">▌▌▌</span>
      <span>Class Code: {classInfo.ClassId}</span>
    </li>

    <li className="flex items-center gap-2">
      ⭐ <span>Awarding Body: ELT</span>
    </li>

    <li className="flex items-start gap-2">
      📅
      <div>
        <span className="font-medium">
          {formatSchedule(classInfo.Sessions || [])}
        </span>
        <span className="text-blue-600 ml-1 cursor-pointer">(edit)</span>
        <div className="text-gray-500 mt-0.5">
          {formatRepeats(classInfo.StartDate, classInfo.EndDate)}
        </div>
      </div>
    </li>

    <li className="flex items-center gap-2">
      💰
      <span>
        Price: No Charge{" "}
        <span className="text-blue-600 cursor-pointer">(edit)</span>
      </span>
    </li>

    <li className="flex items-center gap-2">
      👤
      <span>
        Teacher:{" "}
        <span className="text-blue-600 cursor-pointer">
          {classInfo.TeacherId}
        </span>
      </span>
    </li>

    <li className="flex items-center gap-2">
      📍 <span>Classroom: {classInfo.ClassRoomName || "—"}</span>
    </li>

    <li className="flex items-center gap-2">
      ✏️ <span>Total Lessons: {classInfo.TotalLessons}</span>
    </li>

    <li className="flex items-center gap-2">
      ⏱️ <span>Total Lessons Hours: {classInfo.TotalLessonHours}</span>
    </li>

    <li className="flex items-center gap-2">
      🕒 <span>Total Hours Taught: {classInfo.TotalHoursTaught}</span>
    </li>
  </ul>

  {/* FOOTER */}
  <div className="mt-4 text-xs text-gray-400">
    Created By: Asif Omer &nbsp;&nbsp; Created Date:{" "}
    {formatDate(classInfo.CreatedDate)}
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

  const [scheduledId, setScheduledId] = useState<number | null>(null);
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
      const mapped = res.data.Data.map((s: any) => {
        // Date object create karein StartTime se
        const dateObj = new Date(s.StartTime);

        return {
          scheduleId: s.ScheduleId,
          // Format: 17-Dec-2025
          date: dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).replace(/ /g, "-"), 
          
          // Format: FRI (short weekday)
          day: dateObj.toLocaleDateString("en-GB", { weekday: 'short' }).toUpperCase(),
          
          time: formatTime(s.StartTime),
          duration: calculateDuration(s.StartTime, s.EndTime),
          className: s.ClassTitle,
          subject: s.ClassSubject,
          classroom: s.ClassRoomName || s.DayOfWeek,
          teacherNames: s.TeacherNames || [],
          totalStudents: s.TotalStudents || 0,
          presentCount: s.PresentCount || 0,
          absentCount: s.AbsentCount || 0,
        };
      });

      setLessons(mapped);
    }
  } catch (err) {
    console.error("Error fetching lessons:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (selectedLessonIdx !== null) {
      const selectedLesson = lessons[selectedLessonIdx];
      setScheduledId(selectedLesson.scheduleId);
    }
  }, [selectedLessonIdx]);

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
    {/* HEADER */}
    <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-4">
      <h2 className="text-lg font-semibold text-gray-900">Lessons</h2>

      <button
        onClick={() => setShowAddLessonModal(true)}
        className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-sm flex items-center gap-1 hover:bg-gray-200"
      >
        <Plus size={14} />
        Add a Lesson
      </button>
    </div>

    {/* FILTERS */}
    <div className="flex justify-end items-center gap-2 mb-6">
      <div className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600">
        DATE: <span className="font-medium">Most Relevant</span>
      </div>

      <div className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600">
        SORT: <span className="font-medium">Ascending</span>
      </div>

      <button className="p-2 border border-gray-300 rounded text-gray-600">
        <Clock size={16} />
      </button>
    </div>

    {/* LESSON LIST */}
    <div className="space-y-6 relative">
      {lessons.map((l, i) => (
        <div key={i} className="relative pl-8">
          {/* TIMELINE DOT */}
          <span
            className={`absolute left-0 top-5 h-4 w-4 rounded-full ${
              i === 1 ? "bg-blue-500" : "bg-gray-300"
            }`}
          />

          {/* CARD */}
          <div
            onClick={() => setSelectedLessonIdx(i)}
            className="border border-gray-300 bg-white cursor-pointer"
          >
            {/* TOP ROW */}
            {/* CARD TOP ROW */}
<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
  <div className="text-sm text-gray-900 font-medium">
    {/* Display Date */}
    {l.date} &nbsp;
    
    {/* Display Day (e.g., TUE) */}
    <span className="uppercase text-gray-600">
      {l.day}
    </span>
    
    {/* Display Time */}
    , {l.time}
  </div>

  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-700">
      {/* Agar TeacherNames null hai to default value dikhayein */}
      {l.teacherNames?.[0] || "No Teacher"}
    </span>
    <div className="h-8 w-8 rounded-full border flex items-center justify-center text-gray-600">
      <Users size={16} />
    </div>
  </div>
</div>

            {/* BOTTOM ROW */}
            <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <Users2 size={16} />
                  {l.totalStudents || 1}
                </div>

                <div className="flex items-center gap-1 opacity-40">
                  <Plus size={16} /> 0
                </div>

                <div className="flex items-center gap-1 opacity-40">
                  <Copy size={16} /> 0
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Star size={16} className="opacity-30" />
                <div className="h-5 w-32 bg-gray-100 rounded" />
                <div className="h-5 w-32 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* MODALS */}
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

    {selectedLessonIdx !== null && lessons[selectedLessonIdx] && (
      <SessionDetailsModal
        context="class"
        lesson={{
          id: lessons[selectedLessonIdx].scheduleId?.toString() || "",
          time: lessons[selectedLessonIdx].time || "",
          duration: lessons[selectedLessonIdx].duration || "",
          className: lessons[selectedLessonIdx].className || "",
          subject: lessons[selectedLessonIdx].subject,
          classroom: lessons[selectedLessonIdx].classroom,
          teacherNames: lessons[selectedLessonIdx].teacherNames || [],
          totalStudents: lessons[selectedLessonIdx].totalStudents || 0,
          presentCount: lessons[selectedLessonIdx].presentCount || 0,
          absentCount: lessons[selectedLessonIdx].absentCount || 0,
        }}
        sessionId={lessons[selectedLessonIdx].scheduleId || 0}
        currentDate={currentDate}
        onClose={() => setSelectedLessonIdx(null)}
      />
    )}
  </>
);

}

function StudentsContent({ classId }: { classId: number }) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!classId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get("/Class/GetStudentInClass", {
          params: { classId },
        });
        if (response?.data?.IsSuccess) {
          setStudents(response.data.Data || []);
        } else {
          setError("Failed to load students");
          setStudents([]);
        }
      } catch (err: any) {
        setError("Failed to load students");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [classId]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB");
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Students</h2>

        <div className="flex items-center gap-3">
          {/* TOGGLE */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-5 bg-gray-300 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-0.5 shadow" />
            </div>
          </div>

          {/* ICON */}
          <button className="p-2 border border-gray-300 rounded text-gray-600">
            <BookOpen size={16} />
          </button>

          {/* ENROLL BUTTON */}
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-sm flex items-center gap-1 hover:bg-gray-200"
          >
            <Plus size={14} />
            Enroll Students
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-300">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr className="text-left text-gray-700">
                <th className="px-4 py-2">Student name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Present hours</th>
                <th className="px-4 py-2">Enrolled</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {students.map((s) => {
                const fullName =
                  `${s.FirstName || ""} ${s.Surname || ""}`.trim();

                return (
                  <tr key={s.Id} className="hover:bg-gray-50">
                    {/* NAME */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                          {fullName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div className="text-blue-600 font-medium cursor-pointer">
                            {fullName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {s.IdNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* PHONE */}
                    <td className="px-4 py-3">{s.MobilePhone || "-"}</td>

                    {/* EMAIL */}
                    <td className="px-4 py-3 text-blue-600">
                      {s.Email || "-"}
                    </td>

                    {/* HOURS */}
                    <td className="px-4 py-3">06:00</td>

                    {/* ENROLLED */}
                    <td className="px-4 py-3">
                      {formatDate(s.RegistrationDate)}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          s.IsActive && !s.IsDeleted
                            ? "bg-green-600 text-white"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        {s.IsActive && !s.IsDeleted
                          ? "ACTIVE"
                          : "UNENROLLED"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3 text-center text-gray-400">
                      <div className="flex justify-center gap-2">
                        <Edit size={16} className="cursor-pointer" />
                        <X size={16} className="cursor-pointer" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
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
        if (response.data?.IsSuccess) {
          // API returns: { IsSuccess: true, Data: { data: [...] } }
          const teachersData = response.data.Data?.data || [];
          if (Array.isArray(teachersData)) {
            setTeachers(teachersData);
          } else {
            setTeachers([]);
            setTeacherError("No teachers available.");
          }
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

    const payload = {
      ClassId: Number(classId),
      Schedule: [
        {
          WeekDay: form.dayOfWeek,
          StartTime: form.startTime,
          EndTime: form.endTime,
          TeacherIds: [Number(form.teacherId)],
        },
      ],
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
