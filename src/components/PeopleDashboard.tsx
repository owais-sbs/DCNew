import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Swal from "sweetalert2"
import * as XLSX from "xlsx"

import {
  Users,
  GraduationCap,
  UserRoundCog,
  UserPlus,
  ChevronDown,
  Download,
  MoreHorizontal,
  Check,
  Minus,
  Loader2
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

  // Export modal and filters
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFilterMode, setExportFilterMode] = useState<"monthly" | "nationality" | "report" | null>(null)
  const [exportFilterStep, setExportFilterStep] = useState<"choice" | "params">("choice")
  const [exportMonth, setExportMonth] = useState<number | "">("")
  const [exportYear, setExportYear] = useState<number | "">("")
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([])
  const [nationalitiesList, setNationalitiesList] = useState<string[]>([])
  const [loadingNationalities, setLoadingNationalities] = useState(false)
  const [nationalityDropdownOpen, setNationalityDropdownOpen] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set())
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStatus, setExportStatus] = useState("")
  const [exportReportSearch, setExportReportSearch] = useState("")
  const [exportCourseStartFrom, setExportCourseStartFrom] = useState("")
  const [exportCourseStartTo, setExportCourseStartTo] = useState("")
  const [exportClassId, setExportClassId] = useState<number | "">("")
  const [exportOnlyUnenrolled, setExportOnlyUnenrolled] = useState(false)
  const [exportOnlyEnrolled, setExportOnlyEnrolled] = useState(false)
  const [exportSchedules, setExportSchedules] = useState<string[]>([])
  const [schedulesList, setSchedulesList] = useState<string[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [schedulesDropdownOpen, setSchedulesDropdownOpen] = useState(false)
  const [exportAttendanceFrom, setExportAttendanceFrom] = useState<number | "">("")
  const [exportAttendanceTo, setExportAttendanceTo] = useState<number | "">("")
  const [exportPage, setExportPage] = useState(1)
  const [exportPageSize, setExportPageSize] = useState(5000)
  const [exportClassesList, setExportClassesList] = useState<{ ClassId: number; ClassTitle: string }[]>([])
  const [exportClassSearch, setExportClassSearch] = useState("")
  const [exportClassSearchDebounced, setExportClassSearchDebounced] = useState("")
  const [exportClassDropdownOpen, setExportClassDropdownOpen] = useState(false)
  const [loadingExportClasses, setLoadingExportClasses] = useState(false)
  const [exportClassName, setExportClassName] = useState("")
  const [exportEmailList, setExportEmailList] = useState("")
  const exportClassDropdownRef = useRef<HTMLDivElement>(null)

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
        const url = "/Student/GetAllWithPagination"
        const baseParams: Record<string, unknown> = {
          pageNumber,
          pageSize: pageSize === "all" ? (totalCount > 0 ? totalCount : 1000000) : pageSize,
          search: studentSearchDebounced || null
        }

        const response = await axiosInstance.get(url, {
          params: baseParams,
          signal: controller.signal
        })

        const data = response.data?.Data
        const studentList = Array.isArray(data?.Data)
          ? data.Data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.Items)
              ? data.Items
              : Array.isArray(data)
                ? data
                : []
        const count = data?.TotalCount ?? data?.totalCount ?? data?.total ?? data?.Count ?? studentList.length

        if (response.data?.IsSuccess) {
  setStudents(studentList)
  setTotalCount(count)
  setStudentError(null)
} else if (!response.data?.IsSuccess) {
  setStudents([])
  setStudentError(response.data?.Message || "No student data available.")
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
  }, [pageNumber, pageSize, studentSearchDebounced, totalCount])

  // Fetch nationalities when export modal opens (for filters dropdown)
  useEffect(() => {
    if (!showExportModal) return
    const controller = new AbortController()
    const fetchNationalities = async () => {
      setLoadingNationalities(true)
      try {
        const res = await axiosInstance.get("/Student/GetAllDistinctNationalities", { signal: controller.signal })
        const data = res.data?.Data ?? res.data?.data
        const raw = Array.isArray(data) ? data : (data?.Items ?? data?.Data ?? [])
        const list = Array.isArray(raw) ? raw : []
        const mapped = list.map((n: unknown) => typeof n === "string" ? n : (n && typeof n === "object" ? String((n as Record<string, unknown>).Name ?? (n as Record<string, unknown>).Value ?? (n as Record<string, unknown>).Nationality ?? "") : ""))
        setNationalitiesList([...new Set(mapped.filter(Boolean))].sort())
      } catch (e) {
        console.error("Failed to fetch nationalities", e)
        setNationalitiesList([])
      } finally {
        setLoadingNationalities(false)
      }
    }
    const fetchSchedules = async () => {
      setLoadingSchedules(true)
      try {
        const res = await axiosInstance.get("/Student/GetStudentSchedules", { signal: controller.signal })
        const data = res.data?.Data ?? res.data?.data
        const list = Array.isArray(data) ? data : []
        setSchedulesList(list.map((s: unknown) => String(s ?? "")))
      } catch (e) {
        console.error("Failed to fetch schedules", e)
        setSchedulesList([])
      } finally {
        setLoadingSchedules(false)
      }
    }
    fetchNationalities()
    fetchSchedules()
    return () => controller.abort()
  }, [showExportModal])

  // Debounce class search for export modal
  useEffect(() => {
    if (!showExportModal) return
    const t = setTimeout(() => setExportClassSearchDebounced(exportClassSearch.trim()), 400)
    return () => clearTimeout(t)
  }, [exportClassSearch, showExportModal])

  // Fetch classes for export modal when search changes
  useEffect(() => {
    if (!showExportModal) return
    const controller = new AbortController()
    const fetchClasses = async () => {
      setLoadingExportClasses(true)
      try {
        const res = await axiosInstance.get("/Class/GetAllClassesWithPagination", {
          params: {
            pageNumber: 1,
            pageSize: 50,
            search: exportClassSearchDebounced || undefined
          },
          signal: controller.signal
        })
        const data = res.data?.Data?.Data ?? res.data?.Data ?? []
        setExportClassesList(Array.isArray(data) ? data.map((c: any) => ({ ClassId: c.ClassId ?? c.Id, ClassTitle: c.ClassTitle ?? c.Title ?? "" })) : [])
      } catch (e) {
        if (!controller.signal.aborted) console.error("Failed to fetch classes for export", e)
        setExportClassesList([])
      } finally {
        if (!controller.signal.aborted) setLoadingExportClasses(false)
      }
    }
    fetchClasses()
    return () => controller.abort()
  }, [showExportModal, exportClassSearchDebounced])

  useEffect(() => {
    if (!showExportModal || !exportClassDropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (exportClassDropdownRef.current && !exportClassDropdownRef.current.contains(e.target as Node)) {
        setExportClassDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showExportModal, exportClassDropdownOpen])

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

  const toggleStudentSelection = (id: number) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllStudents = () => {
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set())
    } else {
      setSelectedStudentIds(new Set(students.map((s) => s.Id)))
    }
  }

  const handleExportToExcel = useCallback(async () => {
    const ids = Array.from(selectedStudentIds)
    if (ids.length === 0) {
      Swal.fire({ title: "No selection", text: "Please select at least one student to export.", icon: "warning" })
      return
    }
    setIsExporting(true)
    try {
      const rows: Record<string, string | number>[] = []
      let filterTitle = ""

if (exportFilterMode === "monthly" && exportMonth && exportYear) {
  const monthName = new Date(exportYear, exportMonth - 1)
    .toLocaleString("default", { month: "long" })
  filterTitle = `Monthly - ${monthName} ${exportYear}`
}

if (exportFilterMode === "nationality" && selectedNationalities.length > 0) {
  filterTitle = `Nationality - ${selectedNationalities.join(", ")}`
}

      for (const studentId of ids) {
        const [detailRes, attendanceRes, classRes] = await Promise.all([
          axiosInstance.get(`/Student/GetById/${studentId}`),
          axiosInstance.get("/Dashboard/GetStudentAttendanceStats", { params: { studentId } }),
          axiosInstance.get("/Class/GetClassesByStudent", { params: { studentId } })
        ])
        const classes = classRes.data?.IsSuccess && Array.isArray(classRes.data.Data)
  ? classRes.data.Data
  : []

const enrolledClassName = classes.length > 0
  ? classes.map((c: any) => c.ClassTitle).join(", ")
  : ""

        const d = detailRes.data?.Data || {}
        const attendanceData = attendanceRes.data?.IsSuccess && Array.isArray(attendanceRes.data.Data) ? attendanceRes.data.Data : []
       const presentStat = attendanceData.find(
  (s: { Status?: string }) => (s.Status || "").toLowerCase() === "present"
)

const absentStat = attendanceData.find(
  (s: { Status?: string }) => (s.Status || "").toLowerCase() === "absent"
)

const presentPercentage = presentStat?.Percentage ?? 0
const absentPercentage = absentStat?.Percentage ?? 0


        rows.push({
          Firstname: d.FirstName ?? "",
          Surname: d.Surname ?? d.LastName ?? "",
          RegistrationDate: d.RegistrationDate ?? "",
          IdNumber: d.IdNumber ?? "",
          MobilePhone: d.MobilePhone ?? "",
          Email: d.Email ?? "",
          StreetAddress: d.StreetAddress ?? "",
          Nationality: d.Nationality ?? "",
          CourseStartDate: d.CourseStartDate ?? "",
            enrolledclassname: enrolledClassName,
          CourseTitle: d.CourseTitle ?? "",
          "Present %": `${presentPercentage}%`,
  "Absent %": `${absentPercentage}%`
        })
      }
      // ---------- REPORT HEADING ----------
const reportTitle = "Student  Report"

const filterLine = filterTitle
  ? `Filtered by: ${filterTitle}`
  : "Filtered by: All students"

const generatedOn = `Generated on: ${new Date().toLocaleDateString()}`

// Create sheet with heading rows
const ws = XLSX.utils.aoa_to_sheet([
  [reportTitle],
  [filterLine],
  [generatedOn],
  [], // empty row before table
])

// Add table data starting from row 5
XLSX.utils.sheet_add_json(ws, rows, {
  origin: "A5",
})

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Students")
      XLSX.writeFile(wb, `students_export_${new Date().toISOString().slice(0, 10)}.xlsx`)
      Swal.fire({ title: "Exported", text: `${ids.length} student(s) exported successfully.`, icon: "success" })
      setSelectedStudentIds(new Set())
    } catch (err) {
      console.error("Export failed", err)
      Swal.fire({ title: "Export failed", text: "Could not export students. Please try again.", icon: "error" })
    } finally {
      setIsExporting(false)
    }
  }, [selectedStudentIds, exportFilterMode, exportMonth, exportYear, selectedNationalities])

  type ReportStudent = Array<{
    StudentId?: number
    FirstName?: string | null
    Surname?: string | null
    RegistrationDate?: string | null
    IdNumber?: string | null
    MobilePhone?: string | null
    Email?: string | null
    StreetAddress?: string | null
    Nationality?: string | null
    CourseStartDate?: string | null
    EnrolledClassName?: string | null
    CourseTitle?: string | null
    PresentPercentage?: number | null
    AbsentPercentage?: number | null
  }>

  const buildExcelWorkbook = useCallback((students: ReportStudent, filterTitle: string) => {
    const rows: Record<string, string | number>[] = students.map((s) => ({
      Firstname: s.FirstName ?? "",
      Surname: s.Surname ?? "",
      RegistrationDate: s.RegistrationDate ?? "",
      IdNumber: s.IdNumber ?? "",
      MobilePhone: s.MobilePhone ?? "",
      Email: s.Email ?? "",
      StreetAddress: s.StreetAddress ?? "",
      Nationality: s.Nationality ?? "",
      CourseStartDate: s.CourseStartDate ?? "",
      enrolledclassname: s.EnrolledClassName ?? "",
      CourseTitle: s.CourseTitle ?? "",
      "Present %": `${s.PresentPercentage ?? 0}%`,
      "Absent %": `${s.AbsentPercentage ?? 0}%`
    }))
    const reportTitle = "Student Report"
    const filterLine = filterTitle ? `Filtered by: ${filterTitle}` : "Filtered by: All students"
    const generatedOn = `Generated on: ${new Date().toLocaleDateString()}`
    const ws = XLSX.utils.aoa_to_sheet([[reportTitle], [filterLine], [generatedOn], []])
    XLSX.utils.sheet_add_json(ws, rows, { origin: "A5" })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Students")
    return wb
  }, [])

  const buildExcelAndDownload = useCallback((students: ReportStudent, filterTitle: string) => {
    const wb = buildExcelWorkbook(students, filterTitle)
    XLSX.writeFile(wb, `students_export_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }, [buildExcelWorkbook])

  const buildExcelAsBlob = useCallback((students: ReportStudent, filterTitle: string): Blob => {
    const wb = buildExcelWorkbook(students, filterTitle)
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  }, [buildExcelWorkbook])

  const handleDirectExportToExcel = useCallback(async () => {
    const validNationalities = selectedNationalities.filter((n) => n && String(n).trim())

    setIsExporting(true)
    setExportProgress(0)
    setExportStatus("Preparing…")

    try {
      setExportStatus("Fetching students…")
      setExportProgress(15)
      const payload: Record<string, unknown> = { Mode: "report" }
      if (exportReportSearch.trim()) payload.Search = exportReportSearch.trim()
      if (exportCourseStartFrom) payload.CourseStartFrom = new Date(exportCourseStartFrom).toISOString()
      if (exportCourseStartTo) payload.CourseStartTo = new Date(exportCourseStartTo).toISOString()
      if (validNationalities.length > 0) payload.Nationalities = validNationalities
      if (exportClassId !== "" && exportClassId !== 0) payload.ClassId = exportClassId
      if (exportOnlyUnenrolled) payload.OnlyUnenrolled = true
      if (exportOnlyEnrolled) payload.OnlyEnrolled = true
      const validSchedules = exportSchedules.filter((s) => s && String(s).trim())
      if (validSchedules.length > 0) payload.Schedules = validSchedules
      if (exportAttendanceFrom !== "") payload.AttendanceFrom = Number(exportAttendanceFrom)
      if (exportAttendanceTo !== "") payload.AttendanceTo = Number(exportAttendanceTo)
      payload.Page = exportPage
      payload.PageSize = exportPageSize
      const res = await axiosInstance.post("/Student/FilterStudents", payload)
      setExportProgress(45)
      setExportStatus("Building spreadsheet…")
      if (!res.data?.IsSuccess) {
        Swal.fire({ title: "Error", text: res.data?.Message ?? "Filter failed", icon: "error" })
        setIsExporting(false)
        setExportProgress(0)
        setExportStatus("")
        return
      }
      const data = res.data?.Data
      const students: Array<{
        StudentId?: number
        FirstName?: string | null
        Surname?: string | null
        RegistrationDate?: string | null
        IdNumber?: string | null
        MobilePhone?: string | null
        Email?: string | null
        StreetAddress?: string | null
        Nationality?: string | null
        CourseStartDate?: string | null
        EnrolledClassName?: string | null
        CourseTitle?: string | null
        PresentPercentage?: number | null
        AbsentPercentage?: number | null
      }> = Array.isArray(data) ? data : []
      if (students.length === 0) {
        Swal.fire({ title: "No data", text: "No students found for the selected filters.", icon: "info" })
        setIsExporting(false)
        setExportProgress(0)
        setExportStatus("")
        return
      }
      const parts: string[] = []
      if (exportReportSearch.trim()) parts.push(`Search: ${exportReportSearch.trim()}`)
      if (exportCourseStartFrom) parts.push(`Course from: ${exportCourseStartFrom}`)
      if (exportCourseStartTo) parts.push(`Course to: ${exportCourseStartTo}`)
      if (validNationalities.length) parts.push(`Nationality: ${validNationalities.join(", ")}`)
      if (exportClassId !== "" && exportClassName) parts.push(`Class: ${exportClassName}`)
      if (exportOnlyUnenrolled) parts.push("Unenrolled only")
      if (exportOnlyEnrolled) parts.push("Enrolled only")
      if (validSchedules.length > 0) parts.push(`Schedule: ${validSchedules.join(", ")}`)
      const filterTitle = parts.length ? parts.join(" · ") : "All students"

      setExportProgress(75)
      setExportStatus("Generating file…")
      await new Promise((r) => setTimeout(r, 200))

      const emailRaw = exportEmailList.trim()
      const emailList = emailRaw
        ? emailRaw
            .split(/[\n,]+/)
            .map((e) => e.trim())
            .filter((e) => e.length > 0)
          : []
      const uniqueEmails = [...new Set(emailList)]

      let emailSent = false
      if (uniqueEmails.length > 0) {
        setExportStatus("Sending report by email…")
        const blob = buildExcelAsBlob(students, filterTitle)
        const fileName = `students_export_${new Date().toISOString().slice(0, 10)}.xlsx`
        const excelFile = new File([blob], fileName, { type: blob.type })
        const fd = new FormData()
        uniqueEmails.forEach((e) => fd.append("Emails", e))
        fd.append("EmailTemplateId", "0")
        fd.append("CustomMessage", "Please find the student report attached.")
        fd.append("FileDetails", excelFile)
        fd.append("FileType", "xlsx")
        fd.append("FolderName", "Reports")
        try {
          await axiosInstance.post("/Email/SendEmailToStudents", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          emailSent = true
        } catch (err) {
          console.error("Send report email failed", err)
          const msg =
            err && typeof err === "object" && err !== null && "response" in err
              ? (err as { response?: { data?: string } }).response?.data
              : "Failed to send report by email"
          Swal.fire({ title: "Email failed", text: typeof msg === "string" ? msg : "Failed to send report by email", icon: "warning" })
        }
      }

      buildExcelAndDownload(students, filterTitle)
      setExportProgress(100)
      setExportStatus("Download started.")
      await new Promise((r) => setTimeout(r, 400))
      Swal.fire({
        title: "Exported",
        text: emailSent
          ? `${students.length} student(s) exported. Report sent to ${uniqueEmails.length} email(s).`
          : `${students.length} student(s) exported successfully.`,
        icon: "success",
      })
      setShowExportModal(false)
      setSelectedNationalities([])
      setNationalityDropdownOpen(false)
      setExportClassDropdownOpen(false)
      setExportClassSearch("")
      setExportClassId("")
      setExportClassName("")
      setExportEmailList("")
      setExportReportSearch("")
      setExportCourseStartFrom("")
      setExportCourseStartTo("")
      setExportClassId("")
      setExportOnlyUnenrolled(false)
      setExportOnlyEnrolled(false)
      setExportSchedules([])
      setSchedulesDropdownOpen(false)
      setExportAttendanceFrom("")
      setExportAttendanceTo("")
      setExportProgress(0)
      setExportStatus("")
    } catch (err) {
      console.error("Export failed", err)
      Swal.fire({ title: "Export failed", text: "Could not export students. Please try again.", icon: "error" })
      setExportProgress(0)
      setExportStatus("")
    } finally {
      setIsExporting(false)
    }
  }, [selectedNationalities, exportReportSearch, exportCourseStartFrom, exportCourseStartTo, exportClassId, exportClassName, exportOnlyUnenrolled, exportOnlyEnrolled, exportSchedules, exportAttendanceFrom, exportAttendanceTo, exportPage, exportPageSize, exportEmailList, buildExcelAndDownload, buildExcelAsBlob])

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
            <input
              type="checkbox"
              checked={selectedStudentIds.has(student.Id)}
              onChange={() => toggleStudentSelection(student.Id)}
              aria-label={`Select ${studentName}`}
            />
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
            <button
              type="button"
              onClick={() => {
                setShowExportModal(true)
                setExportFilterMode("report")
                setExportFilterStep("params")
                setSelectedNationalities([])
                setExportClassSearch("")
                setExportClassId("")
                setExportClassName("")
                setExportClassDropdownOpen(false)
              }}
              className="h-9 px-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50"
            >
              <Download size={16} /> Export
            </button>
          </div>

          {/* Export modal – filters only, modern UI */}
          {showExportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto overflow-hidden border border-gray-100">
                {isExporting ? (
                  <div className="px-8 py-10">
                    <div className="flex flex-col items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exporting students</h3>
                        <p className="text-sm text-gray-500">{exportStatus}</p>
                      </div>
                      <div className="w-full max-w-[240px]">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>Progress</span>
                          <span className="font-medium text-indigo-600">{exportProgress}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${exportProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="px-6 pt-6 pb-2">
                      <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Export students</h3>
                      <p className="text-sm text-gray-500 mt-1">Apply filters and export to Excel</p>
                    </div>
                    <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
                        <input
                          type="text"
                          value={exportReportSearch}
                          onChange={(e) => setExportReportSearch(e.target.value)}
                          placeholder="Name, email, ID…"
                          className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Course start from</label>
                          <input
                            type="date"
                            value={exportCourseStartFrom}
                            onChange={(e) => setExportCourseStartFrom(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Course start to</label>
                          <input
                            type="date"
                            value={exportCourseStartTo}
                            onChange={(e) => setExportCourseStartTo(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nationality</label>
                        <button
                          type="button"
                          onClick={() => setNationalityDropdownOpen((o) => !o)}
                          className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <span className="truncate text-gray-700">{selectedNationalities.length === 0 ? "All nationalities" : `${selectedNationalities.length} selected`}</span>
                          <ChevronDown size={18} className="text-gray-400 flex-shrink-0 ml-2" />
                        </button>
                        {nationalityDropdownOpen && (
                          <div className="absolute z-50 mt-1.5 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1">
                            {loadingNationalities ? (
                              <div className="px-4 py-6 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin" /> Loading…
                              </div>
                            ) : nationalitiesList.length === 0 ? (
                              <div className="px-4 py-6 text-sm text-gray-500 text-center">No nationalities found</div>
                            ) : (
                              nationalitiesList.map((nat) => (
                                <label key={nat} className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50/80 cursor-pointer">
                                  <input type="checkbox" checked={selectedNationalities.includes(nat)} onChange={(e) => setSelectedNationalities((prev) => e.target.checked ? [...prev, nat] : prev.filter((n) => n !== nat))} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                  <span className="text-sm text-gray-800">{nat}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <div className="relative" ref={exportClassDropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                        <input
                          type="text"
                          value={exportClassId !== "" && exportClassName ? exportClassName : exportClassSearch}
                          onChange={(e) => {
                            setExportClassSearch(e.target.value)
                            setExportClassDropdownOpen(true)
                            if (exportClassId !== "") {
                              setExportClassId("")
                              setExportClassName("")
                            }
                          }}
                          onFocus={() => setExportClassDropdownOpen(true)}
                          placeholder="Search classes…"
                          className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        {exportClassId !== "" && exportClassName && (
                          <button
                            type="button"
                            onClick={() => { setExportClassId(""); setExportClassName(""); setExportClassSearch(""); setExportClassDropdownOpen(true) }}
                            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                            aria-label="Clear class"
                          >
                            ×
                          </button>
                        )}
                        {exportClassDropdownOpen && (
                          <div className="absolute z-50 mt-1.5 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1">
                            {loadingExportClasses ? (
                              <div className="px-4 py-6 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin" /> Loading…
                              </div>
                            ) : exportClassesList.length === 0 ? (
                              <div className="px-4 py-6 text-sm text-gray-500 text-center">{exportClassSearchDebounced ? "No classes found" : "Type to search classes"}</div>
                            ) : (
                              exportClassesList.map((c) => (
                                <button
                                  key={c.ClassId}
                                  type="button"
                                  onClick={() => {
                                    setExportClassId(c.ClassId)
                                    setExportClassName(c.ClassTitle)
                                    setExportClassSearch("")
                                    setExportClassDropdownOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-indigo-50/80"
                                >
                                  {c.ClassTitle}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer py-1">
                        <input type="checkbox" checked={exportOnlyUnenrolled} onChange={(e) => setExportOnlyUnenrolled(e.target.checked)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-gray-700">Only unenrolled students</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer py-1">
                        <input type="checkbox" checked={exportOnlyEnrolled} onChange={(e) => setExportOnlyEnrolled(e.target.checked)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-gray-700">Only enrolled students</span>
                      </label>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Schedule</label>
                        <button
                          type="button"
                          onClick={() => setSchedulesDropdownOpen((o) => !o)}
                          className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <span className="truncate text-gray-700">{exportSchedules.length === 0 ? "All schedules" : `${exportSchedules.length} selected`}</span>
                          <ChevronDown size={18} className="text-gray-400 flex-shrink-0 ml-2" />
                        </button>
                        {schedulesDropdownOpen && (
                          <div className="absolute z-50 mt-1.5 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1">
                            {loadingSchedules ? (
                              <div className="px-4 py-6 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin" /> Loading…
                              </div>
                            ) : schedulesList.length === 0 ? (
                              <div className="px-4 py-6 text-sm text-gray-500 text-center">No schedules found</div>
                            ) : (
                              schedulesList.map((sched) => (
                                <label key={sched} className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50/80 cursor-pointer">
                                  <input type="checkbox" checked={exportSchedules.includes(sched)} onChange={(e) => setExportSchedules((prev) => e.target.checked ? [...prev, sched] : prev.filter((x) => x !== sched))} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                  <span className="text-sm text-gray-800">{sched}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Attendance % from</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={exportAttendanceFrom === "" ? "" : exportAttendanceFrom}
                            onChange={(e) => setExportAttendanceFrom(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="0"
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Attendance % to</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={exportAttendanceTo === "" ? "" : exportAttendanceTo}
                            onChange={(e) => setExportAttendanceTo(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="100"
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Page</label>
                          <input type="number" min={1} value={exportPage} onChange={(e) => setExportPage(Math.max(1, Number(e.target.value) || 1))} className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Page size</label>
                          <input type="number" min={1} max={10000} value={exportPageSize} onChange={(e) => setExportPageSize(Math.min(10000, Math.max(1, Number(e.target.value) || 1)))} className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Send report by email (optional)</label>
                        <textarea
                          value={exportEmailList}
                          onChange={(e) => setExportEmailList(e.target.value)}
                          placeholder="Enter one or more emails, separated by comma or new line. The Excel report will be sent as an attachment."
                          rows={3}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
                        />
                      </div>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50">
                      <button type="button" onClick={() => { setShowExportModal(false); setNationalityDropdownOpen(false); setExportClassDropdownOpen(false); setSchedulesDropdownOpen(false); setExportClassSearch(""); setExportClassId(""); setExportClassName(""); setExportEmailList("") }} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDirectExportToExcel}
                        disabled={isExporting}
                        className="h-10 px-5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        Export to Excel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

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
                  <th className="px-4 py-2.5 font-medium text-left border-b border-gray-400 border-r w-10">
                    <input
                      type="checkbox"
                      checked={students.length > 0 && selectedStudentIds.size === students.length}
                      onChange={toggleSelectAllStudents}
                      aria-label="Select all students"
                    />
                  </th>
                  {["Name", "Phone", "Email", "Registration date", "ID Number", "Payments", "Actions"].map((heading, idx) => (
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