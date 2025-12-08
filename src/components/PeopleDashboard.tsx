import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRoundCog,
  UserPlus,
  ChevronDown,
  Download,
  MoreHorizontal,
  Check,
  Minus
} from "lucide-react"
import axiosInstance from "./axiosInstance"

type TabId = "dashboard" | "students" | "teachers" | "staff" | "related" | "prospects"

type StudentRow = {
  Id: number
  FirstName?: string | null
  Surname?: string | null
  LastName?: string | null
  MobilePhone?: string | null
  Email?: string | null
  RegistrationDate?: string | null
  IdNumber?: string | null
  TuitionFees?: number | string | null
  Photo?: string | null
  IsActive?: boolean | null
}

type TeacherRow = {
  Id: number
  Name?: string | null
  Surname?: string | null
  Mobile?: string | null
  Email?: string | null
  Photo?: string | null
  IsActive?: boolean | null
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
  const [students, setStudents] = useState<StudentRow[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false)
  const [studentError, setStudentError] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const pageSize = 10
  const [totalCount, setTotalCount] = useState(0)

  // Teachers state
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState<boolean>(false)
  const [teacherError, setTeacherError] = useState<string | null>(null)
  const [teacherPageNumber, setTeacherPageNumber] = useState(1)
  const [teacherTotalCount, setTeacherTotalCount] = useState(0)
  const [teacherSearch, setTeacherSearch] = useState("")
  const [teacherSearchDebounced, setTeacherSearchDebounced] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    const fetchStudents = async () => {
      setIsLoadingStudents(true)
      setStudentError(null)
      try {
        const response = await axiosInstance.get("/Student/GetAllWithPagination", {
          params: { pageNumber, pageSize },
          signal: controller.signal
        })

        console.log(response.data)
        console.log(response.data.Data.Data)
        console.log(response.data.Data.TotalCount)
        if (response.data?.IsSuccess && Array.isArray(response.data.Data.Data)) {
          setStudents(response.data.Data.Data)
          setTotalCount(response.data.Data.TotalCount)
        } else {
          setStudents([])
          setStudentError("No student data available.")
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        console.error("Failed to load students", error)
        setStudentError("Failed to load students. Please try again.")
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingStudents(false)
        }
      }
    }

    fetchStudents()

    return () => controller.abort()
  }, [pageNumber])

  // Debounce teacher search
  useEffect(() => {
    const timer = setTimeout(() => {
      setTeacherSearchDebounced(teacherSearch)
      setTeacherPageNumber(1) // Reset to first page on search
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [teacherSearch])

  // Fetch teachers when teachers tab is active
  useEffect(() => {
    if (activeTab !== "teachers") return

    const controller = new AbortController()

    const fetchTeachers = async () => {
      setIsLoadingTeachers(true)
      setTeacherError(null)
      try {
        const response = await axiosInstance.get("/Teacher/GetAllTeachers", {
          params: { 
            pageNumber: teacherPageNumber, 
            pageSize: pageSize,
            search: teacherSearchDebounced || ""
          },
          signal: controller.signal
        })

        console.log("Teachers response:", response.data)
        if (response.data?.IsSuccess) {
          // API returns: { data: [...], pagination: { totalCount, ... } }
          const teachersData = response.data.Data?.data || []
          const total = response.data.Data?.pagination?.totalCount || 0
          
          if (Array.isArray(teachersData)) {
            setTeachers(teachersData)
            setTeacherTotalCount(total)
          } else {
            setTeachers([])
            setTeacherError("Invalid teacher data format.")
          }
        } else {
          setTeachers([])
          setTeacherError("No teacher data available.")
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        console.error("Failed to load teachers", error)
        setTeacherError("Failed to load teachers. Please try again.")
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingTeachers(false)
        }
      }
    }

    fetchTeachers()

    return () => controller.abort()
  }, [activeTab, teacherPageNumber, teacherSearchDebounced])


  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

const handleEdit = (id: number) => {
  // go to edit page – adjust route if your app uses a different pattern
  navigate(`/people/students/edit/${id}`)
}

const handleDelete = async (id: number) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this student?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    // Add this didOpen block to force the colors
    didOpen: () => {
      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();

      if (confirmBtn) {
        confirmBtn.style.setProperty('background-color', '#d33', 'important');
        confirmBtn.style.setProperty('color', '#ffffff', 'important');
      }
      if (cancelBtn) {
        cancelBtn.style.setProperty('background-color', '#3085d6', 'important');
        cancelBtn.style.setProperty('color', '#ffffff', 'important');
      }
    }
  });

  if (!confirm.isConfirmed) return;

  try {
    // API call → Student/Delete/15
    const response = await axiosInstance.delete(`/Student/Delete/${id}`);

    if (response.data?.IsSuccess) {
      Swal.fire({
        title: "Deleted!",
        text: "Student has been deleted successfully.",
        icon: "success",
      });

      // Remove from UI
      setStudents(prev => prev.filter(s => s.Id !== id));
      setTotalCount(prev => Math.max(prev - 1, 0));
    } else {
      Swal.fire({
        title: "Error",
        text: response.data?.Message || "Unable to delete student.",
        icon: "error",
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      title: "Error",
      text: "Something went wrong while deleting.",
      icon: "error",
    });
  } finally {
    setOpenDropdown(null);
  }
};

  

  const getStudentName = (student: StudentRow) => {
    const lastName = student.Surname ?? student.LastName
    const parts = [student.FirstName, lastName].filter(Boolean)
    return parts.length ? parts.join(" ") : "Unnamed student"
  }

  const getInitials = (student: StudentRow) => {
    const name = getStudentName(student)
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
    return initials || "NA"
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleDateString("en-GB")
  }

  const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") {
      return "€0.00"
    }
    const numericValue = Number(value)
    if (Number.isNaN(numericValue)) {
      return typeof value === "string" ? value : "€0.00"
    }
    return `€${numericValue.toFixed(2)}`
  }

  const resolvedTabs = tabs.map((tab) => {
    if (tab.id === "students") return { ...tab, count: totalCount }
    if (tab.id === "teachers") return { ...tab, count: teacherTotalCount }
    return tab
  })

  const renderStudentTableBody = () => {
    if (isLoadingStudents) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
            Loading students...
          </td>
        </tr>
      )
    }

    if (studentError) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-6 text-center text-red-600">
            {studentError}
          </td>
        </tr>
      )
    }

    if (!totalCount) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
            No students found.
          </td>
        </tr>
      )
    }

    return students.map((student, idx) => {
      const studentName = getStudentName(student)
      const initials = getInitials(student)

      return (
        <tr key={student.Id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
          <td className="px-4 py-3">
            <input type="checkbox" aria-label={`Select ${studentName}`} />
          </td>
          <td className="px-4 py-3 text-indigo-700">
            <button
              type="button"
              onClick={() => navigate(`/people/students/${student.Id}`)}
              className="flex items-center gap-3 text-left w-full focus:outline-none"
            >
              <div className="relative">
                {student.Photo ? (
                  <img src={student.Photo} alt={studentName} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div
                    className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold ${avatarPalette[idx % avatarPalette.length]}`}
                  >
                    {initials}
                  </div>
                )}
                {student.IsActive === true && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white border-2 border-white flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={8} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}
                {student.IsActive === false && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white border-2 border-white flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 flex items-center justify-center">
                      <Minus size={8} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-800">{studentName}</div>
                <div className="text-xs text-gray-500">{student.IdNumber || "—"}</div>
              </div>
            </button>
          </td>
          <td className="px-4 py-3 text-gray-700">{student.MobilePhone || "—"}</td>
          <td className="px-4 py-3 text-blue-600">
            {student.Email ? (
              <a href={`mailto:${student.Email}`} className="hover:underline">
                {student.Email}
              </a>
            ) : (
              "—"
            )}
          </td>
          <td className="px-4 py-3 text-gray-700">{formatDate(student.RegistrationDate)}</td>
          <td className="px-4 py-3 text-gray-700">{student.IdNumber || "—"}</td>
          <td className="px-4 py-3 text-emerald-600">{formatCurrency(student.TuitionFees)}</td>
           <td className="px-4 py-3 relative">
  {/* More button */}
  <button
    type="button"
    onClick={() =>
      setOpenDropdown(openDropdown === student.Id ? null : student.Id)
    }
    className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"
    aria-label="More actions"
  >
    <MoreHorizontal size={18} />
  </button>

  {/* Dropdown */}
  {openDropdown === student.Id && (
    <div className="absolute right-0 mt-2 w-36 rounded-xl border bg-white shadow-md z-50">
      <button
        type="button"
        onClick={() => handleEdit(student.Id)}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => handleDelete(student.Id)}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
      >
        Delete
      </button>
    </div>
  )}
</td>

        </tr>
      )
    })
  }

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-semibold text-gray-900">People</h1>

      <div className="mt-4 flex items-center gap-6 border-b border-gray-200 pb-3">
        {resolvedTabs.map(({ id, label, count, icon: Icon }) => (
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
            <div className="text-xl font-semibold text-gray-800">
              {isLoadingStudents ? "Loading students..." : `${totalCount} Students`}
            </div>
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
                  {["", "Name", "Phone", "Email", "Registration date", "ID Number", "Payments", "Actions"].map((heading, idx) => (
                    <th key={idx} className="px-4 py-3 font-medium text-left border-b border-gray-200">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
              {renderStudentTableBody()}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-4 bg-white border border-t-0 border-gray-200 rouded-b-xl">
              <button
                disabled={pageNumber === 1}
                onClick={() => setPageNumber(p => p-1)}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
              >Previous</button>
              <div className="text-gray-600 text-sm">
                Page {pageNumber} of {Math.ceil(totalCount/pageSize)}
              </div>
              <button
                disabled={pageNumber >= Math.ceil(totalCount/pageSize)}
                onClick={() => setPageNumber(p => p+1)}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "teachers" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-800">
              {isLoadingTeachers ? "Loading teachers..." : `${teacherTotalCount} Teachers`}
            </div>
            <div className="flex items-center gap-3">
              <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
                <Download size={16} /> Export
              </button>
              <button onClick={() => navigate('/people/teachers/new')} className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm">
                + Add teacher
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative w-64">
              <input
                placeholder="Search teachers"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full h-10 pl-4 pr-3 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500">⟳</button>
              <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500">⋯</button>
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
                {isLoadingTeachers ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      Loading teachers...
                    </td>
                  </tr>
                ) : teacherError ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-red-600">
                      {teacherError}
                    </td>
                  </tr>
                ) : !teacherTotalCount ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher, idx) => {
                    const teacherName = [teacher.Name, teacher.Surname].filter(Boolean).join(" ") || "Unnamed teacher"
                    const initials = teacherName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() ?? "")
                      .join("") || "NA"

                    return (
                      <tr key={teacher.Id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input type="checkbox" aria-label={`Select ${teacherName}`} />
                        </td>
                        <td className="px-4 py-3 text-indigo-700">
                          <button
                            type="button"
                            onClick={() => navigate(`/people/teachers/${teacher.Id}`)}
                            className="flex items-center gap-3 text-left w-full focus:outline-none"
                          >
                            <div className="relative">
                              {teacher.Photo ? (
                                <img src={teacher.Photo} alt={teacherName} className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div
                                  className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold ${avatarPalette[idx % avatarPalette.length]}`}
                                >
                                  {initials}
                                </div>
                              )}
                              {teacher.IsActive === true && (
                                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white border-2 border-white flex items-center justify-center">
                                  <div className="h-3 w-3 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check size={8} className="text-white" strokeWidth={3} />
                                  </div>
                                </div>
                              )}
                              {teacher.IsActive === false && (
                                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white border-2 border-white flex items-center justify-center">
                                  <div className="h-3 w-3 rounded-full bg-red-500 flex items-center justify-center">
                                    <Minus size={8} className="text-white" strokeWidth={3} />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{teacherName}</div>
                              <div className="text-xs text-gray-500">Teacher</div>
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{teacher.Mobile || "—"}</td>
                        <td className="px-4 py-3 text-blue-600">
                          {teacher.Email ? (
                            <a href={`mailto:${teacher.Email}`} className="hover:underline">
                              {teacher.Email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100" aria-label="More actions">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            {teacherTotalCount > 0 && (
              <div className="flex items-center justify-between px-4 py-4 bg-white border border-t-0 border-gray-200 rouded-b-xl">
                <button
                  disabled={teacherPageNumber === 1}
                  onClick={() => setTeacherPageNumber(p => p-1)}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <div className="text-gray-600 text-sm">
                  Page {teacherPageNumber} of {Math.ceil(teacherTotalCount/pageSize)}
                </div>
                <button
                  disabled={teacherPageNumber >= Math.ceil(teacherTotalCount/pageSize)}
                  onClick={() => setTeacherPageNumber(p => p+1)}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
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