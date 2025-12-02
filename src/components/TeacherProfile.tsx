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
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!id) return
      try {
        setLoading(true)
        const response = await axiosInstance.get(`/Teacher/GetById/${id}`)
        if (response.data?.IsSuccess) {
          setTeacher(response.data.Data)
        } else {
          // Fallback to default data if API fails
          setTeacher({
            id,
            name: "Unknown Teacher",
            gender: "",
            age: 0,
            email: "",
            idNumber: "",
            department: "",
            position: "Teacher"
          })
        }
      } catch (error: any) {
        console.error("Error fetching teacher:", error)
        // Fallback to default data on error
        setTeacher({
          id,
          name: "Unknown Teacher",
          gender: "",
          age: 0,
          email: "",
          idNumber: "",
          department: "",
          position: "Teacher"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchTeacher()
  }, [id])

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

  const renderProfileContent = () => (
    <div className="space-y-6">
      {/* Contact Details */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Mobile phone</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Home phone</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Online Lesson Link</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Date of birth</div>
              <div className="text-sm text-gray-900 mt-1">02-06-2025</div>
              <div className="text-xs text-gray-500">Birthday is in 7 months</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ID number</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Country</div>
              <div className="text-sm text-gray-900 mt-1">Ireland</div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500">General notes</div>
            <div className="text-sm text-gray-900 mt-1">-</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">About</div>
            <div className="text-sm text-gray-900 mt-1">-</div>
          </div>
        </div>
      </div>

      {/* School Portal */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">School Portal</h3>
        <p className="text-sm text-gray-600 mb-6">Enable or disable this teacher's access to your school portal.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-2">Access to School Portal</div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </div>
                <span className="text-sm text-gray-700">Enabled</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Username</div>
              <div className="text-sm text-gray-900 mt-1">not set</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Automatic reminders</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm text-gray-700">Enabled</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Invitation</div>
              <div className="mt-1">
                <button 
                  onClick={handleSendInviteEmail}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Invite to portal
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {teacherData?.name || "Teacher"} has not signed up yet!
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Password</div>
              <div className="text-sm text-gray-900 mt-1">not set</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Last login</div>
              <div className="text-sm text-gray-900 mt-1">never</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">Created by: Asif Omer</div>
          <div className="text-xs text-gray-500">Created date: 07-08-2025 16:56</div>
        </div>
      </div>
    </div>
  )

  const renderClassesContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Classes taught</h2>
          <p className="text-gray-600 mt-1">View and manage the classes that {teacherData?.name || "this teacher"} teaches in.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-3 rounded-lg bg-blue-600 text-white text-sm">Classes</button>
          <button className="h-8 px-3 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Individual lessons</button>
        </div>
      </div>
      
      {loadingClasses ? (
        <div className="py-12 text-center text-gray-500">
          Loading classes...
        </div>
      ) : classesError ? (
        <div className="py-12 text-center text-red-600">
          {classesError}
        </div>
      ) : classes.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No classes found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Class name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total lessons</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total lesson hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total teacher fees</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls: any, idx: number) => {
                  const formatDate = (dateString?: string | null) => {
                    if (!dateString) return "—"
                    const date = new Date(dateString)
                    if (Number.isNaN(date.getTime())) return "—"
                    return date.toLocaleDateString("en-GB")
                  }
                  
                  return (
                    <tr 
                      key={cls.ClassId || idx} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/notes/class-details/${cls.ClassId}`)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <div>
                            <div className="font-medium text-gray-900">{cls.ClassTitle || "Unnamed Class"}</div>
                            <div className="text-sm text-gray-500">{cls.ClassLevel || cls.ClassSubject || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">—</td>
                      <td className="py-3 px-4 text-gray-700">—</td>
                      <td className="py-3 px-4 text-gray-700">€0.00</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          cls.IsActive !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {cls.IsActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <select className="h-8 px-2 rounded border border-gray-200 text-sm">
                <option>25 entries per page</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100">«</button>
              <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100">‹</button>
              <button className="h-8 w-8 grid place-items-center rounded bg-blue-600 text-white">1</button>
              <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100">›</button>
              <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100">»</button>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderEventsContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Events</h2>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Event name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Start date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">End date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Start time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">End time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="py-12 text-center text-gray-500">
                No records found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <select className="h-8 px-2 rounded border border-gray-200 text-sm">
            <option>25</option>
          </select>
          <span className="text-sm text-gray-500">entries per page</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100">«</button>
          <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100">‹</button>
          <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100">›</button>
          <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100">»</button>
        </div>
      </div>
    </div>
  )

  const renderTeacherFeesContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Teacher fees</h2>
          <p className="text-gray-600 mt-1">View and manage teacher fees</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-3 rounded-lg bg-blue-600 text-white text-sm">Grouped</button>
          <button className="h-8 px-3 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Individual fees</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Class fees */}
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <DollarSign size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Class fees</h3>
          <p className="text-gray-600 mb-4">Teacher fees for classes that {teacherData?.name || "this teacher"} teaches will show here.</p>
        </div>
        
        {/* Additional fees */}
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional fees</h3>
          <p className="text-gray-600 mb-4">Additional fees will show here, e.g. overtime, travel expenses, etc.</p>
          <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
            <Plus size={16} /> Add a fee
          </button>
        </div>
      </div>
    </div>
  )

  const renderPayslipsContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payslips</h2>
        </div>
      </div>
      
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Receipt size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add {teacherData?.name || "this teacher"}'s first payslip</h3>
        <p className="text-gray-600 mb-4">{teacherData?.name || "This teacher"}'s payslips will appear here once they have been added.</p>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New payslip
        </button>
      </div>
    </div>
  )

  const renderNotesContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
        </div>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New note
        </button>
      </div>
      
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <StickyNote size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add notes about {teacherData?.name || "this teacher"}</h3>
        <p className="text-gray-600 mb-4">Notes concerning {teacherData?.name || "this teacher"} will appear here.</p>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New note
        </button>
      </div>
    </div>
  )

  const renderAttachmentsContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attachments</h2>
        </div>
      </div>
      
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Paperclip size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add attachments</h3>
        <p className="text-gray-600 mb-4">You can add and store relevant documents and files here.</p>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Add attachment
        </button>
      </div>
    </div>
  )

  const renderPermissionsContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose what {teacherData?.name || "this teacher"} can view or do in the portal</h2>
        <p className="text-gray-600">These permissions will only apply to {teacherData?.name || "this teacher"} and will not affect anyone else.</p>
      </div>
      
      <div className="space-y-6">
        {/* General access */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General access</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="radio" name="general-access" className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">View all school information</div>
                <div className="text-sm text-gray-600">Can view info about ALL Classes, Lessons, students and related contacts. The permissions below set out how much access they will have to this information.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input type="radio" name="general-access" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">View assigned information</div>
                <div className="text-sm text-gray-600">Can only view information related to the Classes and students they are assigned to</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">View archived information</div>
                <div className="text-sm text-gray-600">Note: This setting can only be changed for individual teachers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teachers</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view teacher profiles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Students and related contacts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students and related contacts</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view student profiles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Prospects */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prospects</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view prospects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Classes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classes</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view classes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Lessons */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Lessons</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">View lessons - Can view lessons and all related information</div>
              </div>
            </div>
          </div>
        </div>

        {/* Classrooms */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classrooms</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">View Classrooms - Can view the schools classrooms but cannot add new ones</div>
              </div>
            </div>
          </div>
        </div>

        {/* Email and SMS notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email and SMS notifications</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view or send Emails or SMS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Library and attachments */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Library and attachments</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view library or attachments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments and receipts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payments and receipts</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view student payments or receipts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports and exports */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports and exports</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot export</div>
              </div>
            </div>
          </div>
        </div>

        {/* Staffs */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staffs</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view staff profiles</div>
              </div>
            </div>
          </div>
        </div>

        {/* School management */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">School management</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view school management</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end pt-6">
        <button className="h-10 px-6 rounded-lg bg-blue-600 text-white text-sm">
          Save changes
        </button>
      </div>
    </div>
  )

  const renderAvailabilityContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Teacher availability</h2>
        <p className="text-gray-600">Set teacher availability to be used in the booking system when students book lessons.</p>
      </div>
      
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Clock size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add a recurring availability time</h3>
        <p className="text-gray-600 mb-4">If you are are using the lessons booking feature, please set teacher availability here. <span className="text-blue-600 cursor-pointer">Learn more</span></p>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Add availability
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
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white text-xl font-semibold">AT</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 truncate">{teacherData?.name || "Loading..."}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Teacher</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div>{teacherData?.gender || "—"}</div>
                <div>{teacherData?.age || 0} years old</div>
                <button className="inline-flex items-center gap-1 text-indigo-600" onClick={() => alert('Add phone')}>+ add phone</button>
                <button className="inline-flex items-center gap-1 text-indigo-600" onClick={() => alert('Add email')}>+ add email</button>
                <div className="inline-flex items-center gap-1 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  2
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Message Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'message' ? null : 'message')}
                  className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                >
                  Message <ChevronDown size={14} />
                </button>
                {openDropdown === 'message' && (
                  <div className="dropdown-container absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div 
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setOpenDropdown(null)
                        setOpenModal('sms')
                      }}
                    >
                      <Megaphone size={16} /> Send SMS
                    </div>
                    <div 
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setOpenDropdown(null)
                        setOpenModal('email')
                      }}
                    >
                      <Mail size={16} /> Send email
                    </div>
                    <div 
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setOpenDropdown(null)
                        setOpenModal('announcement')
                      }}
                    >
                      <Megaphone size={16} /> Send announcement
                    </div>
                  </div>
                )}
              </div>

              {/* Print Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'print' ? null : 'print')}
                  className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                >
                  Print <ChevronDown size={14} />
                </button>
                {openDropdown === 'print' && (
                  <div className="dropdown-container absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Print Profile</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Print Schedule</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Print Reports</div>
                  </div>
                )}
              </div>

              {/* More Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'more' ? null : 'more')}
                  className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                >
                  More <ChevronDown size={14} />
                </button>
                {openDropdown === 'more' && (
                  <div className="dropdown-container absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <FileText size={16} /> Edit
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <Sun size={16} /> Set holiday
                    </div>
                    <div 
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={handleSendInviteEmail}
                    >
                      <User size={16} /> Invite to portal
                    </div>
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <Archive size={16} /> Archive
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
                      <Trash2 size={16} /> Delete
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {tabs.map((tab, i) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`relative h-9 px-3 text-sm transition-colors ${
                  activeTab === tab 
                    ? 'text-blue-700 font-medium' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      {openModal === 'sms' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
