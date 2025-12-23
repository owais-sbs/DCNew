import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Swal from "sweetalert2";

import {
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

// Tabs shown on People page – match design (no Dashboard tab)
type TabId = "students" | "teachers" | "staff" | "related" | "prospects"

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
  Id: number
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

// Base tab config – counts are overridden from API data below
const tabs: Array<{ id: TabId; label: string; count?: number; icon: any }> = [
  { id: "students", label: "Students", count: 0, icon: Users },
  { id: "teachers", label: "Teachers", count: 0, icon: GraduationCap },
  { id: "staff", label: "Staffs", count: 0, icon: UserRoundCog },
  { id: "related", label: "Other Contacts", count: 0, icon: UserRoundCog },
  { id: "prospects", label: "Prospects", count: 0, icon: UserPlus }
]

const studentFilters = [
  { label: "Teacher", value: "All" },
  { label: "Classes", value: "All" },
  { label: "Payments", value: "All" },
  { label: "Status", value: "Live" }
]


const staffRows: StaffRow[] = [
  { Id: 1, name: "Lia Reception", email: "liasantosmarketing@gmail.com" },
  { Id: 2, name: "Lia Reception", email: "liasantosmarketing@gmail.com" },
  { Id: 3, name: "Patrick Admin", email: "patrick.admin@example.com" }
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>("students")
  const [students, setStudents] = useState<StudentRow[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false)
  const [studentError, setStudentError] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState<number | "all">(10)
  const [totalCount, setTotalCount] = useState(0)
  const [studentSearch, setStudentSearch] = useState("")
  const [studentSearchDebounced, setStudentSearchDebounced] = useState("")

  // Teachers state
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState<boolean>(false)
  const [teacherError, setTeacherError] = useState<string | null>(null)
  const [teacherPageNumber, setTeacherPageNumber] = useState(1)
  const [teacherTotalCount, setTeacherTotalCount] = useState(0)
  const [teacherSearch, setTeacherSearch] = useState("")
  const [teacherSearchDebounced, setTeacherSearchDebounced] = useState("")
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)

  // derived pagination values
const studentTotalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(totalCount / (pageSize as number)));
const teacherTotalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(teacherTotalCount / (pageSize as number)));


