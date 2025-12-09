// /src/components/EditClass.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 1. Added useNavigate
import axiosInstance from './axiosInstance';
import Swal from "sweetalert2";
import {
  Plus,
  Info,
  SkipForward,
  Users,
  X,
  FileText,
  Upload,
} from "lucide-react";

type DayEntry = {
  day: string;
  startTime: string;
  endTime: string;
  teacherId: string;
};

const initialState = {
  Id: 0,
  title: "",
  subject: "General English With Exam Preparation",
  level: "",
  description: "",
  classCode: "",
  year: "",
  creditHours: "",
  awardingBody: "",
  bookCode: "",
  classType: "",
  classRoomId: "",
  recurrence: "weekly",
  startDate: "",
  endDate: "",
  days: [{ day: "Monday", startTime: "", endTime: "", teacherId: "" }] as DayEntry[],
  pricingMethod: "skip",
  students: "skip",
  publishDate: "",
};

const EditClass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // 2. Initialize navigate hook

  const [formData, setFormData] = useState<typeof initialState>(initialState);

  // UI state
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  // Teachers
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Classrooms
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
  const [classroomError, setClassroomError] = useState<string | null>(null);
  const [classroomSuccess, setClassroomSuccess] = useState<string | null>(null);

  // Create classroom modal
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [savingClassroom, setSavingClassroom] = useState(false);

  // Files
  const [syllabusFiles, setSyllabusFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);

  // -------------------------
  // Helpers
  // -------------------------
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addDay = () => {
    setFormData((prev) => ({
      ...prev,
      days: [...prev.days, { day: "Monday", startTime: "", endTime: "", teacherId: "" }],
    }));
  };

  const updateDay = (index: number, field: keyof DayEntry, value: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    }));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

  // -------------------------
  // Fetch teachers
  // -------------------------
  useEffect(() => {
    const ctrl = new AbortController();
    const fetchTeachers = async () => {
      try {
        setIsLoadingTeachers(true);
        setTeacherError(null);
        const res = await axiosInstance.get("/Teacher/GetAllTeachers", {
          params: { pageNumber: 1, pageSize: 100 },
          signal: ctrl.signal,
        });
        if (res.data?.IsSuccess) {
          const list = res.data.Data?.data || res.data.Data || [];
          setTeachers(Array.isArray(list) ? list : []);
        } else {
          setTeachers([]);
          setTeacherError("No teachers available.");
        }
      } catch (err) {
        if (ctrl.signal.aborted) return;
        console.error("Failed to fetch teachers", err);
        setTeacherError("Failed to load teachers.");
      } finally {
        if (!ctrl.signal.aborted) setIsLoadingTeachers(false);
      }
    };
    fetchTeachers();
    return () => ctrl.abort();
  }, []);

  // -------------------------
  // Fetch classrooms
  // -------------------------
  useEffect(() => {
    const ctrl = new AbortController();
    const fetchClassrooms = async () => {
      try {
        setIsLoadingClassrooms(true);
        setClassroomError(null);
        const res = await axiosInstance.get("/Class/GetAllClassRooms", { signal: ctrl.signal });
        if (res.data?.IsSuccess && Array.isArray(res.data.Data)) {
          setClassrooms(res.data.Data);
          if (!formData.classRoomId && res.data.Data.length) {
            setFormData((p) => ({ ...p, classRoomId: String(res.data.Data[0].Id) }));
          }
        } else {
          setClassrooms([]);
        }
      } catch (err) {
        if (ctrl.signal.aborted) return;
        console.error("Failed to fetch classrooms", err);
        setClassroomError("Failed to load classrooms.");
      } finally {
        if (!ctrl.signal.aborted) setIsLoadingClassrooms(false);
      }
    };
    fetchClassrooms();
    return () => ctrl.abort();
  }, []);

  const refreshClassrooms = async (selectedId?: number) => {
    try {
      setIsLoadingClassrooms(true);
      const res = await axiosInstance.get("/Class/GetAllClassRooms");
      if (res.data?.IsSuccess && Array.isArray(res.data.Data)) {
        setClassrooms(res.data.Data);
        if (selectedId) setFormData((p) => ({ ...p, classRoomId: String(selectedId) }));
      }
    } catch (err) {
      console.error("refreshClassrooms error", err);
    } finally {
      setIsLoadingClassrooms(false);
    }
  };

  // -------------------------
  // Fetch class by id if present in URL
  // -------------------------
  useEffect(() => {
    const qClassId = id; 
    
    if (!qClassId) return;

    const ctrl = new AbortController();
    const fetchClass = async (classId: number) => {
      try {
        setIsLoadingClassrooms(true);
        const res = await axiosInstance.get("/Class/GetClassById", {
          params: { classId },
          signal: ctrl.signal,
        });
        if (!res.data?.IsSuccess) {
          Swal.fire("Error", res.data?.Message || "Failed to load class.", "error");
          return;
        }

        const data = res.data.Data;
        if (!data) return;

        const mappedDays: DayEntry[] =
          Array.isArray(data.Schedule) && data.Schedule.length
            ? data.Schedule.map((s: any) => ({
                day: s.WeekDay || "Monday",
                startTime: s.StartTime || "",
                endTime: s.EndTime || "",
                teacherId:
                  Array.isArray(s.TeacherIds) && s.TeacherIds.length ? String(s.TeacherIds[0]) : "",
              }))
            : [{ day: "Monday", startTime: "", endTime: "", teacherId: "" }];

        const attachmentsFromApi = Array.isArray(data.Attachments) ? data.Attachments : [];

        setFormData((prev) => ({
          ...prev,
          Id: data.Id || Number(classId),
          title: data.ClassTitle ?? prev.title,
          subject: data.ClassSubject ?? prev.subject,
          level: data.ClassLevel ?? prev.level,
          description: data.ClassDescription ?? prev.description,
          classCode: data.ClassCode ?? prev.classCode,
          year: data.Year ?? prev.year,
          creditHours: data.CreditHours ?? prev.creditHours,
          awardingBody: data.AwardingBody ?? prev.awardingBody,
          bookCode: data.BookCode ?? prev.bookCode,
          classType: data.ClassType ?? prev.classType,
          classRoomId: data.ClassRooomId ? String(data.ClassRooomId) : prev.classRoomId,
          recurrence: prev.recurrence,
          startDate: data.StartDate ? data.StartDate.split("T")[0] : prev.startDate,
          endDate: data.EndDate ? data.EndDate.split("T")[0] : prev.endDate,
          publishDate: data.PublishDate ? data.PublishDate.split("T")[0] : prev.publishDate,
          days: mappedDays,
        }));

        setExistingAttachments(attachmentsFromApi);
      } catch (err) {
        if (ctrl.signal.aborted) return;
        console.error("Failed to fetch class by id", err);
        Swal.fire("Error", "Failed to load class data.", "error");
      } finally {
        if (!ctrl.signal.aborted) setIsLoadingClassrooms(false);
      }
    };

    fetchClass(Number(qClassId));
    return () => ctrl.abort();
  }, [id]);

  // -------------------------
  // Create classroom modal submit
  // -------------------------
  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassroomName.trim()) {
      setClassroomError("Classroom name is required.");
      return;
    }
    try {
      setSavingClassroom(true);
      setClassroomError(null);
      setClassroomSuccess(null);
      const res = await axiosInstance.post("/Class/AddClassRoom", {
        Id: 0,
        Name: newClassroomName.trim(),
      });
      if (res.data?.IsSuccess && res.data?.Data?.Id) {
        await refreshClassrooms(res.data.Data.Id);
        setShowClassroomModal(false);
        setNewClassroomName("");
        setClassroomSuccess("Classroom added successfully.");
        setTimeout(() => setClassroomSuccess(null), 2500);
      } else {
        setClassroomError(res.data?.Message || "Failed to add classroom.");
      }
    } catch (err) {
      console.error("Failed to add classroom", err);
      // @ts-ignore
      setClassroomError(err?.response?.data?.Message || "Failed to add classroom.");
    } finally {
      setSavingClassroom(false);
    }
  };

  // -------------------------
  // Convert newly uploaded files to attachments (base64)
  // -------------------------
  const convertFilesToBase64 = async (currentId: number) => {
    const arr = await Promise.all(
      syllabusFiles.map(async (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const base64 = await fileToBase64(file);
        return {
          Id: 0,
          FileDetails: base64,
          FileType: ext,
          URL: "",
          ClassID: currentId,
        };
      })
    );
    return arr;
  };

  // -------------------------
  // Submit create/update
  // -------------------------
  const handleSubmit = async () => {
    const currentId = id ? Number(id) : (formData.Id || 0);

    // validations
    if (!formData.title.trim()) return Swal.fire("Required", "Class title is required.", "warning");
    if (!formData.startDate || !formData.endDate)
      return Swal.fire("Required", "Start Date and End Date are required.", "warning");
    if (!formData.classRoomId) return Swal.fire("Required", "Please select a classroom.", "warning");
    if (!formData.days.length) return Swal.fire("Required", "Please add at least one schedule day.", "warning");

    const scheduleEntries = formData.days.map((d) => ({
      WeekDay: d.day,
      StartTime: d.startTime,
      EndTime: d.endTime,
      TeacherIds: d.teacherId ? [Number(d.teacherId)].filter((n) => !isNaN(n)) : [],
    }));

    if (scheduleEntries.some((s) => !s.StartTime || !s.EndTime))
      return Swal.fire("Required", "Please enter start and end time for each schedule day.", "warning");
    if (scheduleEntries.some((s) => !s.TeacherIds || s.TeacherIds.length === 0))
      return Swal.fire("Required", "Please select a teacher for each schedule day.", "warning");

    try {
      const newAttachments = await convertFilesToBase64(currentId);
      const mergedAttachments = [
        ...(existingAttachments || []).map((a: any) => ({
          Id: a.Id ?? 0,
          FileDetails: a.FileDetails ?? null,
          FileType: a.FileType ?? null,
          URL: a.URL ?? a.Url ?? "",
          ClassID: a.ClassID ?? currentId,
        })),
        ...newAttachments,
      ];

      const payload = {
        Id: currentId, 
        ClassTitle: formData.title,
        ClassRooomId: Number(formData.classRoomId),
        ClassSubject: formData.subject,
        ClassLevel: formData.level,
        ClassDescription: formData.description,
        ClassCode: formData.classCode || null,
        Year: formData.year || null,
        CreditHours: formData.creditHours || null,
        AwardingBody: formData.awardingBody || null,
        BookCode: formData.bookCode || null,
        ClassType: formData.classType || null,
        StartDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        EndDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        PublishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : null,
        IsDeleted: false,
        IsActive: true,
        CreatedOn: currentId === 0 ? new Date().toISOString() : undefined,
        UpdatedOn: new Date().toISOString(),
        CreatedBy: currentId === 0 ? "system" : undefined,
        UpdatedBy: "system",
        Schedule: scheduleEntries,
        Attachments: mergedAttachments,
      };

      const res = await axiosInstance.post("/Class/AddOrUpdateClass", payload);

      if (res.data?.IsSuccess) {
        // 3. Updated Success Block with Redirect
        Swal.fire({
          icon: "success",
          title: currentId > 0 ? "Class updated" : "Class created",
          text: res.data?.Message || "Operation successful",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/notes/classes"); // Redirects after alert closes or timer ends
        });
      } else {
        Swal.fire("Error", res.data?.Message || "Failed to save class", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      // @ts-ignore
      Swal.fire("Error", err?.response?.data?.Message || "Failed to save class", "error");
    }
  };

  const removeNewFile = (index: number) => {
    setSyllabusFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------
  // JSX
  // -------------------------
  return (
    <div>
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{id ? "Edit class" : "Create class"}</h1>

        <div className="space-y-6">
          {/* Class details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Class details</h3>
              <button className="text-blue-600 text-sm hover:underline">Copy from existing class</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class title <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class subject</label>
                  <input type="text" value="General English With Exam Preparation" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class level</label>
                  <select value={formData.level} onChange={(e) => handleInputChange("level", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Select class level</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class description</label>
                <textarea value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              <button type="button" onClick={() => setShowMoreDetails((s) => !s)} className="text-blue-600 text-sm hover:underline">More details (optional) {showMoreDetails ? "Hide" : "Show"}</button>

              {showMoreDetails && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class code</label>
                    <input type="text" value={formData.classCode} onChange={(e) => handleInputChange("classCode", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input type="text" value={formData.year} onChange={(e) => handleInputChange("year", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit hours</label>
                    <input type="text" value={formData.creditHours} onChange={(e) => handleInputChange("creditHours", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Classroom */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Classroom</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classroom <span className="text-red-500">*</span>
                <button type="button" onClick={() => { setNewClassroomName(""); setClassroomError(null); setShowClassroomModal(true); }} className="text-blue-600 text-sm ml-2 hover:underline">(add new)</button>
              </label>
              <select value={formData.classRoomId} onChange={(e) => handleInputChange("classRoomId", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoadingClassrooms}>
                <option value="">{isLoadingClassrooms ? "Loading classrooms..." : "Select classroom"}</option>
                {classrooms.map((r) => <option key={r.Id} value={r.Id}>{r.Name}</option>)}
              </select>
              {classroomError && <p className="text-sm text-red-600 mt-1">{classroomError}</p>}
              {classroomSuccess && <p className="text-sm text-green-600 mt-1">{classroomSuccess}</p>}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Class schedule</h3>

            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start date <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.startDate} onChange={(e) => handleInputChange("startDate", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End date <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.endDate} onChange={(e) => handleInputChange("endDate", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select the lesson days, times & teachers</label>
                {formData.days.map((d, idx) => (
                  <div key={idx} className="mb-4 border border-gray-200 rounded-lg p-3">
                    <div className="flex gap-3 flex-wrap">
                      <select value={d.day} onChange={(e) => updateDay(idx, "day", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                        <option>Saturday</option>
                        <option>Sunday</option>
                      </select>
                      <input type="time" value={d.startTime} onChange={(e) => updateDay(idx, "startTime", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                      <input type="time" value={d.endTime} onChange={(e) => updateDay(idx, "endTime", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teacher for this session <span className="text-red-500">*</span></label>
                      <select value={d.teacherId} onChange={(e) => updateDay(idx, "teacherId", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoadingTeachers}>
                        <option value="">{isLoadingTeachers ? "Loading teachers..." : "Select teacher"}</option>
                        {teachers.map((t) => <option key={t.Id} value={String(t.Id)}>{t.Name} {t.Surname}</option>)}
                      </select>
                      {teacherError && idx === 0 && <p className="text-sm text-red-600 mt-1">{teacherError}</p>}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addDay} className="text-blue-600 text-sm hover:underline">+ Add another day</button>
              </div>
            </div>
          </div>

          {/* Syllabus */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Syllabus</h3>

            <div className="mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm text-blue-600 font-medium">Click to upload</span>
                  <span className="text-sm text-gray-500"> or drag and drop</span>
                  <input type="file" multiple onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSyllabusFiles((p) => [...p, ...files]);
                  }} className="hidden" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" />
                </label>
                <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB each</p>
              </div>
            </div>

            {/* Existing attachments */}
            {existingAttachments.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Existing files on class</div>
                {existingAttachments.map((att, i) => (
                  <div key={`exist-${i}`} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg mb-2">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium truncate">{att.FileName || att.URL || `Attachment ${i + 1}`}</div>
                        <div className="text-xs text-gray-500">{att.FileType || att.URL}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Newly uploaded files */}
            {syllabusFiles.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-2">New files to upload</div>
                {syllabusFiles.map((f, i) => (
                  <div key={`new-${i}`} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg mb-2">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium truncate">{f.name}</div>
                        <div className="text-xs text-gray-500">{(f.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeNewFile(i)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Students */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Students</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => handleInputChange("students", "skip")} className={`px-4 py-2 rounded-lg ${formData.students === "skip" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-white text-gray-700 border border-gray-300"}`}>
                <SkipForward className="h-4 w-4 inline-block" /> Skip
              </button>
              <button type="button" onClick={() => handleInputChange("students", "select")} className={`px-4 py-2 rounded-lg ${formData.students === "select" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-white text-gray-700 border border-gray-300"}`}>
                <Users className="h-4 w-4 inline-block" /> Select students
              </button>
            </div>
          </div>

          {/* Publish date */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Publish date <Info className="h-4 w-4 text-gray-400" />
            </h3>
            <input type="date" value={formData.publishDate} onChange={(e) => handleInputChange("publishDate", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={() => navigate("/notes/classes")} className="px-6 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">Cancel</button>
            <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {id ? "Update class" : "Add class"}
            </button>
          </div>
        </div>
      </div>

      {/* Create classroom modal */}
      {showClassroomModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Add classroom</h2>
              <button onClick={() => { setShowClassroomModal(false); setClassroomError(null); }} className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Close</span>X
              </button>
            </div>
            <form onSubmit={handleCreateClassroom} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classroom name *</label>
                <input type="text" value={newClassroomName} onChange={(e) => setNewClassroomName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              {classroomError && <p className="text-sm text-red-600">{classroomError}</p>}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                <button type="button" onClick={() => { setShowClassroomModal(false); setClassroomError(null); }} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={savingClassroom} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{savingClassroom ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditClass;