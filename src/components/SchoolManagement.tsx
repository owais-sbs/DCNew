import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const tabs = [
  { id: "expenses", label: "Expense tracking", count: 0, path: "/school" },
  { id: "inventory", label: "School inventory", count: 0, path: "/school/inventory" },
  { id: "signatures", label: "Signature requests", path: "/school/signatures" },
  { id: "library", label: "Library", path: "/school/library" },
]

function EmptyPanel({ icon, title, cta }: { icon: React.ReactNode; title: string; cta?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
      <div className="h-52 w-full grid place-items-center">
        <div className="text-center">
          <div className="text-5xl text-sky-400">{icon}</div>
          <div className="mt-4 text-lg font-semibold text-gray-800">{title}</div>
          {cta && (
            <button className="mt-3 h-9 px-4 rounded-full bg-indigo-50 text-indigo-700 text-sm">+ {cta}</button>
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
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        <div className="text-2xl font-semibold text-gray-800 mb-4">School management</div>
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          {tabs.map(t => (
            <button key={t.id} onClick={()=>go(t)} className={`inline-flex items-center gap-2 px-3 h-10 rounded-xl text-sm ${active===t.id?"bg-white shadow-sm border border-blue-200 text-blue-700":"text-gray-700 hover:bg-gray-50"}`}>
              <span>{t.label}</span>
              {t.count!=null && <span className="text-xs text-gray-500">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {active === "expenses" && (
            <EmptyPanel icon={"💲"} title="Start tracking expenses" cta="Add your first expense" />
          )}
          {active === "inventory" && (
            <EmptyPanel icon={"🏠"} title="Start tracking your inventory" cta="Add your first inventory item" />
          )}
          {active === "signatures" && (
            <EmptyPanel icon={"✍️"} title="Signature requests" cta="Learn more" />
          )}
          {active === "library" && (
            <div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800">Files</div>
                  <div className="flex items-center gap-2">
                    <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white">≡</button>
                    <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white">▦</button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <input placeholder="Search by file name" className="w-80 h-10 px-4 rounded-xl border border-gray-200" />
                  <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Type: All ▾</button>
                  <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Select Month</button>
                  <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white">⟳</button>
                </div>
                {/* grid of file cards */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({length:8}).map((_,i)=> (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="h-28 bg-gray-100 rounded" />
                      <div className="mt-2 text-indigo-700 text-sm underline truncate">DCE145{i}_Document.pdf</div>
                      <div className="mt-2 flex items-center justify-between text-gray-500 text-xs">
                        <span>pdf</span>
                        <div className="flex items-center gap-2">
                          <button>⬇</button>
                          <button>🗑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


