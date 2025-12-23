import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from './axiosInstance';
import Swal from "sweetalert2";
import {
  Plus,
  ArrowLeft,
  X,
  FileText,
  Upload,
  Info,
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
  const navigate = useNavigate();

  const [formData, setFormData] = useState<typeof initialState>(initialState);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [savingClassroom, setSavingClassroom] = useState(false);
  const [syllabusFiles, setSyllabusFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper UI component for consistency
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#f2f2f2] px-4 py-2 border-t border-b text-[13px] font-semibold text-gray-800">
      {title}
    </div>
  );

  // -------------------------
  // Handlers & Logic (Kept same as original)
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

  const removeDay = (index: number) => {
    if (formData.days.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== index),
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

  // Fetch Logic
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoadingTeachers(true);
        const res = await axiosInstance.get("/Teacher/GetAllTeachers", { params: { pageNumber: 1, pageSize: 100 } });
        if (res.data?.IsSuccess) setTeachers(res.data.Data?.data || res.data.Data || []);
      } catch (err) { console.error(err); } finally { setIsLoadingTeachers(false); }
    };
    const fetchClassrooms = async () => {
      try {
        setIsLoadingClassrooms(true);
        const res = await axiosInstance.get("/Class/GetAllClassRooms");
        if (res.data?.IsSuccess && Array.isArray(res.data.Data)) setClassrooms(res.data.Data);
      } catch (err) { console.error(err); } finally { setIsLoadingClassrooms(false); }
    };
    fetchTeachers();
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchClass = async (classId: number) => {
      try {
        const res = await axiosInstance.get("/Class/GetClassById", { params: { classId } });
        if (res.data?.IsSuccess) {
          const data = res.data.Data;
          const mappedDays: DayEntry[] = Array.isArray(data.Schedule) && data.Schedule.length
            ? data.Schedule.map((s: any) => ({
              day: s.WeekDay || "Monday",
              startTime: s.StartTime || "",
              endTime: s.EndTime || "",
              teacherId: Array.isArray(s.TeacherIds) && s.TeacherIds.length ? String(s.TeacherIds[0]) : "",
            })) : [{ day: "Monday", startTime: "", endTime: "", teacherId: "" }];

          setFormData(prev => ({
            ...prev,
            Id: data.Id || Number(classId),
            title: data.ClassTitle || "",
            subject: data.ClassSubject || prev.subject,
            level: data.ClassLevel || "",
            description: data.ClassDescription || "",
            classCode: data.ClassCode || "",
            year: data.Year || "",
            creditHours: data.CreditHours || "",
            classRoomId: data.ClassRooomId ? String(data.ClassRooomId) : "",
            startDate: data.StartDate ? data.StartDate.split("T")[0] : "",
            endDate: data.EndDate ? data.EndDate.split("T")[0] : "",
            publishDate: data.PublishDate ? data.PublishDate.split("T")[0] : "",
            days: mappedDays,
          }));
          setExistingAttachments(data.Attachments || []);
        }
      } catch (err) { console.error(err); }
    };
    fetchClass(Number(id));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const currentId = id ? Number(id) : (formData.Id || 0);

    // Basic Validations
    if (!formData.title.trim() || !formData.startDate || !formData.endDate || !formData.classRoomId) {
      setIsSubmitting(false);
      return Swal.fire("Required", "Please fill all mandatory fields (*)", "warning");
    }

    try {
      const newFilesBase64 = await Promise.all(syllabusFiles.map(async (file) => ({
        Id: 0,
        FileDetails: await fileToBase64(file),
        FileType: file.name.split(".").pop()?.toLowerCase() || "",
        URL: "",
        ClassID: currentId,
      })));

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
        StartDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        EndDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        PublishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : null,
        Schedule: formData.days.map(d => ({
          WeekDay: d.day,
          StartTime: d.startTime,
          EndTime: d.endTime,
          TeacherIds: d.teacherId ? [Number(d.teacherId)] : [],
        })),
        Attachments: [...existingAttachments, ...newFilesBase64],
        UpdatedOn: new Date().toISOString(),
        UpdatedBy: "system"
      };

      const res = await axiosInstance.post("/Class/AddOrUpdateClass", payload);
      if (res.data?.IsSuccess) {
        Swal.fire({ icon: "success", title: "Saved", text: "Class updated successfully", timer: 1500, showConfirmButton: false });
        navigate("/notes/classes");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save class", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassroomName.trim()) return;
    try {
      setSavingClassroom(true);
      const res = await axiosInstance.post("/Class/AddClassRoom", { Id: 0, Name: newClassroomName.trim() });
      if (res.data?.IsSuccess) {
        const freshRes = await axiosInstance.get("/Class/GetAllClassRooms");
        setClassrooms(freshRes.data.Data);
        setFormData(p => ({ ...p, classRoomId: String(res.data.Data.Id) }));
        setShowClassroomModal(false);
        setNewClassroomName("");
      }
    } catch (err) { console.error(err); } finally { setSavingClassroom(false); }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto bg-white border border-gray-300 shadow-sm overflow-hidden">

        {/* Top dark title bar */}
        <div className="bg-[#2b2b2e] px-4 py-2 text-white text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-white opacity-80 hover:opacity-100">
              <ArrowLeft size={16} />
            </button>
            <span>{id ? `Edit Class: ${formData.title}` : "Create New Class"}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-0 space-y-0">

          {/* 1. Class Details */}
          <SectionHeader title="Basic Information" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[13px] text-gray-700 mb-1">Class title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Class level</label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange("level", e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                >
                  <option value="">Select level</option>
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-[13px] text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full h-20 px-2 py-2 border border-gray-300 bg-white text-[13px] resize-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="text-blue-600 text-[12px] mt-2 hover:underline"
            >
              {showMoreDetails ? "- Less details" : "+ More details (Class Code, Year, etc.)"}
            </button>

            {showMoreDetails && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-dashed">
                <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Class code</label>
                  <input type="text" value={formData.classCode} onChange={(e) => handleInputChange("classCode", e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" />
                </div>
                <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Year</label>
                  <input type="text" value={formData.year} onChange={(e) => handleInputChange("year", e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" />
                </div>
                <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Credit hours</label>
                  <input type="text" value={formData.creditHours} onChange={(e) => handleInputChange("creditHours", e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" />
                </div>
              </div>
            )}
          </div>

          {/* 2. Classroom */}
          <SectionHeader title="Location & Classroom" />
          <div className="p-4">
            <div className="max-w-md">
              <label className="block text-[13px] text-gray-700 mb-1">
                Select Classroom <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.classRoomId}
                  onChange={(e) => handleInputChange("classRoomId", e.target.value)}
                  className="flex-1 h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  required
                >
                  <option value="">{isLoadingClassrooms ? "Loading..." : "Choose a room"}</option>
                  {classrooms.map(r => <option key={r.Id} value={r.Id}>{r.Name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowClassroomModal(true)}
                  className="h-[34px] px-3 bg-gray-100 border border-gray-300 text-[12px] hover:bg-gray-200"
                >
                  + New
                </button>
              </div>
            </div>
          </div>

          {/* 3. Schedule */}
          <SectionHeader title="Class Schedule & Teachers" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                <input type="date" value={formData.startDate} onChange={(e) => handleInputChange("startDate", e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" required />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                <input type="date" value={formData.endDate} onChange={(e) => handleInputChange("endDate", e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" required />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[13px] font-semibold text-gray-600">Weekly Sessions</label>
              {formData.days.map((d, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3 p-3 bg-[#f9f9f9] border border-gray-200 relative">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <select value={d.day} onChange={(e) => updateDay(idx, "day", e.target.value)} className="h-[34px] px-1 border border-gray-300 text-[12px]">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                    <input type="time" value={d.startTime} onChange={(e) => updateDay(idx, "startTime", e.target.value)} className="h-[34px] px-1 border border-gray-300 text-[12px]" />
                    <input type="time" value={d.endTime} onChange={(e) => updateDay(idx, "endTime", e.target.value)} className="h-[34px] px-1 border border-gray-300 text-[12px]" />
                  </div>
                  <div className="flex-1">
                    <select value={d.teacherId} onChange={(e) => updateDay(idx, "teacherId", e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[12px]" required>
                      <option value="">Select Teacher *</option>
                      {teachers.map(t => <option key={t.Id} value={String(t.Id)}>{t.Name} {t.Surname}</option>)}
                    </select>
                  </div>
                  {formData.days.length > 1 && (
                    <button type="button" onClick={() => removeDay(idx)} className="text-red-500 hover:bg-red-50 p-1">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addDay} className="flex items-center gap-1 text-blue-600 text-[13px] font-medium hover:underline">
                <Plus size={14} /> Add another session
              </button>
            </div>
          </div>

          {/* 4. Syllabus & Files */}
          <SectionHeader title="Attachments & Syllabus" />
          <div className="p-4">
            <div className="border-2 border-dashed border-gray-200 p-4 text-center bg-gray-50 mb-4">
              <input 
                type="file" 
                multiple 
                id="file-upload" 
                className="hidden" 
                onChange={(e) => setSyllabusFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                <span className="text-[13px] text-blue-600 font-medium">Click to upload files</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Existing */}
              {existingAttachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 p-2 border border-gray-200 bg-white text-[12px]">
                  <FileText size={14} className="text-gray-400" />
                  <span className="truncate flex-1">{att.FileName || "Attached File"}</span>
                  <span className="text-[10px] bg-green-100 text-green-700 px-1">Cloud</span>
                </div>
              ))}
              {/* New */}
              {syllabusFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 p-2 border border-blue-200 bg-blue-50 text-[12px]">
                  <FileText size={14} className="text-blue-400" />
                  <span className="truncate flex-1">{file.name}</span>
                  <button type="button" onClick={() => setSyllabusFiles(p => p.filter((_, idx) => idx !== i))}>
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Publish */}
          <SectionHeader title="Publish Settings" />
          <div className="p-4">
            <div className="max-w-xs">
              <label className="flex items-center gap-1 text-[13px] text-gray-700 mb-1">
                Publish Date <Info size={14} className="text-gray-400" />
              </label>
              <input type="date" value={formData.publishDate} onChange={(e) => handleInputChange("publishDate", e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t bg-white">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-[34px] px-4 border border-gray-300 text-[13px] bg-white hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[34px] px-6 bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : id ? "Update Class" : "Create Class"}
            </button>
          </div>
        </form>
      </div>

      {/* Classroom Modal (Admin Style) */}
      {showClassroomModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-400 shadow-2xl w-full max-w-sm">
             <div className="bg-[#2b2b2e] px-4 py-2 text-white text-[13px] font-semibold flex justify-between items-center">
                <span>Add New Classroom</span>
                <button onClick={() => setShowClassroomModal(false)}><X size={16}/></button>
             </div>
             <form onSubmit={handleCreateClassroom} className="p-4">
                <label className="block text-[13px] mb-1">Room Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newClassroomName} 
                  onChange={(e) => setNewClassroomName(e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 text-[13px] mb-4"
                />
                <div className="flex justify-end gap-2">
                   <button type="button" onClick={() => setShowClassroomModal(false)} className="h-[30px] px-3 border border-gray-300 text-[12px]">Cancel</button>
                   <button type="submit" disabled={savingClassroom} className="h-[30px] px-4 bg-blue-600 text-white text-[12px]">
                      {savingClassroom ? "Saving..." : "Save Room"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditClass;