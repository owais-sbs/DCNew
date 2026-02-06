import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Calendar, Hash } from "lucide-react"
import { useAuth } from "../AuthContext"
import { getStudentId } from "./useStudentClasses"
import axiosInstance from "../axiosInstance"

function formatDate(value?: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

/** Fix Photo URLs that have the base path repeated (e.g. from API). */
function normalizePhotoUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null
  const marker = "student_profile/"
  const idx = url.indexOf(marker)
  if (idx === -1) return url
  const parts = url.split(marker)
  const lastPart = (parts[parts.length - 1] ?? "").trim()
  if (!lastPart || lastPart.startsWith("http")) return url
  const base = url.slice(0, idx + marker.length)
  return base + lastPart
}

export default function StudentProfilePage() {
  const { user } = useAuth()
  const studentId = user?.studentId ?? getStudentId()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileImageError, setProfileImageError] = useState(false)

  useEffect(() => {
    if (!studentId) {
      setLoading(false)
      setError("Student ID not found.")
      return
    }
    const controller = new AbortController()
    const fetchStudent = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosInstance.get(`/Student/GetById/${studentId}`, { signal: controller.signal })
        if (res.data?.IsSuccess && res.data?.Data) {
          setData(res.data.Data)
          setProfileImageError(false)
        } else {
          setError(res.data?.Message || "Failed to load profile.")
        }
      } catch (e: any) {
        if (e?.name !== "CanceledError") {
          setError(e?.message || "Failed to load profile.")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    fetchStudent()
    return () => controller.abort()
  }, [studentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-600">
        {error || "No profile data available."}
      </div>
    )
  }

  const fullName = [data.FirstName, data.Surname || data.LastName].filter(Boolean).join(" ") || "—"
  const rawPhoto = data.Photo || data.ProfilePicture
  const profilePic = normalizePhotoUrl(rawPhoto) || rawPhoto
  const rows = [
    { icon: Mail, label: "Email", value: data.Email ?? "—" },
    { icon: Phone, label: "Phone", value: (data.MobilePhone || data.Phone) ?? "—" },
    { icon: MapPin, label: "Address", value: [data.StreetAddress, data.City, data.State, data.ZipCode, data.Country].filter(Boolean).join(", ") || "—" },
    { icon: Calendar, label: "Date of birth", value: formatDate(data.DateOfBirth) },
    { icon: Hash, label: "ID number", value: data.IdNumber ?? "—" },
    { icon: User, label: "Nationality", value: data.Nationality ?? "—" },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="h-24 w-24 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profilePic && !profileImageError ? (
              <img
                src={profilePic}
                alt={fullName}
                className="h-full w-full object-cover"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <User size={40} className="text-gray-400" />
            )}
          </div>
          <div className="text-center sm:text-left min-w-0">
            <h1 className="text-xl font-semibold text-gray-900">My profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">{fullName}</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-3">
              <Icon size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
                <div className="text-sm text-gray-900 mt-0.5 break-words">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
