import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Users,
  GraduationCap,
  UserRoundCog,
  UserPlus,
  Gauge,
} from "lucide-react"

const metrics = [
  { id: "newStudents", title: "New students", value: 54, sub: "11% Active", icon: Users },
  { id: "newTeachers", title: "New teachers", value: 0, sub: "", icon: GraduationCap },
  { id: "newRelated", title: "New related contacts", value: 0, sub: "", icon: UserRoundCog },
  { id: "newProspects", title: "New prospects", value: 0, sub: "", icon: UserPlus },
]

const tabs = [
  { id: "dashboard", label: "Dashboard", path: "/people" },
  { id: "students", label: "Students", count: 966, path: "/people/students" },
  { id: "teachers", label: "Teachers", count: 41, path: "/people/teachers" },
  { id: "staffs", label: "Staffs", count: 2, path: "/people/staffs" },
  { id: "related", label: "Related contacts", count: 6, path: "/people/related" },
  { id: "prospects", label: "Prospects", count: 2, path: "/people/prospects" },
]

export default function PeopleDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState("dashboard")

  // ✅ Sync active tab based on route
  useEffect(() => {
    const found = tabs.find((t) => location.pathname === t.path)
    if (found) setActive(found.id)
    else if (location.pathname.startsWith("/people")) setActive("students")
    else setActive("dashboard")
  }, [location.pathname])

  const handleTabClick = (id: string, path: string) => {
    setActive(id)
    navigate(path)
  }

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        {/* Tabs Row */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabClick(t.id, t.path)}
              className={`inline-flex items-center gap-2 px-3 h-10 rounded-xl text-sm ${
                active === t.id
                  ? "bg-white shadow-sm border border-blue-200 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50 border border-transparent"
              }`}
            >
              <span>{t.label}</span>
              {t.count != null && (
                <span
                  className={`text-xs ${
                    active === t.id ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* --- Metrics Section --- */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((m) => {
            const Icon = m.icon
            return (
              <div
                key={m.id}
                className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 to-transparent" />
                <div className="p-5">
                  <div className="flex items-center gap-3 text-emerald-700">
                    <Icon size={18} />
                    <div className="font-semibold">{m.title}</div>
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-gray-900">
                    {m.value}
                  </div>
                  {m.sub && (
                    <div className="mt-1 text-sm text-gray-600">{m.sub}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* --- Middle Section --- */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          {/* Student Enrollment Tenure */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-800 mb-4">
              Student enrollment tenure
            </div>
            <div className="space-y-4">
              {["0-3 Months", "3-12 Months", "1-2 Years", "2+ Years"].map(
                (l, i) => (
                  <div
                    key={l}
                    className="flex items-center gap-4 text-sm text-gray-700"
                  >
                    <div className="w-24 text-gray-600">{l}</div>
                    <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${30 + i * 15}%` }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Upcoming Birthdays */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">
              Upcoming birthdays
            </div>
            <div className="space-y-4 max-h-72 overflow-auto pr-2">
              {[
                "Wilker De Lima Carvalho",
                "Glauce Jacqueline Sales Melo",
                "Thamiris Klycia De Moraes",
                "Margarita Huanca Esposo",
                "Dennys Rolando Molina",
              ].map((n, i) => (
                <div key={n} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-purple-200 text-purple-700 grid place-items-center text-sm font-semibold">
                      {n
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="text-sm text-gray-800">{n}</div>
                  </div>
                  <div className="text-xs text-gray-500">19 October, 2025</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Bottom Section --- */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Most Active Teachers */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">
              Most active teachers
            </div>
            <div className="divide-y">
              {[
                "Colm Delmar1",
                "Anne Smiddy Elisabeth",
                "Olga Teacher",
                "Walid Teacher",
                "Dimitro Teacher",
              ].map((n, i) => (
                <div key={n} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold ${
                        [
                          "bg-purple-500",
                          "bg-rose-500",
                          "bg-blue-600",
                          "bg-indigo-500",
                          "bg-sky-500",
                        ][i]
                      }`}
                    >
                      {n
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="text-sm text-gray-800">{n}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {[10, 5, 5, 5, 5][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prospect Source */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm grid place-items-center">
            <div className="text-gray-600">Prospect source</div>
            <div className="mt-3 h-48 w-48 rounded-full bg-gray-300" />
          </div>

          {/* Prospect Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm grid">
            <div className="text-gray-600">Prospect status</div>
            <div className="mt-3 h-48 w-full border border-gray-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
