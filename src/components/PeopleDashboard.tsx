import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRoundCog,
  UserPlus,
  ChevronDown,
  Download,
  MoreHorizontal
} from "lucide-react"

type TabId = "dashboard" | "students" | "teachers" | "staff" | "related" | "prospects"

type StudentRow = {
  name: string
  id: string
  phone: string
  email: string
  registration: string
  payments: string
  avatar?: string
}

type TeacherRow = {
  name: string
  phone: string
  email: string
}

type StaffRow = {
  name: string
  email: string
}

type RelatedRow = {
  name: string
  email: string
}

type ProspectRow = {
  name: string
  phone: string
  email: string
  firstContact: string
  lastAction: string
  subject: string
  level: string
  status: string
}

const tabs: Array<{ id: TabId; label: string; count?: number; icon: any }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", count: 999, icon: Users },
  { id: "teachers", label: "Teachers", count: 41, icon: GraduationCap },
  { id: "staff", label: "Staff", count: 2, icon: UserRoundCog },
  { id: "related", label: "Related contacts", count: 6, icon: UserRoundCog },
  { id: "prospects", label: "Prospects", count: 2, icon: UserPlus }
]

const studentFilters = [
  { label: "Teacher", value: "All" },
  { label: "Classes", value: "All" },
  { label: "Payments", value: "All" },
  { label: "Status", value: "Live" }
]

const studentRows: StudentRow[] = [
  { name: "Abdullah Jan", id: "DCE3314", phone: "353857208236", email: "abdullahjanirl@gmail.com", registration: "16-10-2025", payments: "€0.00", avatar: "https://i.pravatar.cc/48?img=11" },
  { name: "Abdurrakhim Umirbyek", id: "DCE2848", phone: "353831330558", email: "omirbekrahkim@gmail.com", registration: "04-04-2025", payments: "€0.00", avatar: "https://i.pravatar.cc/48?img=32" },
  { name: "Abraham Emmanuel Acosta Garcia", id: "DCE2851", phone: "353831330558", email: "manuel.garcavz@gmail.com", registration: "07-04-2025", payments: "€0.00", avatar: "https://i.pravatar.cc/48?img=5" },
  { name: "Adiyadorj Erdev", id: "DCE3220", phone: "353834074840", email: "adiyadorj_erdev@yahoo.com", registration: "15-09-2025", payments: "€0.00", avatar: "https://i.pravatar.cc/48?img=15" },
  { name: "Adriana Jaimes Garcia", id: "DCE2926", phone: "3530834368847", email: "4drjaimes@gmail.com", registration: "02-05-2025", payments: "€0.00", avatar: "https://i.pravatar.cc/48?img=47" },
  { name: "Adriana Martins De Abreu", id: "DCE2970", phone: "3530834368847", email: "aabreu.ama@gmail.com", registration: "16-05-2025", payments: "€0.00", avatar: "https://i.pravatar.cc/48?img=49" },
  { name: "Adriana Xavier Arruda", id: "DCE2482", phone: "529831252831", email: "adrianaxavier637@gmail.com", registration: "02-12-2024", payments: "€0.00", avatar: "https://i.pravatar.cc/48?img=36" },
  { name: "Aldo Valencia Pantoja", id: "DCE2517", phone: "529831252831", email: "aldox.valencia14@gmail.com", registration: "10-12-2024", payments: "€0.00" },
  { name: "Alejandro Diaz Salinas", id: "DCE3131", phone: "", email: "alejandro23dsa@gmail.com", registration: "05-08-2025", payments: "€0.00" },
  { name: "Alejandro Ezequiel Contreras", id: "DCE3275", phone: "", email: "ale201019@hotmail.com", registration: "03-10-2025", payments: "€0.00", avatar: "https://i.pravatar.cc/48?img=64" }
]

const teacherRows: TeacherRow[] = [
  { name: "Abbey teacher", phone: "0858330601", email: "elisabethsmiddy@hotmail.com" },
  { name: "Adao Lopes Teacher", phone: "0831495753", email: "didina7@gmail.com" },
  { name: "Anne Smiddy Elisabeth", phone: "0852014537", email: "dmytroolginxbocx_yns@indeedemail.com" },
  { name: "Colm Delmar1", phone: "353", email: "ale201019@hotmail.com" },
  { name: "Daiana Teacher", phone: "0852014537", email: "daiana.teacher@example.com" }
]

const staffRows: StaffRow[] = [
  { name: "Lia Reception", email: "liasantosmarketing@gmail.com" },
  { name: "Patrick Admin", email: "patrick.admin@example.com" }
]

const relatedRows: RelatedRow[] = [
  { name: "Parent A", email: "related1@example.com" },
  { name: "Guardian B", email: "related2@example.com" },
  { name: "Parent C", email: "related3@example.com" }
]

const prospectRows: ProspectRow[] = [
  { name: "Julio Cesar", phone: "", email: "julio@example.com", firstContact: "01-09-2025", lastAction: "Email", subject: "General English", level: "B2", status: "Active" },
  { name: "Maria Lopez", phone: "", email: "maria@example.com", firstContact: "12-08-2025", lastAction: "Call", subject: "IELTS", level: "C1", status: "Pending" }
]

const avatarPalette = ["bg-indigo-500","bg-rose-500","bg-purple-500","bg-emerald-500","bg-blue-500"]

