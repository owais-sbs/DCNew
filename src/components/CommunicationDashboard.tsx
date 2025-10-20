// CommunicationDashboard.tsx
import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  Mail,
  MessageCircle,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  X,
  Check
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

type Tab = { id: string; label: string; path?: string }

const TABS: Tab[] = [
  { id: "dashboard", label: "Dashboard", path: "/communication" },
  { id: "email", label: "Email", path: "/communication/email" },
  { id: "sms", label: "SMS", path: "/communication/sms" },
  { id: "ann", label: "Announcements", path: "/communication/announcements" },
]

// sample chart data
const sampleChartData = [
  { name: "Oct 1", delivered: 2 },
  { name: "Oct 2", delivered: 8 },
  { name: "Oct 3", delivered: 15 },
  { name: "Oct 4", delivered: 9 },
  { name: "Oct 5", delivered: 12 },
  { name: "Oct 6", delivered: 7 },
  { name: "Oct 7", delivered: 39 }, // match screenshot single big bar
]

export default function CommunicationDashboard() {
  const navigate = useNavigate()
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>("email")
  const [dateOpen, setDateOpen] = useState(false)
  const [range, setRange] = useState<{ start: string; end: string }>({
    start: "2025-10-01",
    end: "2025-10-31",
  })

  // date inputs in dropdown (local edits before apply)
  const [draftStart, setDraftStart] = useState(range.start)
  const [draftEnd, setDraftEnd] = useState(range.end)

  // metrics (hard-coded for mock)
  const emailsSent = 39
  const smsSent = 0
  const announcementsSent = 0

  // Chart data memoized (could be filtered by date range)
  const chartData = useMemo(() => sampleChartData, [])

  // small helpers
  const toggleDateDropdown = () => setDateOpen((v) => !v)
  const applyRange = () => {
    // naive validation: if draftStart <= draftEnd
    if (draftStart && draftEnd && draftStart > draftEnd) {
      // swap if wrong order
      setRange({ start: draftEnd, end: draftStart })
      setDraftStart(draftEnd)
      setDraftEnd(draftStart)
    } else {
      setRange({ start: draftStart, end: draftEnd })
    }
    setDateOpen(false)
  }

  useEffect(() => {
    // close dropdown on Esc
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDateOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        {/* Header row: Tabs + New message */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 h-10 rounded-xl text-sm inline-flex items-center gap-2 transition ${
                  activeTab === t.id
                    ? "bg-white shadow-sm border border-blue-200 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {/* small icons for each */}
                {t.id === "email" && <Mail size={14} className="text-gray-500" />}
                {t.id === "sms" && <MessageCircle size={14} className="text-gray-500" />}
                {t.id === "ann" && <Megaphone size={14} className="text-gray-500" />}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Date range button + dropdown */}
            <div className="relative">
              <button
                onClick={toggleDateDropdown}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-white border border-gray-200 text-sm hover:bg-gray-50"
              >
                <span className="text-xs text-gray-500">Date range:</span>
                <span className="ml-2 text-gray-700">
                  {range.start.split("-").reverse().join("-")} -{" "}
                  {range.end.split("-").reverse().join("-")}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {/* Dropdown calendar (simple custom) */}
              {dateOpen && (
                <div className="absolute right-0 mt-2 w-[640px] bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-40">
                  <div className="grid grid-cols-12 gap-4 items-start">
                    {/* Quick range column */}
                    <div className="col-span-3 pr-3 border-r border-gray-100">
                      <div className="space-y-2">
                        {[
                          "All (up to now)",
                          "All (incl. future)",
                          "Today",
                          "Yesterday",
                          "Last 7 days",
                          "This month",
                          "Previous month",
                          "Next month",
                          "Custom range",
                        ].map((label, i) => (
                          <button
                            key={label}
                            onClick={() => {
                              // quick actions (very basic)
                              const today = new Date().toISOString().slice(0, 10)
                              if (label === "Today") {
                                setDraftStart(today)
                                setDraftEnd(today)
                              } else if (label === "This month") {
                                const d = new Date()
                                const start = new Date(d.getFullYear(), d.getMonth(), 1)
                                  .toISOString()
                                  .slice(0, 10)
                                const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
                                  .toISOString()
                                  .slice(0, 10)
                                setDraftStart(start)
                                setDraftEnd(end)
                              } else if (label === "Last 7 days") {
                                const end = new Date()
                                const start = new Date()
                                start.setDate(end.getDate() - 6)
                                setDraftStart(start.toISOString().slice(0, 10))
                                setDraftEnd(end.toISOString().slice(0, 10))
                              } else if (label === "All (up to now)") {
                                setDraftStart("2020-01-01")
                                setDraftEnd(new Date().toISOString().slice(0, 10))
                              } else {
                                // custom or others: do nothing special
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 ${
                              i === 5 ? "bg-indigo-600 text-white" : "text-gray-700"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Two small pickers column */}
                    <div className="col-span-9 grid grid-cols-2 gap-4">
                      <div className="p-3 border border-gray-100 rounded-lg">
                        <div className="text-xs text-gray-600 mb-2">Start</div>
                        <input
                          type="date"
                          value={draftStart}
                          onChange={(e) => setDraftStart(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200"
                        />
                      </div>

                      <div className="p-3 border border-gray-100 rounded-lg">
                        <div className="text-xs text-gray-600 mb-2">End</div>
                        <input
                          type="date"
                          value={draftEnd}
                          onChange={(e) => setDraftEnd(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200"
                        />
                      </div>

                      {/* Small calendar previews (static grid placeholders) */}
                      <div className="col-span-2 grid grid-cols-2 gap-3 mt-2">
                        {[0, 1].map((idx) => (
                          <div key={idx} className="border border-gray-100 rounded-lg p-3">
                            <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                              <div>Oct</div>
                              <div className="text-xs text-gray-500">2025</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
                              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                                <div key={d} className="py-1 text-center">{d}</div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-sm">
                              {Array.from({ length: 35 }).map((_, i) => {
                                const day = (i % 31) + 1
                                const isSelected =
                                  `${2025}-10-${String(day).padStart(2, "0")}` === draftStart ||
                                  `${2025}-10-${String(day).padStart(2, "0")}` === draftEnd
                                return (
                                  <div
                                    key={i}
                                    className={`h-8 w-8 grid place-items-center rounded ${isSelected ? "bg-indigo-600 text-white" : "hover:bg-gray-100"}`}
                                  >
                                    {day}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                        <div className="col-span-2 flex justify-end gap-2 mt-2">
                          <button onClick={() => setDateOpen(false)} className="px-4 h-9 rounded-lg border border-gray-200">Cancel</button>
                          <button onClick={applyRange} className="px-4 h-9 rounded-lg bg-indigo-600 text-white">Apply</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* New message button */}
            <button onClick={() => navigate("/compose")} className="ml-3 h-10 px-4 rounded-xl bg-indigo-600 text-white inline-flex items-center gap-2">
              <Plus size={16} />
              New message
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "dashboard" && <DashboardContent />}
        {activeTab === "email" && <EmailContent />}
        {activeTab === "sms" && <SMSContent />}
        {activeTab === "ann" && <AnnouncementsContent />}
      </div>
    </div>
  )
}

// Content components for each tab
function DashboardContent() {
  const emailsSent = 39
  const smsSent = 0
  const announcementsSent = 0
  const chartData = useMemo(() => sampleChartData, [])

  return (
    <>
      {/* Subtitle */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800">Communications dashboard</h3>
        <p className="text-sm text-gray-500 mt-1">Overview of all communications sent</p>
      </div>

      {/* Metric cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 p-5">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-sky-100 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-white/60 grid place-items-center">
              <Mail size={20} className="text-sky-700" />
            </div>
            <div>
              <div className="text-sm font-semibold text-sky-700">Emails sent</div>
              <div className="mt-3 text-2xl font-semibold text-gray-900">{emailsSent}</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-white/60 grid place-items-center">
              <MessageCircle size={20} className="text-emerald-700" />
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-700">SMS messages sent</div>
              <div className="mt-3 text-2xl font-semibold text-gray-900">{smsSent}</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-rose-50 p-5">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-rose-100 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-white/60 grid place-items-center">
              <Megaphone size={20} className="text-rose-700" />
            </div>
            <div>
              <div className="text-sm font-semibold text-rose-700">Announcements sent</div>
              <div className="mt-3 text-2xl font-semibold text-gray-900">{announcementsSent}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - chart + message sender */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-96">
          <div className="font-semibold text-gray-800 mb-3">Email delivery status</div>
          <div className="h-[78%]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="delivered" fill="#34D399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Message sender */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="font-semibold text-gray-800 mb-3">Message sender</div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-100 grid place-items-center text-indigo-700 font-semibold">DCE</div>
              <div className="text-gray-800">Asif Omer</div>
            </div>
            <div className="text-gray-700">{emailsSent}</div>
          </div>

          <div className="text-sm text-gray-500 mt-2">Number of messages</div>
        </div>
      </div>
    </>
  )
}

function EmailContent() {
  const [showMessageModal, setShowMessageModal] = useState(false)
  
  const emailRows = Array.from({ length: 8 }).map((_, i) => ({
    date: "17-10-2025 17:00",
    sentBy: "Asif Omer",
    status: "Sent",
    recipients: "1 recipient",
    subject: ":fname, you're invited to our school portal",
    notes: "",
  }))

  return (
    <>
      {/* Email count */}
      <div className="mt-6 flex items-center gap-2">
        <Mail size={16} className="text-gray-500" />
        <span className="text-sm text-gray-500">759 Email messages</span>
      </div>

      {/* Search and filters */}
      <div className="mt-4 flex items-center gap-3">
        <input placeholder="Search table" className="w-80 h-10 px-4 rounded-xl border border-gray-200 bg-white" />
        <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
          <option>Recipients: ▾</option>
        </select>
        <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
          <option>Sent by: Any</option>
        </select>
        <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
          <option>Status: All</option>
        </select>
        <button className="h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">⟳</button>
      </div>

      {/* Email table */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {["Date","Sent by","Status","Recipients","Email subject","Notes","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {emailRows.map((r, i) => (
              <tr key={i} className="border-b last:border-0 border-gray-100">
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">{r.sentBy}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">{r.status}</span>
                </td>
                <td className="px-4 py-3">{r.recipients}</td>
                <td className="px-4 py-3">{r.subject}</td>
                <td className="px-4 py-3">{r.notes}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowMessageModal(true)}
                      className="h-8 w-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                    >
                      <Eye size={14} />
                    </button>
                    <button className="h-8 w-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center">
                      <Edit size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">25 ▾</button>
          <span className="text-sm text-gray-500">Showing 1 - 8 of 759 entries</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white text-gray-600">⟨</button>
          <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white text-gray-600">⟩</button>
        </div>
      </div>

      {/* Message Details Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Message details</h3>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Status */}
              <div>
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">Sent</span>
              </div>

              {/* Sent on */}
              <div>
                <span className="text-sm text-gray-600">Sent on:</span>
                <span className="ml-2 text-sm text-gray-800">17-10-2025 at 17:00</span>
              </div>

              {/* Sent by */}
              <div>
                <span className="text-sm text-gray-600">Sent by:</span>
                <span className="ml-2 text-sm text-gray-800">Asif Omer</span>
              </div>

              {/* Email subject */}
              <div>
                <span className="text-sm text-gray-600">Email subject:</span>
                <div className="mt-1 text-sm text-gray-800">:fname, you're invited to our school portal</div>
              </div>

              {/* Email body */}
              <div>
                <span className="text-sm text-gray-600">Email body:</span>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-500 min-h-[100px]">
                  {/* Empty email body */}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <span className="text-sm text-gray-600">Recipients:</span>
                <span className="ml-2 text-sm text-gray-800">1</span>
              </div>

              {/* Recipients table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">Name</th>
                      <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">Group</th>
                      <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 border-b border-gray-100">Carlos Alberto Munoz Azagra</td>
                      <td className="px-4 py-3 border-b border-gray-100">Students</td>
                      <td className="px-4 py-3 border-b border-gray-100">c.munoz.azagra@gmail.coM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end">
              <button 
                onClick={() => setShowMessageModal(false)}
                className="h-10 px-6 rounded-xl bg-indigo-600 text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SMSContent() {
  const navigate = useNavigate()
  
  return (
    <div className="mt-6">
      <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
        <div className="h-52 w-full grid place-items-center">
          <div className="text-center">
            <div className="text-5xl text-sky-400">💬</div>
            <div className="mt-4 text-lg font-semibold text-gray-800">Start sending SMS messages</div>
            <div className="mt-2 text-sm text-gray-500 max-w-md">
              You can send group (and individual) SMS messages to students, prospects, teachers, related contacts and classes.
            </div>
            <button onClick={() => navigate("/compose")} className="mt-4 h-10 px-6 rounded-xl bg-indigo-600 text-white inline-flex items-center gap-2">
              <Plus size={16} />
              Send your first group SMS
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnnouncementsContent() {
  const navigate = useNavigate()
  
  return (
    <div className="mt-6">
      <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
        <div className="h-52 w-full grid place-items-center">
          <div className="text-center">
            <div className="text-5xl text-sky-400">📢</div>
            <div className="mt-4 text-lg font-semibold text-gray-800">Start sending announcements</div>
            <div className="mt-2 text-sm text-gray-500 max-w-md">
              You can send group (and individual) announcements to Students, Prospects, Teachers, Related contacts and Classes.
            </div>
            <button onClick={() => navigate("/compose")} className="mt-4 h-10 px-6 rounded-xl bg-indigo-600 text-white inline-flex items-center gap-2">
              <Plus size={16} />
              Send your first announcement
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
