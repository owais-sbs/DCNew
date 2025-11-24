import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { NotebookPen, Users2, CalendarDays, Repeat2 } from "lucide-react"
import ClassesScreen from "./ClassesScreen"

const tabs = [
  { id: "dashboard", label: "Dashboard", path: "/notes" },
  { id: "classes", label: "Classes", path: "/notes/classes" }
]

export default function NotesDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState("dashboard")

  useEffect(() => {
    const f = tabs.find(t => location.pathname === t.path)
    setActive(f ? f.id : "dashboard")
  }, [location.pathname])

  const go = (t:any) => { setActive(t.id); navigate(t.path) }

  // Render different content based on active tab
  if (active === "classes") {
    return (
      <div>
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Classes & Events</h1>
          
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 pb-3 mb-6">
            <button 
              onClick={() => go(tabs[0])} 
              className={`relative inline-flex items-center gap-2 px-3 h-10 text-sm transition-colors ${
                active===tabs[0].id
                  ? "text-blue-700 font-medium"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <span>{tabs[0].label}</span>
              {active === tabs[0].id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
            <button 
              onClick={() => go(tabs[1])} 
              className={`relative inline-flex items-center gap-2 px-3 h-10 text-sm transition-colors ${
                active===tabs[1].id
                  ? "text-blue-700 font-medium"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <span>{tabs[1].label}</span>
              {active === tabs[1].id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          </div>
        </div>
        <ClassesScreen />
      </div>
    );
  }
  

  return (
    <div>
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Classes & Events</h1>
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => go(t)} 
              className={`relative inline-flex items-center gap-2 px-3 h-10 text-sm transition-colors ${
                active===t.id
                  ? "text-blue-700 font-medium"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <span>{t.label}</span>
              {active === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* top cards (green style) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[{title:"Classes",value:53,sub:"100% Active"},{title:"Enrollments",value:63,sub:"5 unenrollments"},{title:"Events",value:0,sub:""},{title:"Substitute lessons",value:0,sub:""}].map((m,i)=> (
            <div key={i} className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 to-transparent" />
              <div className="p-5">
                <div className="font-semibold text-emerald-700">{m.title}</div>
                <div className="mt-3 text-2xl font-semibold text-gray-900">{m.value}</div>
                {m.sub && <div className="mt-1 text-sm text-gray-600">{m.sub}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* charts and lists mock */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-72">
            <div className="font-semibold text-gray-800 mb-3">Attendance breakdown (%)</div>
            <div className="h-full grid place-items-center">
              <div className="h-48 w-48 rounded-full border-8 border-emerald-500 border-t-rose-500" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-72">
            <div className="font-semibold text-gray-800 mb-3">Attendance recorded</div>
            <div className="mt-6 h-3 bg-gray-200 rounded-full overflow-hidden"><div className="h-full w-1/3 bg-emerald-500" /></div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">Students with highest attendance</div>
            <div className="space-y-3">
              {["Mayra Clara", "Felipe Andres", "Jennifer Gabriele"].map(n => (
                <div key={n} className="flex items-center gap-3 text-sm text-gray-700"><div className="h-8 w-8 rounded-full bg-indigo-100 grid place-items-center">{n.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>{n}</div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">Most popular classes</div>
            <ul className="text-sm text-indigo-700 space-y-2">
              {["Cork Classroom C1 AM ABAIGH/ANNE","Limerick class Room AM A2 ANNE/DIMITRO","PM A2 WALID/DIMITRO"].map(t=> (<li key={t} className="underline cursor-pointer">{t}</li>))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">Upcoming events</div>
            <div className="text-sm text-gray-500">No upcoming events</div>
          </div>
        </div>
      </div>
    </div>
  )
}



