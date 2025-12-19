import { useEffect, useState } from "react"
import axiosInstance from "../axiosInstance"
import { useAuth } from "../AuthContext"
import { getStudentId } from "./useStudentClasses"
import { Paperclip } from "lucide-react"

type Attachment = {
  Id: number
  FileName?: string
  URL?: string
  CreatedOn?: string
}

export default function StudentFiles() {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get studentId from user context or localStorage
  const studentId = user?.studentId || getStudentId()

  useEffect(() => {
    const fetchAttachments = async () => {
      if (!studentId) return

      setLoading(true)
      setError(null)
      try {
        const response = await axiosInstance.get("/Attachment/GetByStudentId", {
          params: { studentid: studentId }
        })

        if (response.data?.IsSuccess) {
          setAttachments(response.data.Data || [])
        } else {
          setAttachments([])
          setError(response.data?.Message || "No files found.")
        }
      } catch (err: any) {
        console.error("Error fetching student attachments:", err)
        setError(err?.message || "Failed to load files.")
        setAttachments([])
      } finally {
        setLoading(false)
      }
    }

    fetchAttachments()
  }, [studentId])

  const formatDate = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleDateString("en-GB")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Files</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        {loading ? (
          <div className="text-sm text-gray-500">Loading files...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <Paperclip size={32} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-600 mb-4">When your school shares files with you, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map((attachment) => (
              <div
                key={attachment.Id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Paperclip size={20} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {attachment.FileName || attachment.URL?.split("/").pop() || "Attachment"}
                    </span>
                  </div>
                </div>
                {attachment.CreatedOn && (
                  <div className="text-xs text-gray-500 mb-2">
                    Uploaded on {formatDate(attachment.CreatedOn)}
                  </div>
                )}
                {attachment.URL && (
                  <a
                    href={attachment.URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline mt-2 inline-block"
                  >
                    View file
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}









