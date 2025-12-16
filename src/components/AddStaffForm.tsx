import { useState } from "react"
import { X } from "lucide-react"

interface AddStaffFormProps {
  isOpen: boolean
  onClose: () => void
  asPage?: boolean
}

export default function AddStaffForm({ isOpen, onClose, asPage }: AddStaffFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    gender: "Not specified",
    dateOfBirth: "",
    idNumber: "",
    photo: null as File | null,
    staffRole: "",
    mobilePhone: "",
    homePhone: "",
    email: "",
    streetAddress: "",
    city: "",
    postcode: "",
    state: "",
    country: "Ireland",
    timezone: "Europe/London",
    generalNotes: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, photo: file }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Staff data:', formData)
    onClose()
  }

  if (!asPage && !isOpen) return null

  // UI helper for the admin flat look
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#f2f2f2] px-4 py-2 border-t border-b text-[13px] font-semibold text-gray-800">
      {title}
    </div>
  );

  return (
    <div className={asPage ? "" : "fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"} onClick={asPage ? undefined : onClose}>
      <div 
        className={`bg-white border border-gray-300 overflow-hidden
        ${asPage 
          ? "mx-[250px]" 
          : "max-w-none mx-[100px] max-h-[90vh] overflow-y-auto"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top dark title bar */}
        <div className="bg-[#2b2b2e] px-4 py-2 text-white text-sm font-semibold flex items-center justify-between">
          <div>Add Staff</div>
          {!asPage && (
            <button onClick={onClose} className="text-white opacity-80 hover:opacity-100">
              <X size={16} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-0 space-y-0">
          
          {/* Personal details */}
          <SectionHeader title="Personal Details" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Surname <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Gender</label>
                <div className="flex gap-0 border border-gray-300 bg-white h-[34px] items-center">
                  {["Male", "Female", "Not specified"].map((option) => (
                    <label key={option} className="flex items-center px-3 text-[13px] cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender === option}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="mr-2"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Date of birth</label>
                <input
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="photo"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    className="hidden"
                  />
                  <label htmlFor="photo" className="h-[34px] px-3 border border-gray-300 flex items-center text-[13px] cursor-pointer bg-white">
                    Browse...
                  </label>
                  <span className="text-[13px] text-gray-500 truncate max-w-[150px]">
                    {formData.photo ? formData.photo.name : "No file chosen"}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">jpg, jpeg, png, gif</p>
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Staff Role</label>
                <input
                  type="text"
                  value={formData.staffRole}
                  onChange={(e) => handleInputChange('staffRole', e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
            </div>
          </div>

          {/* Contact details */}
          <SectionHeader title="Contact Details" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Mobile Phone</label>
                <div className="flex items-center gap-0">
                  <div className="flex items-center gap-1 h-[34px] px-2 border border-gray-300 border-r-0 bg-gray-50">
                    <span className="text-[13px]">🇮🇪 +353</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.mobilePhone}
                    onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                    className="flex-1 h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Home Phone</label>
                <div className="flex items-center gap-0">
                  <div className="flex items-center gap-1 h-[34px] px-2 border border-gray-300 border-r-0 bg-gray-50">
                    <span className="text-[13px]">🇮🇪 +353</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.homePhone}
                    onChange={(e) => handleInputChange('homePhone', e.target.value)}
                    className="flex-1 h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Email address (recommended)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Postcode</label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">State/Province/Region</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Country</label>
                <div className="flex items-center gap-2 h-[34px] px-2 border border-gray-300 bg-white">
                  <span className="text-[13px]">🇮🇪 Ireland</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time zone */}
          <SectionHeader title="Time zone" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Time zone</label>
                <div className="flex items-center gap-2 h-[34px] px-2 border border-gray-300 bg-white">
                  <span className="text-[13px]">Europe/London</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <SectionHeader title="Notes" />
          <div className="p-4">
            <div>
              <label className="block text-[13px] text-gray-700 mb-1">General Notes</label>
              <textarea
                value={formData.generalNotes}
                onChange={(e) => handleInputChange('generalNotes', e.target.value)}
                className="w-full h-24 px-2 py-2 border border-gray-300 bg-white text-[13px] resize-none"
                placeholder="Enter notes..."
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t bg-white">
            <button
              type="button"
              onClick={onClose}
              className="h-[34px] px-3 border border-gray-300 text-[13px] bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-[34px] px-3 border border-gray-300 text-[13px] bg-white hover:bg-gray-50"
            >
              Add and new
            </button>
            <button
              type="submit"
              className="h-[34px] px-3 text-white text-[13px] bg-blue-600 hover:bg-blue-700"
            >
              Add staff
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}