export default function PeopleDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>("students")

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-semibold text-gray-900">People</h1>

      <div className="mt-4 flex items-center gap-6 border-b border-gray-200 pb-3">
        {tabs.map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative inline-flex items-center gap-2 px-3 h-10 text-sm transition-colors ${
              activeTab === id ? "text-blue-700 font-semibold" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
            {typeof count === "number" && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            )}
            {activeTab === id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="mt-10 text-center text-gray-400 text-sm">
          Dashboard widgets are not configured in this prototype.
        </div>
      )}

      {activeTab === "students" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-800">999 Students</div>
            <div className="flex items-center gap-3">
              <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                <Download size={16} /> Export
              </button>
              <button
                onClick={() => navigate('/people/students/new')}
                className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm"
              >
                + Add student
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative w-64">
              <input
                placeholder="Search"
                className="w-full h-10 pl-4 pr-3 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {studentFilters.map((filter) => (
                <button
                  key={filter.label}
                  className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50"
                >
                  {filter.label}: {filter.value}
                  <ChevronDown size={14} className="text-gray-500" />
                </button>
              ))}
              <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500">⟳</button>
              <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500">⋯</button>
            </div>
          </div>

          <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  {["", "Name", "Phone", "Email", "Registration date", "ID Number", "Payments", ""].map((heading, idx) => (
                    <th key={idx} className="px-4 py-3 font-medium text-left border-b border-gray-200">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studentRows.map((student, idx) => {
                  const initials = student.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()

                  return (
                    <tr key={student.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3"><input type="checkbox" /></td>
                      <td className="px-4 py-3 text-indigo-700 flex items-center gap-3">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold ${avatarPalette[idx % avatarPalette.length]}`}>
                            {initials}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{student.phone}</td>
                      <td className="px-4 py-3 text-blue-600">{student.email}</td>
                      <td className="px-4 py-3 text-gray-700">{student.registration}</td>
                      <td className="px-4 py-3 text-gray-700">{student.id}</td>
                      <td className="px-4 py-3 text-emerald-600">{student.payments}</td>
                      <td className="px-4 py-3"><button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"><MoreHorizontal size={18} /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "teachers" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-800">41 Teachers</div>
            <div className="flex items-center gap-3">
              <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                <Download size={16} /> Export
              </button>
              <button onClick={() => navigate('/people/teachers/new')} className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm">
                + Add teacher
              </button>
            </div>
          </div>

          <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  {["", "Name", "Phone", "Email", ""].map((heading, idx) => (
                    <th key={idx} className="px-4 py-3 font-medium text-left border-b border-gray-200">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teacherRows.map((teacher, idx) => (
                  <tr key={teacher.name} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" /></td>
                    <td className="px-4 py-3 text-indigo-700 flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold ${avatarPalette[idx % avatarPalette.length]}`}>
                        {teacher.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{teacher.name}</div>
                        <div className="text-xs text-gray-500">Teacher</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{teacher.phone}</td>
                    <td className="px-4 py-3 text-blue-600">{teacher.email}</td>
                    <td className="px-4 py-3"><button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"><MoreHorizontal size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "staff" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-800">2 Staff</div>
            <div className="flex items-center gap-3">
              <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                <Download size={16} /> Export
              </button>
              <button onClick={() => navigate('/people/staffs/new')} className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm">
                + Add staff
              </button>
            </div>
          </div>

          <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  {["", "Name", "Email", ""].map((heading, idx) => (
                    <th key={idx} className="px-4 py-3 font-medium text-left border-b border-gray-200">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffRows.map((staff, idx) => (
                  <tr key={staff.email} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" /></td>
                    <td className="px-4 py-3 text-indigo-700 flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold ${avatarPalette[idx % avatarPalette.length]}`}>
                        {staff.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{staff.name}</div>
                        <div className="text-xs text-gray-500">Staff</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-blue-600">{staff.email}</td>
                    <td className="px-4 py-3"><button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"><MoreHorizontal size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "related" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-800">6 Related contacts</div>
            <button onClick={() => navigate('/people/related/new')} className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm">
              + Add related contact
            </button>
          </div>

          <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  {["", "Name", "Email"].map((heading, idx) => (
                    <th key={idx} className="px-4 py-3 font-medium text-left border-b border-gray-200">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {relatedRows.map((person, idx) => (
                  <tr key={person.email} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" /></td>
                    <td className="px-4 py-3 text-indigo-700 flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold ${avatarPalette[idx % avatarPalette.length]}`}>
                        {person.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                      </div>
                      <div className="font-medium text-gray-800">{person.name}</div>
                    </td>
                    <td className="px-4 py-3 text-blue-600">{person.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "prospects" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-800">2 Prospects</div>
            <div className="flex items-center gap-3">
              <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                <Download size={16} /> Export
              </button>
              <button onClick={() => navigate('/people/prospects/new')} className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm">
                + Add prospect
              </button>
            </div>
          </div>

          <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  {["", "Name", "Phone", "Email", "First contact", "Last action", "Subject", "Level", "Status"].map((heading, idx) => (
                    <th key={idx} className="px-4 py-3 font-medium text-left border-b border-gray-200">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prospectRows.map((prospect, idx) => (
                  <tr key={prospect.email} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" /></td>
                    <td className="px-4 py-3 text-indigo-700">{prospect.name}</td>
                    <td className="px-4 py-3 text-gray-700">{prospect.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-blue-600">{prospect.email}</td>
                    <td className="px-4 py-3 text-gray-700">{prospect.firstContact}</td>
                    <td className="px-4 py-3 text-gray-700">{prospect.lastAction}</td>
                    <td className="px-4 py-3 text-gray-700">{prospect.subject}</td>
                    <td className="px-4 py-3 text-gray-700">{prospect.level}</td>
                    <td className="px-4 py-3 text-gray-700">{prospect.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}