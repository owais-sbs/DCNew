import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Users,
  GraduationCap,
  UserRoundCog,
  UserPlus,
  ChevronDown,
  Download,
  MoreHorizontal,
} from "lucide-react"
import axiosInstance from './axiosInstance'; // Assuming axiosInstance is configured

// --- Mock Data Definitions (Used for other tabs/metrics) ---
const metrics = [
  { id: "newStudents", title: "New students", value: 54, sub: "11% Active", icon: Users },
  { id: "newTeachers", title: "New teachers", value: 0, sub: "", icon: GraduationCap },
  { id: "newRelated", title: "New related contacts", value: 0, sub: "", icon: UserRoundCog },
  { id: "newProspects", title: "New prospects", value: 0, sub: "", icon: UserPlus },
]

// Define initial tab data
const initialTabs = [
  { id: "dashboard", label: "Dashboard", path: "/people", count: undefined },
  { id: "students", label: "Students", count: 0, path: "/people/students" }, // Count starts at 0
  { id: "teachers", label: "Teachers", count: 41, path: "/people/teachers" },
  { id: "staffs", label: "Staffs", count: 2, path: "/people/staffs" },
  { id: "related", label: "Related contacts", count: 6, path: "/people/related" },
  { id: "prospects", label: "Prospects", count: 2, path: "/people/prospects" },
]

// Define the expected structure of a single student record from the API
interface Student {
    Id: number;
    FirstName: string;
    Surname: string;
    MobilePhone: string;
    Email: string;
    RegistrationDate: string;
    IdNumber: string;
    TuitionFees: number; // Using TuitionFees for payments column mock
    // Include other properties if needed for the table/logic
}


