import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const tabs = [
  { id: "dashboard", label: "Dashboard", path: "/payments" },
  { id: "received", label: "Payments received", path: "/payments/received" },
  { id: "overdue", label: "Overdue payments", path: "/payments/overdue" },
  { id: "future", label: "Future payments", path: "/payments/future" },
  { id: "invoices", label: "Payment invoices", path: "/payments/invoices" },
  { id: "refunds", label: "Refunds", path: "/payments/refunds" },
]

function DateRange() {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState({ start: "01-10-2025", end: "31-10-2025" })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm"
      >
        Date range:{" "}
        <span className="text-indigo-600">
          {range.start} - {range.end}
        </span>
      </button>

      {open && (
        <div
          className="fixed right-6 mt-2 w-[720px] bg-white border border-gray-200 rounded-xl shadow-2xl p-3 z-[9999]"
          style={{ top: "70px" }} // adjust this if needed
        >
          <div className="flex">
            {/* Left side quick ranges */}
            <div className="w-56 pr-2 border-r border-gray-200 space-y-2">
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
              ].map((l, i) => (
                <button
                  key={l}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    i === 5
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Right side calendar grids */}
            <div className="flex-1 grid grid-cols-2 gap-3 pl-3">
              {[0, 1].map((k) => (
                <div key={k} className="border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between px-3 py-2 text-sm">
                    <span>Oct</span>
                    <span>2025</span>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs text-gray-500">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                      <div key={d} className="py-1">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 p-2 text-sm">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 w-8 grid place-items-center rounded ${
                          i === 3 || i === 31
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {i % 31 + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Footer buttons */}
              <div className="col-span-2 flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 h-9 rounded-lg border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 h-9 rounded-lg bg-indigo-600 text-white"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaymentsDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState("dashboard")

  useEffect(() => {
    const f = tabs.find((t) => location.pathname === t.path)
    setActive(f ? f.id : "dashboard")
  }, [location.pathname])

  const go = (t: any) => {
    setActive(t.id)
    navigate(t.path)
  }

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6 relative">
        {/* Tabs */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => go(t)}
              className={`px-4 h-10 rounded-xl text-sm whitespace-nowrap ${
                active === t.id
                  ? "bg-white shadow-sm border border-blue-200 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto">
            <DateRange />
          </div>
        </div>

        {/* Top cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 to-transparent" />
            <div className="p-5">
              <div className="font-semibold text-emerald-700">
                Revenue received
              </div>
              <div className="mt-3 text-2xl font-semibold text-gray-900">
                €0.00
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-rose-50">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-rose-100 to-transparent" />
            <div className="p-5">
              <div className="font-semibold text-rose-700">
                Outstanding payments due
              </div>
              <div className="mt-3 text-2xl font-semibold text-gray-900">
                €0.00
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-sky-50">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-sky-100 to-transparent" />
            <div className="p-5">
              <div className="font-semibold text-sky-700">
                Outstanding invoice total
              </div>
              <div className="mt-3 text-2xl font-semibold text-gray-900">
                €0.00
              </div>
            </div>
          </div>
        </div>

        {/* Fees by teachers & students */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">
              Fees generated by teachers
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {["Teacher", "Revenue", "Lessons"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 border-b border-gray-200 font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: "Walid Teacher", i: "WT", r: "€0.00", l: 133 },
                    { n: "Colm Delmar1", i: "CD", r: "€0.00", l: 190 },
                    { n: "Anne Smiddy Elisabeth", i: "AS", r: "€0.00", l: 164 },
                    { n: "Dimitrina Teacher", i: "DT", r: "€0.00", l: 128 },
                    { n: "Dmytro Olgin Teacher", i: "DO", r: "€0.00", l: 23 },
                  ].map((t) => (
                    <tr key={t.n} className="border-b last:border-0 border-gray-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-xs font-semibold">
                            {t.i}
                          </div>
                          <span className="text-indigo-700">{t.n}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{t.r}</td>
                      <td className="px-4 py-3">{t.l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-right text-sm text-indigo-700">
              View all
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">
              Students with highest fees
            </div>
            <div className="text-sm text-gray-500">
              No payments made during the selected period
            </div>
          </div>
        </div>

        {/* Upcoming payments / status / method */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">
              Upcoming fees scheduled
            </div>
            <table className="w-full text-sm">
              <tbody className="text-gray-700">
                {[
                  "Next 30 days",
                  "Next 90 days",
                  "Next 180 days",
                  "Next 365 days",
                ].map((p) => (
                  <tr
                    key={p}
                    className="border-b last:border-0 border-gray-100"
                  >
                    <td className="py-3">{p}</td>
                    <td className="py-3 text-right">€0.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm grid place-items-center">
            <div className="font-semibold text-gray-800 mb-3 self-start">
              Payment status (%)
            </div>
            <div className="h-40 w-40 rounded-full bg-gray-300" />
            <div className="mt-4 text-sm space-y-2 self-start">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" /> Settled
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" /> Overdue
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400" /> Up to date
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">
              Payment method (%)
            </div>
            <div className="text-sm text-gray-500">
              No payments made during the selected period
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

