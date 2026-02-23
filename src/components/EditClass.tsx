import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from './axiosInstance';
import Swal from "sweetalert2";
import {
  Plus,
  ArrowLeft,
  X,
  FileText,
  Info,
} from "lucide-react";

type DayEntry = {
  day: string;
  startTime: string;
  endTime: string;
  teacherId: string;
};

type ExistingAttachment = {
  Id: number;
  URL: string;
  FileType?: string;
};

export default function EditClass() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
    publishDate: "",
    generalNotes: ""
  });

  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [savingClassroom, setSavingClassroom] = useState(false);
  const [syllabusFiles, setSyllabusFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialScheduleRef = useRef<DayEntry[] | null>(null);

  // Helper UI component
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#f2f2f2] px-4 py-2 border-t border-b text-[13px] font-semibold text-gray-800">
      {title}
    </div>
  );

  // Fetch Masters (Teachers & Classrooms)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingTeachers(true);
      setIsLoadingClassrooms(true);
      try {
        const [tRes, cRes] = await Promise.all([
          axiosInstance.get("/Teacher/TeachersGetAll"),
          axiosInstance.get("/Class/GetAllClassRooms")
        ]);
        if (tRes.data?.IsSuccess) setTeachers(tRes.data.Data?.data || []);
        if (cRes.data?.IsSuccess) setClassrooms(cRes.data.Data || []);
      } catch (err) {
        console.error("Fetch Error", err);
      } finally {
        setIsLoadingTeachers(false);
        setIsLoadingClassrooms(false);
      }
    };
    fetchData();
  }, []);

  // Extract time "HH:mm" from ISO datetime for session inputs
  const timeFromIso = (iso: string | null | undefined): string => {
    if (!iso) return "";
    const t = iso.split("T")[1];
    return t ? t.slice(0, 5) : "";
  };

  // Fetch Existing Class Data
  useEffect(() => {
    if (!id) return;
    const fetchClassDetails = async () => {
      try {
        const res = await axiosInstance.get(`/Class/GetClassById?classId=${id}`);
        if (res.data?.IsSuccess) {
          const d = res.data.Data;
          let days: DayEntry[];
          if (Array.isArray(d.Sessions) && d.Sessions.length > 0) {
            days = d.Sessions.map((s: any) => ({
              day: s.DayOfWeek || "Monday",
              startTime: timeFromIso(s.StartTime) || (typeof s.StartTime === "string" && s.StartTime.length <= 8 ? s.StartTime.slice(0, 5) : ""),
              endTime: timeFromIso(s.EndTime) || (typeof s.EndTime === "string" && s.EndTime.length <= 8 ? s.EndTime.slice(0, 5) : ""),
              teacherId: String(s.TeacherIds?.[0] ?? s.TeacherId ?? "")
            }));
          } else if (d.Schedule?.length > 0) {
            days = d.Schedule.map((s: any) => ({
              day: s.WeekDay,
              startTime: s.StartTime ?? "",
              endTime: s.EndTime ?? "",
              teacherId: String(s.TeacherIds?.[0] || "")
            }));
          } else {
            days = [{ day: "Monday", startTime: "", endTime: "", teacherId: "" }];
          }
          initialScheduleRef.current = days;
          setFormData({
            title: d.ClassTitle || "",
            subject: d.ClassSubject || "General English With Exam Preparation",
            level: d.ClassLevel || "",
            description: d.ClassDescription || "",
            classCode: d.ClassCode || "",
            year: d.Year || "",
            creditHours: d.CreditHours || "",
            awardingBody: d.AwardingBody || "",
            bookCode: d.BookCode || "",
            classType: d.ClassType || "",
            classRoomId: String(d.ClassRooomId ?? d.Classroom ?? ""),
            recurrence: "weekly",
            startDate: d.StartDate ? d.StartDate.split("T")[0] : "",
            endDate: d.EndDate ? d.EndDate.split("T")[0] : "",
            publishDate: d.PublishDate ? d.PublishDate.split("T")[0] : "",
            generalNotes: d.ClassDescription || "",
            days
          });
          setExistingAttachments(
            Array.isArray(d.Attachments) ? d.Attachments.map((a: any) => ({
              Id: a.Id,
              URL: a.URL || a.FileUrl || "",
              FileType: a.FileType
            })) : []
          );
        }
      } catch (err) {
        console.error("Load Class Error", err);
      }
    };
    fetchClassDetails();
  }, [id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateDay = (index: number, field: keyof DayEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((d, i) => i === index ? { ...d, [field]: value } : d)
    }));
  };

  const addDay = () => {
    setFormData(prev => ({
      ...prev,
      days: [...prev.days, { day: "Monday", startTime: "", endTime: "", teacherId: "" }]
    }));
  };

  const isScheduleUnchanged = (current: DayEntry[], initial: DayEntry[] | null): boolean => {
    if (!initial || current.length !== initial.length) return false;
    return current.every((c, i) => {
      const ini = initial[i];
      return c.day === ini.day && c.startTime === ini.startTime && c.endTime === ini.endTime && c.teacherId === ini.teacherId;
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.classRoomId) {
      return Swal.fire("Required", "Please fill mandatory fields", "warning");
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("Id", id || "0");
      data.append("ClassTitle", formData.title);
      data.append("ClassRooomId", formData.classRoomId);
      data.append("ClassSubject", formData.subject);
      data.append("ClassLevel", formData.level);
      data.append("ClassDescription", formData.description);
      data.append("ClassCode", formData.classCode);
      data.append("Year", formData.year);
      data.append("CreditHours", formData.creditHours);
      data.append("AwardingBody", formData.awardingBody);
      data.append("BookCode", formData.bookCode);
      data.append("ClassType", formData.classType);
      data.append("StartDate", new Date(formData.startDate).toISOString());
      data.append("EndDate", new Date(formData.endDate).toISOString());
      if (formData.publishDate) {
        data.append("PublishDate", new Date(formData.publishDate).toISOString());
      }

      const isEdit = id && id !== "0";
      const sendSchedule = !isEdit || !isScheduleUnchanged(formData.days, initialScheduleRef.current);
      if (sendSchedule) {
        formData.days.forEach((day, index) => {
          data.append(`Schedule[${index}].WeekDay`, day.day);
          data.append(`Schedule[${index}].StartTime`, day.startTime);
          data.append(`Schedule[${index}].EndTime`, day.endTime);
          if (day.teacherId) {
            data.append(`Schedule[${index}].TeacherIds[0]`, day.teacherId);
          }
        });
      }

      // Existing attachments (Id, URL, ClassID — no file re-upload)
      existingAttachments.forEach((att, index) => {
        data.append(`Attachments[${index}].Id`, String(att.Id));
        data.append(`Attachments[${index}].URL`, att.URL);
        if (att.FileType) data.append(`Attachments[${index}].FileType`, att.FileType);
        if (id) data.append(`Attachments[${index}].ClassID`, id);
      });
      // New files
      syllabusFiles.forEach((file, index) => {
        const idx = existingAttachments.length + index;
        data.append(`Attachments[${idx}].Id`, "0");
        data.append(`Attachments[${idx}].FileDetails`, file);
        data.append(`Attachments[${idx}].FileType`, file.name.split(".").pop() || "");
        if (id) data.append(`Attachments[${idx}].ClassID`, id);
      });

      const res = await axiosInstance.post("/Class/AddOrUpdateClass", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200 || res.data?.IsSuccess) {
        Swal.fire("Success", "Class updated successfully", "success");
        navigate("/notes"); 
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update class", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 overflow-hidden mx-auto max-w-5xl my-10">
      <div className="bg-[#2b2b2e] px-4 py-2 text-white text-sm font-semibold flex items-center gap-4">
        <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} size={18} />
        Edit Class: {formData.title}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-0 space-y-0">
        <SectionHeader title="Class Details" />
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] mb-1 text-gray-700">Class title *</label>
            <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" required />
          </div>
          <div>
            <label className="block text-[13px] mb-1 text-gray-700">Class subject</label>
            <input type="text" value={formData.subject} readOnly className="w-full h-[34px] px-2 border border-gray-300 bg-gray-50 text-[13px] cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-[13px] mb-1 text-gray-700">Class level</label>
            <select value={formData.level} onChange={(e) => handleInputChange('level', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]">
                <option value="">Select class level</option>
                <option value="">Select class level</option>
                  <option value="200525">200525</option>
                  <option value="a1">a1</option>
                  <option value="A1">A1</option>
                  <option value="A1 20 25">A1 20 25</option>
                  <option value="A1 am">A1 am</option>
                  <option value="A1(2)">A1(2)</option>
                  <option value="A1(2) am">A1(2) am</option>
                  <option value="A1(2) pm">A1(2) pm</option>
                  <option value="A1(3) pm">A1(3) pm</option>
                  <option value="a2">a2</option>
                  <option value="A2">A2</option>
                  <option value="A2 am">A2 am</option>
                  <option value="A2 pm">A2 pm</option>
                  <option value="A2(2) pm">A2(2) pm</option>
                  <option value="am">am</option>
                  <option value="B1">B1</option>
                  <option value="B1 am">B1 am</option>
                  <option value="B1 new am">B1 new am</option>
                  <option value="B1 pm">B1 pm</option>
                  <option value="B2">B2</option>
                  <option value="b2">b2</option>
                  <option value="B2 new am">B2 new am</option>
                  <option value="B2(2) pm">B2(2) pm</option>
                  <option value="C1">C1</option>
                  <option value="C1 am">C1 am</option>
                  <option value="C1 pm">C1 pm</option>
                  <option value="C1(2) pm">C1(2) pm</option>
                  <option value="p2">p2</option>
                  <option value="pm">pm</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-[13px] mb-1 text-gray-700">Class description</label>
            <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="w-full h-20 px-2 py-2 border border-gray-300 text-[13px] resize-none" />
          </div>
          
          {/* New Fields Added Below */}
          <div>
            <label className="block text-[13px] mb-1 text-gray-700">Class code</label>
            <input type="text" value={formData.classCode} onChange={(e) => handleInputChange('classCode', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" />
          </div>
          <div>
            <label className="block text-[13px] mb-1 text-gray-700">Year</label>
            <input type="text" value={formData.year} onChange={(e) => handleInputChange('year', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" />
          </div>
          <div>
            <label className="block text-[13px] mb-1 text-gray-700">Credit hours</label>
            <input type="text" value={formData.creditHours} onChange={(e) => handleInputChange('creditHours', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" />
          </div>
          <div>
            <label className="block text-[13px] mb-1 text-gray-700">Awarding body</label>
            <input type="text" value={formData.awardingBody} onChange={(e) => handleInputChange('awardingBody', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" />
          </div>
          <div>
            <label className="block text-[13px] mb-1 text-gray-700">Book code</label>
            <input type="text" value={formData.bookCode} onChange={(e) => handleInputChange('bookCode', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" />
          </div>

          <div>
            <label className="block text-[13px] mb-1 text-gray-700">Classroom *</label>
            <select value={formData.classRoomId} onChange={(e) => handleInputChange('classRoomId', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" required>
              <option value="">{isLoadingClassrooms ? "Loading..." : "Select Classroom"}</option>
              {classrooms.map((room: any) => <option key={room.Id} value={room.Id}>{room.Name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] mb-1 text-gray-700">Class Type</label>
            <select value={formData.classType} onChange={(e) => handleInputChange('classType', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]">
              <option value="Regular">Regular</option>
                  <option value="Intensive">Intensive</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <SectionHeader title="Schedule Details" />
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[13px] mb-1 text-gray-700">Recurrence</label>
              <div className="flex gap-0 border border-gray-300 bg-white h-[34px] items-center">
                {["Weekly", "Custom"].map((option) => (
                    <label key={option} className="flex items-center px-3 text-[13px] cursor-pointer">
                    <input
                        type="radio"
                        name="recurrence"
                        value={option.toLowerCase()}
                        checked={formData.recurrence === option.toLowerCase()}
                        onChange={(e) => handleInputChange('recurrence', e.target.value)}
                        className="mr-2"
                    />
                    <span>{option}</span>
                    </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[13px] mb-1 text-gray-700">Start Date *</label>
              <input type="date" value={formData.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" required />
            </div>
            <div>
              <label className="block text-[13px] mb-1 text-gray-700">End Date *</label>
              <input type="date" value={formData.endDate} onChange={(e) => handleInputChange('endDate', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" required />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold mb-2 text-gray-700">Sessions & Teachers</label>
            {formData.days.map((day, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-2 bg-gray-50 border border-gray-200">
                <select value={day.day} onChange={(e) => updateDay(index, 'day', e.target.value)} className="h-[34px] border border-gray-300 text-[13px] px-1">
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
                <input type="time" value={day.startTime} onChange={(e) => updateDay(index, 'startTime', e.target.value)} className="h-[34px] border border-gray-300 text-[13px] px-1" />
                <input type="time" value={day.endTime} onChange={(e) => updateDay(index, 'endTime', e.target.value)} className="h-[34px] border border-gray-300 text-[13px] px-1" />
                <select value={day.teacherId} onChange={(e) => updateDay(index, 'teacherId', e.target.value)} className="h-[34px] border border-gray-300 text-[13px] px-1">
                  <option value="">Teacher</option>
                  {teachers.map(t => <option key={t.Id} value={t.Id}>{t.Name} {t.Surname}</option>)}
                </select>
              </div>
            ))}
            <button type="button" onClick={addDay} className="text-blue-600 text-[13px] hover:underline">+ Add Day</button>
          </div>
          
          <div className="mt-4 max-w-xs">
            <label className="block text-[13px] mb-1 text-gray-700">Publish date</label>
            <input type="date" value={formData.publishDate} onChange={(e) => handleInputChange('publishDate', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px]" />
          </div>
        </div>

        <SectionHeader title="Attachments" />
        <div className="p-4">
          <label className="block text-[13px] mb-1 text-gray-700">Class attachments</label>
          {existingAttachments.length > 0 && (
            <div className="mb-3">
              <span className="text-[12px] text-gray-500 block mb-1">Existing</span>
              <ul className="space-y-1">
                {existingAttachments.map((att, index) => (
                  <li key={att.Id} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 text-[13px]">
                    <a href={att.URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 min-w-0 text-blue-600 hover:underline truncate">
                      <FileText size={14} className="text-gray-500 flex-shrink-0" />
                      {att.URL?.split("/").pop() || `Attachment ${att.Id}`}
                    </a>
                    <button
                      type="button"
                      onClick={() => setExistingAttachments((prev) => prev.filter((_, i) => i !== index))}
                      className="p-1 text-gray-500 hover:text-red-600"
                      aria-label="Remove"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <span className="text-[12px] text-gray-500 block mb-1">Add new files</span>
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setSyllabusFiles((prev) => [...prev, ...files]);
                e.target.value = "";
              }}
              className="w-full text-[13px] text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700"
            />
            {syllabusFiles.length > 0 && (
              <ul className="mt-2 space-y-1">
                {syllabusFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 text-[13px]">
                    <span className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-gray-500 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-gray-400 text-xs flex-shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSyllabusFiles((prev) => prev.filter((_, i) => i !== index))}
                      className="p-1 text-gray-500 hover:text-red-600"
                      aria-label="Remove"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <SectionHeader title="Notes" />
        <div className="p-4">
            <label className="block text-[13px] mb-1 text-gray-700">General Notes</label>
            <textarea 
                value={formData.generalNotes} 
                onChange={(e) => handleInputChange('generalNotes', e.target.value)} 
                className="w-full h-24 px-2 py-2 border border-gray-300 text-[13px] resize-none" 
                placeholder="Enter any additional class details..."
            />
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button type="button" onClick={() => navigate(-1)} className="h-[34px] px-4 border border-gray-300 text-[13px] bg-white hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="h-[34px] px-6 bg-blue-600 text-white text-[13px] hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Update Class"}
          </button>
        </div>
      </form>
    </div>
  );
}