import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Users2,
  Plus,
  Copy,
  Loader2,
  Star,
  Flag,
  StickyNote,
  MoreVertical,
  Download,
  FilePlus,
  Mail,
  Trash2,
  Check,
  X,
  Clock,
} from "lucide-react";
import axiosInstance from "./axiosInstance";
import AddStudentForm from "./AddStudentForm";
import UnenrollStudentModal from "./UnenrollStudentModal";

type SessionTeacherLesson = {
  id: string;
  time: string;
  duration: string;
  className: string;
  subject?: string;
  classroom?: string;
  teacherNames: string[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
};

type StudentInSession = {
  id: number;
  name: string;
  status: string | null;
  classId: number;
  photo?: string | null;
};

type AllStudent = {
  Id: number;
  FirstName?: string;
  Surname?: string;
};

type SessionDetailsModalProps = {
  lesson: SessionTeacherLesson | null;
  sessionId: string | number;
  currentDate: string;
  onClose: () => void;
  context: "dashboard" | "class";
};

const ProgressBar = ({ green, red, gray }: { green: number; red: number; gray: number }) => {
  const total = green + red + gray || 1;
  const g = (green / total) * 100;
  const r = (red / total) * 100;
  const gr = 100 - g - r;
  return (
    <div className="h-3 w-48  bg-gray-200 overflow-hidden flex text-xs relative">
      {green > 0 && (
        <div
          className="h-full flex items-center justify-center text-white font-semibold"
          style={{ width: `${g}%`, backgroundColor: "#2f9c6a", minWidth: green > 0 ? "20px" : "0" }}
        >
          {green}
        </div>
      )}
      {red > 0 && (
        <div
          className="h-full flex items-center justify-center text-white font-semibold"
          style={{ width: `${r}%`, backgroundColor: "#ef5a66", minWidth: red > 0 ? "20px" : "0" }}
        >
          {red}
        </div>
      )}
      {gr > 0 && <div className="h-full bg-gray-300" style={{ width: `${gr}%` }} />}
    </div>
  );
};

const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  lesson,
  sessionId,
  currentDate,
  onClose,
  context,
}) => {
  const navigate = useNavigate();
  const [sessionStudents, setSessionStudents] = useState<StudentInSession[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [openStudentMenu, setOpenStudentMenu] = useState<number | null>(null);
  const [updatingStudent, setUpdatingStudent] = useState<number | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [allStudents, setAllStudents] = useState<AllStudent[]>([]);
  const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState<number[]>([]);
  const [selectedToEnroll, setSelectedToEnroll] = useState<number[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentInSession | null>(null);
  const [dropdownPositions, setDropdownPositions] = useState<Record<number, { top: number; left: number }>>({});
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceApplyTo, setAttendanceApplyTo] = useState<"all" | "selected">("all");
  const [bulkAttendanceStatus, setBulkAttendanceStatus] = useState<"Present" | "Absent" | "Late" | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const numericSessionId = useMemo(() => Number(sessionId), [sessionId]);

  const fetchSessionStudents = async () => {
    if (!numericSessionId) return;
    try {
      setIsLoadingStudents(true);
      const response = await axiosInstance.get(
        `/Class/GetStudentsForSession?scheduleId=${numericSessionId}&date=${currentDate}`
      );
      if (response.data?.IsSuccess) {
        const mapped = response.data.Data.map((s: any) => ({
          id: s.StudentId,
          name: s.StudentName,
          status: s.AttendanceStatus,
          classId: s.ClassId,
          photo: s.Photo,
        }));
        setSessionStudents(mapped);
      } else {
        setSessionStudents([]);
      }
    } catch (err) {
      console.error("Error fetching session students", err);
      setSessionStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      setIsLoadingAllStudents(true);
      const res = await axiosInstance.get("/Student/GetAll");
      const enrollRes = await axiosInstance.get(`/Class/GetStudentsForSession?scheduleId=${numericSessionId}`);

      if (res.data?.IsSuccess) {
        setAllStudents(res.data.Data || []);
      } else {
        setAllStudents([]);
      }

      if (enrollRes.data?.IsSuccess) {
        const ids = enrollRes.data.Data.map((s: any) => s.StudentId);
        setAlreadyEnrolled(ids);
      } else {
        setAlreadyEnrolled([]);
      }
    } catch (error) {
      console.error("Error fetching all students", error);
      setAllStudents([]);
    } finally {
      setIsLoadingAllStudents(false);
    }
  };

  useEffect(() => {
    fetchSessionStudents();
  }, [numericSessionId, currentDate]);

  useEffect(() => {
    if (showEnrollModal) {
      fetchAllStudents();
    } else {
      setSelectedToEnroll([]);
    }
  }, [showEnrollModal]);

  useEffect(() => {
    if (openStudentMenu === null) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".student-menu-container")) {
        setOpenStudentMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openStudentMenu]);

  if (!lesson) return null;

  const markAttendance = async (
    classId: number,
    studentId: number,
    status: "Present" | "Absent" | "Late" | "Excused" | "None"
  ) => {
    try {
      setUpdatingStudent(studentId);
      const payload = {
        classId,
        scheduleId: numericSessionId,
        studentId,
        date: currentDate,
        attendanceStatus: status,
      };
      const response = await axiosInstance.post("/Class/MarkAttendance", null, { params: payload });
      if (response.data?.IsSuccess) {
        fetchSessionStudents();
      }
    } catch (err) {
      console.error("Error marking attendance", err);
      alert("Failed to mark attendance");
    } finally {
      setUpdatingStudent(null);
    }
  };

  const handleUnenrollClick = (student: StudentInSession) => {
    setSelectedStudent(student);
    setShowUnenrollModal(true);
    setOpenStudentMenu(null);
  };

  const enrollStudents = async () => {
    if (!numericSessionId || selectedToEnroll.length === 0) return;
    try {
      const response = await axiosInstance.post(`/Class/EnrollStudentToClassInBulk`, selectedToEnroll, {
        params: { sessionId: numericSessionId },
      });
      if (response.data?.IsSuccess) {
        setShowEnrollModal(false);
        setSelectedToEnroll([]);
        fetchSessionStudents();
      }
    } catch (err) {
      console.error("Error enrolling students", err);
      alert("Failed to enroll students");
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === sessionStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(sessionStudents.map((s) => s.id));
    }
  };

  const clearAttendance = async () => {
    const studentsToClear = attendanceApplyTo === "all" 
      ? sessionStudents 
      : sessionStudents.filter((s) => selectedStudents.includes(s.id));

    if (studentsToClear.length === 0) return;

    setIsBulkUpdating(true);
    try {
      const promises = studentsToClear.map((student) =>
        axiosInstance.get("/Class/RemoveAttendance", {
          params: {
            scheduleId: numericSessionId,
            studentId: student.id,
            date: currentDate,
          },
        })
      );

      await Promise.all(promises);
      await fetchSessionStudents();
      setShowAttendanceModal(false);
      setBulkAttendanceStatus(null);
      setAttendanceApplyTo("all");
    } catch (err) {
      console.error("Error clearing attendance", err);
      alert("Failed to clear attendance");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const saveBulkAttendance = async () => {
    if (!bulkAttendanceStatus) return;

    const studentsToUpdate = attendanceApplyTo === "all"
      ? sessionStudents
      : sessionStudents.filter((s) => selectedStudents.includes(s.id));

    if (studentsToUpdate.length === 0) return;

    setIsBulkUpdating(true);
    try {
      const promises = studentsToUpdate.map((student) => {
        const payload = {
          classId: student.classId,
          scheduleId: numericSessionId,
          studentId: student.id,
          date: currentDate,
          attendanceStatus: bulkAttendanceStatus,
        };
        return axiosInstance.post("/Class/MarkAttendance", null, { params: payload });
      });

      await Promise.all(promises);
      await fetchSessionStudents();
      setShowAttendanceModal(false);
      setBulkAttendanceStatus(null);
      setAttendanceApplyTo("all");
    } catch (err) {
      console.error("Error marking bulk attendance", err);
      alert("Failed to mark attendance");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const renderStudents = () => {
    if (isLoadingStudents) {
      return (
        <div className="flex items-center justify-center h-40 col-span-full">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      );
    }

    if (sessionStudents.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10 col-span-full">
          No students enrolled in this session.
        </div>
      );
    }

    return sessionStudents.map((student) => {
      const isSelected = selectedStudents.includes(student.id);
      return (
      <div 
        key={student.id} 
        onClick={() => toggleStudentSelection(student.id)}
        className={`bg-gray-100 border border-gray-300  px-4 py-3 hover:shadow-sm transition cursor-pointer h-40 ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3 text-center mt-5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleStudentSelection(student.id)}
            className="h-4 w-4 text-blue-600  border-gray-300 focus:blue-500"
            onClick={(e) => e.stopPropagation()}
          />
          {student.photo ? (
            <img
              src={student.photo}
              alt={student.name}
              className="h-12 w-12  object-cover border border-gray-200"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="h-12 w-12  bg-indigo-100 border border-gray-200 flex items-center justify-center text-indigo-600 font-semibold text-sm">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-semibold text-gray-900 truncate">{student.name}</div>
            <div className="relative mt-3 group w-full max-w-xs">
              <button
                onClick={(e) => e.stopPropagation()}
                className={`w-full h-8  border text-[15px] font-semibold transition-all bg-gray-200 ${
                  student.status === "Present"
                    ? "bg-gray-200 text-gray-700 border-gray-300 "
                    : student.status === "Absent"
                    ? "bg-gray-200 text-gray-700 border-gray-300"
                    : student.status === "Late"
                    ? "bg-gray-200 text-yellow-700 border-gray-300"
                    : student.status === "Excused"
                    ? "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"
                    : "bg-gray-200  text-gray-700 border-gray-300"
                }`}
                disabled={student.status === "Excused" || updatingStudent === student.id}
              >
                {updatingStudent === student.id ? (
                  <Loader2 className="animate-spin w-5 h-5 mx-auto bg-gray-200" />
                ) : (
                  student.status ?? "Take attendance"
                )}
              </button>
              {student.status !== "Excused" && (
                <div className="absolute inset-0 hidden group-hover:flex z-20 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="w-full h-7 border border-gray-300 bg-white overflow-hidden flex shadow-sm ">
  <button
    className="flex-1 text-[11px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors uppercase tracking-tight"
    onClick={(e) => {
      e.stopPropagation();
      markAttendance(student.classId, student.id, "Present");
    }}
  >
    Present
  </button>
  
  <div className="w-px bg-gray-300" />
  
  <button
    className="flex-1 text-[11px] font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors uppercase tracking-tight"
    onClick={(e) => {
      e.stopPropagation();
      markAttendance(student.classId, student.id, "Absent");
    }}
  >
    Absent
  </button>
  
  <div className="w-px bg-gray-300" />
  
  <button
    className="flex-1 text-[11px] font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors uppercase tracking-tight"
    onClick={(e) => {
      e.stopPropagation();
      markAttendance(student.classId, student.id, "Late");
    }}
  >
    Late
  </button>
</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 relative student-menu-container">
            <button
              className="h-9 w-9 grid place-items-center  border border-gray-200 bg-white hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                const button = e.currentTarget;
                const rect = button.getBoundingClientRect();
                setDropdownPositions(prev => ({
                  ...prev,
                  [student.id]: { top: rect.bottom + 4, left: rect.right - 192 }
                }));
                setOpenStudentMenu(openStudentMenu === student.id ? null : student.id);
              }}
            >
              <MoreVertical className="w-4 h-4 text-indigo-600" />
            </button>
            {openStudentMenu === student.id && dropdownPositions[student.id] && (
              <div 
                className="fixed w-48 bg-white  shadow-xl border border-gray-200 z-[100]"
                style={{ top: `${dropdownPositions[student.id].top}px`, left: `${dropdownPositions[student.id].left}px` }}
              >
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenStudentMenu(null);
                    navigate(`/people/students/${student.id}`);
                  }}
                >
                  View profile
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    const toggle = student.status === "Excused" ? "None" : "Excused";
                    markAttendance(student.classId, student.id, toggle);
                    setOpenStudentMenu(null);
                  }}
                >
                  <input type="checkbox" checked={student.status === "Excused"} readOnly className="pointer-events-none" />
                  <span>Mark as excused</span>
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnenrollClick(student);
                  }}
                >
                  <Trash2 size={16} className="text-red-600" />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      );
    });
  };

  return (
  <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" onClick={onClose}>
    <div
      className="w-full max-w-7xl bg-white  border border-gray-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. TOP HEADER (Dark Slate like Sidebar) */}
      <div className="relative flex items-center justify-between px-6 py-4 bg-[#1e293b] border-b border-gray-200 text-white">
        <div className="flex items-center gap-4">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>

          {lesson.teacherNames.length > 0 && (
            <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
              <div className="h-9 w-9  bg-blue-600 text-white grid place-items-center text-sm font-semibold shadow-sm">
                {lesson.teacherNames[0]
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="text-sm text-slate-200 truncate max-w-[180px]">
                {lesson.teacherNames.join(", ")}
              </div>
            </div>
          )}

          <div className="flex items-start gap-4 flex-1 text-left">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
            {lesson.teacherNames.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-9 w-9  bg-blue-600 text-white grid place-items-center text-sm font-semibold">
                  {lesson.teacherNames[0]
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="text-sm text-slate-200 truncate max-w-[180px]">
                  {lesson.teacherNames.join(", ")}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="text-blue-400">{lesson.time}</span>
              <span className="text-white">{lesson.className}</span>
              <span className="text-slate-400 font-normal">
                ({lesson.subject || lesson.classroom})
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block font-mono uppercase">
              {context === "dashboard" ? "Today " : ""}
              #{lesson.id} 📍 {lesson.classroom}
            </span>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white transition-colors p-1" onClick={onClose}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-0 flex-1 overflow-hidden">
        {/* MAIN AREA */}
        <div className="flex flex-col bg-white overflow-hidden">
          
          {/* 2. ACTIONS BAR (Light Gray Background) */}
          <div className="px-6 py-3 bg-[#f1f5f9] border-b border-gray-300 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">
              Students <span className="ml-1 px-1.5 py-0.5 bg-slate-200  text-xs">{sessionStudents.length}</span>
            </h3>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSelectAll}
                className="h-9 px-3 bg-white border border-gray-300 text-slate-600 text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm"
              >
                {selectedStudents.length === sessionStudents.length ? "Deselect all" : "Select all"} ({selectedStudents.length})
              </button>

              <div className="w-px h-5 bg-gray-300 mx-1"></div>

              {["Attendance", "Behaviour", "Grade", "Message"].map((label) => (
                <button
                  key={label}
                  onClick={() => {
                    if (label === "Attendance") {
                      setAttendanceApplyTo(selectedStudents.length > 0 ? "selected" : "all");
                      setShowAttendanceModal(true);
                    }
                  }}
                  className="h-9 px-3 bg-white border border-gray-300 text-slate-600 text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm"
                >
                  {label}
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.44l3.71-4.21a.75.75 0 111.08 1.04l-4.25 4.83a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {renderStudents()}
            </div>
          </div>
        </div>

        {/* 3. SIDEBAR (Slate background) */}
        <aside className="border-l border-gray-300 p-5 bg-[#f8fafc] space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3 text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Edit Mode</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/people/teachers")}
                className="w-full h-10 px-3 bg-white border border-gray-300 text-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm "
              >
                👩‍🏫 Teacher Settings
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Enrollment</h3>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setShowEnrollModal(true)}
                className="w-full h-10 px-3 bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-md "
              >
                👥 Add students
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>

    {/* MODALS - Kept exactly as your original code */}
    {showEnrollModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowEnrollModal(false)}>
    <div
      className="bg-white  border border-gray-300 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. HEADER (Dark Slate like the main modal) */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#1e293b] text-white">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Users2 size={18} className="text-indigo-400" />
          Enroll Students
        </h2>
        <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-5 overflow-y-auto">
        {/* Instruction Text */}
        <p className="text-slate-500 mb-5 text-[11px] font-semibold uppercase tracking-wider border-l-2 border-indigo-500 pl-3">
          Select the date and students to enroll in this {context === "dashboard" ? "session" : "class"}.
        </p>

        {/* Date Inputs - High Density */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 bg-slate-50 p-4 border border-slate-200 ">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Enrollment date *</label>
            <input 
              type="text" 
              defaultValue={new Date().toLocaleDateString("en-GB")} 
              className="w-full px-2 py-1.5 border border-gray-300  text-xs bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Unenrollment date (optional)</label>
            <input 
              type="text" 
              placeholder="Select date..." 
              className="w-full px-2 py-1.5 border border-gray-300  text-xs bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-5">
          <button className="h-8 px-3 text-indigo-600 border border-indigo-200  text-[11px] font-bold hover:bg-indigo-50 inline-flex items-center gap-2 shadow-sm transition-colors">
            <Copy size={12} />
            Copy from Class
          </button>
          <button
            className="h-8 px-3 bg-indigo-600 text-white  text-[11px] font-bold hover:bg-indigo-700 inline-flex items-center gap-2 shadow-sm transition-colors"
            onClick={() => setShowAddStudent(true)}
          >
            <Plus size={12} />
            Add New Student
          </button>
        </div>

        {/* Selection Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col">
            <h4 className="font-bold text-slate-700 mb-2 text-[10px] uppercase tracking-widest flex justify-between">
              <span>All Students</span>
              <span className="text-slate-400 font-normal">Count: {allStudents.length}</span>
            </h4>
            <div className="border border-gray-300  bg-white h-64 overflow-y-auto shadow-inner">
              {isLoadingAllStudents ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                </div>
              ) : (
                allStudents.map((s) => {
                  const disabled = alreadyEnrolled.includes(s.Id);
                  const selected = selectedToEnroll.includes(s.Id);
                  return (
                    <div
                      key={s.Id}
                      onClick={() =>
                        !disabled &&
                        setSelectedToEnroll((prev) => (prev.includes(s.Id) ? prev.filter((id) => id !== s.Id) : [...prev, s.Id]))
                      }
                      className={`p-2 flex justify-between items-center text-[11px] border-b border-slate-50 transition-colors cursor-pointer ${
                        disabled
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : selected
                          ? "bg-indigo-50 text-indigo-700 font-bold"
                          : "hover:bg-indigo-50/50 text-slate-600"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <div className={`w-3 h-3 border  flex items-center justify-center ${selected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                          {selected && <Check size={8} className="text-white" />}
                        </div>
                        {[s.FirstName, s.Surname].filter(Boolean).join(" ")}
                      </span>
                      {disabled && <span className="text-[9px] uppercase font-bold text-slate-400 px-1 bg-slate-200 ">Enrolled</span>}
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Tip: Use shift/control keys for multi-select</p>
          </div>

          <div className="flex flex-col">
            <h4 className="font-bold text-slate-700 mb-2 text-[10px] uppercase tracking-widest flex justify-between">
              <span>Selected</span>
              <span className="text-indigo-600">{selectedToEnroll.length}</span>
            </h4>
            <div className="border border-gray-300  bg-white h-64 overflow-y-auto shadow-inner">
              {selectedToEnroll.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 text-xs italic opacity-60">
                  <Users2 size={20} className="mb-1" />
                  No students selected
                </div>
              ) : (
                selectedToEnroll.map((id) => {
                  const student = allStudents.find((s) => s.Id === id);
                  return (
                    <div key={id} className="p-2 flex justify-between items-center bg-white border-b border-slate-50 text-[11px] hover:bg-slate-50">
                      <span className="font-bold text-slate-700">
                        {[student?.FirstName, student?.Surname].filter(Boolean).join(" ") || "Unnamed"}
                      </span>
                      <button
                        className="text-red-500 text-[10px] font-bold hover:bg-red-50 px-1.5 py-0.5  transition-colors uppercase"
                        onClick={() => setSelectedToEnroll((prev) => prev.filter((x) => x !== id))}
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
      </div>

      {/* FOOTER (Light gray bar) */}
      <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-[#f1f5f9]">
        <button
          onClick={() => {
            setShowEnrollModal(false);
            setSelectedToEnroll([]);
          }}
          className="px-4 h-8  border border-gray-300 bg-white text-slate-600 text-[11px] font-bold hover:bg-gray-50 shadow-sm transition-all"
        >
          Cancel
        </button>
        <button onClick={enrollStudents} className="px-5 h-8  bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 shadow-sm transition-all">
          Enroll Students
        </button>
      </div>
    </div>
    {showAddStudent && <AddStudentForm isOpen={showAddStudent} onClose={() => setShowAddStudent(false)} />}
  </div>
)}

    {/* UNENROLL MODAL - Kept exactly as your original code */}
    {showUnenrollModal && selectedStudent && (
      <UnenrollStudentModal
        student={selectedStudent}
        classId={selectedStudent.classId}
        onClose={() => {
          setShowUnenrollModal(false);
          setSelectedStudent(null);
        }}
        onSuccess={() => {
          fetchSessionStudents();
          setShowUnenrollModal(false);
          setSelectedStudent(null);
        }}
      />
    )}

    {/* ATTENDANCE MODAL - Kept exactly as your original code */}
    {showAttendanceModal && (
      <div 
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4" 
        onClick={() => {
          setShowAttendanceModal(false);
          setBulkAttendanceStatus(null);
        }}
      >
        <div
          className="bg-white  border border-gray-300 shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#f8fafc]">
            <h2 className="text-lg font-bold text-slate-800">Take attendance</h2>
            <button 
              onClick={() => {
                setShowAttendanceModal(false);
                setBulkAttendanceStatus(null);
              }} 
              className="h-8 w-8 grid place-items-center  hover:bg-gray-200"
            >
              ×
            </button>
          </div>

          <div className="p-6">
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={() => setBulkAttendanceStatus("Present")}
                className={`flex flex-col items-center gap-2 p-4  border-2 transition-all w-24 ${
                  bulkAttendanceStatus === "Present"
                    ? "border-green-500 bg-green-50 shadow-sm scale-105"
                    : "border-slate-100 hover:border-green-200 bg-slate-50"
                }`}
              >
                <div className="h-10 w-10  bg-green-500 flex items-center justify-center shadow-sm">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Present</span>
              </button>

              <button
                onClick={() => setBulkAttendanceStatus("Absent")}
                className={`flex flex-col items-center gap-2 p-4  border-2 transition-all w-24 ${
                  bulkAttendanceStatus === "Absent"
                    ? "border-red-500 bg-red-50 shadow-sm scale-105"
                    : "border-slate-100 hover:border-red-200 bg-slate-50"
                }`}
              >
                <div className="h-10 w-10  bg-red-500 flex items-center justify-center shadow-sm">
                  <X className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Absent</span>
              </button>

              <button
                onClick={() => setBulkAttendanceStatus("Late")}
                className={`flex flex-col items-center gap-2 p-4  border-2 transition-all w-24 ${
                  bulkAttendanceStatus === "Late"
                    ? "border-orange-500 bg-orange-50 shadow-sm scale-105"
                    : "border-slate-100 hover:border-orange-200 bg-slate-50"
                }`}
              >
                <div className="h-10 w-10  bg-orange-500 flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Late</span>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest">Apply to:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAttendanceApplyTo("all")}
                  className={`flex-1 h-10  border text-xs font-bold transition-all shadow-sm ${
                    attendanceApplyTo === "all"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-gray-300 hover:bg-slate-50"
                  }`}
                >
                  All ({sessionStudents.length})
                </button>
                <button
                  onClick={() => setAttendanceApplyTo("selected")}
                  className={`flex-1 h-10  border text-xs font-bold transition-all shadow-sm ${
                    attendanceApplyTo === "selected"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-gray-300 hover:bg-slate-50"
                  }`}
                  disabled={selectedStudents.length === 0}
                >
                  Selected ({selectedStudents.length})
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-[#f8fafc]">
            <button
              onClick={clearAttendance}
              disabled={isBulkUpdating}
              className="text-xs font-bold text-red-500 hover:underline disabled:opacity-50 uppercase tracking-tight"
            >
              Clear attendance
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAttendanceModal(false);
                  setBulkAttendanceStatus(null);
                  setAttendanceApplyTo("all");
                }}
                disabled={isBulkUpdating}
                className="px-4 h-9  border border-gray-300 text-slate-600 text-xs font-bold hover:bg-white shadow-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={saveBulkAttendance}
                disabled={!bulkAttendanceStatus || isBulkUpdating}
                className="px-6 h-9  bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md transition disabled:opacity-50"
              >
                {isBulkUpdating ? (
                  <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default SessionDetailsModal;