// helper to build page buttons (1 ... n) — returns array of numbers or "..."
const makePageButtons = (totalPages: number, current: number) => {
  const pages: (number | "...")[] = [];
  const maxButtons = 5;
  let left = Math.max(1, current - 2);
  let right = Math.min(totalPages, current + 2);

  if (current <= 3) {
    left = 1;
    right = Math.min(totalPages, maxButtons);
  } else if (current + 2 >= totalPages) {
    right = totalPages;
    left = Math.max(1, totalPages - maxButtons + 1);
  }

  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push("...");
  }

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < totalPages) {
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return pages;
};


  useEffect(() => {
    const controller = new AbortController()

    const fetchStudents = async () => {
      setIsLoadingStudents(true)
      setStudentError(null)
      try {
        const response = await axiosInstance.get("/Student/GetAllWithPagination", {
          params: {
            pageNumber,
            pageSize: pageSize === "all" ? (totalCount > 0 ? totalCount : 1000000) : pageSize,
            search: studentSearchDebounced || null
          },
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
  }, [pageNumber, pageSize, studentSearchDebounced])

  // Debounce student search
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setStudentSearch(query); // This triggers your existing API/Filter logic
      setActiveTab("students"); // Ensure the correct tab is active
    }
    const timer = setTimeout(() => {
      setStudentSearchDebounced(studentSearch)
      setPageNumber(1) // Reset to first page on search
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [studentSearch, searchParams])

  // Debounce teacher search
  useEffect(() => {
    const timer = setTimeout(() => {
      setTeacherSearchDebounced(teacherSearch)
      setTeacherPageNumber(1) // Reset to first page on search
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [teacherSearch])

  // Fetch teachers when teachers tab is active
  // Is useEffect ko replace karein
useEffect(() => {
  // Page load pe ya jab pagination/search change ho tab fetch karega
  // Agar aap sirf page refresh pe chahte hain aur tab click pe nahi, toh activeTab dependency ko dhyaan se manage karein
  
  const controller = new AbortController()

  const fetchTeachers = async () => {
    setIsLoadingTeachers(true)
    setTeacherError(null)
    try {
      const response = await axiosInstance.get("/Teacher/GetAllTeachers", {
        params: {
          pageNumber: teacherPageNumber,
          pageSize: pageSize === "all" ? (teacherTotalCount > 0 ? teacherTotalCount : 100) : pageSize,
          search: teacherSearchDebounced || ""
        },
        signal: controller.signal
      })

      if (response.data?.IsSuccess) {
        // API response handling
        const teachersData = response.data.Data?.data || []
        const total = response.data.Data?.pagination?.totalCount || 0
        
        if (Array.isArray(teachersData)) {
          setTeachers(teachersData)
          setTeacherTotalCount(total)
        }
      } else {
        setTeachers([])
        setTeacherError("No teacher data available.")
      }
    } catch (error: unknown) {
      if (controller.signal.aborted) return
      setTeacherError("Failed to load teachers.")
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingTeachers(false)
      }
    }
  }

  fetchTeachers()

  return () => controller.abort()
  // Yaha dependencies mein pageNumber aur search debounced hain
}, [teacherPageNumber, teacherSearchDebounced, pageSize])



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




const handleTeacherEdit = (id: number) => {
  // go to edit page – adjust route if your app uses a different pattern
  navigate(`/people/teachers/edit/${id}`)
}

const handleTeacherDelete = async (id: number) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this teacher?",
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
    const response = await axiosInstance.delete(`/teacher/Delete/${id}`);

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
  




const handleStaffEdit = (id: number) => {
  // go to edit page – adjust route if your app uses a different pattern
  navigate(`/people/staff/edit/${id}`)
}

const handleStaffDelete = async (id: number) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this staff member?",
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
    // API call → Staff/Delete/15
    const response = await axiosInstance.delete(`/staff/Delete/${id}`);

    if (response.data?.IsSuccess) {
      Swal.fire({
        title: "Deleted!",
        text: "Staff member has been deleted successfully.",
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
    // Staff / related / prospects are currently static
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
        <tr
          key={student.Id}
          className="border-b border-gray-300 last:border-b-0 hover:bg-[#f7f7f7]"
        >
          <td className="px-4 py-3 border-r border-gray-300">
            <input type="checkbox" aria-label={`Select ${studentName}`} />
          </td>
          <td className="px-4 py-3 text-indigo-700 border-r border-gray-300">
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
          <td className="px-4 py-3 text-gray-700 border-r border-gray-300">
            {student.MobilePhone || "—"}
          </td>
          <td className="px-4 py-3 text-blue-600 border-r border-gray-300">
            {student.Email ? (
              <a href={`mailto:${student.Email}`} className="hover:underline">
                {student.Email}
              </a>
            ) : (
              "—"
            )}
          </td>
          <td className="px-4 py-3 text-gray-700 border-r border-gray-300">
            {formatDate(student.RegistrationDate)}
          </td>
          <td className="px-4 py-3 text-gray-700 border-r border-gray-300">
            {student.IdNumber || "—"}
          </td>
          <td className="px-4 py-3 text-emerald-600 border-r border-gray-300">
            {formatCurrency(student.TuitionFees)}
          </td>
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
    <div className="px-6 py-6 relative">
      {/* Top title + Add dropdown (right) */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold text-gray-900">People</h1>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsAddMenuOpen((open) => !open)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50"
          >
            Add <span className="text-xs text-gray-500">▾</span>
          </button>

          {isAddMenuOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false)
                  navigate("/people/students/new")
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Add student
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false)
                  navigate("/people/teachers/new")
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Add teacher
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false)
                  navigate("/people/staffs/new")
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Add staff
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false)
                  navigate("/people/related/new")
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Add related contact
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false)
                  navigate("/people/prospects/new")
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Add prospect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs row – match old app style with blue count pill on active tab */}
      <div className="flex items-end gap-1 border-b border-gray-300 pb-0.5">
        {resolvedTabs.map(({ id, label, count, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 px-3 h-8 rounded-t-md border ${
                isActive
                  ? "border-gray-400 border-b-white bg-white text-gray-900"
                  : "border-gray-300 bg-[#f5f5f5] text-gray-700 hover:bg-gray-200"
              }`}
              style={{ marginBottom: -1 }}
            >
              <Icon size={16} className="text-gray-600" />
              <span className="text-sm">{label}</span>
              {typeof count === "number" && (
                <span
                  className={`min-w-[28px] px-2 py-0.5 rounded-full text-xs text-center ${
                    isActive
                      ? "bg-[#0060df] text-white"
                      : "bg-white border border-gray-300 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === "students" && (
        <div className="mt-6">
          {/* Row under tabs: icon + 978/978 Students + Export (right) */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded bg-gray-100 grid place-items-center">
                <Users size={20} className="text-gray-500" />
              </div>
              <div className="text-xl font-semibold text-gray-800">
                {isLoadingStudents
                  ? "Loading students..."
                  : `${totalCount}/${totalCount} Students`}
              </div>
            </div>
            <button className="h-9 px-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
          </div>

          {/* Filters row + table combined in one retro header bar */}
          <div className="mt-4 border border-gray-400 rounded-sm overflow-hidden bg-white">
            {/* Toolbar row above table */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#f1f1f1] border-b border-gray-400">
              <div className="flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Search in columns in view"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {studentFilters.map((filter) => (
                  <button
                    key={filter.label}
                    className="h-9 px-3 inline-flex items-center gap-2 rounded border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50"
                  >
                    {filter.label}: {filter.value}
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                ))}
                <button className="h-9 w-9 grid place-items-center rounded border border-gray-300 bg-white text-gray-600">
                  ⟳
                </button>
                <button className="h-9 w-9 grid place-items-center rounded border border-gray-300 bg-white text-gray-600">
                  ⋯
                </button>
              </div>
            </div>

            {/* Table – retro grid look with strong lines */}
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#f1f1f1] text-gray-700">
                <tr>
                  {["", "Name", "Phone", "Email", "Registration date", "ID Number", "Payments", "Actions"].map((heading, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 font-medium text-left border-b border-gray-400 border-r last:border-r-0"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderStudentTableBody()}</tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-4 bg-white border border-t-0 border-gray-200 rouded-b-xl">
  <div className="text-sm text-gray-600">
Showing {totalCount === 0 ? 0 : 1} - {pageSize === "all" ? totalCount : Math.min(pageNumber * (pageSize as number), totalCount)} of {totalCount}  </div>


  <select
  value={pageSize}
  onChange={(e) => {
    const v = e.target.value;
    setPageSize(v === "all" ? "all" : Number(v));
    setPageNumber(1);
  }}
  className="border px-2 py-1 rounded"
>
  {[5, 10, 25, 50, 100].map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ))}
  <option value="all">All</option>
</select>


  <div className="flex items-center gap-2">
    <button
      disabled={pageNumber === 1}
      onClick={() => setPageNumber(p => Math.max(1, p - 1))}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Previous
    </button>

    

    <div className="flex items-center gap-1">
      {makePageButtons(studentTotalPages, pageNumber).map((p, idx) =>
        p === "..." ? (
          <span key={`s-ellipsis-${idx}`} className="px-2 text-sm text-gray-500">…</span>
        ) : (
          <button
            key={`s-${p}`}
            onClick={() => setPageNumber(Number(p))}
            className={`px-3 h-8 inline-flex items-center justify-center rounded text-sm border ${p === pageNumber ? "bg-blue-600 text-white border-blue-600" : "text-gray-700 border-gray-200 hover:bg-gray-50"}`}
          >
            {p}
          </button>
        )
      )}
    </div>

    <button
      disabled={pageNumber >= studentTotalPages}
      onClick={() => setPageNumber(p => Math.min(studentTotalPages, p + 1))}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
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
            <button className="h-9 px-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
          </div>

          {/* Teachers: retro container + toolbar row + grid table */}
          <div className="mt-4 border border-gray-400 rounded-sm overflow-hidden bg-white">
            {/* Toolbar row */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#f1f1f1] border-b border-gray-400">
              <div className="flex-1 max-w-sm">
                <input
                  placeholder="Search teachers"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button className="h-9 w-9 grid place-items-center rounded border border-gray-300 bg-white text-gray-600">
                  ⟳
                </button>
                <button className="h-9 w-9 grid place-items-center rounded border border-gray-300 bg-white text-gray-600">
                  ⋯
                </button>
              </div>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#f1f1f1] text-gray-700">
                <tr>
                  {["", "Name", "Phone", "Email", "Actions"].map((heading, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 font-medium text-left border-b border-gray-400 border-r last:border-r-0"
                    >
                      {heading}
                    </th>
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
                      <tr
                        key={teacher.Id}
                        className="border-b border-gray-300 last:border-b-0 hover:bg-[#f7f7f7]"
                      >
                        <td className="px-4 py-3 border-r border-gray-300">
                          <input type="checkbox" aria-label={`Select ${teacherName}`} />
                        </td>
                        <td className="px-4 py-3 text-indigo-700 border-r border-gray-300">
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
                        <td className="px-4 py-3 text-gray-700 border-r border-gray-300">
                          {teacher.Mobile || "—"}
                        </td>
                        <td className="px-4 py-3 text-blue-600 border-r border-gray-300">
                          {teacher.Email ? (
                            <a href={`mailto:${teacher.Email}`} className="hover:underline">
                              {teacher.Email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 relative">
  {/* More button */}
  <button
    type="button"
    onClick={() =>
      setOpenDropdown(openDropdown === teacher.Id ? null : teacher.Id)
    }
    className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"
    aria-label="More actions"
  >
    <MoreHorizontal size={18} />
  </button>

  {/* Dropdown */}
  {openDropdown === teacher.Id && (
    <div className="absolute right-0 mt-2 w-36 rounded-xl border bg-white shadow-md z-50">
      <button
        type="button"
        onClick={() => handleTeacherEdit(teacher.Id)}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => handleTeacherDelete(teacher.Id)}
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
                )}
              </tbody>
            </table>
            {teacherTotalCount > 0 && (
  <div className="flex items-center justify-between px-4 py-4 bg-white border border-t-0 border-gray-200 rouded-b-xl">
    <div className="text-sm text-gray-600">
      Showing {teacherTotalCount === 0 ? 0 : 1} - {pageSize === "all" ? teacherTotalCount : Math.min(teacherPageNumber * (pageSize as number), teacherTotalCount)} of {teacherTotalCount}
    </div>


    <select
  value={pageSize}
  onChange={(e) => {
    const v = e.target.value;
    setPageSize(v === "all" ? "all" : Number(v));
    setTeacherPageNumber(1);
    setPageNumber(1);
  }}
  className="border px-2 py-1 rounded"
>
  {[5, 10, 25, 50, 100].map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ))}
  <option value="all">All</option>
</select>


    <div className="flex items-center gap-2">
      <button
        disabled={teacherPageNumber === 1}
        onClick={() => setTeacherPageNumber(p => Math.max(1, p - 1))}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Previous
      </button>

      

      <div className="flex items-center gap-1">
        {makePageButtons(teacherTotalPages, teacherPageNumber).map((p, idx) =>
          p === "..." ? (
            <span key={`t-ellipsis-${idx}`} className="px-2 text-sm text-gray-500">…</span>
          ) : (
            <button
              key={`t-${p}`}
              onClick={() => setTeacherPageNumber(Number(p))}
              className={`px-3 h-8 inline-flex items-center justify-center rounded text-sm border ${p === teacherPageNumber ? "bg-blue-600 text-white border-blue-600" : "text-gray-700 border-gray-200 hover:bg-gray-50"}`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        disabled={teacherPageNumber >= teacherTotalPages}
        onClick={() => setTeacherPageNumber(p => Math.min(teacherTotalPages, p + 1))}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
)}

          </div>
        </div>
      )}

      {activeTab === "staff" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-800">2 Staff</div>
            <button className="h-9 px-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
          </div>

          {/* Staff table – retro grid style */}
          <div className="mt-4 border border-gray-400 rounded-sm overflow-hidden bg-white">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#f1f1f1] text-gray-700">
                <tr>
                  {["", "Name", "Email", "Actions"].map((heading, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 font-medium text-left border-b border-gray-400 border-r last:border-r-0"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffRows.map((staff, idx) => (
                  <tr
                    key={staff.email}
                    className="border-b border-gray-300 last:border-b-0 hover:bg-[#f7f7f7]"
                  >
                    <td className="px-4 py-3 border-r border-gray-300">
                      <input type="checkbox" />
                    </td>
                    <td className="px-4 py-3 text-indigo-700 flex items-center gap-3 border-r border-gray-300">
                      <div className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold ${avatarPalette[idx % avatarPalette.length]}`}>
                        {staff.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{staff.name}</div>
                        <div className="text-xs text-gray-500">Staff</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-blue-600 border-r border-gray-300">{staff.email}</td>

                    <td className="px-4 py-3 relative">
  {/* More button */}
  <button
    type="button"
    onClick={() =>
      setOpenDropdown(openDropdown === staff.Id ? null : staff.Id)
    }
    className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"
    aria-label="More actions"
  >
    <MoreHorizontal size={18} />
  </button>

  {/* Dropdown */}
  {openDropdown === staff.Id && (
    <div className="absolute right-0 mt-2 w-36 rounded-xl border bg-white shadow-md z-50">
      <button
        type="button"
        onClick={() => handleStaffEdit(staff.Id)}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => handleStaffDelete(staff.Id)}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
      >
        Delete
      </button>
    </div>
  )}
</td>

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
            <button className="h-9 px-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
          </div>

          <div className="mt-4 border border-gray-400 rounded-sm overflow-hidden bg-white">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#f1f1f1] text-gray-700">
                <tr>
                  {["", "Name", "Email"].map((heading, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 font-medium text-left border-b border-gray-400 border-r last:border-r-0"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {relatedRows.map((person, idx) => (
                  <tr
                    key={person.email}
                    className="border-b border-gray-300 last:border-b-0 hover:bg-[#f7f7f7]"
                  >
                    <td className="px-4 py-3 border-r border-gray-300">
                      <input type="checkbox" />
                    </td>
                    <td className="px-4 py-3 text-indigo-700 flex items-center gap-3 border-r border-gray-300">
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
            <button className="h-9 px-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
          </div>

          <div className="mt-4 border border-gray-400 rounded-sm overflow-hidden bg-white">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#f1f1f1] text-gray-700">
                <tr>
                  {["", "Name", "Phone", "Email", "First contact", "Last action", "Subject", "Level", "Status"].map((heading, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 font-medium text-left border-b border-gray-400 border-r last:border-r-0"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prospectRows.map((prospect, idx) => (
                  <tr
                    key={prospect.email}
                    className="border-b border-gray-300 last:border-b-0 hover:bg-[#f7f7f7]"
                  >
                    <td className="px-4 py-3 border-r border-gray-300">
                      <input type="checkbox" />
                    </td>
                    <td className="px-4 py-3 text-indigo-700 border-r border-gray-300">
                      {prospect.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700 border-r border-gray-300">
                      {prospect.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-blue-600 border-r border-gray-300">
                      {prospect.email}
                    </td>
                    <td className="px-4 py-3 text-gray-700 border-r border-gray-300">
                      {prospect.firstContact}
                    </td>
                    <td className="px-4 py-3 text-gray-700 border-r border-gray-300">
                      {prospect.lastAction}
                    </td>
                    <td className="px-4 py-3 text-gray-700 border-r border-gray-300">
                      {prospect.subject}
                    </td>
                    <td className="px-4 py-3 text-gray-700 border-r border-gray-300">
                      {prospect.level}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {prospect.status}
                    </td>
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