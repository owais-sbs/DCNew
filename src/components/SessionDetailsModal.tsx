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
} from "lucide-react";
import axiosInstance from "./axiosInstance";
import AddStudentForm from "./AddStudentForm";

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
    <div className="h-3 w-48 rounded-full bg-gray-200 overflow-hidden flex text-xs relative">
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
    status: "Present" | "Absent" | "Late" | "Excused"
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

  const removeStudent = async (classId: number, studentId: number) => {
    try {
      setUpdatingStudent(studentId);
      const response = await axiosInstance.delete(`/Class/RemoveStudentFromSession`, {
        params: { classId, sessionId: numericSessionId, studentId },
      });
      if (response.data?.IsSuccess) {
        fetchSessionStudents();
        setOpenStudentMenu(null);
      } else {
        alert("Failed to remove student");
      }
    } catch (err) {
      console.error("Error removing student", err);
      alert("Failed to remove student");
    } finally {
      setUpdatingStudent(null);
    }
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

    return sessionStudents.map((student) => (
      <div key={student.id} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          {student.photo ? (
            <img
              src={student.photo}
              alt={student.name}
              className="h-12 w-12 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-indigo-100 border border-gray-200 flex items-center justify-center text-indigo-600 font-semibold text-sm">
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
                className={`w-full h-12 rounded-full border text-[15px] font-semibold transition-all ${
                  student.status === "Present"
                    ? "bg-green-100 text-green-700 border-green-300"
                    : student.status === "Absent"
                    ? "bg-red-100 text-red-700 border-red-300"
                    : student.status === "Late"
                    ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                    : student.status === "Excused"
                    ? "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
                disabled={student.status === "Excused" || updatingStudent === student.id}
              >
                {updatingStudent === student.id ? (
                  <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                ) : (
                  student.status ?? "Take attendance"
                )}
              </button>
              {student.status !== "Excused" && (
                <div className="absolute inset-0 hidden group-hover:flex z-20 pointer-events-auto">
                  <div className="w-full h-12 rounded-full border border-gray-300 bg-white overflow-hidden flex text-[15px] font-medium">
                    <button
                      className="flex-1 hover:bg-green-50 text-green-700"
                      onClick={() => markAttendance(student.classId, student.id, "Present")}
                    >
                      Present
                    </button>
                    <div className="w-px bg-gray-300" />
                    <button
                      className="flex-1 hover:bg-red-50 text-red-700"
                      onClick={() => markAttendance(student.classId, student.id, "Absent")}
                    >
                      Absent
                    </button>
                    <div className="w-px bg-gray-300" />
                    <button
                      className="flex-1 hover:bg-yellow-50 text-yellow-700"
                      onClick={() => markAttendance(student.classId, student.id, "Late")}
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
              className="h-9 w-9 grid place-items-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                setOpenStudentMenu(openStudentMenu === student.id ? null : student.id);
              }}
            >
              <MoreVertical className="w-4 h-4 text-indigo-600" />
            </button>
            {openStudentMenu === student.id && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Remove ${student.name} from this session?`)) {
                      removeStudent(student.classId, student.id);
                    } else {
                      setOpenStudentMenu(null);
                    }
                  }}
                >
                  Remove
                </button>
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
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={onClose}>
      <div
        className="w-full max-w-7xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {lesson.teacherNames.length > 0 && (
              <>
                <div className="h-9 w-9 rounded-full bg-blue-500 text-white grid place-items-center text-sm font-semibold">
                  {lesson.teacherNames[0]
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="text-sm text-gray-700 mr-2 truncate max-w-[180px]">
                  {lesson.teacherNames.join(", ")}
                </div>
              </>
            )}
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {lesson.time} - {lesson.className} ({lesson.subject || lesson.classroom})
              </div>
              <div className="text-sm text-gray-600">
                {context === "dashboard" ? "Today" : ""} #{lesson.id} {lesson.classroom}
              </div>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-0">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Students {sessionStudents.length}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/people/students")}
                    className="px-3 h-9 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 hover:bg-gray-50"
                  >
                    Select/deselect all
                  </button>
                  {["Attendance", "Behaviour", "Grade", "Message"].map((label) => (
                    <button
                      key={label}
                      className="px-3 h-9 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">{renderStudents()}</div>
            </div>
          </div>

          <aside className="border-l border-gray-200 p-6 bg-gray-50">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800">Edit</h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/people/teachers")}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    👩‍🏫 Teacher
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800">Actions</h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    👥 Add students
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={() => setShowEnrollModal(false)}>
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xlisson font-semibold text-gray-900">Enroll students</h2>
              <button onClick={() => setShowEnrollModal(false)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Select the date and students to enroll in this {context === "dashboard" ? "session" : "class"}.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment date *</label>
                  <input type="text" defaultValue={new Date().toLocaleDateString("en-GB")} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unenrollment date (optional)</label>
                  <input type="text" placeholder="Select date..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 inline-flex items-center gap-2">
                  <Copy size={16} />
                  Copy from another class
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                  onClick={() => setShowAddStudent(true)}
                >
                  <Plus size={16} />
                  Add new student
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">All students</h4>
                  <div className="border border-gray-200 rounded-lg h-64 overflow-y-auto">
                    {isLoadingAllStudents ? (
                      <div className="flex items-center justify-center h-40">
                        <Loader2 className="animate-spin text-blue-500" size={28} />
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
                            className={`p-2 flex justify-between cursor-pointer ${
                              disabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : selected
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {[s.FirstName, s.Surname].filter(Boolean).join(" ") || "Unnamed student"}
                            {disabled && <span className="text-xs">(Enrolled)</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Use shift and control keys to select multiple students</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Selected students</h4>
                  <div className="border border-gray-200 rounded-lg h-64 overflow-y-auto">
                    {selectedToEnroll.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400">No students selected</div>
                    ) : (
                      selectedToEnroll.map((id) => {
                        const student = allStudents.find((s) => s.Id === id);
                        return (
                          <div key={id} className="p-2 flex justify-between bg-white border-b">
                            {[student?.FirstName, student?.Surname].filter(Boolean).join(" ") || "Unnamed"}
                            <button
                              className="text-red-500 text-xs"
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
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedToEnroll([]);
                }}
                className="px-6 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={enrollStudents} className="px-6 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                Save changes
              </button>
            </div>
          </div>
          {showAddStudent && <AddStudentForm isOpen={showAddStudent} onClose={() => setShowAddStudent(false)} />}
        </div>
      )}
    </div>
  );
};

export default SessionDetailsModal;

