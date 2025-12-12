import React, { useEffect, useState } from "react";
import axiosInstance from './axiosInstance'; 
import Swal from "sweetalert2";
import { 
  Plus, 
  Info,
  SkipForward,
  Clock,
  RotateCcw,
  Calendar,
  Users,
  X,
  FileText,
  Upload
} from "lucide-react";

export default function AddClassForm() {
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
    days: [{ day: "Monday", startTime: "", endTime: "", teacherId: "" }],
    pricingMethod: "skip",
    students: "skip",
    publishDate: ""
  });
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)
  const [teacherError, setTeacherError] = useState<string | null>(null)
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false)
  const [classroomError, setClassroomError] = useState<string | null>(null)
  const [classroomSuccess, setClassroomSuccess] = useState<string | null>(null)
  const [showClassroomModal, setShowClassroomModal] = useState(false)
  const [newClassroomName, setNewClassroomName] = useState("")
  const [savingClassroom, setSavingClassroom] = useState(false)
  const [syllabusFiles, setSyllabusFiles] = useState<File[]>([])

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data:image/png;base64, or data:application/pdf;base64, prefix
        const base64 = result.includes(",") ? result.split(",")[1] : result
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  useEffect(() => {
    const controller = new AbortController()
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true)
      setTeacherError(null)
      try {
        const response = await axiosInstance.get("/Teacher/GetAllTeachers", {
          params: {
            pageNumber: 1,
            pageSize: 10
          },
          signal: controller.signal
        })
        if (response.data?.IsSuccess) {
          // API returns: { IsSuccess: true, Data: { data: [...] } }
          const teachersData = response.data.Data?.data || []
          if (Array.isArray(teachersData)) {
            setTeachers(teachersData)
          } else {
            setTeachers([])
            setTeacherError("No teachers available.")
          }
        } else {
          setTeachers([])
          setTeacherError("No teachers available.")
        }
      } catch (error: any) {
        if (controller.signal.aborted) return
        console.error("Failed to load teachers", error)
        setTeacherError("Failed to load teachers. Please try again.")
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingTeachers(false)
        }
      }
    }
    fetchTeachers()
    return () => controller.abort()
  }, [])


  useEffect(() => {
    const controller = new AbortController()
    const fetchClassrooms = async () => {
      try {
        setIsLoadingClassrooms(true)
        setClassroomError(null)
        const response = await axiosInstance.get("/Class/GetAllClassRooms", {
          signal: controller.signal,
        })
        if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
          setClassrooms(response.data.Data)
          if (!formData.classRoomId && response.data.Data.length) {
            setFormData((prev) => ({
              ...prev,
              classRoomId: String(response.data.Data[0].Id),
            }))
          }
        } else {
          setClassrooms([])
          setClassroomError("No classrooms available.")
        }
      } catch (error: any) {
        if (controller.signal.aborted) return
        console.error("Failed to load classrooms", error)
        setClassroomError("Failed to load classrooms. Please try again.")
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingClassrooms(false)
        }
      }
    }
    fetchClassrooms()
    return () => controller.abort()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDay = () => {
    setFormData(prev => ({
      ...prev,
      days: [...prev.days, { day: "Monday", startTime: "", endTime: "", teacherId: "" }]
    }));
  };

  const refreshClassrooms = async (selectedId?: number) => {
    try {
      setIsLoadingClassrooms(true)
      const response = await axiosInstance.get("/Class/GetAllClassRooms")
      if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
        setClassrooms(response.data.Data)
        if (selectedId) {
          setFormData((prev) => ({ ...prev, classRoomId: String(selectedId) }))
        }
      }
    } catch (error) {
      console.error("Failed to refresh classrooms", error)
    } finally {
      setIsLoadingClassrooms(false)
    }
  }

  // ####################################################################
  // ## CHANGED: This entire function is updated to match your C# model ##
  // ####################################################################
  const handleSubmit = async () => {
    // ✅ Basic form validation
    if (!formData.title.trim()) {
      return Swal.fire("Required", "Class title is required.", "warning");
    }
    if (!formData.startDate.trim() || !formData.endDate.trim()) {
      return Swal.fire("Required", "Start Date and End Date are required.", "warning");
    }
    if (formData.days.length === 0) {
      return Swal.fire("Required", "Please add at least one schedule day.", "warning");
    }

    if (!formData.classRoomId) {
      return Swal.fire("Required", "Please select a classroom.", "warning")
    }

    const scheduleEntries = formData.days.map((day) => ({
      WeekDay: day.day,
      StartTime: day.startTime,
      EndTime: day.endTime,
      TeacherIds: day.teacherId ? [Number(day.teacherId)].filter((id) => !Number.isNaN(id)) : [],
    }))

    if (scheduleEntries.some((entry) => !entry.StartTime || !entry.EndTime)) {
      return Swal.fire("Required", "Please enter start and end time for each schedule day.", "warning")
    }

    if (scheduleEntries.some((entry) => !entry.TeacherIds.length)) {
      return Swal.fire("Required", "Please select a teacher for each schedule day.", "warning")
    }

    try {
      // Create FormData for [FromForm] endpoint
      const formDataToSend = new FormData();

      // Append basic class properties
      formDataToSend.append("Id", "0");
      formDataToSend.append("ClassTitle", formData.title);
      formDataToSend.append("ClassRooomId", String(formData.classRoomId));
      if (formData.subject) formDataToSend.append("ClassSubject", formData.subject);
      if (formData.level) formDataToSend.append("ClassLevel", formData.level);
      if (formData.description) formDataToSend.append("ClassDescription", formData.description);
      if (formData.classCode) formDataToSend.append("ClassCode", formData.classCode);
      if (formData.year) formDataToSend.append("Year", formData.year);
      if (formData.creditHours) formDataToSend.append("CreditHours", formData.creditHours);
      if (formData.awardingBody) formDataToSend.append("AwardingBody", formData.awardingBody);
      if (formData.bookCode) formDataToSend.append("BookCode", formData.bookCode);
      if (formData.classType) formDataToSend.append("ClassType", formData.classType);
      
      if (formData.startDate) {
        formDataToSend.append("StartDate", new Date(formData.startDate).toISOString());
      }
      if (formData.endDate) {
        formDataToSend.append("EndDate", new Date(formData.endDate).toISOString());
      }
      if (formData.publishDate) {
        formDataToSend.append("PublishDate", new Date(formData.publishDate).toISOString());
      }
      
      formDataToSend.append("IsDeleted", "false");
      formDataToSend.append("IsActive", "true");
      formDataToSend.append("CreatedOn", new Date().toISOString());
      formDataToSend.append("UpdatedOn", new Date().toISOString());
      formDataToSend.append("CreatedBy", "system");
      formDataToSend.append("UpdatedBy", "system");

      // Append Schedule entries
      scheduleEntries.forEach((schedule, index) => {
        formDataToSend.append(`Schedule[${index}].WeekDay`, schedule.WeekDay);
        formDataToSend.append(`Schedule[${index}].StartTime`, schedule.StartTime);
        formDataToSend.append(`Schedule[${index}].EndTime`, schedule.EndTime);
        schedule.TeacherIds.forEach((teacherId, teacherIndex) => {
          formDataToSend.append(`Schedule[${index}].TeacherIds[${teacherIndex}]`, String(teacherId));
        });
      });

      // Append Attachments with actual File objects
      syllabusFiles.forEach((file, index) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        formDataToSend.append(`Attachments[${index}].Id`, "0");
        formDataToSend.append(`Attachments[${index}].FileDetails`, file);
        formDataToSend.append(`Attachments[${index}].FileType`, fileExtension);
        formDataToSend.append(`Attachments[${index}].URL`, "");
        formDataToSend.append(`Attachments[${index}].ClassID`, "0");
      });

      console.log("Sending FormData to API with", syllabusFiles.length, "attachment(s)");

      const response = await axiosInstance.post("/Class/AddOrUpdateClass", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Swal.fire({
        icon: "success",
        title: "Class Created",
        text: response.data || "Your class has been added successfully.",
        confirmButtonColor: "#2563eb"
      });
      // You might want to reset the form here
      // setFormData({ ...initialState }); 
    } catch (error: any) {
      console.error("API Error:", error.response || error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.title || error.response?.data || "Something went wrong.",
        confirmButtonColor: "#dc2626"
      });
    }
  };

  const updateDay = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      )
    }));
  };


  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClassroomName.trim()) {
      setClassroomError("Classroom name is required.")
      return
    }
    try {
      setSavingClassroom(true)
      setClassroomError(null)
      setClassroomSuccess(null)
      const response = await axiosInstance.post("/Class/AddClassRoom", {
        Id: 0,
        Name: newClassroomName.trim(),
      })
      if (response.data?.IsSuccess && response.data?.Data?.Id) {
        await refreshClassrooms(response.data.Data.Id)
        setShowClassroomModal(false)
        setNewClassroomName("")
        setClassroomSuccess("Classroom added successfully.")
        setTimeout(() => setClassroomSuccess(null), 3000)
      } else {
        setClassroomError(response.data?.Message || "Failed to add classroom.")
      }
    } catch (error: any) {
      console.error("Failed to add classroom", error)
      setClassroomError(
        error?.response?.data?.Message || "Failed to add classroom. Please try again."
      )
      setClassroomSuccess(null)
    } finally {
      setSavingClassroom(false)
    }
  }

  // ####################################################################
  // ## The JSX remains mostly the same, with minor input type fixes   ##
  // ####################################################################
  return (
    <div>
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add class</h1>
        
        <div className="space-y-6">
          {/* Class details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* ... (No changes in this section) ... */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Class details</h3>
              <button className="text-blue-600 text-sm hover:underline">Copy from existing class</button>
            </div>
            
            <div className="space-y-4">
              {/* Three fields in one row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder=""
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class subject</label>
                  <input
                    type="text"
                    value="General English With Exam Preparation"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder=""
                    title="General English With Exam Preparation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
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
              </div>
              
              {/* Description takes full row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder=""
                />
              </div>
              
              <button 
                type="button"
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="text-blue-600 text-sm hover:underline"
              >
                More details (optional) {showMoreDetails ? 'Hide' : 'Show'}
              </button>
              
              {showMoreDetails && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class code</label>
                    <input
                      type="text"
                      value={formData.classCode}
                      onChange={(e) => handleInputChange('classCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder=""
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder=""
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit hours</label>
                    <input
                      type="text"
                      value={formData.creditHours}
                      onChange={(e) => handleInputChange('creditHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder=""
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Awarding body</label>
                    <input
                      type="text"
                      value={formData.awardingBody}
                      onChange={(e) => handleInputChange('awardingBody', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder=""
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Book code</label>
                    <input
                      type="text"
                      value={formData.bookCode}
                      onChange={(e) => handleInputChange('bookCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder=""
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class type</label>
                    <select
                      value={formData.classType}
                      onChange={(e) => handleInputChange('classType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select class type</option>
                      <option value="Regular">Regular</option>
                      <option value="Intensive">Intensive</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Classroom */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Classroom</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classroom <span className="text-red-500">*</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setNewClassroomName("")
                      setClassroomError(null)
                      setShowClassroomModal(true)
                    }}
                    className="text-blue-600 text-sm ml-2 hover:underline"
                  >
                    (add new)
                  </button>
                </label>
                <select
                  value={formData.classRoomId}
                  onChange={(e) => handleInputChange('classRoomId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoadingClassrooms}
                >
                  <option value="">
                    {isLoadingClassrooms ? "Loading classrooms..." : "Select classroom"}
                  </option>
                  {classrooms.map((room: any) => (
                    <option key={room.Id} value={room.Id}>
                      {room.Name}
                    </option>
                  ))}
                </select>
                {classroomError && <p className="text-sm text-red-600 mt-1">{classroomError}</p>}
                {classroomSuccess && <p className="text-sm text-green-600 mt-1">{classroomSuccess}</p>}
              </div>
            </div>
          </div>

          {/* Class schedule */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Class schedule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select class recurrence</label>
                {/* ... (No changes in this section) ... */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInputChange('recurrence', 'weekly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      formData.recurrence === 'weekly' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => handleInputChange('recurrence', 'custom')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      formData.recurrence === 'custom' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    Custom dates
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* ... (No changes in this section) ... */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select the lesson days, times & teachers</label>
                {formData.days.map((day, index) => (
                  <div key={index} className="space-y-3 mb-4 border border-gray-200 rounded-lg p-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={day.day}
                        onChange={(e) => updateDay(index, 'day', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                        <option>Saturday</option>
                        <option>Sunday</option>
                      </select>
                      
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateDay(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateDay(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teacher for this session <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={day.teacherId}
                        onChange={(e) => updateDay(index, 'teacherId', e.target.value)}
                        disabled={isLoadingTeachers}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">
                          {isLoadingTeachers ? "Loading teachers..." : "Select teacher"}
                        </option>
                        {teachers.map((teacher) => (
                          <option key={teacher.Id} value={String(teacher.Id)}>
                            {teacher.Name} {teacher.Surname}
                          </option>
                        ))}
                      </select>
                      {teacherError && index === 0 && (
                        <p className="text-sm text-red-600 mt-1">{teacherError}</p>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={addDay} className="text-blue-600 text-sm hover:underline">+ Add another day</button>
              </div>
            </div>
          </div>

          {/* Syllabus */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Syllabus</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload syllabus files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-sm text-gray-500"> or drag and drop</span>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          setSyllabusFiles((prev) => [...prev, ...files])
                        }}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB each</p>
                  </div>
                </div>
              </div>

              {syllabusFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Uploaded files:</div>
                  {syllabusFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSyllabusFiles((prev) => prev.filter((_, i) => i !== index))
                        }}
                        className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Students */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* ... (No changes in this section) ... */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Students</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleInputChange('students', 'skip')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  formData.students === 'skip' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </button>
              <button
                onClick={() => handleInputChange('students', 'select')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  formData.students === 'select' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <Users className="h-4 w-4" />
                Select students
              </button>
            </div>
          </div>
          
          {/* Publish date */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Publish date
              <Info className="h-4 w-4 text-gray-400" />
            </h3>
            
            {/* CHANGED: type="date" to send correct format to API */}
            <input
              type="date"
              value={formData.publishDate}
              onChange={(e) => handleInputChange('publishDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <button className="px-6 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add class
            </button>
          </div>
        </div>
      </div>
      {showClassroomModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Add classroom</h2>
              <button
                onClick={() => {
                  setShowClassroomModal(false)
                  setClassroomError(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-lg leading-none"
              >
                <span className="sr-only">Close</span>X
              </button>
            </div>
            <form onSubmit={handleCreateClassroom} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classroom name *
                </label>
                <input
                  type="text"
                  value={newClassroomName}
                  onChange={(e) => setNewClassroomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter classroom name"
                />
              </div>
              {classroomError && (
                <p className="text-sm text-red-600">{classroomError}</p>
              )}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowClassroomModal(false)
                    setClassroomError(null)
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={savingClassroom}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
                  disabled={savingClassroom}
                >
                  {savingClassroom ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}