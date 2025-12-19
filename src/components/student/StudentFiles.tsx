import { useEffect, useState } from "react"
import axiosInstance from "../axiosInstance"
import { useAuth } from "../AuthContext"
import { getStudentId } from "./useStudentClasses"
import { Download, FileText, User } from "lucide-react"

type Attachment = {
  Id: number
  FileName?: string
  URL?: string
  CreatedOn?: string
  FileSize?: string
  UploadedBy?: string
}

export default function StudentFiles() {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"personal" | "lessons" | "classes">("personal")

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
    <div className="space-y-6 m-4">
      {/* Header */}
      <h1 className="text-xl font-semibold text-gray-900">Files</h1>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        {[
          { id: "personal", label: "Personal", icon: <User size={16} /> },
          { id: "lessons", label: "Lessons", icon: <FileText size={16} /> },
          { id: "classes", label: "Classes", icon: <FileText size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 ${
              activeTab === tab.id
                ? "text-indigo-600 border-indigo-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-4">
          View files shared with you directly
        </p>

        <h3 className="text-sm font-semibold text-gray-900 mb-6">
          Personal files
        </h3>

        {/* States */}
        {loading ? (
          <div className="text-sm text-gray-500">Loading files…</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : attachments.length === 0 ? (
          <div className="text-sm text-gray-500">No files available.</div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {attachments.map(file => {
              const fileName =
                file.FileName ||
                file.URL?.split("/").pop() ||
                "Document.pdf"

              return (
                <div
                  key={file.Id}
                  className="w-[230px] border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition"
                >
                  {/* File body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <a
                        href={file.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-indigo-600 leading-snug hover:underline"
                      >
                        {fileName}
                      </a>

                      {file.URL && (
                        <a
                          href={file.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Download size={18} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* File footer */}
                  <div className="bg-red-600 text-white text-xs flex items-center justify-between px-3 py-1">
                    <span>pdf</span>
                    <span>{file.FileSize || "—"}</span>
                  </div>

                  {/* Meta */}
                  <div className="px-3 py-2 text-xs text-gray-500">
                    {file.UploadedBy || "Asif Omer"} on{" "}
                    {formatDate(file.CreatedOn)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

