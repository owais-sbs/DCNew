import { useParams, useNavigate } from "react-router-dom"
import { ChevronDown, Plus, Download, MoreHorizontal, CheckCircle, Clock, FileText, User, Calendar, DollarSign, Receipt, Users, StickyNote, Paperclip, BookOpen, Award, FilePlus, Sun, Archive, Trash2, CreditCard, Mail, Megaphone, BarChart3, Calendar as CalendarIcon, FileCheck } from "lucide-react"
import { useState, useEffect } from "react"
import axiosInstance from "./axiosInstance"
import Swal from "sweetalert2"

export default function TeacherProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("profile")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [classesError, setClassesError] = useState<string | null>(null)
  
  console.log('TeacherProfile rendered with id:', id)

  // Fetch teacher data
  // Fetch teacher data
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!id) return
      try {
        setLoading(true)
        const response = await axiosInstance.get(`/Teacher/GetTeacherById?id=${id}`)  
        if (response.data?.IsSuccess) {
          // Ham response.data.Data ko state me set kar rahe hain
          setTeacher(response.data.Data)
        }
      } catch (error: any) {
        console.error("Error fetching teacher:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeacher()
  }, [id])


  // Helper to format Date
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
  };

  // Fetch classes when classes tab is active
  useEffect(() => {
    if (activeTab.toLowerCase() !== "classes" || !id) return

    const controller = new AbortController()

    const fetchClasses = async () => {
      setLoadingClasses(true)
      setClassesError(null)
      try {
        const response = await axiosInstance.get("/Class/GetClassesByTeacher", {
          params: { teacherId: parseInt(id) },
          signal: controller.signal
        })

        console.log("Teacher classes response:", response.data)
        if (response.data?.IsSuccess) {
          const classesData = response.data.Data || []
          if (Array.isArray(classesData)) {
            setClasses(classesData)
          } else {
            setClasses([])
            setClassesError("Invalid classes data format.")
          }
        } else {
          setClasses([])
          setClassesError(response.data?.Message || "No classes data available.")
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        console.error("Failed to load teacher classes", error)
        setClassesError("Failed to load classes. Please try again.")
      } finally {
        if (!controller.signal.aborted) {
          setLoadingClasses(false)
        }
      }
    }

    fetchClasses()

    return () => controller.abort()
  }, [activeTab, id])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const handleSendInviteEmail = async () => {
    if (!id) {
      Swal.fire("Error", "Teacher ID is missing", "error")
      return
    }

    try {
      const response = await axiosInstance.post("/Account/InviteUser", {
        UserId: parseInt(id),
        UserType: "teacher",
      })

      if (response.data?.IsSuccess) {
        Swal.fire({
          icon: "success",
          title: "Invitation Sent",
          text: "The teacher has been invited to the portal successfully.",
          confirmButtonColor: "#2563eb",
        })
        // Refresh teacher data to get updated activation code
        const refreshResponse = await axiosInstance.get(`/Teacher/GetById/${id}`)
        if (refreshResponse.data?.IsSuccess) {
          setTeacher(refreshResponse.data.Data)
        }
      } else {
        Swal.fire("Error", response.data?.Message || "Failed to invite teacher", "error")
      }
    } catch (error: any) {
      console.error("Error inviting teacher:", error)
      Swal.fire(
        "Error",
        error.response?.data?.Message || "Failed to invite teacher. Please try again.",
        "error"
      )
    }
  }

  // Default teacher data if not loaded yet
  const teacherData = teacher || {
    id,
    name: "Loading...",
    gender: "",
    age: 0,
    email: "",
    idNumber: "",
    department: "",
    position: "Teacher"
  }

  const tabs = [
    "Profile", "Classes", "Events", "Teacher fees", "Payslips", "Notes", 
    "Attachments", "Permissions", "Availability"
  ]

  // Profile Content Tab
  const renderProfileContent = () => (
    <div className="bg-white border border-gray-300">
      {/* ROW 1: Mobile, Home, Email */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-200">
        <div className="p-4">
          <div className="text-sm text-gray-600">Mobile Phone</div>
          <div className="text-sm text-blue-600 mt-1">
            {teacher?.Mobile || "—"}
          </div>
        </div>

        <div className="p-4 border-l border-gray-200">
          <div className="text-sm text-gray-600">Home Phone</div>
          <div className="text-sm text-gray-900 mt-1">
            {teacher?.HomeNumber || "—"}
          </div>
        </div>

        <div className="p-4 border-l border-gray-200">
          <div className="text-sm text-gray-600">Email</div>
          <div className="text-sm text-blue-600 mt-1">
            {teacher?.Email || "—"}
          </div>
        </div>
      </div>

      {/* ROW 2: Online Lesson Link */}
      <div className="border-b border-gray-200 p-4">
        <div className="text-sm text-gray-600">Online Lesson Link</div>
        <div className="text-sm text-blue-600 mt-1">
          {teacher?.OnlineSessionLink || "—"}
        </div>
      </div>

      {/* ROW 3: DOB & ID Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-200">
        <div className="p-4">
          <div className="text-sm text-gray-600">Date of Birth</div>
          <div className="text-sm text-gray-900 mt-1">
            {formatDate(teacher?.DateOfBirth)}
          </div>
        </div>

        <div className="p-4 border-l border-gray-200">
          <div className="text-sm text-gray-600">Id. Number</div>
          <div className="text-sm text-gray-900 mt-1">
            {teacher?.IdNumber || "—"}
          </div>
        </div>
      </div>

      {/* ROW 4: Address */}
      <div className="border-b border-gray-200 p-4">
        <div className="text-sm text-gray-600">Address</div>
        <div className="text-sm text-gray-900 mt-1">
          {teacher?.StreetAddress 
            ? `${teacher.StreetAddress}, ${teacher.City}, ${teacher.Country}` 
            : "—"}
        </div>
      </div>

      {/* ROW 5: General Notes */}
      <div className="border-b border-gray-200 p-4">
        <div className="text-sm text-gray-600">General Notes</div>
        <div className="text-sm text-gray-900 mt-1">
          {teacher?.Notes || "—"}
        </div>
      </div>

      {/* ROW 6: About */}
      <div className="border-b border-gray-200 p-4">
        <div className="text-sm text-gray-600">About</div>
        <div className="text-sm text-gray-900 mt-1">
          {teacher?.About || "—"}
        </div>
      </div>

      {/* SCHOOL PORTAL */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="font-medium text-gray-900">School Portal</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-200">
        <div className="p-4">
          <div className="text-sm text-gray-600 mb-2">Access to School Portal</div>
          <span className={`px-3 py-1 rounded-full text-white text-xs ${teacher?.IsActive ? 'bg-green-600' : 'bg-blue-600'}`}>
            {teacher?.IsActive ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="p-4 border-l border-gray-200">
          <div className="text-sm text-gray-600">Invitation</div>
          <div className="text-sm text-blue-600 mt-1 cursor-pointer">Invite to Portal</div>
          <div className="text-xs text-gray-500 mt-1">{teacher?.Name} has not signed up yet!</div>
        </div>

        <div className="p-4 border-l border-gray-200">
          <div className="text-sm text-gray-600">Last Login</div>
          <div className="text-sm text-gray-400 italic mt-1">never</div>
        </div>
      </div>

      <div className="p-3 text-xs text-gray-500">
        Created By: {teacher?.CreatedBy || "—"} | Updated On: {teacher?.UpdatedOn ? new Date(teacher.UpdatedOn).toLocaleString() : "—"}
      </div>
    </div>
  )

  const renderClassesContent = () => (
  <div className="bg-white border border-gray-300">

    {/* HEADER */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
      <h2 className="text-lg font-semibold text-gray-800">Classes Taught</h2>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">View:</span>
        <button className="px-3 py-1 rounded bg-blue-600 text-white">
          Classes
        </button>
        <button className="px-3 py-1 rounded border border-gray-300 text-blue-600">
          Individual Lessons
        </button>
      </div>
    </div>

    {/* TABLE */}
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-300">
            <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r">
              Class Name
            </th>
            <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r">
              Total Lessons
            </th>
            <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r">
              Total Lesson Hours
            </th>
            <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r">
              Total Teacher Fees
            </th>
            <th className="text-left px-4 py-2 font-semibold text-gray-700">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {loadingClasses ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500">
                Loading classes...
              </td>
            </tr>
          ) : classesError ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-red-600">
                {classesError}
              </td>
            </tr>
          ) : classes.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            classes.map((cls: any, idx: number) => (
              <tr
                key={cls.ClassId || idx}
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  navigate(`/notes/class-details/${cls.ClassId}`)
                }
              >
                {/* CLASS NAME */}
                <td className="px-4 py-3 border-r">
                  <div className="flex items-start gap-2">
                    <span className="h-3 w-3 mt-1 rounded-full bg-red-500" />
                    <div>
                      <div className="text-blue-600 hover:underline">
                        {cls.ClassTitle || "Unnamed Class"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {cls.ClassLevel || cls.ClassSubject || ""}
                      </div>
                    </div>
                  </div>
                </td>

                {/* TOTAL LESSONS */}
                <td className="px-4 py-3 border-r text-gray-700">
                  {cls.TotalLessons ?? "—"}
                </td>

                {/* TOTAL HOURS */}
                <td className="px-4 py-3 border-r text-gray-700">
                  {cls.TotalHours ?? "—"}
                </td>

                {/* FEES */}
                <td className="px-4 py-3 border-r text-gray-700">
                  €0.00
                </td>

                {/* STATUS */}
                <td className="px-4 py-3">
                  <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-600 text-white">
                    Active
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* FOOTER */}
    <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <select className="border border-gray-300 px-2 py-1 rounded">
          <option>25</option>
        </select>
        <span>records per page</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-2 py-1 border border-gray-300 rounded text-gray-400">
          ← Previous
        </button>
        <span className="px-3 py-1 border border-gray-300 rounded bg-gray-100">
          1
        </span>
        <button className="px-2 py-1 border border-gray-300 rounded text-gray-400">
          Next →
        </button>
      </div>
    </div>
  </div>
)


 const renderEventsContent = () => (
  <div className="bg-white border border-gray-300">

    {/* TABLE */}
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-300">
            <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r">
              Event Name
            </th>
            <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r">
              Location
            </th>
            <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r">
              Start Date
            </th>
            <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r">
              End Date
            </th>
            <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r">
              Start Time
            </th>
            <th className="text-left px-4 py-2 font-semibold text-gray-700">
              End Time
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td
              colSpan={6}
              className="px-4 py-6 text-left text-gray-600 border-b border-gray-200"
            >
              No data available
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* FOOTER */}
    <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 border-t border-gray-300">
      <div className="flex items-center gap-2">
        <select className="border border-gray-300 px-2 py-1 rounded">
          <option>25</option>
        </select>
        <span>records per page</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-3 py-1 border border-gray-300 rounded text-gray-400">
          ← Previous
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded text-gray-400">
          Next →
        </button>
      </div>
    </div>
  </div>
)


  const renderTeacherFeesContent = () => (
  <div className="bg-white">

    {/* HEADER */}
    <div className="flex items-center justify-between pb-3 border-b border-gray-300 p-5">
      <h2 className="text-lg font-semibold text-gray-900">Teacher Fees</h2>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">View:</span>
        <button className="px-3 py-1 rounded bg-blue-600 text-white">
          Grouped by Fee
        </button>
        <button className="px-3 py-1 rounded border border-gray-300 text-blue-600">
          Individual Items
        </button>
      </div>
    </div>

    {/* CLASS FEES */}
    <div className="p-5">
      <div className="font-semibold text-gray-800">Class Fees</div>
      <div className="text-sm text-gray-600">
        Teacher fees for classes that {teacherData?.name || "this teacher"} teaches in.
      </div>
      <div className="mt-1 text-sm">
        <span className="font-semibold">€0.00</span>{" "}
        <span className="text-gray-600">Total Fees</span>
      </div>
    </div>

    {/* TABLE */}
    <div className="border border-gray-300 mt-3">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-300">
            <th className="text-left px-4 py-2 font-semibold border-r">
              Class
            </th>
            <th className="text-left px-4 py-2 font-semibold border-r">
              Fee Type
            </th>
            <th className="text-left px-4 py-2 font-semibold border-r">
              Paid / Total
            </th>
            <th className="text-left px-4 py-2 font-semibold border-r">
              Status
            </th>
            <th className="text-left px-4 py-2 font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b border-gray-200">
            <td className="px-4 py-3">
              <div className="flex items-start gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500 mt-1"></span>
                <div>
                  <div className="text-blue-600 cursor-pointer">
                    Cork Classroom C1 AM ABAIGH/ANNE
                  </div>
                  <div className="text-xs text-gray-500">C1 am</div>
                </div>
              </div>
            </td>

            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">⏳</span>
                <div>
                  <div>Hourly</div>
                  <div className="text-xs text-gray-500">€0.00 per hour</div>
                </div>
              </div>
            </td>

            <td className="px-4 py-3">
              <div className="mb-1">€0.00 / €0.00</div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-gray-300 rounded w-0"></div>
              </div>
            </td>

            <td className="px-4 py-3">
              <span className="px-2 py-1 text-xs rounded bg-blue-600 text-white">
                FREE
              </span>
            </td>

            <td className="px-4 py-3 text-gray-400">
              ✏️ &nbsp; ☰
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* ADDITIONAL FEES */}
    <div className="mt-12 border-t border-dashed border-gray-300 pt-10 text-center">
      <div className="mx-auto mb-3 h-14 w-14 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">
        🏷️
      </div>

      <div className="font-semibold text-gray-700">
        Additional Fees <span className="text-xs text-orange-500 ml-1">BETA</span>
      </div>

      <div className="text-sm text-gray-500 mt-1">
        Additional fees will show here, e.g. overtime, travel expenses, etc.
      </div>

      <button className="mt-4 px-4 py-2 border border-gray-300 rounded bg-gray-100 text-sm">
        + Add a Fee
      </button>
    </div>
  </div>
)


  const renderPayslipsContent = () => (
  <div className="bg-white border border-gray-200 px-6 py-4 shadow-sm">
    
    {/* Header */}
    <div className="pb-2 border-b border-gray-300 mb-6 flex items-center gap-2">
      <h2 className="text-lg font-semibold text-gray-900">Payslips</h2>
      <span className="text-[10px] font-semibold text-orange-500">BETA</span>
    </div>

    {/* Empty state */}
    <div className="flex items-start gap-6 max-w-3xl mx-auto mt-10">
      
      {/* Icon */}
      <div className="h-14 w-14 rounded-lg bg-gray-200 flex items-center justify-center">
        <Receipt size={28} className="text-gray-400" />
      </div>

      {/* Text */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Add {teacherData?.name || "this teacher"}'s first teacher payment
        </h3>

        <p className="text-sm text-gray-600 mb-4 max-w-xl">
          {teacherData?.name || "This teacher"}'s payslips will appear here once a teacher payment is made.
        </p>

        <button className="h-9 px-4 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm inline-flex items-center gap-2 hover:bg-gray-200">
          <Plus size={14} /> New Teacher Payment
        </button>
      </div>
    </div>

  </div>
)


  const renderNotesContent = () => (
  <div className="bg-white border border-gray-200 px-6 py-4 shadow-sm">
    
    {/* Header */}
    <div className="pb-2 border-b border-gray-300 mb-6">
      <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
    </div>

    {/* Empty state */}
    <div className="flex items-start gap-6 max-w-3xl mx-auto mt-10">
      
      {/* Icon */}
      <div className="h-14 w-14 rounded-lg bg-gray-200 flex items-center justify-center">
        <StickyNote size={26} className="text-gray-400" />
      </div>

      {/* Text */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Add notes about {teacherData?.name || "this teacher"}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Notes concerning {teacherData?.name || "this teacher"} will appear here.
        </p>

        <button className="h-9 px-4 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm inline-flex items-center gap-2 hover:bg-gray-200">
          <Plus size={14} /> New Note
        </button>
      </div>
    </div>

  </div>
)


 const renderAttachmentsContent = () => (
  <div className="bg-white border border-gray-200 px-6 py-4 shadow-sm">

    {/* Header */}
    <div className="pb-2 border-b border-gray-300 mb-6">
      <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
    </div>

    {/* Empty state */}
    <div className="flex items-start gap-6 max-w-3xl mx-auto mt-10">

      {/* Icon (NO circle – image jaisa) */}
      <div className="text-gray-300">
        <Paperclip size={42} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Add Attachments
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          You can add and store relevant documents and files here.
        </p>

        <button className="h-9 px-4 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm inline-flex items-center gap-2 hover:bg-gray-200">
          <Plus size={14} /> Add Attachment
        </button>
      </div>
    </div>

  </div>
)

  const renderPermissionsContent = () => (
  <div className="bg-white border border-gray-200 shadow-sm">

    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">
        Choose what this teacher can view or do in the Teacher Portal
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        These permissions will only apply to this teacher and will not affect any other teacher.
      </p>
    </div>

    {/* Permissions list */}
    <div className="divide-y divide-gray-200">

      {/* GENERAL ACCESS */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase">
          General Access
        </h3>

        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm">
            <input type="radio" name="general-access" />
            <div>
              <div className="font-medium text-gray-900">
                View All School Information
              </div>
              <div className="text-gray-600">
                Can view info about ALL Classes, Lessons, students and related contacts.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 text-sm">
            <input type="radio" name="general-access" defaultChecked />
            <div>
              <div className="font-medium text-gray-900">
                View Assigned Information
              </div>
              <div className="text-gray-600">
                Can only view information related to assigned classes and students.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" />
            <div>
              <div className="font-medium text-gray-900">
                View Archived Information
              </div>
              <div className="text-gray-600">
                NOTE: This setting can only be changed for individual teachers
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* SIMPLE CHECKBOX SECTIONS */}
      {[
        ["Teachers", "None - Cannot view teacher profiles"],
        ["Students and related contacts", "None - Cannot view student profiles"],
        ["Prospects", "None - Cannot view prospects"],
        ["Classes", "None - Cannot view classes"],
        ["Class Lessons", "View lessons and related information"],
        ["Classrooms", "Can view classrooms but cannot add new ones"],
        ["Email and SMS notifications", "Cannot view or send Emails or SMS"],
        ["Library and attachments", "Cannot view library or attachments"],
        ["Payments and receipts", "Cannot view student payments or receipts"],
        ["Reports and exports", "Cannot export"],
        ["Staffs", "Cannot view staff profiles"],
        ["School management", "Cannot view school management"],
      ].map(([title, desc]) => (
        <div key={title} className="px-6 py-4">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" defaultChecked />
            <div>
              <div className="font-medium text-gray-900">{title}</div>
              <div className="text-gray-600">{desc}</div>
            </div>
          </label>
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
      <button className="h-9 px-5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">
        Save
      </button>
    </div>

  </div>
)


  const renderAvailabilityContent = () => (
  <div className="bg-white border border-gray-200 shadow-sm">

    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">
        Teacher Recurring Availability
      </h2>
    </div>

    {/* Empty State */}
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">

      {/* Icon */}
      <div className="h-16 w-16 mb-6 rounded-full bg-gray-200 flex items-center justify-center">
        <Clock size={28} className="text-gray-500" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Add a Recurring Time
      </h3>

      {/* Description */}
      <p className="text-gray-600 max-w-md mb-4 text-sm">
        If you are using the Book Lessons feature, please set your teacher
        availability here.{" "}
        <span className="text-blue-600 cursor-pointer">Learn more</span>
      </p>

      {/* Button */}
      <button className="h-9 px-4 rounded-md border border-gray-300 bg-gray-100 text-gray-800 text-sm hover:bg-gray-200 inline-flex items-center gap-2">
        <Plus size={14} /> Add Time
      </button>

    </div>
  </div>
)


  const renderContent = () => {
    switch(activeTab.toLowerCase()) {
      case "profile": return renderProfileContent()
      case "classes": return renderClassesContent()
      case "events": return renderEventsContent()
      case "teacher fees": return renderTeacherFeesContent()
      case "payslips": return renderPayslipsContent()
      case "notes": return renderNotesContent()
      case "attachments": return renderAttachmentsContent()
      case "permissions": return renderPermissionsContent()
      case "availability": return renderAvailabilityContent()
      default: return renderProfileContent()
    }
  }

  return (
    <div>
      <div className="px-6 py-6">
        {/* Header card */}
        <div className="bg-white border border-gray-200  p-5 shadow-sm">
          {/* ================= TEACHER PROFILE HEADER ================= */}
        <div className="px-5 py-3 border-b border-dotted border-gray-300 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Teacher Profile</h1>
        </div>

        <div className="px-5 py-5 flex items-start gap-4">
          {/* AVATAR (Base64 handle kiya gaya hai) */}
          <div className="w-24 h-24 border border-gray-300 bg-gray-200 flex items-center justify-center overflow-hidden">
            {teacher?.Photo ? (
              <img src={`data:image/png;base64,${teacher.Photo}`} alt="Teacher" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="text-xl font-semibold text-gray-900">
              {teacher?.Name} {teacher?.Surname}
            </div>
            <div className="text-sm text-gray-600 mt-1">{teacher?.Gender || "—"}</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-blue-600">
                <span className="text-gray-500">📞</span>
                <span>{teacher?.Mobile || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <span className="text-gray-500">✉</span>
                <span>{teacher?.Email || "—"}</span>
              </div>
            </div>
          </div>
        </div>


          {/* Navigation tabs */}
          {/* ===== Tabs Navigation (Image Like) ===== */}
<div className="mt-6 border-b border-gray-200">
  <div className="flex items-center gap-6 text-sm">

    {[
      { key: "Profile", icon: <User size={16} /> },
      { key: "Classes", icon: <BookOpen size={16} /> },
      { key: "Events", icon: <Calendar size={16} /> },
      { key: "Teacher fees", icon: <DollarSign size={16} /> },
      { key: "Payslips", icon: <Receipt size={16} /> },
      { key: "Notes", icon: <StickyNote size={16} /> },
      { key: "Attachments", icon: <Paperclip size={16} /> },
      { key: "Permissions", icon: <FileCheck size={16} /> },
      { key: "Availability", icon: <Clock size={16} /> },
    ].map(tab => {
      const isActive = activeTab === tab.key

      return (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`relative flex items-center gap-2 px-1 py-3 font-medium transition-colors
            ${isActive 
              ? "text-blue-600" 
              : "text-gray-500 hover:text-gray-800"
            }`}
        >
          {tab.icon}
          <span>{tab.key}</span>

          {isActive && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600"></span>
          )}
        </button>
      )
    })}

  </div>
</div>

        </div>

        {/* Content based on active tab */}
        <div className="">
          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      {openModal === 'sms' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-md bg-white  border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send sms message</h3>
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                <span className="text-gray-500">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="text-sm text-blue-600 cursor-pointer">0 people selected</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value="InfoSMS" 
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                    readOnly
                  />
                  <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500">
                    <span className="text-sm">i</span>
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">Message *</label>
                  <button className="text-sm text-gray-500">▼</button>
                  <button className="h-4 w-4 grid place-items-center rounded-full border border-gray-300 text-gray-500">
                    <span className="text-xs">i</span>
                  </button>
                </div>
                <textarea 
                  className="w-full h-32 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-none"
                  placeholder="Type your message here..."
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>You have 459 characters left</span>
                  <span>1 message</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Message will be delivered to <span className="text-blue-600">0 people</span> and cost 0 credits
              </div>
              <div className="flex items-center gap-3 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Remaining SMS credits: 0</span>
                </div>
                <button className="h-8 px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm inline-flex items-center gap-1">
                  <CreditCard size={14} /> Add credit
                </button>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  onClick={() => setOpenModal(null)}
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openModal === 'email' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-lg bg-white  border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send email message</h3>
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                <span className="text-gray-500">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="text-sm text-blue-600 cursor-pointer">0 people selected</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input 
                  type="text" 
                  value="Asif Omer (info@dcedu.ie)" 
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input 
                  type="text" 
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea 
                  className="w-full h-32 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-none"
                  placeholder="Type your message here..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  onClick={() => setOpenModal(null)}
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openModal === 'announcement' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-2xl bg-white  border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send announcement message</h3>
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                <span className="text-gray-500">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600 cursor-pointer">1 person selected</span>
                  <button className="h-6 w-6 grid place-items-center rounded text-blue-600">
                    <User size={14} />
                  </button>
                  <button className="h-6 w-6 grid place-items-center rounded text-blue-600">
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value="Asif Omer (info@dcedu.ie)" 
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                    readOnly
                  />
                  <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500">
                    <span className="text-sm">i</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input 
                  type="text" 
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">Message *</label>
                  <button className="text-sm text-blue-600">Insert variable ▼</button>
                  <button className="h-4 w-4 grid place-items-center rounded-full border border-gray-300 text-gray-500">
                    <span className="text-xs">i</span>
                  </button>
                </div>
                {/* Rich text editor toolbar */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm font-bold">B</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm italic">I</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm underline">U</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm line-through">S</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 bg-yellow-200">A</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-xs">14</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">•</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">1.</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">→</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">←</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">🔗</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">📹</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">📷</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">📎</button>
                  </div>
                  <textarea 
                    className="w-full h-32 px-3 py-2 text-sm resize-none border-0 focus:ring-0"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule send (optional)</label>
                  <input 
                    type="text" 
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                    placeholder="Select date and time"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry date (optional)</label>
                  <input 
                    type="text" 
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                    placeholder="Select expiry date"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  onClick={() => setOpenModal(null)}
                  className="h-10 px-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
