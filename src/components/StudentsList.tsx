import { ChevronDown, Download, Plus, Filter, MoreHorizontal } from "lucide-react"
import { useNavigate } from "react-router-dom"

const rows = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  name: [
    "Abdurrahkim Umirbyek",
    "Abraham Emmanuel Acosta Garcia",
    "Adiyadorj Erdev",
    "Adriana Jaimes Garcia",
    "Adriana Martins De Abreu",
    "Adriana Xavier Arruda"
  ][i % 6],
  phone: ["353831330558", "353834074840", "3530834368847"][i % 3],
  email: [
    "omirbekrahkim@gmail.com",
    "manuel.garcavz@gmail.com",
    "adiyadorj_erdev@yahoo.com",
    "4drjaimes@gmail.com",
    "aabreu.ama@gmail.com"
  ][i % 5],
  reg: ["04-04-2025", "07-04-2025", "15-09-2025", "02-05-2025", "16-05-2025"][i % 5],
  idNum: ["DCE2848", "DCE2851", "DCE3220", "DCE2926", "DCE2970"][i % 5],
  payments: "€0.00"
}))

export default function StudentsList() {
  const navigate = useNavigate()
  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        {/* Tabs bar */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          {[
            { label: "Dashboard" },
            { label: "Students", count: 966 },
            { label: "Teachers", count: 41 },
            { label: "Staffs", count: 2 },
            { label: "Related contacts", count: 6 },
            { label: "Prospects", count: 2 }
          ].map((t, idx) => (
            <button key={idx} className={`inline-flex items-center gap-2 px-3 h-10 rounded-xl text-sm ${idx===1?"bg-white shadow-sm border border-blue-200 text-blue-700":"text-gray-700 hover:bg-gray-50"}`}>
              <span>{t.label}</span>
              {t.count!=null && <span className="text-xs text-gray-500">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Header actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xl font-semibold text-gray-800">966 Students</div>
          <div className="flex items-center gap-3">
            <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
            <button className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
              <Plus size={18} /> Add student
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <input placeholder="Search" className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 text-sm" />
          </div>
          {[
            "Teacher: All",
            "Classes: All",
            "Payments: All",
            "Status: Live"
          ].map((f) => (
            <button key={f} className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
              {f} <ChevronDown size={14} className="text-gray-500" />
            </button>
          ))}
          <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-600"><span>⟲</span></button>
          <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-600"><Filter size={16} /></button>
          <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-600">⋯</button>
        </div>

        {/* Table */}
        <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {[
                  "",
                  "Name",
                  "Phone",
                  "Email",
                  "Registration date",
                  "ID Number",
                  "Payments",
                  ""
                ].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-b last:border-0 border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" /></td>
                  <td className="px-4 py-3 text-indigo-700 flex items-center gap-2">
                    <img 
                      src={`https://i.pravatar.cc/32?img=${(i % 70) + 1}`} 
                      className="h-8 w-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all" 
                      onClick={() => {
                        console.log('Navigating to:', `/people/students/${r.id}`)
                        navigate(`/people/students/${r.id}`)
                      }}
                      alt={`${r.name} profile`}
                    />
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-gray-500">{r.idNum}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.phone}</td>
                  <td className="px-4 py-3 text-blue-600">{r.email}</td>
                  <td className="px-4 py-3">{r.reg}</td>
                  <td className="px-4 py-3">{r.idNum}</td>
                  <td className="px-4 py-3 text-emerald-600">{r.payments}</td>
                  <td className="px-4 py-3"><button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"><MoreHorizontal size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}



