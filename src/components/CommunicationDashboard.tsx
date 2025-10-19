// CommunicationDashboard.tsx
import React, { useEffect, useMemo, useState } from "react"
import { 
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  Mail,
  MessageCircle,
  Megaphone,
  ChevronLeft,
  ChevronRight
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
  // UI state
  const [activeTab, setActiveTab] = useState<string>("dashboard")
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
            <button className="ml-3 h-10 px-4 rounded-xl bg-indigo-600 text-white inline-flex items-center gap-2">
              <Plus size={16} />
              New message
            </button>
          </div>
        </div>

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
      </div>
    </div>
  )
}
