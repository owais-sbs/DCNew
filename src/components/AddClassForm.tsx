import React, { useState } from "react";
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
    teacher: "Abbey teacher",
    teacherFee: "",
    classroom: "Class 1",
    recurrence: "weekly",
    startDate: "",
    endDate: "",
    // CHANGED: startTime and endTime defaults to ""
    days: [{ day: "Monday", startTime: "", endTime: "" }],
    pricingMethod: "skip",
    students: "skip",
    publishDate: ""
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDay = () => {
    setFormData(prev => ({
      ...prev,
      // CHANGED: startTime and endTime defaults to ""
      days: [...prev.days, { day: "Monday", startTime: "", endTime: "" }]
    }));
  };

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

    // ✅ Prepare API model
    
    // 1. Transform the 'days' array into the 'Schedule' object (dictionary)
    //    This groups all time slots by the day of the week.
    const scheduleObject = formData.days.reduce((acc, currentDay) => {
      const { day, startTime, endTime } = currentDay;

      // The time slot object for the API
      const timeSlot = {
        StartTime: startTime || "00:00", // Use "HH:mm" format from type="time"
        EndTime: endTime || "00:00"
      };

      // If this day isn't in our accumulator object yet, create an empty array for it
      if (!acc[day]) {
        acc[day] = [];
      }

      // Push the new time slot into the correct day's array
      acc[day].push(timeSlot);
      
      return acc;
    // We type the initial value as an empty object that will match the C# model
    }, {} as { [key: string]: { StartTime: string, EndTime: string }[] });


    // 2. Build the final payload matching the C# model EXACTLY
    const payload = {
      Id: 0,
      ClassTitle: formData.title,
      ClassSubject: formData.subject,
      ClassLevel: formData.level,
      ClassDescription: formData.description,
      TeacherId: 1, // TODO: Replace this hardcoded ID with a real one
      TeacherHourlyFees: Number(formData.teacherFee || 0),
      StartDate: formData.startDate, // "YYYY-MM-DD"
      EndDate: formData.endDate,     // "YYYY-MM-DD"
      PublishDate: formData.publishDate || null, // "YYYY-MM-DD" or null
      IsDeleted: false, // Default value from your model
      IsActive: true,  // Default value from your model
      CreatedBy: "system", // Or get from auth user
      UpdatedBy: "system", // Or get from auth user
      Schedule: scheduleObject // The object we just built
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
                {/* A small validation improvement */}
                {/* <p className="text-red-500 text-xs mt-1">This field is required</p> */}
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
          
          {/* Teacher and classroom */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* ... (No changes in this section) ... */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Teacher and classroom</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher <span className="text-red-500">*</span>
                  <button className="text-blue-600 text-sm ml-2 hover:underline">(add new)</button>
                </label>
                <select
                  value={formData.teacher}
                  onChange={(e) => handleInputChange('teacher', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Abbey teacher</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher hourly fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number" // CHANGED: type="number" for fees
                    value={formData.teacherFee}
                    onChange={(e) => handleInputChange('teacherFee', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <button className="text-blue-600 text-sm hover:underline">+ Add another teacher</button>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classroom <span className="text-red-500">*</span>
                  <button className="text-blue-600 text-sm ml-2 hover:underline">(add new)</button>
                </label>
                <select
                  value={formData.classroom}
                  onChange={(e) => handleInputChange('classroom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Class 1</option>
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-3">Select the lesson days and times</label>
                {formData.days.map((day, index) => (
                  <div key={index} className="flex items-center gap-3 mb-3">
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
                    
                    {/* CHANGED: type="time" is much simpler and matches the API model */}
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => updateDay(index, 'startTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {/* CHANGED: type="time" is much simpler and matches the API model */}
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => updateDay(index, 'endTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
                <button onClick={addDay} className="text-blue-600 text-sm hover:underline">+ Add another day</button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                {/* ... (No changes in this section) ... */}
                <div>
                  <span className="text-gray-600">Total lessons:</span>
                  <span className="ml-2 font-medium">0</span>
                </div>
                <div>
                  <span className="text-gray-600">Total lessons hours:</span>
                  <span className="ml-2 font-medium">0</span>
                </div>
                <div>
                  <span className="text-gray-600">Skipped lessons:</span>
                  <span className="ml-2 font-medium">0</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skipped lesson dates</label>
                {/* ... (No changes in this section) ... */}
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add dates"
                  />
                  <Info className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Class price */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* ... (No changes in this section) ... */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Class price</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select class pricing method</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleInputChange('pricingMethod', 'skip')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    formData.pricingMethod === 'skip' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  <SkipForward className="h-4 w-4" />
                  Skip
                </button>
                <button
                  onClick={() => handleInputChange('pricingMethod', 'hourly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    formData.pricingMethod === 'hourly' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Hourly fee
                </button>
                <button
                  onClick={() => handleInputChange('pricingMethod', 'monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    formData.pricingMethod === 'monthly' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                  Monthly fee
                </button>
                <button
                  onClick={() => handleInputChange('pricingMethod', 'custom')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    formData.pricingMethod === 'custom' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-white text-gray-700 border border-blue-300'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Custom fee
                </button>
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
    </div>
  );
}