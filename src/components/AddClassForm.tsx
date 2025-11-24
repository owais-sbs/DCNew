import React, { useEffect, useState } from "react";
import axiosInstance from './axiosInstance'; 
import Swal from "sweetalert2";
import { 
  ChevronDown, 
  Plus, 
  Info,
  SkipForward,
  Clock,
  RotateCcw,
  Calendar,
  Users
} from "lucide-react";

export default function AddClassForm() {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    level: "",
    description: "",
    classRoomId: "",
    recurrence: "weekly",
    startDate: "",
    endDate: "",
    days: [{ day: "Monday", startTime: "", endTime: "", teacherIds: [] as string[] }],
    pricingMethod: "skip",
    students: "skip",
    publishDate: ""
  });
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
  const [openTeacherDropdown, setOpenTeacherDropdown] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true)
      setTeacherError(null)
      try {
        const response = await axiosInstance.get("/Teacher/GetAllTeachers", { signal: controller.signal })
        if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
          setTeachers(response.data.Data)
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
    if (openTeacherDropdown === null) return
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest("[data-teacher-dropdown-root]")) {
        setOpenTeacherDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [openTeacherDropdown])

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
      days: [...prev.days, { day: "Monday", startTime: "", endTime: "", teacherIds: [] }]
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
      TeacherIds: day.teacherIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id)),
    }))

    if (scheduleEntries.some((entry) => !entry.StartTime || !entry.EndTime)) {
      return Swal.fire("Required", "Please enter start and end time for each schedule day.", "warning")
    }

    if (scheduleEntries.some((entry) => !entry.TeacherIds.length)) {
      return Swal.fire("Required", "Please select at least one teacher for each schedule day.", "warning")
    }

    // 2. Build the final payload matching the C# model EXACTLY
    const payload = {
      Id: 0,
      ClassTitle: formData.title,
      ClassRooomId: Number(formData.classRoomId),
      ClassSubject: formData.subject,
      ClassLevel: formData.level,
      ClassDescription: formData.description,
      StartDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      EndDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      PublishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : null,
      IsDeleted: false,
      IsActive: true,
      CreatedOn: new Date().toISOString(),
      UpdatedOn: new Date().toISOString(),
      CreatedBy: "system",
      UpdatedBy: "system",
      Schedule: scheduleEntries,
    };

    console.log("Sending payload to API:", JSON.stringify(payload, null, 2));

    try {
      const response = await axiosInstance.post("/Class/AddOrUpdateClass", payload);
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

  const toggleTeacherSelection = (dayIndex: number, teacherId: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map((day, i) => {
        if (i !== dayIndex) return day
        const exists = day.teacherIds.includes(teacherId)
        return {
          ...day,
          teacherIds: exists
            ? day.teacherIds.filter((id) => id !== teacherId)
            : [...day.teacherIds, teacherId],
        }
      }),
    }))
  }

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
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder=""
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class level</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder=""
                  />
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
              
              <button className="text-blue-600 text-sm hover:underline">More details (optional) Show/Hide</button>
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
                    <div data-teacher-dropdown-root>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teachers for this session
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenTeacherDropdown(
                              openTeacherDropdown === index ? null : index
                            )
                          }
                          disabled={isLoadingTeachers}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                        >
                          <span className="truncate text-sm text-gray-700">
                            {day.teacherIds.length
                              ? day.teacherIds
                                  .map((id) => {
                                    const teacher = teachers.find((t) => String(t.Id) === id)
                                    return teacher
                                      ? `${teacher.Name ?? ""} ${teacher.Surname ?? ""}`.trim()
                                      : "Unknown"
                                  })
                                  .join(", ")
                              : "Select teachers"}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                        {openTeacherDropdown === index && (
                          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {teachers.map((teacher) => {
                              const value = String(teacher.Id)
                              const checked = day.teacherIds.includes(value)
                              return (
                                <label
                                  key={teacher.Id}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleTeacherSelection(index, value)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="truncate">
                                    {teacher.Name} {teacher.Surname}
                                  </span>
                                </label>
                              )
                            })}
                            {!teachers.length && (
                              <div className="px-3 py-2 text-sm text-gray-500">
                                {isLoadingTeachers
                                  ? "Loading teachers..."
                                  : "No teachers available"}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {teacherError && index === 0 && (
                        <p className="text-sm text-red-600 mt-1">{teacherError}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Click to open the dropdown then check all teachers who teach this slot.
                      </p>
                    </div>
                  </div>
                ))}
                <button onClick={addDay} className="text-blue-600 text-sm hover:underline">+ Add another day</button>
              </div>
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