export default function PeopleDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState("dashboard")
    
  // --- Dynamic Data States ---
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [tabs, setTabs] = useState(initialTabs);
  // -----------------------------

  // Students filter state and options
  const [studentsOpenFilter, setStudentsOpenFilter] = useState<string | null>(null)
  const [studentsQuery, setStudentsQuery] = useState("")
  const [studentsSelected, setStudentsSelected] = useState<{ teacher: string; class: string; payment: string; status: string }>({
    teacher: "All",
    class: "All",
    payment: "All",
    status: "Live",
  })
  const [teachersStatusFilter, setTeachersStatusFilter] = useState<string | null>(null)
  const [staffStatusFilter, setStaffStatusFilter] = useState<string | null>(null)

  const teacherOptions = [
    "Abbey teacher","Adao Lopes Teacher","Ane 1","Anne Smiddy Elisabeth","Aoife Sinead Buckley","Ava Collopy","Beni Teacher","Carla Kerr","Cathrine Teacher","Colm Delmar1","Conor O'Riordan","Daiana Teacher","David Teacher","Dimitrina Teacher","Isabela Teacher","Maeve Teacher","Oriana Teacher","Saba Teacher","Sara Lagarto Teacher"
  ]
  const classOptions = [
    "AM B1 WALID/ABBEY","Advanced_AM_DCE1_PART 1","Advanced_AM_DCE1_PART 2","Advanced_PM_DCE1_PART 1","Advanced_PM_DCE1_PART 2","Cork Classroom C1 AM ABAIGH/ANNE","Elementary_AM_DCE1_PART 1","Elementary_AM_DCE1_PART 2","Elementary_AM_DCE1_PART 2","PM A2 WALID/DIMITRO",
  ]
  const paymentOptions = ["All", "Overdue", "Up to date"]
  const statusOptions = ["Live", "Enrolled", "Not Enrolled", "Archived"]


  // FETCH STUDENT DATA EFFECT
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const response = await axiosInstance.get("Student/GetAll");
        
        // 🚨 IMPORTANT FIX: Check if the students array is nested inside 'data'
        const studentsArray = Array.isArray(response.data) 
            ? response.data // Case 1: API returned a direct array (expected)
            : (response.data.Data || response.data.Result || response.data.students || []); 
            // Case 2: Array is nested inside a property like 'Data'

        // Ensure the extracted item is an array before setting state
        const validStudents = Array.isArray(studentsArray) ? studentsArray : [];


        setStudentList(validStudents);
        // Update the student count in the tabs array
        setTabs(prevTabs => 
          prevTabs.map(t => t.id === 'students' ? { ...t, count: validStudents.length } : t)
        );
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudentList([]); 
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  // SYNC ACTIVE TAB BASED ON ROUTE
  useEffect(() => {
    const { pathname } = location
    const found = tabs.find((t) => pathname === t.path)
    if (found) {
      setActive(found.id)
      return
    }
    if (pathname === "/people") {
      setActive("dashboard")
      return
    }
    if (pathname.startsWith("/people/students")) {
      setActive("students")
      return
    }
    if (pathname.startsWith("/people/teachers")) {
      setActive("teachers")
      return
    }
    if (pathname.startsWith("/people/staffs")) {
      setActive("staffs")
      return
    }
    if (pathname.startsWith("/people/related")) {
      setActive("related")
      return
    }
    if (pathname.startsWith("/people/prospects")) {
      setActive("prospects")
      return
    }
    setActive("dashboard")
  }, [location.pathname, tabs]) // Dependency on `tabs` ensures sync after count updates

  const handleTabClick = (id: string, path: string) => {
    setActive(id)
    navigate(path)
  }
    
  const formatRegistrationDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      // Assuming dateString is an ISO 8601 string from the C# backend
      return new Date(dateString).toLocaleDateString('en-IE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      <div className="px-6 py-6">
        {/* Page Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">People</h1>
        </div>
        {/* Tabs Row */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabClick(t.id, t.path)}
              className={`relative inline-flex items-center gap-2 px-3 h-10 text-sm transition-colors ${
                active === t.id
                  ? "text-blue-700 font-medium"
                  : "text-gray-700 hover:text-gray-900"
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
              {active === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* -------- DASHBOARD (cards) -------- */}
        {active === "dashboard" && (
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
        )}

        {active === "dashboard" && (
        <>
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
        </>
        )}

        {active === "dashboard" && (
        <>
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
        </>
        )}

        {/* -------- STUDENTS (img1) -------- */}
        {active === "students" && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold text-gray-800">{tabs.find(t => t.id === 'students')?.count} Students</div>
              <div className="flex items-center gap-3">
                <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                  <Download size={16} /> Export
                </button>
                <button 
                  onClick={() => navigate('/people/students/new')}
                  className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  + Add student
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 max-w-sm">
                <input placeholder="Search" className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 text-sm" />
              </div>
              <div className="ml-auto flex items-center gap-2 relative">
                {/* Teacher dropdown (img1 style) */}
                <div className="relative">
                  <button
                    onClick={() => { setStudentsQuery(""); setStudentsOpenFilter(studentsOpenFilter === 'teacher' ? null : 'teacher') }}
                    className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50"
                  >
                    Teacher: {studentsSelected.teacher} <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  {studentsOpenFilter === 'teacher' && (
                    <div className="absolute z-50 mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-lg p-2">
                      <input
                        autoFocus
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 mb-2 text-sm"
                        placeholder=""
                        value={studentsQuery}
                        onChange={(e) => setStudentsQuery(e.target.value)}
                      />
                      <div className="max-h-80 overflow-auto">
                        <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={() => { setStudentsSelected(s => ({...s, teacher: 'All'})); setStudentsOpenFilter(null) }}>All</div>
                        {(studentsQuery ? teacherOptions.filter(t => t.toLowerCase().includes(studentsQuery.toLowerCase())) : teacherOptions).map((t) => (
                          <div key={t} className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={() => { setStudentsSelected(s => ({...s, teacher: t})); setStudentsOpenFilter(null) }}>{t}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Classes dropdown (img2 style with sections) */}
                <div className="relative">
                  <button
                    onClick={() => { setStudentsQuery(""); setStudentsOpenFilter(studentsOpenFilter === 'class' ? null : 'class') }}
                    className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50"
                  >
                    Classes: {studentsSelected.class} <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  {studentsOpenFilter === 'class' && (
                    <div className="absolute z-50 mt-2 w-[28rem] bg-white border border-gray-200 rounded-2xl shadow-lg p-2">
                      <input
                        autoFocus
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 mb-2 text-sm"
                        placeholder=""
                        value={studentsQuery}
                        onChange={(e) => setStudentsQuery(e.target.value)}
                      />
                      <div className="max-h-96 overflow-auto">
                        <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={() => { setStudentsSelected(s => ({...s, class: 'All'})); setStudentsOpenFilter(null) }}>All</div>
                        <div className="px-3 py-2 text-xs text-gray-500">Active</div>
                        {(studentsQuery ? classOptions.filter(c => c.toLowerCase().includes(studentsQuery.toLowerCase())) : classOptions).map((c) => (
                          <div key={c} className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={() => { setStudentsSelected(s => ({...s, class: c})); setStudentsOpenFilter(null) }}>{c}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payments dropdown (img3 simple menu) */}
                <div className="relative">
                  <button
                    onClick={() => setStudentsOpenFilter(studentsOpenFilter === 'payment' ? null : 'payment')}
                    className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50"
                  >
                    Payments: {studentsSelected.payment} <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  {studentsOpenFilter === 'payment' && (
                    <div className="absolute z-50 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg p-2">
                      {paymentOptions.map((p) => (
                        <div key={p} className={`px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between ${studentsSelected.payment===p? 'text-gray-900':''}`} onClick={() => { setStudentsSelected(s => ({...s, payment: p})); setStudentsOpenFilter(null) }}>
                          {p}
                          {studentsSelected.payment === p && <span>✔</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status dropdown (img4 simple menu) */}
                <div className="relative">
                  <button
                    onClick={() => setStudentsOpenFilter(studentsOpenFilter === 'status' ? null : 'status')}
                    className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50"
                  >
                    Status: {studentsSelected.status} <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  {studentsOpenFilter === 'status' && (
                    <div className="absolute z-50 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg p-2">
                      {statusOptions.map((s) => (
                        <div key={s} className={`px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between ${studentsSelected.status===s? 'text-gray-900':''}`} onClick={() => { setStudentsSelected(prev => ({...prev, status: s})); setStudentsOpenFilter(null) }}>
                          {s}
                          {studentsSelected.status === s && <span>✔</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-600">⟲</button>
                <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-600">⋯</button>
              </div>
            </div>

            <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {["", "Name", "Phone", "Email", "Registration date", "ID Number", "Payments", ""].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Loading State */}
                  {loadingStudents && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        Loading student data...
                      </td>
                    </tr>
                  )}

                  {/* Data Mapping */}
                  {!loadingStudents && studentList.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No students found.
                    </td>
                    </tr>
                  )}

                  {!loadingStudents && studentList.map((student, i) => {
                    const fullName = `${student.FirstName || ''} ${student.Surname || ''}`;
                    const avatarSeed = (student.Id % 70) + 1;
                    return (
                      <tr key={student.Id} className="border-b last:border-0 border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3"><input type="checkbox" /></td>
                        <td className="px-4 py-3 text-indigo-700 flex items-center gap-2">
                          <img 
                            src={`https://i.pravatar.cc/48?img=${avatarSeed}`} 
                            className="h-8 w-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all" 
                            onClick={() => navigate(`/people/students/${student.Id}`)}
                            alt={`${fullName} profile`}
                          />
                          <div>
                            <div>{fullName}</div>
                            <div className="text-xs text-gray-500">{student.IdNumber || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{student.MobilePhone || 'N/A'}</td>
                        <td className="px-4 py-3 text-blue-600">{student.Email || 'N/A'}</td>
                        <td className="px-4 py-3">{formatRegistrationDate(student.RegistrationDate)}</td>
                        <td className="px-4 py-3">{student.IdNumber || 'N/A'}</td>
                        <td className="px-4 py-3 text-emerald-600">€{student.TuitionFees != null ? student.TuitionFees.toFixed(2) : '0.00'}</td>
                        <td className="px-4 py-3"><button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"><MoreHorizontal size={18} /></button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------- TEACHERS (img2) -------- */}
        {active === "teachers" && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold text-gray-800">{tabs.find(t => t.id === 'teachers')?.count} Teachers</div>
              <div className="flex items-center gap-3">
                <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                  <Download size={16} /> Export
                </button>
                <button 
                  onClick={() => navigate('/people/teachers/new')}
                  className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  + Add teacher
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 justify-end">
              <div className="relative">
                <button 
                  onClick={() => setTeachersStatusFilter(teachersStatusFilter === 'status' ? null : 'status')}
                  className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50"
                >
                  Status: All <ChevronDown size={14} className="text-gray-500" />
                </button>
                {teachersStatusFilter === 'status' && (
                  <div className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      All <span className="text-black">✓</span>
                    </div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Assigned</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Not Assigned</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Archived</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {["", "Name", "Phone", "Email", ""].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }).map((_, i) => {
                    const name = [
                      "Abbey teacher",
                      "Adao Lopes Teacher",
                      "Anne Smiddy Elisabeth",
                      "Colm Delmar1",
                      "Daiana Teacher",
                      "David Teacher",
                      "Dimitrina Teacher",
                    ][i % 7]
                    const phone = ["0858330601", "0831495753", "0852014537", "353"][i % 4]
                    const email = [
                      "elisabethsmiddy@hotmail.com",
                      "didina7@gmail.com",
                      "dmytroolginxbocx_yns@indeedemail.com",
                      "ale201019@hotmail.coM",
                    ][i % 4]
                    return (
                      <tr key={i} className="border-b last:border-0 border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/people/teachers/${i + 1}`)}>
                        <td className="px-4 py-3"><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                        <td className="px-4 py-3 text-indigo-700 flex items-center gap-2">
                          <div 
                            className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all ${["bg-green-500","bg-rose-500","bg-orange-500","bg-indigo-500"][i%4]}`}
                            onClick={() => navigate(`/people/teachers/${i + 1}`)}
                          >
                            {name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                          </div>
                          <div>
                            <div className="font-medium">{name}</div>
                            <div className="text-xs text-gray-500">Teacher</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{phone}</td>
                        <td className="px-4 py-3 text-blue-600">{email}</td>
                        <td className="px-4 py-3"><button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100" onClick={(e) => e.stopPropagation()}><MoreHorizontal size={18} /></button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------- STAFFS (img3) -------- */}
        {active === "staffs" && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold text-gray-800">{tabs.find(t => t.id === 'staffs')?.count} Staff</div>
              <div className="flex items-center gap-3">
                <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                  <Download size={16} /> Export
                </button>
                <button 
                  onClick={() => navigate('/people/staffs/new')}
                  className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  + Add staff
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 justify-end">
              <div className="relative">
                <button 
                  onClick={() => setStaffStatusFilter(staffStatusFilter === 'status' ? null : 'status')}
                  className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50"
                >
                  Status: All <ChevronDown size={14} className="text-gray-500" />
                </button>
                {staffStatusFilter === 'status' && (
                  <div className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      All <span className="text-black">✓</span>
                    </div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Assigned</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Not Assigned</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Archived</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {["", "Name", "Phone", "Email", ""].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {["Lia Reception","Lia Reception"].map((name, i) => (
                    <tr key={i} className="border-b last:border-0 border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/people/staffs/${i + 1}`)}>
                      <td className="px-4 py-3"><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                      <td className="px-4 py-3 text-indigo-700 flex items-center gap-2">
                        <div 
                          className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all ${["bg-purple-500","bg-red-500"][i%2]}`}
                          onClick={() => navigate(`/people/staffs/${i + 1}`)}
                        >
                          {name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                        </div>
                        <div>
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-gray-500">Staff</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700"></td>
                      <td className="px-4 py-3 text-blue-600">liasantosmarketing@gmail.com</td>
                      <td className="px-4 py-3"><button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100" onClick={(e) => e.stopPropagation()}><MoreHorizontal size={18} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------- RELATED CONTACTS (img4) -------- */}
        {active === "related" && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold text-gray-800">{tabs.find(t => t.id === 'related')?.count} Related contacts</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/people/related/new')}
                  className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  + Add related contact
                </button>
              </div>
            </div>
            <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {["", "Name", "Phone", "Email"].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({length:6}).map((_,i)=>{
                    const name = ["Parent A","Parent B","Parent C","Guardian D","Guardian E","Parent F"][i]
                    const phone = ""
                    const email = `related${i+1}@example.com`
                    return (
                      <tr key={i} className="border-b last:border-0 border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3"><input type="checkbox" /></td>
                        <td className="px-4 py-3 text-indigo-700 flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold ${["bg-emerald-500","bg-sky-500","bg-orange-500","bg-indigo-500","bg-rose-500","bg-purple-500"][i%6]}`}>{name.split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
                          {name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{phone}</td>
                        <td className="px-4 py-3 text-blue-600">{email}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------- PROSPECTS (img5) -------- */}
        {active === "prospects" && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold text-gray-800">{tabs.find(t => t.id === 'prospects')?.count} Prospects</div>
              <div className="flex items-center gap-3">
                <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                  <Download size={16} /> Export
                </button>
                <button onClick={() => navigate('/people/prospects/new')} className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
                  + Add prospect
                </button>
              </div>
            </div>

          <div className="mt-4 flex items-center gap-3 justify-end">
            {/* Subjects dropdown (img7) */}
            <div className="relative">
              <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                Subject: All <ChevronDown size={14} className="text-gray-500" />
              </button>
              {/* Implement options same as calendar subjects if needed */}
            </div>
            {/* All dropdown (img8) */}
            <div className="relative">
              <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                Level: All <ChevronDown size={14} className="text-gray-500" />
              </button>
            </div>
            {/* Status dropdown (img9) */}
            <div className="relative">
              <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                Status: Active Prospects <ChevronDown size={14} className="text-gray-500" />
              </button>
            </div>
          </div>

            <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {["", "Name", "Phone", "Email", "First contact", "Last action", "Subject", "Level", "Status"].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
              </table>
              <div className="py-12 text-center text-gray-600">No records found</div>
            </div>
          </div>
        )}
      </div>

      {/* No modals here; forms are full-screen pages */}
    </div>
  )
}