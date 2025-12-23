import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import axiosInstance from "./axiosInstance"
import Swal from "sweetalert2"

type TeacherFormState = {
  id: number | null
  accountId: number | null
  name: string
  surname: string
  gender: string
  dateOfBirth: string
  idNumber: string
  photoName: string
  photoBase64: string
  about: string
  mobilePhone: string
  homePhone: string
  email: string
  password: string
  onlineLessonLink: string
  streetAddress: string
  city: string
  postcode: string
  state: string
  country: string
  timezone: string
  generalNotes: string
}

const emptyForm: TeacherFormState = {
  id: null,
  accountId: null,
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
}

const toIsoOrNull = (value: string) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString()
}

const fromIsoToDateInput = (value?: string | null) => {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export default function EditTeacher() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<TeacherFormState>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleInputChange = (field: keyof TeacherFormState, value: string) => {
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

  // -----------------------
  // Load teacher by ID
  // -----------------------
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!id) return

      try {
        setLoading(true)
        setErrorMessage(null)

        const res = await axiosInstance.get(`/Teacher/GetTeacherById?id=${id}`)
        const data = res.data?.Data || res.data

        if (!data) {
          Swal.fire("Not found", "Teacher not found", "error")
          navigate(-1)
          return
        }

        setFormData(prev => ({
          ...prev,
          id: data.Id ?? Number(id),
          accountId: data.AccountId ?? null,
          name: data.Name ?? "",
          surname: data.Surname ?? "",
          gender: data.Gender ?? "Not specified",
          dateOfBirth: fromIsoToDateInput(data.DateOfBirth),
          idNumber: data.IdNumber ?? "",
          photoName: "",
          photoBase64: "",
          about: data.About ?? "",
          mobilePhone: data.Mobile ?? data.MobilePhone ?? "",
          homePhone: data.HomeNumber ?? data.HomePhone ?? "",
          email: data.Email ?? "",
          password: "",
          onlineLessonLink: data.OnlineSessionLink ?? data.OnlineLessonLink ?? "",
          streetAddress: data.StreetAddress ?? "",
          city: data.City ?? "",
          postcode: data.Postcode ?? data.ZipCode ?? "",
          state: data.State ?? "",
          country: data.Country ?? "Ireland",
          timezone: data.TimeZone ?? data.Timezone ?? "Europe/London",
          generalNotes: data.Notes ?? data.GeneralNotes ?? ""
        }))
      } catch (err: any) {
        console.error("Failed to fetch teacher", err)
        setErrorMessage(err?.response?.data?.Message || "Failed to load teacher.")
      } finally {
        setLoading(false)
      }
    }

    fetchTeacher()
  }, [id, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!formData.email) {
      setErrorMessage("Email is required.")
      return
    }

    if (!formData.id) {
      setErrorMessage("Teacher ID is missing.")
      return
    }

    const payload = {
      Id: formData.id,
      AccountId: formData.accountId ?? 0,
      Name: formData.name,
      Surname: formData.surname,
      Gender: formData.gender,
      DateOfBirth: toIsoOrNull(formData.dateOfBirth),
      IdNumber: formData.idNumber,
      Photo: formData.photoBase64 || null,
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
      Password: formData.password || null
    }

    try {
      setIsSubmitting(true)
      const res = await axiosInstance.post("/Teacher/AddOrUpdateTeacher", payload)

      if (res.data?.IsSuccess || res.data?.Success || res.status === 200) {
        setSuccessMessage("Teacher has been updated successfully.")
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Teacher updated successfully",
          timer: 1500,
          showConfirmButton: false
        })
        navigate(-1)
      } else {
        setErrorMessage(res.data?.Message || "Failed to update teacher.")
      }
    } catch (error: any) {
      console.error("Failed to save teacher", error)
      setErrorMessage(error?.response?.data?.Message || "Failed to update teacher. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-600 flex items-center justify-center h-64">
        Loading teacher data...
      </div>
    )
  }

  // UI helper for the admin flat look
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#f2f2f2] px-4 py-2 border-t border-b text-[13px] font-semibold text-gray-800">
      {title}
    </div>
  );

  const teacherName = `${formData.name} ${formData.surname}`.trim() || "Teacher";

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto bg-white border border-gray-300 shadow-sm overflow-hidden">
        
        {/* Top dark title bar */}
        <div className="bg-[#2b2b2e] px-4 py-2 text-white text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="text-white opacity-80 hover:opacity-100">
                <ArrowLeft size={16} />
             </button>
             <span>Edit {teacherName}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-0 space-y-0">
          {(errorMessage || successMessage) && (
            <div
              className={`p-3 text-sm border-b ${
                errorMessage ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {errorMessage || successMessage}
            </div>
          )}

          {/* Personal details */}
          <SectionHeader title="Personal Details" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Surname <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => handleInputChange("surname", e.target.value)}
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
                        onChange={(e) => handleInputChange("gender", e.target.value)}
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
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  placeholder="yyyy-mm-dd"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">ID number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange("idNumber", e.target.value)}
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
                  <label
                    htmlFor="photo"
                    className="h-[34px] px-3 border border-gray-300 flex items-center text-[13px] cursor-pointer bg-white"
                  >
                    Browse...
                  </label>
                  <span className="text-[13px] text-gray-500 truncate max-w-[150px]">
                    {formData.photoName || "No file selected..."}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">jpg, jpeg, png, gif</p>
              </div>
              <div className="md:col-span-3">
                <label className="block text-[13px] text-gray-700 mb-1">About</label>
                <div className="border border-gray-300 bg-white">
                  <div className="flex items-center gap-1 p-1 border-b border-gray-300 bg-[#f9f9f9]">
                    <button type="button" className="h-6 w-6 grid place-items-center hover:bg-gray-200 text-xs font-bold">B</button>
                    <button type="button" className="h-6 w-6 grid place-items-center hover:bg-gray-200 text-xs italic">I</button>
                    <button type="button" className="h-6 w-6 grid place-items-center hover:bg-gray-200 text-xs underline">U</button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" className="h-6 w-6 grid place-items-center hover:bg-gray-200 text-xs">≡</button>
                  </div>
                  <textarea
                    value={formData.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    className="w-full h-24 px-2 py-2 text-[13px] resize-none border-0 focus:ring-0"
                    placeholder="Enter teacher's bio..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact details */}
          <SectionHeader title="Contact Details" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Mobile phone</label>
                <div className="flex items-center gap-0">
                  <div className="flex items-center gap-1 h-[34px] px-2 border border-gray-300 border-r-0 bg-gray-50">
                    <span className="text-[13px]">🇮🇪 +353</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.mobilePhone}
                    onChange={(e) => handleInputChange("mobilePhone", e.target.value)}
                    className="flex-1 h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Home phone</label>
                <div className="flex items-center gap-0">
                  <div className="flex items-center gap-1 h-[34px] px-2 border border-gray-300 border-r-0 bg-gray-50">
                    <span className="text-[13px]">🇮🇪 +353</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.homePhone}
                    onChange={(e) => handleInputChange("homePhone", e.target.value)}
                    className="flex-1 h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Email address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                  minLength={6}
                  placeholder="Leave blank to keep existing"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Online Lesson Link</label>
                <input
                  type="text"
                  value={formData.onlineLessonLink}
                  onChange={(e) => handleInputChange("onlineLessonLink", e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Street address</label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Postcode</label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange("postcode", e.target.value)}
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">State/Province/Region</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Time zone</label>
                <div className="flex items-center gap-2 h-[34px] px-2 border border-gray-300 bg-white">
                  <span className="text-[13px]">{formData.timezone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <SectionHeader title="Notes" />
          <div className="p-4">
            <div>
              <label className="block text-[13px] text-gray-700 mb-1">General notes</label>
              <textarea
                value={formData.generalNotes}
                onChange={(e) => handleInputChange("generalNotes", e.target.value)}
                className="w-full h-24 px-2 py-2 border border-gray-300 bg-white text-[13px] resize-none"
                placeholder="Enter any additional notes..."
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t bg-white">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-[34px] px-3 border border-gray-300 text-[13px] bg-white hover:bg-gray-50 text-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[34px] px-3 bg-blue-600 text-white text-[13px] hover:bg-blue-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Update teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}