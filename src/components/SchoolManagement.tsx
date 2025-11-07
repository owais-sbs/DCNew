import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const tabs = [
  { id: "expenses", label: "Expense tracking", count: 0, path: "/school" },
  { id: "inventory", label: "School inventory", count: 0, path: "/school/inventory" },
  { id: "signatures", label: "Signature requests", path: "/school/signatures" },
  { id: "library", label: "Library", path: "/school/library" },
]

function EmptyPanel({ icon, title, cta, onCta }: { icon: React.ReactNode; title: string; cta?: string; onCta?: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
      <div className="h-52 w-full grid place-items-center">
        <div className="text-center">
          <div className="text-5xl text-sky-400">{icon}</div>
          <div className="mt-4 text-lg font-semibold text-gray-800">{title}</div>
          {cta && (
            <button onClick={onCta} className="mt-3 h-9 px-4 rounded-full bg-indigo-50 text-indigo-700 text-sm">+ {cta}</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SchoolManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState("expenses")

  useEffect(()=>{
    if (location.pathname.startsWith("/school/inventory")) setActive("inventory")
    else if (location.pathname.startsWith("/school/signatures")) setActive("signatures")
    else if (location.pathname.startsWith("/school/library")) setActive("library")
    else setActive("expenses")
  },[location.pathname])

  const go = (t:any) => { setActive(t.id); navigate(t.path) }

  return (
    <div>
      <div className="px-6 py-6">
        <div className="text-2xl font-semibold text-gray-800 mb-4">School management</div>
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={()=>go(t)} 
              className={`relative inline-flex items-center gap-2 px-3 h-10 text-sm transition-colors ${
                active===t.id
                  ? "text-blue-700 font-medium"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <span>{t.label}</span>
              {t.count!=null && (
                <span
                  className={`text-xs ${
                    active === t.id ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  {t.count}
                </span>
              )}
              {active === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {active === "expenses" && (
            <EmptyPanel icon={"💲"} title="Start tracking expenses" cta="Add your expense" onCta={()=>navigate("/school/expenses/new")} />
          )}
          {active === "inventory" && (
            <EmptyPanel icon={"🏠"} title="Start tracking your inventory" cta="Add your inventory" onCta={()=>navigate("/school/inventory/new")} />
          )}
          {active === "signatures" && (
            <EmptyPanel icon={"✍️"} title="Signature requests" cta="Learn more" />
          )}
          {active === "library" && (
            <LibraryTab />
          )}
        </div>
      </div>
    </div>
  )
}

function LibraryTab() {
  const [view, setView] = useState<'grid'|'list'>('grid')
  const [monthOpen, setMonthOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string>('Select Month')
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const files = Array.from({length:24}).map((_,i)=>({
    name: `DCE14${50+i}_Passport.pdf`,
    type: i%3===0? 'pdf' : i%3===1? 'jpeg' : 'png',
    size: i%3===0? `${400+i}KB` : i%3===1? `${1+i%2}MB` : `${900+i}KB`,
    date: `0${(i%9)+1}-10-2025 13:${(i%59).toString().padStart(2,'0')}`
  }))

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="font-semibold text-gray-800">Files</div>
        <div className="flex items-center gap-3">
          {/* Upload button with dropdown */}
          <div className="relative">
            <button onClick={()=>setUploadOpen(v=>!v)} className="h-10 px-4 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-2">↥ Upload file</button>
            {uploadOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-2">
                <div className="px-3 py-1 text-xs text-gray-500">Add from...</div>
                {['Upload','Library','Dropbox','Google Drive'].map(label => (
                  <button key={label} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">{label}</button>
                ))}
              </div>
            )}
          </div>
          {/* View toggles */}
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200">
            <button onClick={()=>setView('list')} className={`h-10 w-10 grid place-items-center ${view==='list' ? 'bg-white' : ''}`}>≡</button>
            <button onClick={()=>setView('grid')} className={`h-10 w-10 grid place-items-center ${view==='grid' ? 'bg-indigo-50 text-indigo-700' : ''}`}>▦</button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-3 flex items-center gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input placeholder="Search by file name" className="w-80 h-10 pl-9 pr-3 rounded-xl border border-gray-200" />
        </div>
        <div className="relative">
          <button onClick={()=>setMonthOpen(v=>!v)} className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">{selectedMonth}</button>
          {monthOpen && (
            <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-3 w-44">
              <div className="flex items-center justify-between text-gray-700 px-2 pb-2"><button className="px-2">«</button><div className="font-semibold">2025</div><button className="px-2">»</button></div>
              <div className="grid grid-cols-2 gap-y-2">
                {months.map(m => (
                  <button key={m} onClick={()=>{setSelectedMonth(m); setMonthOpen(false);}} className={`px-2 py-1 rounded-lg hover:bg-gray-100 text-left ${selectedMonth===m? 'bg-gray-100' : ''}`}>{m}</button>
                ))}
              </div>
              <div className="absolute -top-2 left-5 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-200" />
            </div>
          )}
        </div>
        <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white">⟳</button>
      </div>

      {/* Content */}
      {view==='grid' ? (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {files.map((f,i)=> (
            <div key={i} className="rounded-2xl bg-white shadow-[0_1px_0_#e5e7eb] border border-gray-200 overflow-hidden">
              <div className="p-3">
                <div className="text-[13px] leading-5 text-indigo-700 underline line-clamp-3 h-[60px]">{f.name}</div>
                <div className="mt-2 flex items-center justify-end gap-3 text-indigo-600">
                  <button title="Download" className="h-7 w-7 grid place-items-center rounded-lg hover:bg-indigo-50">⬇</button>
                  <button title="Delete" className="h-7 w-7 grid place-items-center rounded-lg hover:bg-indigo-50">🗑</button>
                </div>
              </div>
              <div className="h-6 bg-red-600 text-white text-[12px] px-3 flex items-center justify-between">
                <span>{f.type}</span>
                <span>{f.size}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="py-3 px-3 font-medium">File name</th>
                <th className="py-3 px-3 font-medium">File type</th>
                <th className="py-3 px-3 font-medium">File size</th>
                <th className="py-3 px-3 font-medium">Uploaded on</th>
                <th className="py-3 px-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {files.map((f,i)=> (
                <tr key={i} className="hover:bg-indigo-50/30">
                  <td className="px-3 py-3 text-indigo-700 underline">{f.name}</td>
                  <td className="px-3 py-3 text-gray-700">{f.type}</td>
                  <td className="px-3 py-3 text-gray-700">{f.size}</td>
                  <td className="px-3 py-3 text-gray-700">{f.date}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button className="h-8 w-8 grid place-items-center rounded-lg border">⬇</button>
                      <button className="h-8 w-8 grid place-items-center rounded-lg border">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


