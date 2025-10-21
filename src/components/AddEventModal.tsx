import React, { useState } from "react";
import { 
  X, 
  Search, 
  ChevronDown, 
  Info,
  SkipForward,
  Clock,
  RotateCcw,
  Calendar,
  Users
} from "lucide-react";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddEventModal({ isOpen, onClose }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    eventName: "",
    location: "Limerick (06)",
    eventType: "",
    description: "",
    recurrence: "custom",
    eventDays: [{ date: "", startTime: "", endTime: "" }],
    participants: "",
    selectedPeople: 0,
    pricingMethod: "skip"
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addEventDay = () => {
    setFormData(prev => ({
      ...prev,
      eventDays: [...prev.eventDays, { date: "", startTime: "", endTime: "" }]
    }));
  };

  const updateEventDay = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      eventDays: prev.eventDays.map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">New event</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Event details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) => handleInputChange('eventName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder=""
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder=""
                    />
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event type (optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.eventType}
                    onChange={(e) => handleInputChange('eventType', e.target.value)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Select event type"
                  />
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder=""
                />
              </div>
            </div>
          </div>

          {/* Event schedule */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event schedule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select event recurrence</label>
                <div className="flex gap-2">
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
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select the event days and times</label>
                {formData.eventDays.map((day, index) => (
                  <div key={index} className="flex items-center gap-3 mb-3">
                    <input
                      type="text"
                      value={day.date}
                      onChange={(e) => updateEventDay(index, 'date', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="select date..."
                    />
                    <input
                      type="text"
                      value={day.startTime}
                      onChange={(e) => updateEventDay(index, 'startTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="start time..."
                    />
                    <input
                      type="text"
                      value={day.endTime}
                      onChange={(e) => updateEventDay(index, 'endTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="end time..."
                    />
                  </div>
                ))}
                <button onClick={addEventDay} className="text-blue-600 text-sm hover:underline">+ Add another day</button>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Participants
              <Info className="h-4 w-4 text-gray-400" />
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.participants}
                  onChange={(e) => handleInputChange('participants', e.target.value)}
                  className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1">
                  Quick select
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <span>{formData.selectedPeople} people selected</span>
                <Users className="h-4 w-4" />
                <button className="hover:underline">View</button>
              </div>
            </div>
          </div>

          {/* Event price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Event price
              <Info className="h-4 w-4 text-gray-400" />
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select pricing method</label>
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
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Custom fee
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
            Create event
          </button>
        </div>
      </div>
    </div>
  );
}
