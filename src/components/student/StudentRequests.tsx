import { useCallback, useEffect, useState } from "react"
import { FileText, Upload, Clock3, CheckCircle2, XCircle } from "lucide-react"
import axiosInstance from "../axiosInstance"

type RequestRow = {
  Id: number
  RequestType: string
  Subject: string
  Message: string
  AttendanceId: number | null
  EvidenceUrl: string | null
  Status: string
  AdminNote: string | null
  ResponseUrl: string | null
  RequestedOn: string
  ReviewedOn: string | null
  EvidenceFileName: string | null
  ResponseFileName: string | null
}

const choices = [
  ["MedicalCertificate", "Medical certificate"],
  ["Letter", "Letter request"],
  ["TieConfirmation", "TIE confirmation"],
  ["Registration", "Registration support"],
  ["Document", "Document request"],
  ["Other", "Other request"]
]

const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onerror = () => reject(new Error("Could not read the selected file."))
  reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read the selected file."))
  reader.readAsDataURL(file)
})

const date = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-GB") : "—"

export default function StudentRequests() {
  const [rows, setRows] = useState<RequestRow[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [warnings, setWarnings] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [requestType, setRequestType] = useState("Letter")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [attendanceId, setAttendanceId] = useState("")
  const [evidence, setEvidence] = useState<{ name: string; data: string } | null>(null)
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [requestResponse, attendanceResponse, warningResponse, documentResponse] = await Promise.all([
        axiosInstance.get("/StudentPortalRequests/GetMine"),
        axiosInstance.get("/StudentPortalRequests/GetMyAttendance"),
        axiosInstance.get("/StudentPortalRequests/GetMyWarningStatus"),
        axiosInstance.get("/StudentPortalRequests/GetMyDocuments")
      ])
      setRows(requestResponse.data?.IsSuccess && Array.isArray(requestResponse.data.Data) ? requestResponse.data.Data : [])
      setAttendance(attendanceResponse.data?.IsSuccess && Array.isArray(attendanceResponse.data.Data) ? attendanceResponse.data.Data : [])
      setWarnings(warningResponse.data?.IsSuccess && Array.isArray(warningResponse.data.Data) ? warningResponse.data.Data : [])
      setDocuments(documentResponse.data?.IsSuccess && Array.isArray(documentResponse.data.Data) ? documentResponse.data.Data : [])
    } catch (error: any) {
      setNotice(error?.response?.data?.Message || "Could not load your requests.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setNotice("")
    setSaving(true)
    try {
      const response = await axiosInstance.post("/StudentPortalRequests/Submit", {
        requestType,
        subject,
        message,
        attendanceId: requestType === "MedicalCertificate" ? Number(attendanceId) : null,
        evidenceDataUrl: evidence?.data ?? null,
        evidenceFileName: evidence?.name ?? null
      })
      if (!response.data?.IsSuccess) {
        setNotice(response.data?.Message || "Request could not be submitted.")
        return
      }
      setNotice("Your request has been sent to the school administration for review.")
      setSubject("")
      setMessage("")
      setAttendanceId("")
      setEvidence(null)
      await refresh()
    } catch (error: any) {
      setNotice(error?.response?.data?.Message || "Request could not be submitted.")
    } finally {
      setSaving(false)
    }
  }

  const downloadRequestFile = async (requestId: number, fileType: "evidence" | "response", fileName: string) => {
    try {
      const response = await axiosInstance.get("/StudentPortalRequests/DownloadFile", {
        params: { requestId, fileType }, responseType: "blob"
      })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    } catch (error: any) {
      setNotice(error?.response?.data?.Message || "Could not open the file.")
    }
  }

  const statusStyle: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-800",
    Approved: "bg-emerald-50 text-emerald-800",
    Rejected: "bg-rose-50 text-rose-800"
  }

  return <div className="mx-auto max-w-4xl space-y-6">
    <header><h1 className="text-2xl font-semibold text-gray-900">Requests and notices</h1><p className="mt-1 text-sm text-gray-600">Send requests to the school team and follow the review result here.</p></header>

    {warnings.length > 0 && <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="font-semibold text-amber-950">Attendance warning notices</h2>
      {warnings.map((warning) => <p key={warning.Id} className="mt-2 text-sm text-amber-900">{String(warning.EmailStatus ?? "Warning").replace(/([A-Z])/g, " $1").trim()} · {date(warning.UpdatedOn || warning.CreatedOn)}. Please contact the school office if you have questions.</p>)}
    </section>}

    <form onSubmit={submit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-gray-900">Create a request</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">Request type
          <select value={requestType} onChange={(event) => setRequestType(event.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3">
            {choices.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">Subject
          <input required maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3" />
        </label>
      </div>
      {requestType === "MedicalCertificate" && <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">Absence covered
          <select required value={attendanceId} onChange={(event) => setAttendanceId(event.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3">
            <option value="">Select an absent class</option>
            {attendance.filter((item) => item.AttendanceStatus === "Absent").map((item) => <option key={item.AttendanceId} value={item.AttendanceId}>{date(item.Date)} · {item.ClassTitle || "Class"}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">Certificate file (PDF, JPG, PNG)
          <input required type="file" accept="application/pdf,image/jpeg,image/png" className="mt-1 block w-full text-sm" onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) { setEvidence(null); return }
            if (file.size > 15 * 1024 * 1024) { setNotice("Certificate must be smaller than 15 MB."); event.target.value = ""; return }
            try { setEvidence({ name: file.name, data: await toDataUrl(file) }) }
            catch (error: any) { setNotice(error.message); setEvidence(null) }
          }} />
        </label>
      </div>}
      <label className="block text-sm font-medium text-gray-700">Details
        <textarea required maxLength={4000} rows={4} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Tell the school team what you need." />
      </label>
      {requestType !== "MedicalCertificate" && <label className="block text-sm font-medium text-gray-700">Supporting file (optional)
        <input type="file" accept="application/pdf,image/jpeg,image/png" className="mt-1 block w-full text-sm" onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) { setEvidence(null); return }
          if (file.size > 15 * 1024 * 1024) { setNotice("File must be smaller than 15 MB."); event.target.value = ""; return }
          try { setEvidence({ name: file.name, data: await toDataUrl(file) }) }
          catch (error: any) { setNotice(error.message); setEvidence(null) }
        }} />
      </label>}
      {notice && <p className="text-sm text-indigo-700" role="status">{notice}</p>}
      <button disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white disabled:opacity-50"><Upload size={16} />{saving ? "Sending…" : "Send for review"}</button>
    </form>

    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 font-semibold text-gray-900">Request history</h2>
      {loading ? <p className="text-sm text-gray-500">Loading…</p> : rows.length === 0 ? <p className="text-sm text-gray-500">No requests yet.</p> : <div className="divide-y divide-gray-100">
        {rows.map((row) => <article key={row.Id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-medium text-gray-900">{row.Subject} <span className="font-normal text-gray-500">· {choices.find(([value]) => value === row.RequestType)?.[1] || row.RequestType}</span></p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{row.Message}</p>
              <p className="mt-1 text-xs text-gray-500">Sent {date(row.RequestedOn)}{row.ReviewedOn ? ` · Reviewed ${date(row.ReviewedOn)}` : ""}</p>
              {row.AdminNote && <p className="mt-2 text-sm text-gray-700">School response: {row.AdminNote}</p>}
              <div className="mt-2 flex gap-4 text-sm">{row.EvidenceFileName && <button type="button" className="text-indigo-600 underline" onClick={() => void downloadRequestFile(row.Id, "evidence", row.EvidenceFileName!)}>View submitted file</button>}{row.ResponseFileName && <button type="button" className="text-indigo-600 underline" onClick={() => void downloadRequestFile(row.Id, "response", row.ResponseFileName!)}>View school document</button>}{row.ResponseUrl && <a className="text-indigo-600 underline" href={row.ResponseUrl} target="_blank" rel="noreferrer">View linked document</a>}</div>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusStyle[row.Status] || "bg-gray-100 text-gray-700"}`}>
              {row.Status === "Pending" ? <Clock3 size={13} /> : row.Status === "Approved" ? <CheckCircle2 size={13} /> : <XCircle size={13} />}{row.Status}
            </span>
          </div>
        </article>)}
      </div>}
    </section>

    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 font-semibold text-gray-900">Your school documents</h2>
      {documents.length === 0 ? <p className="text-sm text-gray-500">Documents issued by the school will appear here.</p> : <ul className="divide-y divide-gray-100">
        {documents.map((document) => <li key={document.Id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div><p className="text-sm font-medium text-gray-900">{String(document.Name || "School document").split("/").pop()}</p><p className="text-xs text-gray-500">Added {date(document.CreatedOn)}</p></div>
          {document.Url && <a href={document.Url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 underline">Open document</a>}
        </li>)}
      </ul>}
    </section>
  </div>
}
