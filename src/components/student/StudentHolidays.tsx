import { useCallback, useEffect, useState } from "react"
import { CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react"
import axiosInstance from "../axiosInstance"

type Eligibility = {
  AttendancePercentage: number
  RequiredAttendancePercentage: number
  CourseStartDate: string | null
  CourseEndDate: string | null
  EarliestAllowedDate: string | null
  LatestAllowedDate: string | null
  EligibleToRequest: boolean
  CanSubmitRequest: boolean
  Reasons: string[]
}

type HolidayRequest = {
  Id: number
  FromDate: string
  ToDate: string
  Note: string | null
  Status: string
  RequestedOn: string | null
  ReviewNote: string | null
}

const dateInput = (value?: string | null) => value ? value.slice(0, 10) : ""
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-GB") : "—"

export default function StudentHolidays() {
  const [eligibility, setEligibility] = useState<Eligibility | null>(null)
  const [requests, setRequests] = useState<HolidayRequest[]>([])
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [note, setNote] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [eligibilityResponse, requestResponse] = await Promise.all([
        axiosInstance.get("/StudentHolidayWorkflow/GetEligibility"),
        axiosInstance.get("/StudentHolidayWorkflow/GetMyRequests")
      ])
      setEligibility(eligibilityResponse.data?.IsSuccess ? eligibilityResponse.data.Data : null)
      setRequests(requestResponse.data?.IsSuccess && Array.isArray(requestResponse.data.Data) ? requestResponse.data.Data : [])
    } catch (error: any) {
      setMessage(error?.response?.data?.Message || "Could not load holiday eligibility.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  useEffect(() => {
    if (!fromDate || !toDate) return
    let cancelled = false
    axiosInstance.get("/StudentHolidayWorkflow/GetEligibility", { params: { fromDate, toDate } })
      .then((response) => { if (!cancelled && response.data?.IsSuccess) setEligibility(response.data.Data) })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [fromDate, toDate])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage("")
    setSaving(true)
    try {
      const response = await axiosInstance.post("/StudentHolidayWorkflow/SubmitRequest", { fromDate, toDate, note })
      if (!response.data?.IsSuccess) {
        setMessage(response.data?.Message || "The request could not be submitted.")
        if (response.data?.Data?.Eligibility) setEligibility(response.data.Data.Eligibility)
        return
      }
      setMessage("Your request has been sent to the school administrator for review.")
      setFromDate("")
      setToDate("")
      setNote("")
      await refresh()
    } catch (error: any) {
      setMessage(error?.response?.data?.Message || "The request could not be submitted.")
    } finally {
      setSaving(false)
    }
  }

  const statusStyle: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-800",
    Approved: "bg-emerald-50 text-emerald-800",
    Rejected: "bg-rose-50 text-rose-800"
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Holiday requests</h1>
        <p className="mt-1 text-sm text-gray-600">Check your eligibility and send a request for administrative review.</p>
      </header>

      {loading ? <div className="rounded-xl bg-white p-6 text-gray-600">Checking your eligibility…</div> : eligibility && (
        <section className={`rounded-xl border p-5 ${eligibility.EligibleToRequest ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <div className="flex items-start gap-3">
            {eligibility.EligibleToRequest ? <CheckCircle2 className="mt-0.5 text-emerald-700" /> : <XCircle className="mt-0.5 text-amber-700" />}
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">{eligibility.EligibleToRequest ? "You meet the general eligibility requirements" : "You are not currently eligible to request a holiday"}</h2>
              <p className="mt-1 text-sm text-gray-700">Calculated attendance: <strong>{eligibility.AttendancePercentage.toFixed(2)}%</strong> · Minimum required: {eligibility.RequiredAttendancePercentage}%</p>
              <p className="mt-1 text-sm text-gray-700">Course period: {formatDate(eligibility.CourseStartDate)} – {formatDate(eligibility.CourseEndDate)}</p>
              <p className="mt-1 text-sm text-gray-700">Allowed request dates: {formatDate(eligibility.EarliestAllowedDate)} – {formatDate(eligibility.LatestAllowedDate)}</p>
              <p className="mt-2 text-xs text-gray-600">Requests are not allowed during the first two months or the final month of the course. Approved requests update your course end date.</p>
              {eligibility.Reasons?.map((reason, index) => <p key={index} className="mt-2 text-sm text-amber-900">{reason}</p>)}
            </div>
          </div>
        </section>
      )}

      <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Submit a holiday request</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">From
            <input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3" type="date" value={fromDate} min={dateInput(eligibility?.EarliestAllowedDate)} max={dateInput(eligibility?.LatestAllowedDate)} onChange={(event) => setFromDate(event.target.value)} required />
          </label>
          <label className="text-sm font-medium text-gray-700">To
            <input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3" type="date" value={toDate} min={fromDate || dateInput(eligibility?.EarliestAllowedDate)} max={dateInput(eligibility?.LatestAllowedDate)} onChange={(event) => setToDate(event.target.value)} required />
          </label>
        </div>
        <label className="block text-sm font-medium text-gray-700">Note for the administrator
          <textarea className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" rows={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add any details that will help review your request." />
        </label>
        {eligibility && fromDate && toDate && !eligibility.CanSubmitRequest && <p className="text-sm text-rose-700">{eligibility.Reasons.join(" ")}</p>}
        {message && <p className="text-sm text-indigo-700" role="status">{message}</p>}
        <button disabled={saving || !eligibility?.CanSubmitRequest} className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
          <CalendarDays size={16} /> {saving ? "Submitting…" : "Send for review"}
        </button>
      </form>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Your requests</h2>
        {requests.length === 0 ? <p className="text-sm text-gray-500">You have not submitted any holiday requests.</p> : <div className="divide-y divide-gray-100">
          {requests.map((request) => <article key={request.Id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
            <div>
              <div className="font-medium text-gray-900">{formatDate(request.FromDate)} – {formatDate(request.ToDate)}</div>
              {request.Note && <p className="mt-1 text-sm text-gray-600">{request.Note}</p>}
              {request.ReviewNote && <p className="mt-1 text-sm text-gray-600">Administrator: {request.ReviewNote}</p>}
              <p className="mt-1 text-xs text-gray-500">Submitted {formatDate(request.RequestedOn)}</p>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusStyle[request.Status] || "bg-gray-100 text-gray-700"}`}>
              {request.Status === "Pending" ? <Clock3 size={13} /> : request.Status === "Approved" ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {request.Status}
            </span>
          </article>)}
        </div>}
      </section>
    </div>
  )
}
