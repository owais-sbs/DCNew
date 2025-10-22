import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  FileText, 
  RotateCcw,
  Search,
  Download,
  Plus,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  X
} from "lucide-react"

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "grid", path: "/payments" },
  { id: "received", label: "Payments received", icon: "check", path: "/payments/received" },
  { id: "overdue", label: "Overdue payments", icon: "clock", path: "/payments/overdue" },
  { id: "future", label: "Future payments", icon: "trend", path: "/payments/future" },
  { id: "invoices", label: "Payment invoices", icon: "invoice", path: "/payments/invoices" },
  { id: "refunds", label: "Refunds", icon: "refund", path: "/payments/refunds" },
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
        <ChevronDown size={16} />
      </button>

      {open && (
        <div
          className="fixed right-6 mt-2 w-[720px] bg-white border border-gray-200 rounded-xl shadow-2xl p-3 z-[9999]"
          style={{ top: "70px" }}
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
  const [active, setActive] = useState("received")

  useEffect(() => {
    const f = tabs.find((t) => location.pathname === t.path)
    setActive(f ? f.id : "received")
  }, [location.pathname])

  const go = (t: any) => {
    setActive(t.id)
    navigate(t.path)
  }

  const renderTabIcon = (icon: string) => {
    switch (icon) {
      case "grid": return <div className="w-4 h-4 bg-gray-400 rounded-sm" />
      case "check": return <CheckSquare size={16} className="text-gray-500" />
      case "clock": return <Clock size={16} className="text-gray-500" />
      case "trend": return <TrendingUp size={16} className="text-gray-500" />
      case "invoice": return <FileText size={16} className="text-gray-500" />
      case "refund": return <RotateCcw size={16} className="text-gray-500" />
      default: return null
    }
  }

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="text-2xl font-semibold text-gray-800 mb-4">Payments</div>
        
        {/* Tabs - line style */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-3 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => go(t)}
              className={`relative inline-flex items-center gap-2 px-3 h-10 text-sm whitespace-nowrap transition-colors ${
                active === t.id ? "text-blue-700 font-medium" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {renderTabIcon(t.icon)}
              <span>{t.label}</span>
              {active === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {active === "dashboard" && <DashboardContent />}
        {active === "received" && <PaymentsReceivedContent />}
        {active === "overdue" && <OverduePaymentsContent />}
        {active === "future" && <FuturePaymentsContent />}
        {active === "invoices" && <PaymentInvoicesContent />}
        {active === "refunds" && <RefundsContent />}
      </div>
    </div>
  )
}

function DashboardContent() {
  return (
    <div className="mt-6">
      {/* Payments dashboard header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Payments dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Overview of payments performance</p>
        </div>
        <DateRange />
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
  )
}

function PaymentsReceivedContent() {
  const navigate = useNavigate()
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  
  return (
    <div className="mt-6">
      {/* Summary */}
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare size={16} className="text-gray-500" />
        <span className="text-sm text-gray-700">2 Receipts €3,050.00 in current view</span>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            placeholder="Search" 
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200"
          />
        </div>
        <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2">
          <Download size={16} />
          Export
        </button>
        <button onClick={() => navigate("/payments/add-payment")} className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} />
          Add payment
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
          <option>Payment method: All</option>
        </select>
        <DateRange />
        <button className="h-10 w-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Receipt # <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Date <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Bill to <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Paid by <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Subtotal <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Discount <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  VAT <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Total <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Created by <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Created on <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-3">
                  <span 
                    className="text-blue-600 cursor-pointer hover:text-blue-800"
                    onClick={() => setShowReceiptModal(true)}
                  >
                    A41063
                  </span>
                </td>
                <td className="px-4 py-3">0-2019</td>
                <td className="px-4 py-3">TEST 6...</td>
                <td className="px-4 py-3">Bank Transfer</td>
                <td className="px-4 py-3">€1,600.00</td>
                <td className="px-4 py-3">€0.00</td>
                <td className="px-4 py-3">€0.00</td>
                <td className="px-4 py-3">€1,600.00</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3">11-10-2019 1</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setShowReceiptModal(true)}
                      className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50"
                    >
                      <Eye size={14} className="text-gray-500" />
                    </button>
                    <button className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
                      <Download size={14} className="text-gray-500" />
                    </button>
                    <button className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
                      <Edit size={14} className="text-gray-500" />
                    </button>
                    <button className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
                      <Trash2 size={14} className="text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-3">
                  <span 
                    className="text-blue-600 cursor-pointer hover:text-blue-800"
                    onClick={() => setShowReceiptModal(true)}
                  >
                    A31063
                  </span>
                </td>
                <td className="px-4 py-3">0-2019</td>
                <td className="px-4 py-3">TEST 6...</td>
                <td className="px-4 py-3">Bank Transfer</td>
                <td className="px-4 py-3">€1,450.00</td>
                <td className="px-4 py-3">€0.00</td>
                <td className="px-4 py-3">€0.00</td>
                <td className="px-4 py-3">€1,450.00</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3">11-10-2019 1</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setShowReceiptModal(true)}
                      className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50"
                    >
                      <Eye size={14} className="text-gray-500" />
                    </button>
                    <button className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
                      <Download size={14} className="text-gray-500" />
                    </button>
                    <button className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
                      <Edit size={14} className="text-gray-500" />
                    </button>
                    <button className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
                      <Trash2 size={14} className="text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-3">
            <select className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
              <option>25</option>
            </select>
            <span className="text-sm text-gray-500">Showing 1 - 2 of 2 entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">K</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&lt;</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center bg-indigo-600 text-white">
              <span className="text-sm">1</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&gt;</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&gt;I</span>
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Receipt</h3>
              <div className="text-sm text-gray-600">Receipt #: A41063</div>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Receipt Details */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Receipt Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date Issued:</span>
                    <span className="ml-2 text-gray-800">11-10-2019</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Paid By:</span>
                    <span className="ml-2 text-gray-800">Bank Transfer</span>
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Customer</h4>
                <div className="text-sm space-y-1">
                  <div className="text-gray-800">TEST 6</div>
                  <div className="text-gray-600">31/32 North Cumberland Street, Dublin 1, Dublin, Ireland</div>
                  <div className="text-gray-600">Phone/ID: 15381506</div>
                </div>
              </div>

              {/* From */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">From</h4>
                <div className="text-sm space-y-1">
                  <div className="text-gray-800">DCE English Language School</div>
                  <div className="text-gray-600">Phone: 015381506</div>
                  <div className="text-gray-600">Email: info@dcedu.ie</div>
                  <div className="text-gray-600">Website: www.dcedu.ie</div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Payment Details</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">Student & Fee Description</th>
                        <th className="text-right px-4 py-3 border-b border-gray-200 font-medium">Subtotal</th>
                        <th className="text-right px-4 py-3 border-b border-gray-200 font-medium">Discount</th>
                        <th className="text-right px-4 py-3 border-b border-gray-200 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 border-b border-gray-200">Tuition Fees</td>
                        <td className="px-4 py-3 border-b border-gray-200 text-right">€1,600.00</td>
                        <td className="px-4 py-3 border-b border-gray-200 text-right">€0.00</td>
                        <td className="px-4 py-3 border-b border-gray-200 text-right">€1,600.00</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-4 py-3 font-semibold">Subtotal</td>
                        <td className="px-4 py-3 text-right font-semibold">€1,600.00</td>
                        <td className="px-4 py-3 text-right font-semibold">€0.00</td>
                        <td className="px-4 py-3 text-right font-semibold">€1,600.00</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold">Total</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right font-semibold">€1,600.00</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="h-10 px-6 rounded-xl border border-gray-200 bg-white text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Subtotal €1,600.00</div>
                  <div className="text-sm text-gray-600">Total €1,600.00</div>
                </div>
                <button 
                  onClick={() => setShowNotesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
              
              <div className="space-y-2 mb-6">
                <div className="text-sm text-gray-700">25 weeks course</div>
                <div className="text-sm text-gray-700">Book</div>
                <div className="text-sm text-gray-700">TIE</div>
                <div className="text-sm text-gray-700">......</div>
              </div>

              <div className="flex items-center gap-2">
                <button className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 inline-flex items-center gap-2">
                  <Edit size={16} />
                  Edit
                </button>
                <button className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-gray-700">
                  Cancel
                </button>
                <button className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-gray-700">
                  Delete
                </button>
                <button className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 inline-flex items-center gap-2">
                  <Download size={16} />
                  Download
                </button>
                <button className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 inline-flex items-center gap-2">
                  Send <ChevronDown size={12} />
                </button>
                <button className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-gray-700">
                  Print
                </button>
                <button 
                  onClick={() => setShowNotesModal(false)}
                  className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-gray-700"
                >
                  X Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OverduePaymentsContent() {
  const navigate = useNavigate()
  const [showBulkReceiptModal, setShowBulkReceiptModal] = useState(false)
  
  return (
    <div className="mt-6">
      {/* Summary */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
          <span className="text-white text-xs">!</span>
        </div>
        <span className="text-sm text-gray-700">0 Overdue payments</span>
        <span className="text-sm text-gray-500">€0.00 in current view</span>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            placeholder="Search" 
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200"
          />
        </div>
        <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
          <option>Student: All</option>
        </select>
        <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
          <option>Class: All</option>
        </select>
        <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
          <option>Payment method: All</option>
        </select>
        <DateRange />
        <button className="h-10 w-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
        <button 
          onClick={() => setShowBulkReceiptModal(true)}
          className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm inline-flex items-center gap-2"
        >
          <span className="text-lg">$</span>
          Bulk receipt
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Due date <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Student <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Description <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Method <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Subtotal <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Discount <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Total <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-3">
            <select className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
              <option>25</option>
            </select>
            <span className="text-sm text-gray-500">Showing 0 - 0 of 0 entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">K</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&lt;</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&gt;</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&gt;I</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Receipt Modal */}
      {showBulkReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Bulk receipt</h3>
              <button 
                onClick={() => setShowBulkReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Students section */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800">Students</h4>
                <button className="h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm">
                  Mark as Settled
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4 mb-4">
                <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
                  <option>Student: All</option>
                </select>
                <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
                  <option>Payment Method: All</option>
                </select>
                <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
                  <option>Overdue Fees</option>
                </select>
                <button className="h-10 w-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                  <RefreshCw size={16} className="text-gray-500" />
                </button>
              </div>

              {/* Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </th>
                      <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                        Student <ChevronDown size={12} />
                      </th>
                      <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                        Payment Method <ChevronDown size={12} />
                      </th>
                      <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                        Amount <ChevronDown size={12} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">€17,055.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
                    <option>25</option>
                  </select>
                  <span className="text-sm text-gray-500">entries per page</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                    <span className="text-sm">«</span>
                  </button>
                  <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                    <span className="text-sm">‹</span>
                  </button>
                  <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center bg-indigo-600 text-white">
                    <span className="text-sm">1</span>
                  </button>
                  <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                    <span className="text-sm">›</span>
                  </button>
                  <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                    <span className="text-sm">»</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowBulkReceiptModal(false)}
                className="h-10 px-6 rounded-xl border border-gray-200 bg-white text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FuturePaymentsContent() {
  const navigate = useNavigate()
  
  return (
    <div className="mt-6">
      {/* Summary */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-gray-500" />
        <span className="text-sm text-gray-700">0 Future payments</span>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            placeholder="Search" 
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200"
          />
        </div>
        <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
          <option>Student: All</option>
        </select>
        <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
          <option>Class: All</option>
        </select>
        <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
          <option>Payment method: All</option>
        </select>
        <DateRange />
        <button className="h-10 w-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Due date <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Student <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Description <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Method <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Subtotal <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Discount <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Total <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-3">
            <select className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
              <option>25</option>
            </select>
            <span className="text-sm text-gray-500">Showing 0 - 0 of 0 entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">K</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&lt;</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&gt;</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&gt;I</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentInvoicesContent() {
  const navigate = useNavigate()
  
  return (
    <div className="mt-6">
      <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
        <div className="h-52 w-full grid place-items-center">
          <div className="text-center">
            <div className="text-5xl text-blue-400 mb-4">
              <FileText size={48} />
            </div>
            <div className="mt-4 text-lg font-semibold text-gray-800">Start issuing invoices</div>
            <div className="mt-2 text-sm text-gray-500 max-w-md">
              Once you've assigned class or custom fees to a students, you can issue a invoice for them.
            </div>
            <button onClick={() => navigate("/payments/add-invoice")} className="mt-4 h-10 px-6 rounded-xl bg-indigo-600 text-white inline-flex items-center gap-2">
              <Plus size={16} />
              Add new invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RefundsContent() {
  const navigate = useNavigate()
  
  return (
    <div className="mt-6">
      {/* Summary */}
      <div className="flex items-center gap-2 mb-4">
        <RotateCcw size={16} className="text-gray-500" />
        <span className="text-sm text-gray-700">0 Refunds</span>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            placeholder="Search" 
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200"
          />
        </div>
        <button onClick={() => navigate("/payments/add-refund")} className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} />
          Add refund
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <DateRange />
        <button className="h-10 w-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Student <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Description <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Date <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Amount <ChevronDown size={12} />
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-200 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-3">
            <select className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
              <option>25</option>
            </select>
            <span className="text-sm text-gray-500">Showing 0 - 0 of 0 entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">K</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&lt;</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&gt;</span>
            </button>
            <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-sm">&gt;I</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

