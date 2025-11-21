import { useState } from "react"
import { X } from "lucide-react"
import axiosInstance from "./axiosInstance"

interface AddTeacherFormProps {
  isOpen: boolean
  onClose: () => void
  asPage?: boolean
}

export default function AddTeacherForm({ isOpen, onClose, asPage }: AddTeacherFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    gender: "Not specified",
    dateOfBirth: "",
    idNumber: "",
    photoName: "",
    photoBase64: "",
    about: "",
    mobilePhone: "",
    homePhone: "",
    email: "",
    password: "",
    onlineLessonLink: "",
    streetAddress: "",
    city: "",
    postcode: "",
    state: "",
    country: "Ireland",
    timezone: "Europe/London",
    generalNotes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setFormData(prev => ({ ...prev, photoName: "", photoBase64: "" }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.includes(",") ? result.split(",")[1] : result
      setFormData(prev => ({
        ...prev,
        photoName: file.name,
        photoBase64: base64
      }))
    }
    reader.onerror = () => {
      console.error("Failed to read file")
      setFormData(prev => ({ ...prev, photoName: "", photoBase64: "" }))
    }
    reader.readAsDataURL(file)
  }

  const toIsoOrNull = (value: string) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!formData.email || !formData.password) {
      setErrorMessage("Email and password are required.")
      return
    }

    const payload = {
      Id: 0,
      AccountId: 0,
      Name: formData.name,
      Surname: formData.surname,
      Gender: formData.gender,
      DateOfBirth: toIsoOrNull(formData.dateOfBirth),
      IdNumber: formData.idNumber,
      Photo: formData.photoBase64,
      About: formData.about,
      Mobile: formData.mobilePhone,
      HomeNumber: formData.homePhone,
      Email: formData.email,
      OnlineSessionLink: formData.onlineLessonLink,
      StreetAddress: formData.streetAddress,
      City: formData.city,
      Postcode: formData.postcode,
      State: formData.state,
      Country: formData.country,
      TimeZone: formData.timezone,
      Notes: formData.generalNotes,
      Password: formData.password
    }

    try {
      setIsSubmitting(true)
      await axiosInstance.post("/Teacher/AddOrUpdateTeacher", payload)
      setSuccessMessage("Teacher has been added successfully.")
      setTimeout(() => {
        onClose()
      }, 800)
    } catch (error: any) {
      console.error("Failed to save teacher", error)
      setErrorMessage(error?.response?.data?.message || "Failed to add teacher. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!asPage && !isOpen) return null

  return (
    <div className={asPage ? "" : "fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"} onClick={asPage ? undefined : onClose}>
      <div className={`w-full ${asPage ? "" : "max-w-4xl"} bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden ${asPage ? "" : "max-h-[90vh] overflow-y-auto"}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add teacher</h2>
          {!asPage && (
            <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(errorMessage || successMessage) && (
            <div
              className={`p-4 rounded-xl text-sm ${
                errorMessage ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {errorMessage || successMessage}
            </div>
          )}
          {/* Personal details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex gap-4">
                  {["Male", "Female", "Not specified"].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender === option}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
                <input
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="photo"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    className="hidden"
                  />
                  <label htmlFor="photo" className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm cursor-pointer flex items-center">
                    Choose file
                  </label>
                  <span className="text-sm text-gray-500">
                    {formData.photoName || "No file chosen"}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">Accepted file types: jpg, jpeg, png, gif</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                {/* Rich text editor toolbar */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm font-bold">B</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm italic">I</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm underline">U</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm line-through">S</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 bg-yellow-200">A</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-xs">14</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">•</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">1.</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">→</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">←</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">🔗</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">📹</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">📷</button>
                    <button type="button" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">📎</button>
                  </div>
                  <textarea
                    value={formData.about}
                    onChange={(e) => handleInputChange('about', e.target.value)}
                    className="w-full h-32 px-3 py-2 text-sm resize-none border-0 focus:ring-0"
                    placeholder="Enter teacher's bio and information..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile phone</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                    <span className="text-sm">🇮🇪</span>
                    <span className="text-sm">+353</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.mobilePhone}
                    onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home phone</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                    <span className="text-sm">🇮🇪</span>
                    <span className="text-sm">+353</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.homePhone}
                    onChange={(e) => handleInputChange('homePhone', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Online Lesson Link</label>
                <input
                  type="url"
                  value={formData.onlineLessonLink}
                  onChange={(e) => handleInputChange('onlineLessonLink', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street address</label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province/Region</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                  <span className="text-sm">🇮🇪</span>
                  <span className="text-sm">Ireland</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time zone */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time zone</label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                  <span className="text-sm">Europe/London</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">General notes</label>
              <textarea
                value={formData.generalNotes}
                onChange={(e) => handleInputChange('generalNotes', e.target.value)}
                className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-none"
                placeholder="Enter any additional notes about the teacher..."
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            {/* <button
              type="button"
              className="h-10 px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm disabled:opacity-60"
              disabled={isSubmitting}
            >
              Add and new
            </button> */}
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-blue-600 text-white text-sm disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Add teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
