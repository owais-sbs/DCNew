import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, Clock3, FileText, XCircle } from "lucide-react"
import axiosInstance from "./axiosInstance"

type RequestRow = { Id: number; StudentId: number; StudentName: string; RequestType: string; Subject: string; Message: string; AttendanceId: number | null; EvidenceUrl: string | null; EvidenceFileName: string | null; RequestedOn: string }
type HolidayRow = { Id: number; StudentId: number; StudentName: string; FromDate: string; ToDate: string; Note: string | null; RequestedOn: string | null }
const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error("Could not read file.")); reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read file.")); reader.readAsDataURL(file) })
const date = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-GB") : "—"

export default function StudentRequestQueue() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [holidays, setHolidays] = useState<HolidayRow[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<Record<string, string>>({})
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const requestKey = (id: number) => `request-${id}`
  const holidayKey = (id: number) => `holiday-${id}`

  const openEvidence = async (requestId: number, fileName: string) => {
    try {
      const response = await axiosInstance.get("/StudentPortalRequests/DownloadFile", {
        params: { requestId, fileType: "evidence" }, responseType: "blob"
      })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    } catch (error: any) { setMessage(error?.response?.data?.Message || "Could not open certificate evidence.") }
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [requestResponse, holidayResponse] = await Promise.all([
        axiosInstance.get("/StudentPortalRequests/GetPending"),
        axiosInstance.get("/StudentHolidayWorkflow/GetPendingRequests")
      ])
      setRequests(requestResponse.data?.IsSuccess && Array.isArray(requestResponse.data.Data) ? requestResponse.data.Data : [])
      setHolidays(holidayResponse.data?.IsSuccess && Array.isArray(holidayResponse.data.Data) ? holidayResponse.data.Data : [])
    } catch (error: any) { setMessage(error?.response?.data?.Message || "Could not load pending student requests.") }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void refresh() }, [refresh])

  const reviewRequest = async (row: RequestRow, decision: "Approved" | "Rejected") => {
    setMessage("")
    try {
      const response = await axiosInstance.post("/StudentPortalRequests/Review", {
        requestId: row.Id, decision, adminNote: notes[requestKey(row.Id)] || null,
        responseUrl: urls[requestKey(row.Id)] || null, responseDataUrl: files[requestKey(row.Id)] || null
      })
      if (!response.data?.IsSuccess) { setMessage(response.data?.Message || "Request could not be reviewed."); return }
      setMessage(`${row.RequestType} request ${decision.toLowerCase()}.`)
      await refresh()
    } catch (error: any) { setMessage(error?.response?.data?.Message || "Request could not be reviewed.") }
  }

  const reviewHoliday = async (row: HolidayRow, decision: "Approved" | "Rejected") => {
    setMessage("")
    try {
      const response = await axiosInstance.post("/StudentHolidayWorkflow/Review", {
        requestId: row.Id, decision, reviewNote: notes[holidayKey(row.Id)] || null
      })
      if (!response.data?.IsSuccess) { setMessage(response.data?.Message || "Holiday request could not be reviewed."); return }
      setMessage(`Holiday request ${decision.toLowerCase()}.`)
      await refresh()
    } catch (error: any) { setMessage(error?.response?.data?.Message || "Holiday request could not be reviewed.") }
  }

  return <div className="mx-auto max-w-5xl space-y-6">
    <header><h1 className="text-2xl font-semibold text-gray-900">Student request review</h1><p className="mt-1 text-sm text-gray-600">Pending requests submitted through the student portal.</p></header>
    {message && <p role="status" className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}
    {loading ? <p className="rounded-xl bg-white p-6 text-gray-500">Loading requests…</p> : <>
      <section className="space-y-4"><h2 className="font-semibold text-gray-900">General requests ({requests.length})</h2>
        {requests.length === 0 && <p className="rounded-xl bg-white p-5 text-sm text-gray-500">No pending general requests.</p>}
        {requests.map((row) => <article key={row.Id} className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-gray-900">{row.Subject} <span className="font-normal text-gray-500">· {row.RequestType}</span></p><p className="mt-1 text-sm text-gray-600">{row.StudentName} · {date(row.RequestedOn)}</p><p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{row.Message}</p>
            {row.AttendanceId && <p className="mt-2 text-xs text-gray-500">Linked attendance record #{row.AttendanceId}</p>}
            {row.EvidenceFileName && <button onClick={() => void openEvidence(row.Id, row.EvidenceFileName!)} className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-600 underline"><FileText size={14} /> Open student evidence</button>}
          </div><span className="inline-flex h-7 items-center gap-1 rounded-full bg-amber-50 px-3 text-xs text-amber-800"><Clock3 size={13} /> Pending</span></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2"><textarea rows={2} maxLength={2000} placeholder="Response to student" value={notes[requestKey(row.Id)] || ""} onChange={(event) => setNotes({ ...notes, [requestKey(row.Id)]: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <div className="space-y-2"><input type="url" placeholder="Response document URL (optional)" value={urls[requestKey(row.Id)] || ""} onChange={(event) => setUrls({ ...urls, [requestKey(row.Id)]: event.target.value })} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" />
              <label className="block text-xs text-gray-600">Or attach a response document (PDF/JPG/PNG)<input type="file" accept="application/pdf,image/jpeg,image/png" className="mt-1 block w-full" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 15 * 1024 * 1024) { setMessage("Response file must be smaller than 15 MB."); event.target.value = ""; return } try { setFiles({ ...files, [requestKey(row.Id)]: await toDataUrl(file) }) } catch (error: any) { setMessage(error.message) } }} /></label>
            </div></div>
          <div className="mt-3 flex justify-end gap-2"><button onClick={() => void reviewRequest(row, "Rejected")} className="inline-flex h-9 items-center gap-1 rounded-lg border border-rose-200 px-3 text-sm text-rose-700"><XCircle size={15} /> Reject</button><button onClick={() => void reviewRequest(row, "Approved")} className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-sm text-white"><CheckCircle2 size={15} /> Approve</button></div>
        </article>)}
      </section>
      <section className="space-y-4"><h2 className="font-semibold text-gray-900">Holiday requests ({holidays.length})</h2>
        {holidays.length === 0 && <p className="rounded-xl bg-white p-5 text-sm text-gray-500">No pending holiday requests.</p>}
        {holidays.map((row) => <article key={row.Id} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-gray-900">{row.StudentName} · {date(row.FromDate)} – {date(row.ToDate)}</p><p className="mt-1 text-sm text-gray-600">{row.Note || "No note provided."}</p></div><span className="inline-flex h-7 items-center gap-1 rounded-full bg-amber-50 px-3 text-xs text-amber-800"><Clock3 size={13} /> Pending</span></div>
          <textarea rows={2} maxLength={1000} placeholder="Review note shown to student" value={notes[holidayKey(row.Id)] || ""} onChange={(event) => setNotes({ ...notes, [holidayKey(row.Id)]: event.target.value })} className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <div className="mt-3 flex justify-end gap-2"><button onClick={() => void reviewHoliday(row, "Rejected")} className="inline-flex h-9 items-center gap-1 rounded-lg border border-rose-200 px-3 text-sm text-rose-700"><XCircle size={15} /> Reject</button><button onClick={() => void reviewHoliday(row, "Approved")} className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-sm text-white"><CheckCircle2 size={15} /> Approve</button></div>
        </article>)}
      </section>
    </>}
    <button onClick={() => void refresh()} className="text-sm text-indigo-600 underline">Refresh queue</button>
  </div>
}
