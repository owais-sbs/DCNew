import { useParams, useNavigate } from "react-router-dom"
import { ChevronDown, Plus, Download, MoreHorizontal, CheckCircle, Printer, Clock, FileText, User, Calendar, DollarSign, Receipt, Users, StickyNote, Paperclip, BookOpen, Award, FilePlus, Sun, Archive, Trash2, CreditCard, Mail, Megaphone, BarChart3, Calendar as CalendarIcon, FileCheck, Flag, Star, X, ShieldCheck } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import axiosInstance from "./axiosInstance"
import { jsPDF } from "jspdf"
import Swal from "sweetalert2"

type StudentFieldKey =
  | "Name"
  | "Student ID"
  | "Address"
  | "Date of Birth"
  | "Passport Number"
  | "Course Start Date"
  | "Course End Date"
  | "Course Level"
  | "Mode of Study"
  | "Number of Weeks"
  | "Hours Per Week"
  | "Tuition Fees"
  | "End of the Course Exam Fee"
  | "ILEP Programme Reference"
  | "Attendance"
  | "Nationality"
  | "Finished Course Date"
  | "External Exam"
  | "Date of External Exam"
  | "Score External Exam"
  | "ILEP Programme Title"
  | "Course Title"
  | "Course Code"
  | "ILEP programme reference"
  | "End of the Course Exam Fee"
  | "Duration"
  | "Schedule"


type DocumentTemplateContent = {
  id: string
  label: string
  heading: string
  subheading?: string
  recipientLines?: string[]
  paragraphs: string[]
  fieldKeys: StudentFieldKey[]
  closingLines: string[]
  signatureName: string
  signatureRole: string
}

const formatDateValue = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  
  if (Number.isNaN(date.getTime())) {
    const parts = value.split("T")[0].split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`; 
    return value.split("T")[0] ?? value;
  }

  return date.toLocaleDateString("en-GB", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

const formatCurrency = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "—"
  const numeric = Number(value)
  if (Number.isNaN(numeric)) {
    return typeof value === "string" ? value : "—"
  }
  return `€${numeric.toFixed(2)}`
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")


export default function StudentProfile() {
  // All hooks must be called unconditionally at the top level
  const { id } = useParams()
  const navigate = useNavigate()

  // State hooks
  const [activeTab, setActiveTab] = useState("profile")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [invitingToPortal, setInvitingToPortal] = useState(false)
  const [inviteSentSuccess, setInviteSentSuccess] = useState(false)
  const [studentdetails, setStudent] = useState<any>(null)
  const [classesSubTab, setClassesSubTab] = useState<'classes'|'lessons'|'events'>('classes')
  const [feesTab, setFeesTab] = useState<'grouped'|'individual'>('grouped')
  const [documents, setDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [classesError, setClassesError] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [attendanceData, setAttendanceData] = useState<Record<number, any>>({})
  const [openClassMenu, setOpenClassMenu] = useState<number | null>(null)
  const [classMenuPositions, setClassMenuPositions] = useState<Record<number, { top: number; left: number }>>({})
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [showAddAttachmentModal, setShowAddAttachmentModal] = useState(false)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [signatures, setSignatures] = useState<any[]>([])
  const [loadingSignatures, setLoadingSignatures] = useState(false)
  const [selectedSignatureId, setSelectedSignatureId] = useState<number | null>(null)
  // Controls whether the signature should be rendered/printed in generated documents
  const [includeSignature, setIncludeSignature] = useState<boolean>(true)
  const [profileImageError, setProfileImageError] = useState(false)
  const [signatureBase64Map, setSignatureBase64Map] = useState<Record<number, string>>({})
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [courseExtension, setCourseExtension] = useState<any>(null);


  const renderCourseTimeline = () => {
    if (!courseExtension) return null;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 mb-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
            <CalendarIcon size={20} className="text-blue-600" /> 
            Course Journey (25 Weeks Base)
          </h3>
          {/* <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
            STATUS: ACTIVE
          </span> */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Start Date</p>
            <p className="text-md font-bold text-gray-900">{formatDateValue(courseExtension.CourseStartDate)}</p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-red-100 shadow-sm text-center">
            <p className="text-[10px] text-red-500 uppercase font-bold tracking-wider text-nowrap">Leaves (Added)</p>
            <p className="text-md font-bold text-red-600">+{courseExtension.TotalLeaveDays} Days</p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm text-center">
            <p className="text-[10px] text-orange-500 uppercase font-bold tracking-wider text-nowrap">Holidays (Added)</p>
            <p className="text-md font-bold text-orange-600">+{courseExtension.TotalHolidayDays} Days</p>
          </div>

          <div className="bg-emerald-600 p-3 rounded-lg shadow-md text-center text-white">
            <p className="text-[10px] opacity-90 uppercase font-bold tracking-wider">Projected End Date</p>
            <p className="text-md font-black">{formatDateValue(courseExtension.ExtendedEndDate)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-800 bg-white/50 p-2 rounded-lg border border-blue-100/50">
          <Clock size={16} className="animate-pulse" />
          The original course date has been extended by <span className="font-bold underline">{courseExtension.TotalExtension} days</span>.
        </div>
      </div>
    );
  };


    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")


  const [attendanceStats, setAttendanceStats] = useState<any[]>([])
  const [loadingAttendanceStats, setLoadingAttendanceStats] = useState(false)
  const [attendanceStatsError, setAttendanceStatsError] = useState<string | null>(null)

  const presentStat = attendanceStats.find((stat: any) => stat.Status === "Present");
  const percentage = presentStat?.Percentage ?? 0;
  const [attendanceMode, setAttendanceMode] = useState<"single" | "bulk" | null>(null)



  const [openMoreMenu, setOpenMoreMenu] = useState(false)

  // Student holidays tab
  const [holidays, setHolidays] = useState<{ Id: number; StudentId?: number; Note?: string | null; FromDate?: string | null; ToDate?: string | null; IsDeleted?: boolean | null }[]>([])
  const [loadingHolidays, setLoadingHolidays] = useState(false)
  const [holidaysError, setHolidaysError] = useState<string | null>(null)
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<{ Id: number; Note?: string | null; FromDate?: string | null; ToDate?: string | null } | null>(null)
  const [holidayForm, setHolidayForm] = useState({ note: "", fromDate: "", toDate: "" })
  const [savingHoliday, setSavingHoliday] = useState(false)

  // Ref hooks
  const documentContentRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)


  // Inside StudentProfile component
const [activities, setActivities] = useState<any[]>([]);
const [loadingActivity, setLoadingActivity] = useState(false);

const [selectedSessions, setSelectedSessions] = useState<{ sessionId: number ; attendanceDate: string}[]>([])


const isSessionSelected = (sessionId: number, attendanceDate: string) => {
  return selectedSessions.some(
    s => s.sessionId == sessionId && s.attendanceDate == attendanceDate
  )
}

const toggleSession = (sessionId: number, attendanceDate: string) => {
  setSelectedSessions(prev => {
    const exist = prev.some(
      s => s.sessionId == sessionId && s.attendanceDate == attendanceDate
    )

    if(exist){
      return prev.filter(
        s => !(s.sessionId == sessionId && s.attendanceDate == attendanceDate)
      )
    }

    return [...prev, { sessionId, attendanceDate }]
  })
}




useEffect(() => {
    const fetchExtensionInfo = async () => {
      if (!id) return;
      try {
        const res = await axiosInstance.get(`/Student/GetCourseExtension/GetCourseExtension/${id}`);
        if (res.data?.IsSuccess) {
          setCourseExtension(res.data.Data);
        }
      } catch (err) {
        console.error("Extension fetch error:", err);
      }
    };
    fetchExtensionInfo();
  }, [id, holidays]);


useEffect(() => {
  const fetchEmailStatus = async () => {
    if (!id) return;
    try {
      const response = await axiosInstance.get(`/Student/GetStudentEmailStatus`, {
        params: { studentId: id }
      });
      if (response.data?.IsSuccess) {
        // Assuming Data contains the Enum integer (0, 1, 2, etc.)
        setEmailStatus(response.data.Data);
      }
    } catch (error) {
      console.error("Error fetching email status:", error);
    }
  };
  fetchEmailStatus();
}, [id]);


useEffect(() => {
    const fetchExtensionInfo = async () => {
        if (!id) return;
        try {
            const res = await axiosInstance.get(`/Student/GetCourseExtension/GetCourseExtension/${id}`);
            if (res.data?.IsSuccess) {
                setCourseExtension(res.data.Data);
            }
        } catch (err) {
            console.error("Extension fetch error:", err);
        }
    };
    fetchExtensionInfo();
}, [id, holidays, studentdetails]); 

// Helper to convert the C# Enum to Text (matches EmailStatus: None, FirstWarning, SecondWarning, ThirdWarning, FinalWarning, Expulsion)
const getEmailStatusLabel = (status: string | null) => {
  if (!status || status === "None") return null;

  const statusMap: Record<string, string> = {
    FirstWarning: "First Warning",
    SecondWarning: "Second Warning",
    ThirdWarning: "Third Warning",
    FinalWarning: "Final Warning",
    Expulsion: "Expulsion",
  };

  return statusMap[status] || status;
};

const toggleSelectAll = (checked: boolean) => {
  if(checked){
    const all = lessons.map((l: any) => ({
      sessionId: l.scheduleId,
      attendanceDate: l.date
    }))

    setSelectedSessions(all)
  }else{
    setSelectedSessions([])
  }
}


const isAllSelected = lessons.length > 0 && lessons.every((l: any) => isSessionSelected(l.scheduleId, l.date))


console.log("selected sessions", selectedSessions)

useEffect(() => {
  if (activeTab.toLowerCase() === "activity" && id) {
    const fetchActivity = async () => {
      setLoadingActivity(true);
      try {
        const response = await axiosInstance.get(`/Dashboard/GetStudentActivity`, {
          params: { studentId: id }
        });
        if (response.data?.IsSuccess) {
          setActivities(response.data.Data || []);
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchActivity();
  }
}, [activeTab, id]);

  useEffect(() => {
    const close = () => setOpenMoreMenu(false)
    if (openMoreMenu) {
      document.addEventListener("click", close)
    }
    return () => document.removeEventListener("click", close)
  }, [openMoreMenu])

  useEffect(() => {
    const close = () => setOpenClassMenu(null)
    if (openClassMenu !== null) {
      document.addEventListener("click", close)
    }
    return () => document.removeEventListener("click", close)
  }, [openClassMenu])


  // Logic to derive the "True" attendance percentage
const getOverallAttendanceStats = () => {
  if (!attendanceStats || attendanceStats.length === 0) return { percentage: 0, label: "No Data" };

  // 1. Find the Present stat
  const presentStat = attendanceStats.find(s => s.Status === "Present");
  
  // 2. Filter out "None" or "NotTaken" for the visual table
  const displayStats = attendanceStats.filter(s => s.Status !== "None" && s.Status !== "NotTaken");

  // 3. Logic: If there is a "Present" percentage, use it. 
  // If all valid counts are 0, it's 0%.
  const totalCount = displayStats.reduce((acc, curr) => acc + (curr.Count || 0), 0);
  
  return {
    percentage: presentStat?.Percentage || 0,
    label: "Present",
    totalLessons: totalCount,
    displayStats
  };
};

const stats = getOverallAttendanceStats();
const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);



  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axiosInstance.get(`/Student/GetById/${id}`);
        if (response.data?.IsSuccess) {
          setStudent(response.data.Data);
          setProfileImageError(false); // Reset error when new student data is loaded
        }
      } catch (error) {
        console.error("Failed to fetch student:", error);
      }
    };
    fetchStudent();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  useEffect(() => {
    console.log("Active tab changed:", activeTab)
    if (activeTab.toLowerCase() === "create documents") {
      console.log("Tab matches 'create documents', fetching documents...")
      const fetchDocuments = async () => {
        try {
          setLoadingDocuments(true)
          console.log("Fetching documents from API: /Document/GetAllDocument")
          const response = await axiosInstance.get("/Document/GetAllDocument")
          console.log("Documents API response:", response.data)
          if (response.data?.IsSuccess) {
            setDocuments(response.data.Data || [])
          } else {
            setDocuments([])
          }
        } catch (error) {
          console.error("Error fetching documents:", error)
          setDocuments([])
        } finally {
          setLoadingDocuments(false)
        }
      }
      fetchDocuments()
    }
  }, [activeTab])

  // Helper function to convert image URL to base64 using /Image/FetchImage API
  const imageUrlToBase64 = async (url: string): Promise<string | null> => {
    if (!url) return null
    
    try {
      // Use /Image/FetchImage API with fileId parameter (URL-encoded signature URL)
      const response = await axiosInstance.get("/Image/FetchImage", {
        params: {
          fileId: url // The API will URL-encode this automatically
        },
        responseType: 'blob',
        headers: {
          'Accept': 'image/*'
        }
      })
      
      const blob = response.data
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          // Return full data URL for img src (includes data:image/...;base64, prefix)
          console.log("Image converted to base64 via FetchImage API, length:", base64String.length)
          resolve(base64String)
        }
        reader.onerror = (error) => {
          console.error("FileReader error:", error)
          reject(error)
        }
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error("Error fetching image via /Image/FetchImage:", error)
      // Fallback: try direct fetch if API fails
      try {
        const response = await fetch(url, { mode: 'cors' })
        if (!response.ok) {
          console.error("Failed to fetch image:", response.statusText)
          return null
        }
        const blob = await response.blob()
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64String = reader.result as string
            console.log("Image converted to base64 (fallback), length:", base64String.length)
            resolve(base64String)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
        return null
      }
    }
  }


  const handleSendWarning = async () => {
  if (!id || !emailStatus || emailStatus === "None") {
    Swal.fire("Notice", "No warning status is currently active for this student.", "info");
    return;
  }

  const currentLabel = getEmailStatusLabel(emailStatus);
  const isFinalWarning = emailStatus === "FinalWarning";

  let statusToSend: string;
  let expelStudentChosen = false;
  if (isFinalWarning) {
    // When at Final Warning: choose either Resend Final Warning or Expel Student (calls UnenrollStudentFromAll)
    const result = await Swal.fire({
      title: "Final Warning",
      html: "Choose an action for this student:",
      icon: "warning",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: "#2563eb",
      denyButtonColor: "#dc2626",
      confirmButtonText: "Resend Final Warning",
      denyButtonText: "Expel Student",
      cancelButtonText: "Cancel",
      customClass: { denyButton: "swal2-deny" },
    });
    if (result.isDismissed) return;
    expelStudentChosen = result.isDenied;
    statusToSend = result.isDenied ? "Expulsion" : "FinalWarning";
  } else {
    // For other statuses: confirm resend current warning
    const result = await Swal.fire({
      title: "Resend Warning?",
      html: `Are you sure you want to resend the <b style="color: #dc2626;">${currentLabel}</b> to this student?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Yes, Send Email",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    statusToSend = emailStatus;
  }

  if (expelStudentChosen) {
    Swal.fire({
      title: "Expelling student...",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });
    try {
      const unenrollRes = await axiosInstance.post("/Class/UnenrollStudentFromAll", null, {
        params: { studentId: id },
      });
      if (!unenrollRes.data?.IsSuccess) {
        Swal.fire("Error", unenrollRes.data?.Message || "Failed to unenroll student.", "error");
        return;
      }
      const emailRes = await axiosInstance.post("/Student/SendWarningEmail", null, {
        params: { studentId: id, status: "Expulsion" },
      });
      if (emailRes.data?.IsSuccess) {
        Swal.fire("Done", "Student has been expelled, unenrolled from all classes, and the expulsion email has been sent.", "success");
        const statusRes = await axiosInstance.get("/Student/GetStudentEmailStatus", { params: { studentId: id } });
        if (statusRes.data?.IsSuccess && statusRes.data?.Data != null) {
          setEmailStatus(statusRes.data.Data);
        }
      } else {
        Swal.fire("Done", "Student unenrolled from all classes. Expulsion email could not be sent.", "warning");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred while calling the server.", "error");
    }
    return;
  }

  Swal.fire({
    title: "Sending Email...",
    didOpen: () => Swal.showLoading(),
    allowOutsideClick: false,
  });

  try {
    const response = await axiosInstance.post("/Student/SendWarningEmail", null, {
      params: { studentId: id, status: statusToSend },
    });

    if (response.data?.IsSuccess) {
      const newLabel = getEmailStatusLabel(statusToSend);
      Swal.fire("Done", `The ${newLabel} email has been resent.`, "success");
      const statusRes = await axiosInstance.get("/Student/GetStudentEmailStatus", { params: { studentId: id } });
      if (statusRes.data?.IsSuccess && statusRes.data?.Data != null) {
        setEmailStatus(statusRes.data.Data);
      }
    } else {
      Swal.fire("Error", response.data?.Message || "Failed to send email.", "error");
    }
  } catch (error) {
    Swal.fire("Error", "An error occurred while calling the server.", "error");
  }
};

  // Fetch signatures when document modal opens
  useEffect(() => {
    if (selectedDocument) {
      const fetchSignatures = async () => {
        setLoadingSignatures(true)
        try {
          const response = await axiosInstance.get("/Attachment/GetDigitalSignatures")
          if (response.data?.IsSuccess && response.data?.Data?.Data) {
            const mappedSignatures = response.data.Data.Data.map((item: any) => ({
              id: item.Id,
              name: item.Name || "",
              signatureUrl: item.Signature || "",
              fileDetails: item.FileDetails,
              fileType: item.FileType
            }))
            setSignatures(mappedSignatures)
            
            // Convert all signature images to base64
            const base64Map: Record<number, string> = {}
            for (const sig of mappedSignatures) {
              if (sig.signatureUrl) {
                const base64 = await imageUrlToBase64(sig.signatureUrl)
                if (base64) {
                  base64Map[sig.id] = base64
                }
              }
            }
            setSignatureBase64Map(base64Map)
            
            // Auto-select first signature if available
            if (mappedSignatures.length > 0 && !selectedSignatureId) {
              setSelectedSignatureId(mappedSignatures[0].id)
            }
          } else {
            setSignatures([])
          }
        } catch (err: any) {
          console.error("Failed to fetch signatures", err)
          setSignatures([])
        } finally {
          setLoadingSignatures(false)
        }
      }
      fetchSignatures()
    } else {
      // Reset when modal closes
      setSignatures([])
      setSelectedSignatureId(null)
      setSignatureBase64Map({})
    }
  }, [selectedDocument])

  // When student id changes (e.g. open another student from search), reset state so we don't show previous student's data
  useEffect(() => {
    if (!id) return
    setStudent(null)
    setClasses([])
    setLessons([])
    setSelectedClassId(null)
    setClassesSubTab("classes")
    setAttendanceData({})
    setSelectedSessions([])
    setCurrentPage(1)
    setTotalCount(0)
  }, [id])

  // Fetch classes when classes tab is active
  useEffect(() => {
    if (activeTab.toLowerCase() !== "classes" || !id) return

    const controller = new AbortController()

    const fetchClasses = async () => {
      setLoadingClasses(true)
      setClassesError(null)
      try {
        const response = await axiosInstance.get("/Class/GetClassesByStudent", {
          params: { studentId: parseInt(id) },
          signal: controller.signal
        })

        console.log("Student classes response:", response.data)
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
        console.error("Failed to load student classes", error)
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

  // Fetch attachments when attachments tab is active
  useEffect(() => {
    if (activeTab.toLowerCase() !== "attachments" || !id) return

    const controller = new AbortController()

    const fetchAttachments = async () => {
      setLoadingAttachments(true)
      try {
        const response = await axiosInstance.get(`/Attachment/GetByStudentId`, {
          params: { studentId: id },
          signal: controller.signal
        })
        if (response.data?.IsSuccess) {
          const raw = response.data.Data
          const list = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.Data)
              ? raw.Data
              : Array.isArray(raw?.Items)
                ? raw.Items
                : []
          setAttachments(list)
        } else {
          setAttachments([])
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        console.error("Error fetching attachments:", error)
        setAttachments([])
      } finally {
        if (!controller.signal.aborted) {
          setLoadingAttachments(false)
        }
      }
    }

    fetchAttachments()

    return () => controller.abort()
  }, [activeTab, id])

  // Fetch attendance stats when attendance tab is active
  useEffect(() => {
    const fetchAttendanceStats = async () => {
      if (activeTab.toLowerCase() !== "attendance" || !id) return

      setLoadingAttendanceStats(true)
      setAttendanceStatsError(null)
      try {
        const response = await axiosInstance.get("/Dashboard/GetStudentAttendanceStats", {
          params: { studentId: Number(id) }
        })

        if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
          setAttendanceStats(response.data.Data)
        } else {
          setAttendanceStats([])
          setAttendanceStatsError(response.data?.Message || "No attendance stats available.")
        }
      } catch (error: any) {
        console.error("Error fetching attendance stats:", error)
        setAttendanceStatsError(error?.message || "Failed to load attendance stats.")
        setAttendanceStats([])
      } finally {
        setLoadingAttendanceStats(false)
      }
    }

    fetchAttendanceStats()
  }, [activeTab, id])

  // Fetch student holidays when Holidays tab is active
  useEffect(() => {
    if (activeTab.toLowerCase() !== "holidays" || !id) return
    setLoadingHolidays(true)
    setHolidaysError(null)
    axiosInstance
      .get("/Holiday/GetStudentHolidays", { params: { studentId: Number(id) } })
      .then((res) => {
        if (res.data?.IsSuccess && Array.isArray(res.data.Data)) {
          setHolidays(res.data.Data)
        } else {
          setHolidays([])
          setHolidaysError(res.data?.Message || "No holidays found.")
        }
      })
      .catch((err) => {
        console.error("Failed to load holidays", err)
        setHolidaysError(err?.message || "Failed to load holidays.")
        setHolidays([])
      })
      .finally(() => setLoadingHolidays(false))
  }, [activeTab, id])

  // Fetch attendance data for student in class
  const fetchAttendance = async (classId: number) => {
    if (!id) return
    
    try {
      const response = await axiosInstance.get("/Class/GetAttendanceForStudentInClass", {
        params: { 
          classId,
          studentId: Number(id)
        }
      })

      console.log("Attendance response:", response.data)
      if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
        // Create a map of SessionId -> attendance data
        const attendanceMap: Record<number, any> = {}
        response.data.Data.forEach((item: any) => {
          if (item.SessionId) {
            attendanceMap[item.SessionId] = {
              attendanceStatus: item.AttendanceStatus,
              attendanceDate: item.AttendanceDate,
              sessionDayOfWeek: item.SessionDayOfWeek,
              sessionStartTime: item.SessionStartTime,
              sessionEndTime: item.SessionEndTime,
              classTitle: item.ClassTitle
            }
          }
        })
        setAttendanceData(attendanceMap)
      }
    } catch (error: any) {
      console.error("Error fetching attendance:", error)
      // Don't show error to user, just log it
    }
  }

  const refreshAttendanceStats = async () => {
  const response = await axiosInstance.get(
    "/Dashboard/GetStudentAttendanceStats",
    { params: { studentId: Number(id) } }
  )
  if (response.data?.IsSuccess) {
    setAttendanceStats(response.data.Data)
  }
}


  // Fetch lessons for selected class using GetAttendanceForStudentInClass
  const fetchLessons = async (classId: number, page: number = 1) => {
        if (!id) return
        
        setSelectedClassId(classId)
        setLoadingLessons(true)
        setCurrentPage(page)

        try {
            const response = await axiosInstance.get("/Class/GetAttendanceForStudentInClasspagination", {
                params: {
                    classId: classId,
                    studentId: Number(id),
                    fromDate: fromDate || null,
                    toDate: toDate || null,
                    page: page,
                    pageSize: pageSize
                }
            })

            if (response.data?.IsSuccess) {
                // API returns { TotalCount, Items }
                const result = response.data.Data;
                const mapped = result.Items.map((s: any) => ({
                    scheduleId: s.SessionId,
                    classId: classId,
                    date: s.AttendanceDate || s.SessionStartTime,
                    startTime: s.SessionStartTime,
                    endTime: s.SessionEndTime,
                    className: s.ClassTitle || "—",
                    dayOfWeek: s.SessionDayOfWeek || null,
                    attendance: s.AttendanceStatus || null,
                }))
                
                setLessons(mapped)
                setTotalCount(result.TotalCount)
                setClassesSubTab('lessons')
            } else {
                setLessons([])
                setTotalCount(0)
            }
        } catch (error) {
            console.error("Error fetching paginated lessons:", error)
            setLessons([])
        } finally {
            setLoadingLessons(false)
        }
    }

    // Effect to trigger fetch when page, page size, or dates change
    useEffect(() => {
        if (selectedClassId && classesSubTab === 'lessons') {
            fetchLessons(selectedClassId, currentPage)
        }
    }, [currentPage, pageSize, fromDate, toDate])

    const tabs = ["Profile", "Activity", "Classes", "Attendance", "Attachments", "Holidays", "Create documents"]

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openClassMenu && !(event.target as Element).closest('.class-menu-container')) {
        setOpenClassMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openClassMenu])

  // Don't use early return - render loading state conditionally to ensure hooks are always called
  const studentName = studentdetails ? `${studentdetails.FirstName ?? ""} ${studentdetails.LastName ?? studentdetails.Surname ?? ""}`.trim() : "";

  const age = studentdetails?.DateOfBirth
  ? Math.floor(
      (new Date().getTime() - new Date(studentdetails.DateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    )
  : null;

  const studentAddress = studentdetails
    ? [
        studentdetails.StreetAddress,
        studentdetails.City,
        studentdetails.State,
        studentdetails.ZipCode,
        studentdetails.Country
      ]
        .filter(Boolean)
        .join(", ")
    : ""
    const isLeapCardLetter = selectedDocument?.Title?.toLowerCase().includes("leap card letter");
    const isReferenceLetter = selectedDocument?.Title?.toLowerCase().includes("reference letter");
    const isDocumentId27 = selectedDocument?.Id === 27;
    const isDocumentId18 = selectedDocument?.Id === 18;
    const isDocumentId15 = selectedDocument?.Id === 15;

  const defaultFieldKeys: StudentFieldKey[] = isDocumentId27
    ? [
        "Name",
        "Student ID",
        "Date of Birth",
        "Attendance",
        "Nationality",
        "Course Start Date",
        "Finished Course Date",
        "Course Level",
        "External Exam",
        "Date of External Exam",
        "Score External Exam",
        "ILEP Programme Title",
        "ILEP Programme Reference",
      ]
    : isDocumentId18
    ? [
        "Name",
        "Student ID",
        "Address",
        "Date of Birth",
        "Course Level",
        "Passport Number",
        "Course Start Date",
        "Course End Date",
        "Course Title",
        "Mode of Study",
        "Number of Weeks",
        "Hours Per Week",
        "Tuition Fees",
        "End of the Course Exam Fee",
        "ILEP Programme Reference",
      ]
    : isDocumentId15
    ? [
        "Name",
        "Student ID",
        "Date of Birth",
        "Attendance",
        "Nationality",
        "Course Start Date",
        "Finished Course Date",
        "Course Level",
        "External Exam",
        "Date of External Exam",
        "ILEP Programme Title",
        "ILEP Programme Reference",
      ]
    : isLeapCardLetter
    ? [
      "Name",
      "Student ID",
      "Date of Birth",
      "Course Start Date",
      "Course End Date",
      "Course Title",
      "Course Level",
      "Mode of Study",
      "Duration",
      "Schedule",
      "Tuition Fees"
    ]
  : isReferenceLetter
  ? [
      "Name",
      "Student ID",
      "Address",
      "Date of Birth",
      "Attendance",
      "Nationality",
      "Passport Number",
      "Course Start Date",
      "Course End Date",
      "Course Title", 
      "Number of Weeks",
      "Hours Per Week",
      "Tuition Fees"
    ]
  : [
      "Name",
      "Student ID",
      "Address",
      "Date of Birth",
      "Course Level",
      "Passport Number",
      "Course Start Date",
      "Course End Date",
      "Course Title",
      "Mode of Study",
      "Number of Weeks",
      "Hours Per Week",
      "Tuition Fees",
      "End of the Course Exam Fee",
      "ILEP Programme Reference"
    ];

  const handleInviteToPortal = async () => {
    if (!studentdetails?.Id) {
      Swal.fire("Error", "Student ID is missing", "error");
      return;
    }
    setInvitingToPortal(true);
    try {
      const response = await axiosInstance.post("/Account/InviteUser", {
        UserId: studentdetails.Id,
        UserType: "student",
      });
      if (response.data?.IsSuccess) {
        setInviteSentSuccess(true);
        Swal.fire({
          icon: "success",
          title: "Invitation Sent",
          text: "The student has been invited to the portal successfully.",
          confirmButtonColor: "#2563eb",
        });
        const refreshResponse = await axiosInstance.get(`/Student/GetById/${id}`);
        if (refreshResponse.data?.IsSuccess) {
          setStudent(refreshResponse.data.Data);
        }
      } else {
        Swal.fire("Error", response.data?.Message || "Failed to invite student", "error");
      }
    } catch (error: any) {
      console.error("Error inviting student:", error);
      Swal.fire(
        "Error",
        error.response?.data?.Message || "Failed to invite student. Please try again.",
        "error"
      );
    } finally {
      setInvitingToPortal(false);
    }
  };


  useEffect(() => {
  const fetchAttendanceStats = async () => {
    // Only stop if there is no student ID
    if (!id) return;

    setLoadingAttendanceStats(true);
    setAttendanceStatsError(null);
    try {
      const response = await axiosInstance.get("/Dashboard/GetStudentAttendanceStats", {
        params: { studentId: Number(id) }
      });

      if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
        setAttendanceStats(response.data.Data);
      } else {
        setAttendanceStats([]);
      }
    } catch (error: any) {
      console.error("Error fetching attendance stats:", error);
      setAttendanceStats([]);
    } finally {
      setLoadingAttendanceStats(false);
    }
  };

  fetchAttendanceStats();
}, [id]);

  const studentFieldResolvers: Record<StudentFieldKey, () => string> = {
    "Name": () => studentName || "—",
    "Student ID": () => studentdetails?.IdNumber || "—",
    "Date of Birth": () => formatDateValue(studentdetails?.DateOfBirth),
    "Attendance": () => {
      // Try to get attendance percentage from stats or calculate it
      if (attendanceStats && attendanceStats.length > 0) {
        const presentStat = attendanceStats.find((stat: any) => stat.Status?.toLowerCase() === "present");
        if (presentStat?.Percentage !== undefined) {
          return `${presentStat.Percentage.toFixed(1)}%`;
        }
      }
      // Fallback to attendance field if available
      return studentdetails?.Attendance?.toString() || "—";
    },
    
    "Course Start Date": () => formatDateValue(studentdetails?.CourseStartDate),
    "Finished Course Date": () => formatDateValue(studentdetails?.FinishedCourseDate),
    "Course Level": () => studentdetails?.CourseLevel || "—",


    "Nationality": () => studentdetails?.Nationality || "—",
    "Attendance": () => {
      // Try to get attendance percentage from stats or calculate it
      if (attendanceStats && attendanceStats.length > 0) {
        const presentStat = attendanceStats.find((stat: any) => stat.Status?.toLowerCase() === "present");
        if (presentStat?.Percentage !== undefined) {
          return `${presentStat.Percentage.toFixed(1)}%`;
        }
      }
      // Fallback to attendance field if available
      return studentdetails?.Attendance?.toString() || "—";
    },

    "External Exam": () => studentdetails?.ExternalExam || "—",
    "Date of External Exam": () => formatDateValue(studentdetails?.ExternalExamDate),
    "Score External Exam": () => studentdetails?.ScoreExternalExam || "—",
    "ILEP Programme Reference": () => studentdetails?.IlepReference || "—",
    "ILEP Programme Title": () => studentdetails?.IlepTitle || studentdetails?.IlepProgrammeTitle || studentdetails?.CourseTitle || "—",
    "Address": () => studentAddress || "—",
    "Passport Number": () => studentdetails?.PassportNumber || "—",
    "Course End Date": () => formatDateValue(studentdetails?.CourseEndDate),
    "Course Title": () => studentdetails?.CourseTitle || "—",
    "Mode of Study": () => studentdetails?.ModeOfStudy || "—",
    "Duration": () => studentdetails?.Duration || "—",
    "Schedule": () => studentdetails?.Schedule || "—",
    "Number of Weeks": () => {
      const weeks = studentdetails?.NumberOfWeeks;
      return weeks ? `${weeks} Weeks` : "—";
    },
    "Hours Per Week": () => studentdetails?.HoursPerWeek?.toString() || "—",
    "Tuition Fees": () => {
      // Always return "Fully Paid" for documents
      return "Fully Paid";
    },
    "Course Code": () => studentdetails?.CourseCode || "—",
    "ILEP programme reference": () => studentdetails?.IlepReference || "—",
    "End of the Course Exam Fee": () => {
      const examFees = studentdetails?.EndOfExamPaid;
      if (examFees === null || examFees === undefined || examFees === "") return "Fully Paid";
      // Check if it says "Fully Paid" or similar, otherwise format as currency
      if (typeof examFees === "string" && examFees.toLowerCase().includes("paid")) {
        return examFees;
      }
      const numeric = Number(examFees);
      if (!isNaN(numeric)) {
        return formatCurrency(numeric);
      }
      return examFees.toString();
    },
    "End of the course exam fees": () => {
      // Always return "Fully Paid" for documents
      return "Fully Paid";
    }
  }

  const getStudentFieldValue = (key: StudentFieldKey) => studentFieldResolvers[key]()

  // Replace placeholders in document body with student data
  const replacePlaceholders = (text: string) => {
    if (!text) return ""

    // 2. Remove the text from the document content
    
    return text      
      .replace(/\{StudentName\}/g, studentName || "—")
      .replace(/\{StudentID\}/g, studentdetails.IdNumber || "—")
      .replace(/\{Address\}/g, studentAddress || "—")
      .replace(/\{DateOfBirth\}/g, formatDateValue(studentdetails.DateOfBirth))
      .replace(/\{Nationality\}/g, studentdetails.Nationality || "—")
      .replace(/\{PassportNumber\}/g, studentdetails.PassportNumber || "—")
      .replace(/\{CourseStartDate\}/g, formatDateValue(studentdetails.CourseStartDate))
      .replace(/\{CourseEndDate\}/g, formatDateValue(studentdetails.CourseEndDate))
      .replace(/\{CourseTitle\}/g, studentdetails.CourseTitle || "—")
      .replace(/\{CourseLevel\}/g, studentdetails.CourseLevel || "—")
      .replace(/\{ModeOfStudy\}/g, studentdetails.ModeOfStudy || "—")
      .replace(/\{NumberOfWeeks\}/g, String(studentdetails.NumberOfWeeks ?? "—"))
      .replace(/\{HoursPerWeek\}/g, String(studentdetails.HoursPerWeek ?? "—"))
      .replace(/\{TuitionFees\}/g, (() => {
        const fees = studentdetails?.TuitionFees;
        if (fees === null || fees === undefined || fees === "") return "—";
        if (typeof fees === "string" && fees.toLowerCase().includes("paid")) {
          return fees;
        }
        return formatCurrency(fees);
      })())
      .replace(/\{CourseCode\}/g, studentdetails.CourseCode || "—")
      .replace(/\{Attendance\}/g, (() => {
        if (attendanceStats && attendanceStats.length > 0) {
          const presentStat = attendanceStats.find((stat: any) => stat.Status?.toLowerCase() === "present");
          if (presentStat?.Percentage !== undefined) {
            return `${presentStat.Percentage.toFixed(1)}%`;
          }
        }
        return studentdetails?.Attendance?.toString() || "—";
      })())
      .replace(/\{FinishedCourseDate\}/g, formatDateValue(studentdetails.FinishedCourseDate))
      .replace(/\{ExternalExam\}/g, studentdetails.ExternalExam || "—")
      .replace(/\{ExternalExamDate\}/g, formatDateValue(studentdetails.ExternalExamDate))
      .replace(/\{DateOfExternalExam\}/g, formatDateValue(studentdetails.ExternalExamDate))
      .replace(/\{ScoreExternalExam\}/g, studentdetails.ScoreExternalExam || "—")
      .replace(/\{IlepReference\}/g, studentdetails.IlepReference || "—")
      .replace(/\{ILEPProgrammeReference\}/g, studentdetails.IlepReference || "—")
      .replace(/\{ILEPProgrammeTitle\}/g, studentdetails.IlepTitle || studentdetails.IlepProgrammeTitle || studentdetails.CourseTitle || "—")
      .replace(/\{EndOfExamPaid\}/g, (() => {
        const examFees = studentdetails?.EndOfExamPaid;
        if (examFees === null || examFees === undefined || examFees === "") return "—";
        const numeric = Number(examFees);
        if (!isNaN(numeric)) {
          return formatCurrency(numeric);
        }
        return examFees.toString();
      })())
      .replace(/\{EndOfCourseExamFees\}/g, (() => {
        const examFees = studentdetails?.EndOfExamPaid;
        if (examFees === null || examFees === undefined || examFees === "") return "—";
        if (typeof examFees === "string" && examFees.toLowerCase().includes("paid")) {
          return examFees;
        }
        const numeric = Number(examFees);
        if (!isNaN(numeric)) {
          return formatCurrency(numeric);
        }
        return examFees.toString();
      })())
      .replace(/\{EndOfCourseExamFee\}/g, (() => {
        const examFees = studentdetails?.EndOfExamPaid;
        if (examFees === null || examFees === undefined || examFees === "") return "—";
        if (typeof examFees === "string" && examFees.toLowerCase().includes("paid")) {
          return examFees;
        }
        const numeric = Number(examFees);
        if (!isNaN(numeric)) {
          return formatCurrency(numeric);
        }
        return examFees.toString();
      })())
  }

  

 const renderActivityContent = () => (
  <div className="bg-white border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Activity</h2>
        <p className="text-gray-600 mt-1">Student activity is logged here</p>
      </div>
      <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
        Activity type <ChevronDown size={14} />
      </button>
    </div>
    
    <div className="space-y-4">
      {loadingActivity ? (
        <div className="py-10 text-center text-gray-500">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No activity recorded.</div>
      ) : (
        activities.map((activity, i) => {
          const dateObj = new Date(activity.ActivityTime);
          const displayDate = dateObj.toLocaleDateString("en-GB", {
            day: '2-digit', month: 'short', year: 'numeric'
          });
          const displayTime = dateObj.toLocaleTimeString("en-GB", {
            hour: '2-digit', minute: '2-digit'
          });

          return (
            <div key={activity.AttendanceId || i} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle size={16} className="text-blue-600" />
                </div>
                {i < activities.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-2" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium">Attendance:</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    activity.Status === "Excused" ? "bg-blue-100 text-blue-800" : 
                    activity.Status === "Absent" ? "bg-red-100 text-red-800" : 
                    "bg-green-100 text-green-800"
                  }`}>
                    {activity.Status}
                  </span>
                  <span className="text-sm text-gray-600">
                    was recorded for <strong>{activity.ClassTitle}</strong> in {activity.ClassRoom}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {displayTime}, {displayDate}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);

const renderContent = () => {
    const timeline = renderCourseTimeline();

    switch (activeTab.toLowerCase()) {
      case "profile":
        return (
          <div className="space-y-4">
            {timeline} 
            {renderProfileContent()}
          </div>
        );
      case "activity":
        return renderActivityContent();
      case "classes":
        return renderClassesContent();
      case "attendance":
        return renderAttendanceContent();
      case "attachments":
        return renderAttachmentsContent();
      case "holidays":
        return renderHolidaysContent();
      case "create documents":
        return renderCreateDocumentsContent();
      default:
        return (
          <div className="space-y-4">
            {timeline}
            {renderProfileContent()}
          </div>
        );
    }
  };
  

  const renderClassesContent = () => (
  <div className="bg-white p-5">

    {/* HEADER */}
    {/* HEADER ROW */}
<div className="flex items-center justify-between pb-3">
  <h2 className="text-lg font-semibold text-gray-900">Classes</h2>

  {/* View switch */}
  <div className="flex items-center gap-1 text-sm">
    <span className="text-gray-600 mr-1">View:</span>

    {[
      { id: "classes", label: "Classes" },
      { id: "lessons", label: "Individual Lessons" },
      { id: "events", label: "Events" },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => setClassesSubTab(tab.id)}
        className={`px-3 py-1.5 border text-sm ${
          classesSubTab === tab.id
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-blue-600 border-gray-300 hover:bg-gray-50"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>

{/* 🔹 BORDER LINE (SEPARATOR) */}
<div className="border-b border-gray-300 mb-4" />

{/* SUB HEADER ROW */}
<div className="flex items-center justify-between mb-4">
  <p className="text-sm text-gray-500">
    The classes this student is enrolled in.
  </p>

  <div className="flex items-center gap-3">
    {/* Toggle */}
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" />
      <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-600 relative transition">
        <div className="absolute left-1 top-0.5 h-4 w-4 bg-white rounded-full peer-checked:translate-x-5 transition" />
      </div>
    </label>

    {/* Enroll */}
    <button
      onClick={() => setOpenModal("enroll-event")}
      className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-sm flex items-center gap-1 hover:bg-gray-200"
    >
      <Plus size={14} /> Enroll Student
    </button>
  </div>
</div>



{classesSubTab === 'lessons' && (
      <div>
        {selectedClassId && (
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => {
                setClassesSubTab('classes')
                setSelectedClassId(null)
                setLessons([])
                setCurrentPage(1) // Reset page
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              &larr; Back to classes
            </button>
          </div>
        )}


        

        {/* Filter Section */}
        <div className="flex items-center gap-4 mb-4">
          <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
            <option>Attendance: All</option>
          </select>
          <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
            <option>Class: All</option>
          </select>
          
          {/* 🔹 Date Filters Integrated */}
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={fromDate} 
              onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm"
            />
            <span className="text-gray-400">to</span>
            <input 
              type="date" 
              value={toDate} 
              onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm"
            />
          </div>

          <button className="h-10 w-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
            <Clock size={16} className="text-gray-500" />
          </button>
        </div>

        {loadingLessons ? (
          <div className="py-12 text-center text-gray-500">
            Loading lessons...
          </div>
        ) : lessons.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            {selectedClassId ? "No lessons found for this class." : "Select a class and click 'View lessons' to see lessons."}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <th className="px-4 py-3 text-right">
  <input
    type="checkbox"
    checked={isAllSelected}
    onChange={(e) => toggleSelectAll(e.target.checked)}
  />
</th>
<th>
  <button
  disabled={selectedSessions.length === 0}
  onClick={() => {
    setAttendanceMode("bulk")
    setShowAttendanceModal(true)
  }}
  className={`h-10 w-10 grid place-items-center rounded-lg border
    ${
      selectedSessions.length === 0
        ? "text-gray-400 border-gray-200 cursor-not-allowed"
        : "text-blue-600 border-blue-300 hover:bg-blue-50"
    }`}
>
  <FileText size={18} />
</button>

</th>


              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Check Box</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Day</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Class</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Attendance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>


                

                <tbody>
                  {lessons.map((lesson, i) => {
                    const formatLessonDate = (dateString) => {
                      if (!dateString) return "—"
                      const date = new Date(dateString)
                      if (Number.isNaN(date.getTime())) return "—"
                      const dateStr = date.toLocaleDateString("en-GB")
                      const timeStr = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                      return `${dateStr} ${timeStr}`
                    }

                    const getAttendanceColor = (status) => {
                      if (!status) return ""
                      switch (status.toLowerCase()) {
                        case "present": return "bg-green-100 text-green-800"
                        case "absent": return "bg-red-100 text-red-800"
                        case "late": return "bg-orange-100 text-orange-800"
                        case "nottaken": return "bg-gray-100 text-gray-500"
                        case "excused": return "bg-blue-100 text-blue-800"
                        default: return "bg-gray-100 text-gray-800"
                      }
                    }

                    const lessonDate = formatLessonDate(lesson.date || lesson.startTime)
                    const lessonTime = lesson.startTime && lesson.endTime
                      ? `${new Date(lesson.startTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}-${new Date(lesson.endTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                      : ""

                    const attendanceStatus = lesson.attendance || null
                    const displayAttendanceStatus = attendanceStatus && attendanceStatus.toLowerCase() !== "nottaken"
                      ? attendanceStatus
                      : null

                    return (
                      <tr key={lesson.scheduleId || i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
 <input
  type="checkbox"
  checked={isSessionSelected(
    lesson.scheduleId,
    lesson.date
  )}
  onChange={() =>
    toggleSession(
      lesson.scheduleId,
      lesson.date
    )
  }
/>

</td>

                        <td className="py-3 px-4 text-gray-700">
                          <div>{lessonDate}</div>
                          {lessonTime && <div className="text-xs text-gray-500">{lessonTime}</div>}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {lesson.dayOfWeek || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <div>
                              <div className="font-medium text-gray-900">{lesson.className || "Unnamed Class"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {displayAttendanceStatus ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceColor(displayAttendanceStatus)}`}>
                              {displayAttendanceStatus}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            disabled={selectedSessions.length !== 0}
                            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"
                            onClick={() => {
                              setAttendanceMode("single")
                              setSelectedLesson(lesson)
                              setShowAttendanceModal(true)
                            }}
                          >
                            <FileText size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 🔹 Pagination Controls Added */}
            <div className="flex items-center justify-between mt-6 px-4 bg-white py-3 border-t border-gray-100">
      {/* Left Side: Entries Info */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span>
        </p>
        
        {/* Page Size Selector (Optional as per screenshot) */}
        <select 
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
      </div>

      {/* Right Side: Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>

        {/* Dynamic Page Numbers */}
        {(() => {
          const pages = [];
          const totalPages = Math.ceil(totalCount / pageSize);
          
          for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
              pages.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-1.5 text-sm font-medium rounded border ${
                    currentPage === i
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i}
                </button>
              );
            } else if (i === currentPage - 2 || i === currentPage + 2) {
              pages.push(<span key={i} className="px-2">...</span>);
            }
          }
          return pages;
        })()}

        {/* Next Button */}
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage * pageSize >= totalCount}
          className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
          </>
        )}
      </div>
    )}


    
               

    {/* TABLE */}
    {classesSubTab === "classes" && (
      <div className="overflow-x-auto mt-4">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-300">
              <th className="text-left px-4 py-2">Class</th>
              <th className="text-left px-4 py-2">Teacher</th>
              {/* <th className="text-left px-4 py-2">Recurring Time</th> */}
              <th className="text-left px-4 py-2">Enrolled</th>
              <th className="text-left px-4 py-2">Unenrolled2</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {classes.map((cls: any, i: number) => {
              const formatDate = (d?: string | null) =>
                d ? new Date(d).toLocaleDateString("en-GB") : "—"

              const isUnenrolled =
                cls.EndDate && new Date(cls.EndDate) < new Date()

              return (
                <tr
                  key={cls.ClassId || i}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  {/* Class */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-500" />
                      <div>
                        <div className="font-medium text-blue-600">
                          {cls.ClassTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          {cls.ClassLevel}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Teacher */}
                  <td className="px-4 py-3 text-blue-600">
                    {cls.TeacherId}
                  </td>

                  {/* Recurring */}
                  {/* <td className="px-4 py-3 text-gray-700">
                    Monday (13:00–15:00), Thursday (13:00–15:00){" "}
                    <span className="text-blue-600 cursor-pointer">and more</span>
                  </td> */}

                  {/* Enrolled */}
                  <td className="px-4 py-3">
                    {formatDate(cls.StartDate)}
                  </td>

                  {/* Unenrolled */}
                  <td className="px-4 py-3">
                    {formatDate(cls.EndDate)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isUnenrolled
                        ? "bg-gray-200 text-gray-700"
                        : "bg-green-600 text-white"
                    }`}>
                      {isUnenrolled ? "INACTIVE" : "ACTIVE"}
                    </span>
                  </td>

                  {/* Actions */}
                   <td className="py-3 px-4">
                          <div className="relative class-menu-container">
                            <button 
                              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                const button = e.currentTarget
                                const rect = button.getBoundingClientRect()
                                if (openClassMenu === cls.ClassId) {
                                  setOpenClassMenu(null)
                                } else {
                                  setClassMenuPositions({
                                    ...classMenuPositions,
                                    [cls.ClassId]: {
                                      top: rect.bottom + 4,
                                      left: rect.right - 192 // 192px = w-48 (12rem)
                                    }
                                  })
                                  setOpenClassMenu(cls.ClassId)
                                }
                              }}
                            >
                      <MoreHorizontal size={16} />
                    </button>
                            {openClassMenu === cls.ClassId && classMenuPositions[cls.ClassId] && (
                              <div 
                                className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[100]"
                                style={{ 
                                  top: `${classMenuPositions[cls.ClassId].top}px`, 
                                  left: `${classMenuPositions[cls.ClassId].left}px` 
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenClassMenu(null)
                                    fetchLessons(cls.ClassId)
                                  }}
                                >
                                  <FileText size={16} />
                                  View lessons
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenClassMenu(null)
                                    // TODO: Implement view grades
                                  }}
                                >
                                  <Award size={16} />
                                  View grades
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenClassMenu(null)
                                    // TODO: Implement print report
                                  }}
                                >
                                  <Download size={16} />
                                  Print report
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenClassMenu(null)
                                    // TODO: Implement unenroll
                                    Swal.fire({
                                      title: "Unenroll Student",
                                      text: `Are you sure you want to unenroll ${studentName} from ${cls.ClassTitle}?`,
                                      icon: "warning",
                                      showCancelButton: true,
                                      confirmButtonColor: "#ef4444",
                                      cancelButtonColor: "#6b7280",
                                      confirmButtonText: "Yes, unenroll",
                                    }).then(async (result) => {
                                      if (result.isConfirmed) {
                                        try {
                                          const response = await axiosInstance.post("/Class/UnenrollStudentFromClass", null, {
                                            params: {
                                              studentId: parseInt(id!),
                                              classId: cls.ClassId
                                            }
                                          })
                                          if (response.data?.IsSuccess) {
                                            Swal.fire("Success", "Student unenrolled successfully", "success")
                                            // Refresh classes
                                            const refreshResponse = await axiosInstance.get("/Class/GetClassesByStudent", {
                                              params: { studentId: parseInt(id!) }
                                            })
                                            if (refreshResponse.data?.IsSuccess) {
                                              setClasses(refreshResponse.data.Data || [])
                                            }
                                          } else {
                                            Swal.fire("Error", response.data?.Message || "Failed to unenroll student", "error")
                                          }
                                        } catch (error: any) {
                                          console.error("Error unenrolling:", error)
                                          Swal.fire("Error", "Failed to unenroll student. Please try again.", "error")
                                        }
                                      }
                                    })
                                  }}
                                >
                                  <Trash2 size={16} />
                                  Unenroll
                                </button>
                              </div>
                            )}
                          </div>
                          </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
  
)



  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "bg-green-500"
      case "absent":
        return "bg-red-500"
      case "late":
        return "bg-yellow-500"
      case "excused":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  // Helper function to get border color for donut chart
  const getStatusBorderColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "border-green-500"
      case "absent":
        return "border-red-500"
      case "late":
        return "border-yellow-500"
      case "excused":
        return "border-blue-500"
      default:
        return "border-gray-500"
    }
  }

 const renderAttendanceContent = () => {
  // 1️⃣ Extract data
  const present = attendanceStats.find(s => s.Status === "Present")?.Percentage || 0;
  const absent = attendanceStats.find(s => s.Status === "Absent")?.Percentage || 0;
  const late = attendanceStats.find(s => s.Status === "Late")?.Percentage || 0;
  const excused = attendanceStats.find(s => s.Status === "Excused")?.Percentage || 0;

  // 2️⃣ Pie Data
  const pieData = [
    { label: "Present", value: present, color: "#4d8b31" },
    { label: "Absent", value: absent, color: "#c92a2a" },
    { label: "Late", value: late, color: "#ff9800" },
    { label: "Excused", value: excused, color: "#1e64f0" }
  ];

  // 3️⃣ Conic Gradient
  let cumulative = 0;
  const gradient = pieData
    .map(item => {
      const start = cumulative;
      cumulative += item.value;
      return `${item.color} ${start}% ${cumulative}%`;
    })
    .join(", ");

  // 4️⃣ Label positioning helper
  const getLabelPosition = (start: number, value: number) => {
    const angle = ((start + value / 2) * 360) / 100;
    const radius = 90; // distance from center
    const x = 50 + (radius * Math.cos((angle - 90) * Math.PI / 180)) / 100;
    const y = 50 + (radius * Math.sin((angle - 90) * Math.PI / 180)) / 100;
    return { left: `${x}%`, top: `${y}%` };
  };

  let running = 0;

  return (
    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded">
      {/* HEADER */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Attendance Distribution
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* ================= PIE CHART ================= */}
        {/* ================= PIE CHART ================= */}
<div className="flex justify-center">
  <div
    className="relative w-64 h-64 rounded-full"
    style={{ background: `conic-gradient(${gradient})` }}
  >
    {(() => {
      let running = 0;

      return pieData.map((item, index) => {
        if (item.value < 6) {
          running += item.value;
          return null; // ❌ skip tiny slices
        }

        const angle = ((running + item.value / 2) * 360) / 100;
        running += item.value;

        const radius = 42; // 🔥 push labels outward
        const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180);
        const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180);

        return (
          <div
            key={index}
            className="absolute text-white text-xs font-bold select-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              whiteSpace: "nowrap",
            }}
          >
            {item.value.toFixed(1)}%
          </div>
        );
      });
    })()}
  </div>
</div>


        {/* ================= TABLE ================= */}
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Duration</th>
                <th className="text-center py-3 px-2">Sessions</th>
                <th className="text-right py-3 px-2">Ratio</th>
              </tr>
            </thead>

            <tbody>
              {attendanceStats
                .filter(s => s.Status !== "None" && s.Status !== "NotTaken")
                .map((stat: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              stat.Status === "Present" ? "#4d8b31" :
                              stat.Status === "Absent" ? "#c92a2a" :
                              stat.Status === "Late" ? "#ff9800" :
                              "#1e64f0"
                          }}
                        />
                        <span className="font-medium text-gray-700">
                          {stat.Status}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-2 text-gray-500">
                      {stat.Time !== "0" ? stat.Time : "—"}
                    </td>

                    <td className="py-4 px-2 text-center text-gray-700">
                      {stat.Count}
                    </td>

                    <td className="py-4 px-2 text-right font-bold text-gray-900">
                      {stat.Percentage}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};


  const renderFeesContent = () => (
    <div className="bg-white border border-gray-200  p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fees</h2>
        </div>
        {/* Line-style tabs: Grouped / Individual */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3 w-full ml-6">
          {[
            {id:'grouped',label:'Grouped'},
            {id:'individual',label:'Individual fees'}
          ].map((t:any)=> (
            <button
              key={t.id}
              onClick={()=>setFeesTab(t.id)}
              className={`relative inline-flex items-center gap-2 px-3 h-10 text-sm ${feesTab===t.id? 'text-blue-700 font-medium':'text-gray-700 hover:text-gray-900'}`}
            >
              <span>{t.label}</span>
              {feesTab===t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
            </button>
          ))}
        </div>
      </div>

      {feesTab==='grouped' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Class fees */}
          <div className="text-center py-12">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign size={32} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Class fees</h3>
            <p className="text-gray-600 mb-4">Class fees will appear here when you enroll {studentName} in a class.</p>
            <button className="h-10 px-4  bg-blue-600 text-white text-sm inline-flex items-center gap-2">
              <Plus size={16} /> Enroll student
            </button>
          </div>

          {/* Additional fees */}
          <div className="text-center py-12">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText size={32} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional fees</h3>
            <p className="text-gray-600 mb-4">Add any other fees here, such as registration fees, exam fees, books, bus service etc.</p>
            <button className="h-10 px-4  bg-blue-600 text-white text-sm inline-flex items-center gap-2">
              <Plus size={16} /> Add fee
            </button>
          </div>
        </div>
      )}

      {feesTab==='individual' && (
        <div>
          {/* Simple table placeholder based on provided screenshots */}
          <div className="text-sm text-gray-600 mb-3">Breakdown of all of this student's fees</div>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {['', 'Due date', 'Description', 'Subtotal', 'Discount', 'Total', 'Status', 'Actions'].map(h=> (
                    <th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">No records found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  const renderReceiptsContent = () => (
    <div className="bg-white border border-gray-200  p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Receipts</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-3  bg-blue-600 text-white text-sm">Receipts</button>
          <button className="h-8 px-3  text-gray-700 hover:bg-gray-50 text-sm">Invoices</button>
          <button className="h-8 px-3  text-gray-700 hover:bg-gray-50 text-sm">Refund</button>
        </div>
      </div>
      
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Receipt size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add {studentName}'s first payment.</h3>
        <p className="text-gray-600 mb-4">{studentName}'s receipts will appear here once a payment is made.</p>
        <button className="h-10 px-4  bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New payment
        </button>
      </div>
    </div>
  )

  const renderRelatedContactsContent = () => (
    <div className="bg-white border border-gray-200  p-6 shadow-sm">
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Users size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add {studentName}'s relationships</h3>
        <p className="text-gray-600 mb-4">Add {studentName}'s mother, father and any other related contacts here.</p>
        <button className="h-10 px-4  bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Add relationship
        </button>
      </div>
    </div>
  )

  const renderNotesContent = () => (
    <div className="bg-white border border-gray-200  p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
            Note type: All <ChevronDown size={14} />
          </button>
          <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
            Note privacy: All <ChevronDown size={14} />
          </button>
          <button className="h-10 px-4  bg-blue-600 text-white text-sm inline-flex items-center gap-2">
            <Plus size={16} /> New note
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {[
          { author: "Asif Omer", date: "19-09-2025", category: "Communication", content: "An invitation email was sent to the Student.", privacy: "Admin" },
          { author: "Asif Omer", date: "07-08-2025", category: "Communication", content: "An invitation email was sent to the Student.", privacy: "Admin" }
        ].map((note, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{note.author}</span>
                <span className="text-sm text-gray-500">on {note.date}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{note.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{note.privacy}</span>
                <button className="h-6 w-6 grid place-items-center rounded hover:bg-gray-200">
                  <FileText size={14} />
                </button>
                <button className="h-6 w-6 grid place-items-center rounded hover:bg-gray-200">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              {note.content.split('invitation email').map((part, idx) => 
                idx === 0 ? part : (
                  <span key={idx}>
                    <span className="text-blue-600">invitation email</span>
                    {part}
                  </span>
                )
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const handleAddAttachment = async (formData: FormData) => {
    setUploadingAttachment(true)
    try {
      // The API expects [FromForm] List<Attachment>
      // Endpoint is AddDocuments (plural) and expects a list
      const response = await axiosInstance.post("/Attachment/AddDocuments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data?.IsSuccess) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Attachment added successfully",
          confirmButtonColor: "#2563eb",
        })
        setShowAddAttachmentModal(false)
        // Refresh attachments list
        if (activeTab.toLowerCase() === "attachments" && id) {
          const refreshResponse = await axiosInstance.get(`/Attachment/GetByStudentId`, {
            params: { studentId: id }
          })
          if (refreshResponse.data?.IsSuccess) {
            const raw = refreshResponse.data.Data
            const list = Array.isArray(raw) ? raw : Array.isArray(raw?.Data) ? raw.Data : Array.isArray(raw?.Items) ? raw.Items : []
            setAttachments(list)
          }
        }
      } else {
        Swal.fire("Error", response.data?.Message || "Failed to add attachment", "error")
      }
    } catch (error: any) {
      console.error("Error adding attachment:", error)
      Swal.fire(
        "Error",
        error.response?.data?.Message || "Failed to add attachment. Please try again.",
        "error"
      )
    } finally {
      setUploadingAttachment(false)
    }
  }

  const renderAttachmentsContent = () => (
    <div className="bg-white border border-gray-200  p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attachments</h2>
          <p className="text-gray-600 mt-1">You can add and store relevant documents and files here.</p>
        </div>
        <button
          onClick={() => setShowAddAttachmentModal(true)}
          className="h-10 px-4  bg-blue-600 text-white text-sm inline-flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} /> Add attachment
        </button>
      </div>

      {loadingAttachments ? (
        <div className="py-12 text-center text-gray-500">
          Loading attachments...
        </div>
      ) : attachments.length === 0 ? (
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Paperclip size={32} className="text-blue-600" />
        </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No attachments yet</h3>
          <p className="text-gray-600 mb-4">Add your first attachment to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attachments.map((attachment) => (
            <div
              key={attachment.Id}
              className="border border-gray-200  p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Paperclip size={20} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {attachment.FileName || attachment.URL?.split("/").pop() || attachment.FileUrl?.split("/").pop() || "Attachment"}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={16} />
        </button>
      </div>
              {attachment.CreatedOn && (
                <div className="text-xs text-gray-500">
                  {new Date(attachment.CreatedOn).toLocaleDateString("en-GB")}
                </div>
              )}
              {(attachment.URL || attachment.FileUrl) && (
                <a
                  href={attachment.URL || attachment.FileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                >
                  View file
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderAssignmentsContent = () => (
    <div className="bg-white border border-gray-200  p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Assignments</h2>
        <p className="text-gray-600">View this student's assignments.</p>
      </div>
      
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <BookOpen size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignments</h3>
        <p className="text-gray-600">Assignments will appear here when the student has uploaded them.</p>
      </div>
    </div>
  )

  const renderGradesContent = () => (
    <div className="bg-white border border-gray-200  p-6 shadow-sm">
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Award size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{studentName}'s Grade Results</h3>
        <p className="text-gray-600">{studentName}'s grades will appear here when their result have been added to a gradebook.</p>
      </div>
    </div>
  )

  const renderCreateDocumentsContent = () => (
    <div className="space-y-6">
      {/* Documents List */}
    <div className="bg-white border border-gray-200  p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create documents</h2>
      </div>
      
        {loadingDocuments ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading documents...</div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No documents found</h3>
            <p className="text-gray-600">Create document templates in the Documents section first.</p>
          </div>
        ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {documents.map((doc) => (
              <button
                key={doc.Id}
                onClick={() => setSelectedDocument(doc)}
                className="h-12 px-3  bg-blue-50 text-blue-700 text-sm hover:bg-blue-100 transition-colors text-left"
              >
                {doc.Title || "Untitled Document"}
          </button>
        ))}
          </div>
        )}
      </div>
    </div>
  )

  // Helper function to wait for fonts to load
  const waitForFonts = async (): Promise<void> => {
    if ('fonts' in document) {
      try {
        await (document as any).fonts.ready
        // Additional wait to ensure fonts are fully rendered
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.warn("Font loading check failed, continuing anyway:", error)
      }
    }
  }

  // Helper function to ensure all styles are computed
  const ensureStylesComputed = (element: HTMLElement): void => {
    // Force style computation by accessing computed styles
    window.getComputedStyle(element)
    // Also check all child elements
    const allElements = element.querySelectorAll('*')
    allElements.forEach(el => {
      window.getComputedStyle(el as Element)
    })
  }

  const handlePrintDocument = async () => {
    if (!documentContentRef.current || !selectedDocument) return

    try {
      // Ensure signature image is converted to base64 if not already (only when including signature)
      if (includeSignature && selectedSignatureId && signatures.length > 0) {
        const selectedSignature = signatures.find((sig) => sig.id === selectedSignatureId)
        if (selectedSignature && selectedSignature.signatureUrl) {
          let base64ToUse = signatureBase64Map[selectedSignature.id]
          
          // If base64 not in state, convert it now
          if (!base64ToUse) {
            console.log("Converting signature image to base64 before PDF generation...")
            const base64 = await imageUrlToBase64(selectedSignature.signatureUrl)
            if (base64) {
              base64ToUse = base64
              setSignatureBase64Map(prev => ({ ...prev, [selectedSignature.id]: base64 }))
            }
          }
          
          // Directly update the image src in the DOM to ensure it's set
          if (base64ToUse && documentContentRef.current) {
            const signatureImages = documentContentRef.current.querySelectorAll('img')
            signatureImages.forEach(img => {
              // Check if this is the signature image (it should have the signature name as alt or be in the signature section)
              const parentText = img.closest('div')?.textContent || ''
              if (parentText.includes(selectedSignature.name) || img.alt === selectedSignature.name) {
                console.log("Updating signature image src directly in DOM")
                img.src = base64ToUse
              }
            })
            // Wait for image to update
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }
      }

      // Wait for all images to load
      const images = documentContentRef.current.querySelectorAll('img')
      const imagePromises = Array.from(images).map((img) => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve(img)
            return
          }
          
          const loadHandler = () => resolve(img)
          const errorHandler = () => resolve(img) // Continue anyway
          
          img.addEventListener('load', loadHandler, { once: true })
          img.addEventListener('error', errorHandler, { once: true })
        })
      })

      await Promise.all(imagePromises)
      
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 200))

      // Create PDF using jsPDF html() method - single page only
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      
      await pdf.html(documentContentRef.current, {
        callback: (doc) => {
          try {
            // Remove any extra pages that might have been created
            const totalPages = (doc as any).internal.pages.length
            if (totalPages > 1) {
              for (let i = totalPages; i > 1; i--) {
                doc.deletePage(i)
              }
            }

            // Open the PDF in a new tab and trigger the browser print dialog
            const blobUrl = doc.output("bloburl")
            const printWindow = window.open(blobUrl, "_blank")

            if (printWindow) {
              printWindow.onload = () => {
                printWindow.focus()
                printWindow.print()
              }
            }
          } catch (printError) {
            console.error("Failed to open print dialog", printError)
          }
        },
        x: 0,
        y: 0,
        width: pageWidth,
        windowWidth: documentContentRef.current.scrollWidth,
        html2canvas: {
          scale: 0.264583, // Convert pixels to mm
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          height: documentContentRef.current.scrollHeight,
          width: documentContentRef.current.scrollWidth
        },
        autoPaging: 'slice' // Prevent auto page breaks
      })
    } catch (error) {
      console.error("Failed to generate PDF", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Unable to generate PDF. Please try again.",
        confirmButtonColor: "#2563eb"
      })
    }
  }

  const handleSendDocument = async () => {
    if (!documentContentRef.current || !selectedDocument || !id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Missing required information to send document.",
        confirmButtonColor: "#2563eb"
      })
      return
    }

    try {
      // Show loading alert
      Swal.fire({
        title: "Generating PDF...",
        text: "Please wait while we prepare your document.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      // Ensure signature image is converted to base64 if not already (only when including signature)
      if (includeSignature && selectedSignatureId && signatures.length > 0) {
        const selectedSignature = signatures.find((sig) => sig.id === selectedSignatureId)
        if (selectedSignature && selectedSignature.signatureUrl) {
          let base64ToUse = signatureBase64Map[selectedSignature.id]
          
          if (!base64ToUse) {
            console.log("Converting signature image to base64 before PDF generation...")
            const base64 = await imageUrlToBase64(selectedSignature.signatureUrl)
            if (base64) {
              base64ToUse = base64
              setSignatureBase64Map(prev => ({ ...prev, [selectedSignature.id]: base64 }))
            }
          }
          
          if (base64ToUse && documentContentRef.current) {
            const signatureImages = documentContentRef.current.querySelectorAll('img')
            signatureImages.forEach(img => {
              const parentText = img.closest('div')?.textContent || ''
              if (parentText.includes(selectedSignature.name) || img.alt === selectedSignature.name) {
                console.log("Updating signature image src directly in DOM")
                img.src = base64ToUse
                img.style.display = 'none'
                img.offsetHeight
                img.style.display = 'block'
              }
            })
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
      }

      // Wait for all images to load
      const images = documentContentRef.current.querySelectorAll('img')
      const imagePromises = Array.from(images).map((img) => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve(img)
            return
          }
          
          const loadHandler = () => resolve(img)
          const errorHandler = () => resolve(img) // Continue anyway
          
          img.addEventListener('load', loadHandler, { once: true })
          img.addEventListener('error', errorHandler, { once: true })
        })
      })

      await Promise.all(imagePromises)
      
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 200))

      // Generate PDF using jsPDF html() method - single page only
      const pdf = new jsPDF("p", "mm", "a4")
      const pageHeight = pdf.internal.pageSize.getHeight()
      const pageWidth = pdf.internal.pageSize.getWidth()
      
      await pdf.html(documentContentRef.current, {
        callback: async (doc) => {
          try {
            // Remove any extra pages that might have been created
            const totalPages = (doc as any).internal.pages.length
            if (totalPages > 1) {
              for (let i = totalPages; i > 1; i--) {
                doc.deletePage(i)
              }
            }
            
            // Convert PDF to Blob
            const pdfBlob = doc.output('blob')
            const sanitizedTitle = (selectedDocument.Title || "student-document").replace(/[^a-z0-9]+/gi, "-").toLowerCase()
            const pdfFile = new File([pdfBlob], `${sanitizedTitle}.pdf`, { type: 'application/pdf' })

            // Create FormData
            const formData = new FormData()
            formData.append("Id", "0")
            formData.append("FileDetails", pdfFile)
            formData.append("FileType", "pdf")
            formData.append("FolderName", "documents")
            formData.append("StudentName", studentName || "")
            formData.append("StudentID", String(id))
            formData.append("IsDeleted", "false")

            // Update loading message
            Swal.fire({
              title: "Sending document...",
              text: "Please wait while we send the document via email.",
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading()
              }
            })

            // Send to API
            const response = await axiosInstance.post("/Account/UploadPdfAndSendEmail", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })

            if (response.data?.IsSuccess) {
              Swal.fire({
                icon: "success",
                title: "Success",
                text: response.data?.Message || "Document sent successfully via email.",
                confirmButtonColor: "#2563eb"
              })
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.data?.Message || "Failed to send document via email.",
                confirmButtonColor: "#2563eb"
              })
            }
          } catch (callbackError: any) {
            console.error("Error in PDF callback", callbackError)
            Swal.fire({
              icon: "error",
              title: "Error",
              text: callbackError.response?.data?.Message || callbackError.message || "Unable to send document. Please try again.",
              confirmButtonColor: "#2563eb"
            })
          }
        },
        x: 0,
        y: 0,
        width: pageWidth,
        windowWidth: documentContentRef.current.scrollWidth,
        html2canvas: {
          scale: 0.264583, // Convert pixels to mm
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          height: documentContentRef.current.scrollHeight,
          width: documentContentRef.current.scrollWidth
        },
        autoPaging: 'slice' // Prevent auto page breaks
      })
    } catch (error: any) {
      console.error("Failed to send document", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.Message || error.message || "Unable to send document. Please try again.",
        confirmButtonColor: "#2563eb"
      })
    }
  }

  const renderDocumentModal = () => {
    if (!selectedDocument) return null
    const todayDisplay = formatDateValue(new Date().toISOString())
    
    // Process document body with placeholders replaced
    const processedBody = replacePlaceholders(selectedDocument.Body || "")
    const processedFooter = replacePlaceholders(selectedDocument.Footer || "")

    const processedTo = selectedDocument.To 
? replacePlaceholders(selectedDocument.To) 
: (isReferenceLetter ? "\nTo:\nGarda National Immigration Bureau,\n13-14 Burgh Quay, Dublin 2." : "");

    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setSelectedDocument(null)}>
        <div className="w-full max-w-5xl bg-white border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create document</h3>
            <button onClick={() => setSelectedDocument(null)} className="h-8 w-8 grid place-items-center hover:bg-gray-100">
              <span className="text-gray-500">×</span>
            </button>
          </div>
          <div className="p-4 max-h-[85vh] overflow-auto bg-gray-100">
            <div className="flex justify-center items-start w-full">
              <div
                ref={documentContentRef}
                className="bg-white shadow-sm"
                style={{ 
                  width: "210mm",
                  maxWidth: "210mm",
                  height: "297mm",
                  maxHeight: "297mm",
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: "9pt",
                  lineHeight: "1.3",
                  color: "#000000",
                  boxSizing: "border-box",
                  padding: "8mm 8mm",
                  margin: "0 auto",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
              {/* Date */}
              <div style={{ 
                fontSize: "13pt", 
                lineHeight: "1", 
                fontFamily: "'Times New Roman', Times, serif",
                marginBottom: "4px"
              }}>
                Date: {todayDisplay}
              </div>
              
              {/* Main Content Container */}
              <div style={{ 
                height: "calc(100% - 20px)",
                boxSizing: "border-box",
                display: "flex",
                marginTop: "140px",
                flexDirection: "column"
              }}>
                {/* To/Recipient */}
                {processedTo && (
                  <div
                    className="mb-1 whitespace-pre-wrap"
                    style={{
                      fontSize: "12pt",
                      lineHeight: "1.2",
                      fontFamily: "'Times New Roman', Times, serif",
                      fontWeight: "bold",
                    }}
                  >
                    {processedTo}
                  </div>
                )}

                {/* Title – in letter/PDF show only text before " - " (e.g. "Certificate of Attendance"); full title stays in document list UI */}
                <h2 className="mb-2 font-bold" style={{ 
                  fontSize: "12pt",
                  textAlign: "center",
                  marginTop: ".1px",
                  marginBottom: "1px",
                  lineHeight: "1.2",
                  fontFamily: "'Times New Roman', Times, serif"
                }}>
                  {(() => {
                    const t = selectedDocument.Title || "Document"
                    const idx = t.indexOf(" - ")
                    return idx > 0 ? t.slice(0, idx).trim() : t
                  })()}
                </h2>

                {/* Body Content */}
                <div className="mb-3 whitespace-pre-wrap" style={{ 
                  fontSize: "12pt", 
                  lineHeight: "1.2",
                  textAlign: "left",
                  fontFamily: "'Times New Roman', Times, serif"
                }}>
                  {processedBody || "No content available."}
                </div>

                {/* Student Details Table */}
                <div className="mb-1" style={{ flexShrink: 0 }}>
                  <table className="w-full" style={{ 
                    borderCollapse: "collapse",
                    fontSize: "12px",
                    width: "100%",
                    // Use standard PDF-safe fonts to avoid spacing issues in jsPDF/html2canvas
                    fontFamily: "Arial, Helvetica, sans-serif",
                  }}>
                
                    <tbody>
                      {defaultFieldKeys.map((fieldKey) => {
                        const isAddressRow = fieldKey === "Address"
                        return (
                          <tr key={fieldKey}>
                            <td
                              className="font-medium"
                              style={{ 
                                border: "0.1px solid black",
                                padding: "0px 6px 8px 6px",
                                backgroundColor: "#ffffff",
                                width: "26%",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontWeight: "bold",
                                fontSize: "12px",
                              }}
                            >
                              {fieldKey}
                            </td>
                            <td
                              style={{ 
                                border: "0.1px solid black",
                                padding: "0px 6px 8px 6px",
                                backgroundColor: "#ffffff",
                                width: "65%",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontWeight: "normal",
                                whiteSpace: isAddressRow ? "nowrap" : "normal",
                              }}
                            >
                              {getStudentFieldValue(fieldKey)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {processedFooter && (
                  <div className=" whitespace-pre-wrap " style={{ 
                    fontSize: "12pt", 
                    lineHeight: "1.2",
                    textAlign: "left",
                    fontFamily: "'Times New Roman', Times, serif",
                    position: "relative",
                    zIndex: 10,
                    marginBottom: "1px"
                  }}>
                    {processedFooter}
                  </div>
                )}

              {/* Selected Signature Display in Document - Positioned below footer */}
                {includeSignature && selectedSignatureId && signatures.length > 0 && (() => {
                  const selectedSignature = signatures.find((sig) => sig.id === selectedSignatureId)
                  if (selectedSignature) {
                    // Use base64 version if available, otherwise fallback to URL
                    const signatureImageSrc = signatureBase64Map[selectedSignature.id] || selectedSignature.signatureUrl
                    
                    if (signatureImageSrc) {
                      return (
                        <div style={{ 
                          marginTop: "0px",
                          marginBottom: "0px",
                          position: "relative",
                          zIndex: 1
                        }}>
                          <div className="flex">
                            <div className="text-left">
                              <img
                                src={signatureImageSrc}
                                alt={selectedSignature.name}
                                className="block"
                                style={{ 
                                  maxHeight: "100px",
                                  objectFit: "contain"
                                }}
                                onLoad={(e) => {
                                  console.log("Signature image loaded successfully")
                                }}
                                onError={(e) => {
                                  console.error("Signature image failed to load")
                                  const target = e.currentTarget as HTMLImageElement
                                  target.style.display = "none"
                                }}
                              />
                              {selectedSignature.name && (
                                <div className="mt-0.5 font-medium" style={{ 
                                  fontSize: "9pt",
                                  color: "#000000",
                                  lineHeight: "0",
                                  fontFamily: "'Times New Roman', Times, serif",
                                  textTransform: "capitalize"
                                }}>
                                  {selectedSignature.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    }
                  }
                  return null
                })()}
              </div>
            </div>
            </div>

            {/* Signature Selection Section - Outside document content */}
            {signatures.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Select Signature</h4>
                  <p className="text-xs text-gray-500">Click on a signature to select it. Only the selected signature will appear in the document.</p>
                </div>
                {loadingSignatures ? (
                  <div className="text-center py-4 text-sm text-gray-500">Loading signatures...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {signatures.map((signature) => {
                      const isSelected = selectedSignatureId === signature.id
                      return (
                        <div
                          key={signature.id}
                          onClick={() => setSelectedSignatureId(signature.id)}
                          className={`relative cursor-pointer border-2  p-3 transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white opacity-50 hover:opacity-75"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle size={14} className="text-white" />
                            </div>
                          )}
                          <div className="text-xs font-medium text-gray-700 mb-2 text-center">
                            {signature.name}
                          </div>
                          <div className="flex items-center justify-center min-h-[80px] bg-gray-50 rounded border border-gray-200 p-2">
                            {signature.signatureUrl ? (
                              <img
                                src={signature.signatureUrl}
                                alt={signature.name}
                                className={`max-w-full max-h-16 object-contain transition-all ${
                                  !isSelected ? "opacity-30 blur-sm" : "opacity-100"
                                }`}
                                crossOrigin="anonymous"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement
                                  target.style.display = "none"
                                }}
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">No image</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            {/* Signature toggle */}
            <label className="inline-flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
              />
              <span>Include signature in document</span>
            </label>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button className="h-10 px-4  border border-blue-200 bg-blue-50 text-blue-700 text-sm inline-flex items-center gap-2">
                <FilePlus size={16} /> Save to students profile
              </button>
              <button
                onClick={handleSendDocument}
                className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2"
                disabled={!selectedDocument || !id}
              >
                <Mail size={16} /> Send document
              </button>
              <button
                onClick={handlePrintDocument}
                className="h-10 px-4  border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2"
              >
                <Download size={16} /> Print
              </button>
              <button
                onClick={() => setSelectedDocument(null)}
                className="h-10 px-4  bg-gray-800 text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const openAddHolidayModal = () => {
    setEditingHoliday(null)
    setHolidayForm({ note: "", fromDate: "", toDate: "" })
    setShowHolidayModal(true)
  }

  const openEditHolidayModal = (h: { Id: number; Note?: string | null; FromDate?: string | null; ToDate?: string | null }) => {
    setEditingHoliday(h)
    setHolidayForm({
      note: h.Note ?? "",
      fromDate: h.FromDate ? h.FromDate.split("T")[0] : "",
      toDate: h.ToDate ? h.ToDate.split("T")[0] : "",
    })
    setShowHolidayModal(true)
  }

  const closeHolidayModal = () => {
    setShowHolidayModal(false)
    setEditingHoliday(null)
    setHolidayForm({ note: "", fromDate: "", toDate: "" })
  }

  const saveHoliday = async () => {
    if (!id) return
    if (!holidayForm.fromDate || !holidayForm.toDate) {
      Swal.fire({ title: "Required", text: "Please enter From date and To date.", icon: "warning" })
      return
    }
    setSavingHoliday(true)
    try {
      const payload = {
        Id: editingHoliday?.Id ?? 0,
        StudentId: Number(id),
        Note: holidayForm.note.trim() || null,
        FromDate: new Date(holidayForm.fromDate).toISOString(),
        ToDate: new Date(holidayForm.toDate).toISOString(),
        IsDeleted: false,
      }
      await axiosInstance.post("/Holiday/AddOrUpdateStudentHoliday", payload)
      Swal.fire({ title: "Saved", text: editingHoliday ? "Holiday updated." : "Holiday added.", icon: "success" })
      closeHolidayModal()
      if (activeTab.toLowerCase() === "holidays") {
        const res = await axiosInstance.get("/Holiday/GetStudentHolidays", { params: { studentId: Number(id) } })
        if (res.data?.IsSuccess && Array.isArray(res.data.Data)) setHolidays(res.data.Data)
      }
    } catch (err: any) {
      Swal.fire({ title: "Error", text: err?.message ?? "Failed to save holiday.", icon: "error" })
    } finally {
      setSavingHoliday(false)
    }
  }

  const deleteHoliday = async (h: { Id: number; StudentId?: number; Note?: string | null; FromDate?: string | null; ToDate?: string | null }) => {
    const confirmed = await Swal.fire({
      title: "Delete holiday?",
      text: "This will remove this holiday record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    })
    if (!confirmed.isConfirmed) return
    try {
      await axiosInstance.post("/Holiday/AddOrUpdateStudentHoliday", {
        Id: h.Id,
        StudentId: h.StudentId ?? Number(id),
        Note: h.Note,
        FromDate: h.FromDate,
        ToDate: h.ToDate,
        IsDeleted: true,
      })
      Swal.fire({ title: "Deleted", text: "Holiday removed.", icon: "success" })
      const res = await axiosInstance.get("/Holiday/GetStudentHolidays", { params: { studentId: Number(id) } })
      if (res.data?.IsSuccess && Array.isArray(res.data.Data)) setHolidays(res.data.Data)
    } catch (err: any) {
      Swal.fire({ title: "Error", text: err?.message ?? "Failed to delete.", icon: "error" })
    }
  }

  const renderHolidaysContent = () => (
    <div className="bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Holidays for {studentName}</h3>
        <button
          type="button"
          onClick={openAddHolidayModal}
          className="h-10 px-4 bg-blue-600 text-white text-sm inline-flex items-center gap-2 rounded hover:bg-blue-700"
        >
          <Plus size={16} /> Add holiday
        </button>
      </div>
      {loadingHolidays ? (
        <div className="py-8 text-center text-gray-500 text-sm">Loading holidays...</div>
      ) : holidaysError ? (
        <div className="py-8 text-center text-red-600 text-sm">{holidaysError}</div>
      ) : holidays.length === 0 ? (
        <div className="py-8 text-center text-gray-500 text-sm">No holidays recorded. Click &quot;Add holiday&quot; to add one.</div>
      ) : (
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700 border-b border-gray-200">From</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 border-b border-gray-200">To</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 border-b border-gray-200">Note</th>
              <th className="px-4 py-2 text-right font-medium text-gray-700 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.Id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-4 py-2 text-gray-900">{formatDateValue(h.FromDate)}</td>
                <td className="px-4 py-2 text-gray-900">{formatDateValue(h.ToDate)}</td>
                <td className="px-4 py-2 text-gray-700">{h.Note || "—"}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => openEditHolidayModal(h)}
                    className="text-blue-600 hover:underline text-sm mr-3"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteHoliday(h)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{editingHoliday ? "Edit holiday" : "Add holiday"}</h3>
              <button type="button" onClick={closeHolidayModal} className="p-1 text-gray-500 hover:text-gray-700" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From date *</label>
                <input
                  type="date"
                  value={holidayForm.fromDate}
                  onChange={(e) => setHolidayForm((f) => ({ ...f, fromDate: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To date *</label>
                <input
                  type="date"
                  value={holidayForm.toDate}
                  onChange={(e) => setHolidayForm((f) => ({ ...f, toDate: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={holidayForm.note}
                  onChange={(e) => setHolidayForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Optional note (e.g. reason, destination)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={closeHolidayModal} className="h-9 px-4 border border-gray-300 rounded-lg text-sm hover:bg-gray-100">
                Cancel
              </button>
              <button type="button" onClick={saveHoliday} disabled={savingHoliday} className="h-9 px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {savingHoliday ? "Saving..." : editingHoliday ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )


  

  const renderProfileContent = () => {
  const Row3 = ({
    label1,
    value1,
    sub1,
    label2,
    value2,
    sub2,
    label3,
    value3,
    sub3,
  }: {
    label1: string
    value1?: React.ReactNode
    sub1?: React.ReactNode
    label2?: string
    value2?: React.ReactNode
    sub2?: React.ReactNode
    label3?: string
    value3?: React.ReactNode
    sub3?: React.ReactNode
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-200">
      {[{ label: label1, value: value1, sub: sub1 },
        { label: label2, value: value2, sub: sub2 },
        { label: label3, value: value3, sub: sub3 }].map(
        (col, i) => (
          <div key={i} className="px-6 py-4">
            {col.label && (
              <>
                <div className="text-sm text-gray-500">
                  {col.label}
                </div>
                <div className="text-sm text-gray-900 mt-1">
                  {col.value ?? "-"}
                </div>
                {col.sub && (
                  <div className="text-xs text-gray-500 mt-1">
                    {col.sub}
                  </div>
                )}
              </>
            )}
          </div>
        )
      )}
    </div>
  )

  return (
    <div className="bg-white border border-gray-200">

      {/* CONTACT */}
      <Row3
        label1="Mobile Phone"
        value1={studentdetails?.MobilePhone}
        label2="Home Phone"
        value2={studentdetails?.HomePhone}
        label3="Email"
        value3={studentdetails?.Email}
      />

      {/* DATES */}
      <Row3
        label1="Registration Date"
        value1={formatDateValue(studentdetails?.RegistrationDate)}
        label2="Date of Birth"
        value2={formatDateValue(studentdetails?.DateOfBirth)}
        label3="Id. Number"
        value3={studentdetails?.IdNumber}
      />

      {/* ADDRESS / PAYMENT */}
      <Row3
        label1="Address"
        value1={[
          studentdetails?.StreetAddress,
          studentdetails?.City,
          studentdetails?.ZipCode,
          studentdetails?.Country,
        ].filter(Boolean).join(", ")}
        label2="Preferred Payment Method"
        value2={studentdetails?.PreferredPaymentMethod}
        label3="Discount"
        value3={
          studentdetails?.Discount !== null
            ? `${studentdetails?.Discount}%`
            : "0%"
        }
      />

      {/* NOTES */}
      <Row3
        label1="General Notes"
        value1={studentdetails?.GeneralNotes}
        label2="Medical Notes"
        value2={studentdetails?.MedicalNotes}
        label3="Class Subjects"
        value3={studentdetails?.ClassSubject}
      />

      {/* CLASS */}
      <Row3        
        label1="Class Levels"
        value1={studentdetails?.ClassLevel}
        label2="Course Code"
        value2={studentdetails?.CourseCode}
        label3="External Exam"
        value3={studentdetails?.ExternalExam}
      />

      {/* IDENTITY */}
      <Row3
        label1="Nationality"
        value1={studentdetails?.Nationality}
        label2="Passport Number"
        value2={studentdetails?.PassportNumber}
        label3="Passport Expiry Date"
        value3={formatDateValue(studentdetails?.PassportExpiryDate)}
      />

      {/* COURSE DATES */}
      <Row3
        label1="GNIB Expiry Date"
        value1={formatDateValue(studentdetails?.GnibExpiryDate)}
        label2="Course Start Date"
        value2={formatDateValue(studentdetails?.CourseStartDate)}
        label3="Course End Date"
        value3={formatDateValue(studentdetails?.CourseEndDate)}
      />

      {/* COURSE INFO */}
      <Row3
        label1="Finished Course Date"
        value1={formatDateValue(studentdetails?.FinishedCourseDate)}
        label2="Attendance"
        value2={studentdetails?.Attendance}
        label3="Course Title"
        value3={studentdetails?.CourseTitle}
      />

      <Row3
        label1="Course Level"
        value1={studentdetails?.CourseLevel}
        label2="Mode of Study"
        value2={studentdetails?.ModeOfStudy}
        label3="Number of Weeks"
        value3={
          studentdetails?.NumberOfWeeks
            ? `${studentdetails.NumberOfWeeks} Weeks`
            : "-"
        }
      />

      <Row3
        label1="Hours Per Week"
        value1={studentdetails?.HoursPerWeek}
        label2="Tuition Fees"
        value2={studentdetails?.TuitionFees}
        label3="Department"
        value3={studentdetails?.Department}
      />

      {/* <Row3
        label1="Course Code"
        value1={studentdetails?.CourseCode}
        label2="External Exam"
        value2={studentdetails?.ExternalExam}
      /> */}

      {/* EXAM */}
      <Row3
        label1="Date of External Exam"
        value1={formatDateValue(studentdetails?.ExternalExamDate)}
        label2="Score External Exam"
        value2={studentdetails?.ScoreExternalExam}
        label3="Date of Payment"
        value3={formatDateValue(studentdetails?.DateOfPayment)}
      />

      <Row3
        label1="Duration"
        value1={studentdetails?.Duration}
        label2="Schedule"
        value2={studentdetails?.Schedule}
        label3="ILEP reference number"
        value3={studentdetails?.IlepReference}
      />

  <Row3
  label1="End of Exam paid"
  value1={studentdetails?.EndOfExamPaid}
  label2="Course Number"
  value2={(() => {
    const map: Record<string, string> = {
      FirstCourse: "First Course",
      Renewal: "Renewal",
      LastCourse: "Last Course",
    };
    return studentdetails?.CourseNumber
      ? map[studentdetails.CourseNumber] ?? studentdetails.CourseNumber
      : "-";
  })()}
  label3="School Portal"
  value3={
    <div className="">
      <div className="text-xs text-gray-500">
        Enable or disable the student's access to your portal.
      </div>
    </div>
  }
/>

<Row3
  label1="Access to School Portal"
  value1={
    <span className="inline-flex items-center gap-2">
      <span className="w-10 h-5 bg-blue-600 rounded-full relative">
        <span className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
      </span>
      ON
    </span>
  }
  label2="Invitation"
  value2={
    <button
      onClick={handleInviteToPortal}
      disabled={invitingToPortal}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        inviteSentSuccess
          ? "bg-emerald-600 text-white cursor-default"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
      } disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {invitingToPortal ? (
        <>
          <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Sending…
        </>
      ) : inviteSentSuccess ? (
        <>✓ Invited to Portal</>
      ) : (
        <>Invite to Portal</>
      )}
    </button>
  }
  label3="Last Login"
  value3="never"
  sub3="Abdullah has not signed up yet!"
/>

<Row3
  label1="Automatic Reminders"
  value1={
    <span className="inline-flex items-center gap-2">
      <span className="w-10 h-5 bg-blue-600 rounded-full relative">
        <span className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
      </span>
      ON
    </span>
  }
  label2="Username"
  value2={studentdetails?.Username || "not set"}
  label3="Password"
  value3="not set"
/>
      

      

      {/* FOOTER */}
      <div className="px-6 py-3 text-xs text-gray-500 bg-gray-50">
        Created By: {studentdetails?.CreatedByName || "Asif Omer"} <br />
        Created Date: {formatDateValue(studentdetails.CreatedOn) || "-"} <br />
      </div>
    </div>
  )
}


  

  // Show loading state if studentdetails is not loaded yet
  if (!studentdetails) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading student profile...
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-6">
        
        {/* Header card */}
        {/* PAGE TITLE + ACTIONS */}
<div className="flex items-center justify-between mb-4">
  <h1 className="text-2xl font-semibold text-gray-800">
    Student Profile
  </h1>

  <div className="flex items-center gap-2">
    <div className="flex items-center gap-2 relative">

    <div 
    className="flex items-center gap-2 h-9 px-3 border border-gray-300 bg-white rounded shadow-sm cursor-pointer hover:bg-gray-50 relative"
    onClick={() => setShowAttendanceDropdown(!showAttendanceDropdown)}
  >
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance:</span>
    <span className={`text-sm font-bold flex items-center gap-1 ${
      stats.percentage >= 85 ? 'text-green-600' : 
      stats.percentage >= 75 ? 'text-orange-600' : 'text-red-600'
    }`}>
      {loadingAttendanceStats ? "..." : `${stats.percentage.toFixed(1)}%`}
      <ChevronDown size={14} className="text-gray-400" />
    </span>

    {/* Dropdown Menu */}
    {showAttendanceDropdown && (
      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-md z-[100] py-2">
        <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
          Stats Breakdown
        </div>
        
        {/* Present (Default) */}
        <div className="px-4 py-2 flex justify-between hover:bg-gray-50">
          <span className="text-sm text-gray-700">Present</span>
          <span className="text-sm font-bold text-green-600">{stats.percentage}%</span>
        </div>

        {/* Other Statuses */}
        {attendanceStats
          .filter(s => s.Status !== "Present" && s.Status !== "None" && s.Status !== "NotTaken")
          .map((stat, idx) => (
            <div key={idx} className="px-4 py-2 flex justify-between hover:bg-gray-50 border-t border-gray-50">
              <span className="text-sm text-gray-700">{stat.Status}</span>
              <span className={`text-sm font-bold ${
                stat.Status === 'Absent' ? 'text-red-600' : 
                stat.Status === 'Late' ? 'text-orange-500' : 'text-blue-600'
              }`}>
                {stat.Percentage}%
              </span>
            </div>
          ))}
      </div>
    )}
  </div>

  {/* NEW: Email Status Warning Badge */}
  {emailStatus && emailStatus !== "None" && (
  <div 
    onClick={handleSendWarning}
    className="group flex items-center gap-2 h-9 px-3 border border-red-200 bg-red-50 rounded shadow-sm cursor-pointer hover:bg-red-100 transition-all active:scale-95"
  >
    <Flag size={14} className="text-red-600 group-hover:rotate-12 transition-transform" />
    <span className="text-xs font-bold text-red-700 uppercase tracking-tight">
      {getEmailStatusLabel(emailStatus)}
    </span>
    {/* Clean hover indicator */}
    <span className="text-[10px] text-red-400 font-medium hidden group-hover:inline ml-1 border-l border-red-200 pl-2">
      {emailStatus === "FinalWarning" ? "Click for options" : "Click to resend"}
    </span>
  </div>
)}

  <button className="h-9 px-3 border border-gray-300 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200">
    Payment
  </button>

  <button className="h-9 px-3 border border-gray-300 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200">
    Message
  </button>

  <button className="h-9 px-3 border border-gray-300 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200">
    Reports
  </button>

  {/* MORE DROPDOWN */}
  <div className="relative">
    <button
      onClick={(e) => {
        e.stopPropagation()
        setOpenMoreMenu((p) => !p)
      }}
      className="h-9 px-3 border border-gray-300 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
    >
      More
      <ChevronDown size={14} />
    </button>

    {openMoreMenu && (
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 mt-2 w-44 bg-white border border-gray-300 shadow-lg z-50"
      >
        <button
          onClick={() => {
            setOpenMoreMenu(false)
            navigate(`/people/students/edit/${id}`) // 👈 EDIT PAGE
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          ✏️ Edit Student
        </button>

        
        
      </div>
    )}
  </div>
</div>

  </div>
</div>

{/* DOTTED DIVIDER */}
<div className="border-b border-dotted border-gray-300 mb-6" />

{/* PROFILE HEADER */}
<div className="flex items-start gap-6 mb-6">
  {/* Avatar */}
  <div className="h-32 w-32 border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
    {(studentdetails?.Photo || studentdetails?.ProfilePicture) && !profileImageError ? (
      <img
        src={studentdetails.Photo || studentdetails.ProfilePicture}
        alt={studentName}
        className="h-full w-full object-cover"
        onError={() => setProfileImageError(true)}
      />
    ) : (
      <User className="h-16 w-16 text-gray-400" />
    )}
  </div>

  {/* Info */}
  <div>
    <h2 className="text-xl font-semibold text-gray-800">
      {studentName}
    </h2>

    <div className="text-sm text-gray-600 mt-1">
      {studentdetails?.Gender || "-"}, {age ? `${age} years old` : "-"}
    </div>

    <div className="mt-2 space-y-1 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">📞</span>
        <a
          href={`tel:${studentdetails?.MobilePhone}`}
          className="text-blue-600"
        >
          {studentdetails?.MobilePhone || "-"}
        </a>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-500">✉️</span>
        <a
          href={`mailto:${studentdetails?.Email}`}
          className="text-blue-600"
        >
          {studentdetails?.Email || "-"}
        </a>
      </div>
    </div>

    <div className="mt-3 space-y-1 text-sm">
      <div className="flex items-center gap-2 text-green-700">
        <span className="h-4 w-4 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">
          ✓
        </span>
        1
      </div>
      <div className="flex items-center gap-2 text-green-700">
        <span className="h-4 w-4 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">
          ✓
        </span>
        €0
      </div>
    </div>
  </div>
</div>

{/* TABS (SEPARATE ROW, LIKE IMAGE) */}
<div className="border-b border-gray-300">
  <div className="flex flex-wrap gap-1">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm border border-b-0 ${
          activeTab === tab
            ? "bg-white border-gray-300 font-semibold"
            : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
</div>


        {/* Content based on active tab */}
        <div className="mt-0">
          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      {openModal === 'sms' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-md bg-white  border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send sms message</h3>
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center  hover:bg-gray-100">
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
                <button className="h-8 px-3  border border-blue-200 bg-blue-50 text-blue-700 text-sm inline-flex items-center gap-1">
                  <CreditCard size={14} /> Add credit
                </button>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  onClick={() => setOpenModal(null)}
                  className="h-10 px-4  border border-gray-200 bg-white text-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4  bg-blue-600 text-white text-sm">
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
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center  hover:bg-gray-100">
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
                  className="h-10 px-4  border border-gray-200 bg-white text-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4  bg-blue-600 text-white text-sm">
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
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center  hover:bg-gray-100">
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
                  className="h-10 px-4  border border-blue-200 bg-blue-50 text-blue-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4  bg-blue-600 text-white text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register for Event Modal */}
      {openModal === 'enroll-event' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-md bg-white  border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Enroll Student</h3>
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center  hover:bg-gray-100">
                <span className="text-gray-500">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 ">
                  <CalendarIcon size={16} />
                  Select a event
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 ">
                  <BarChart3 size={16} />
                  Select by event type
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Enroll this student in an event. Select an event and the date on which the student(s) will be enrolled.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select event:</label>
                <select className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
                  <option>Select</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Only active and scheduled event are shown.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment date:</label>
                <input 
                  type="text" 
                  value="22-10-2025"
                  placeholder="dd-mm-yyyy"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  onClick={() => setOpenModal(null)}
                  className="h-10 px-4  border border-gray-200 bg-white text-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4  bg-blue-600 text-white text-sm">
                  Enroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderDocumentModal()}

      {/* Add Attachment Modal */}
      {showAddAttachmentModal && id && (
        <AddAttachmentModal
          studentId={parseInt(id)}
          studentName={studentName}
          onClose={() => setShowAddAttachmentModal(false)}
          onSuccess={handleAddAttachment}
          uploading={uploadingAttachment}
        />
      )}

      {/* Student Attendance and Behaviour Modal */}
      {/* Inside StudentProfile return block */}
{showAttendanceModal && attendanceMode == "single" && selectedLesson && (
  <StudentAttendanceModal
    studentId={parseInt(id!)}
    studentName={studentName}
    mode={"single"}
    lesson={selectedLesson}
    onClose={() => {
      setShowAttendanceModal(false)
      setSelectedLesson(null)
    }}
    onSuccess={() => {
      if (selectedClassId) {
        fetchLessons(selectedClassId)
      }
    }}
    // Pass the function here
    refreshStats={() => {
      // Logic to trigger the useEffect in parent or call the fetch function directly
      // Since fetchAttendanceStats is defined in the parent, make sure it's accessible
      // or wrapped in a useCallback if needed.
      const fetchStats = async () => {
        const response = await axiosInstance.get("/Dashboard/GetStudentAttendanceStats", {
          params: { studentId: Number(id) }
        })
        if (response.data?.IsSuccess) setAttendanceStats(response.data.Data)
      }
      fetchStats();
    }}

  />
)}
{showAttendanceModal && attendanceMode === "bulk" && (
  <StudentAttendanceModal
    studentId={parseInt(id!)}
    studentName={studentName}
    mode={"bulk"}
    lessons={selectedSessions}
    onClose={() => {
      setShowAttendanceModal(false)
      setSelectedSessions([])
      setAttendanceMode(null)
    }}
    onSuccess={() => {
      if (selectedClassId) fetchLessons(selectedClassId)
    }}
    refreshStats={refreshAttendanceStats}
  />
)}

    </div>
  )
}

// Student Attendance and Behaviour Modal Component
function StudentAttendanceModal({
  studentId,
  studentName,
  mode,
  lesson,
  lessons,
  onClose,
  onSuccess,
  refreshStats
}: {
  studentId: number
  studentName: string
  mode: "single" | "bulk"
  lesson?: any
  lessons?: { sessionId: number, attendanceDate: number }[]
  onClose: () => void
  onSuccess: () => void
  refreshStats: () => void
}) {
  // const [attendanceStatus, setAttendanceStatus] = useState<"Present" | "Absent" | "Late" | "Excused" | null>(
  //   lesson.attendance || null
  // )
  const [attendanceStatus, setAttendanceStatus] = useState<
  "Present" | "Absent" | "Late" | "Excused" | null
>(mode === "single" ? lesson?.attendance ?? null : null)

  const [isExcused, setIsExcused] = useState(
  mode === "single" && lesson?.attendance === "Excused"
)

  const [loading, setLoading] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(true)
  const [attendanceData, setAttendanceData] = useState<any>(null)

  // Fetch attendance data when modal opens
  // useEffect(() => {
  //   const fetchAttendanceData = async () => {
  //     if (!lesson.classId || !lesson.scheduleId) {
  //       setLoadingAttendance(false)
  //       return
  //     }

  //     try {
  //       const response = await axiosInstance.get("/Class/GetAttendanceForStudentInClass", {
  //         params: { 
  //           classId: lesson.classId,
  //           studentId: studentId
  //         }
  //       })

  //       if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
  //         // Find the attendance record for this specific session
  //         const sessionAttendance = response.data.Data.find(
  //           (item: any) => item.SessionId === lesson.scheduleId
  //         )
          
  //         if (sessionAttendance) {
  //           setAttendanceData(sessionAttendance)
  //           // Update attendance status from API
  //           const status = sessionAttendance.AttendanceStatus
  //           if (status && status !== "NotTaken") {
  //             if (status === "Excused") {
  //               setAttendanceStatus("Excused")
  //               setIsExcused(true)
  //             } else {
  //               setAttendanceStatus(status as "Present" | "Absent" | "Late")
  //               setIsExcused(false)
  //             }
  //           }
  //         }
  //       }
  //     } catch (error: any) {
  //       console.error("Error fetching attendance:", error)
  //     } finally {
  //       setLoadingAttendance(false)
  //     }
  //   }

  //   fetchAttendanceData()
  // }, [lesson.classId, lesson.scheduleId, studentId])

  useEffect(() => {
  if (mode !== "single" || !lesson) {
    setLoadingAttendance(false)
    return
  }

  const fetchAttendanceData = async () => {
    try {
      const response = await axiosInstance.get(
        "/Class/GetAttendanceForStudentInClass",
        {
          params: {
            classId: lesson.classId,
            studentId
          }
        }
      )

      const sessionAttendance = response.data?.Data?.find(
        (x: any) => x.SessionId === lesson.scheduleId
      )

      if (sessionAttendance) {
        setAttendanceData(sessionAttendance)
        const status = sessionAttendance.AttendanceStatus
        if (status && status !== "NotTaken") {
          setAttendanceStatus(status)
          setIsExcused(status === "Excused")
        }
      }
    } finally {
      setLoadingAttendance(false)
    }
  }

  fetchAttendanceData()
}, [mode, lesson, studentId])


  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // const lessonDate = formatDate(lesson.date || lesson.startTime)
  // const lessonTime = lesson.startTime && lesson.endTime
  //   ? `${formatTime(lesson.startTime)}-${formatTime(lesson.endTime)}`
  //   : "—"
  const lessonDate =
  mode === "single" && lesson
    ? formatDate(lesson.date || lesson.startTime)
    : "—"

const lessonTime =
  mode === "single" && lesson?.startTime && lesson?.endTime
    ? `${formatTime(lesson.startTime)}-${formatTime(lesson.endTime)}`
    : "—"


  // Format date to YYYY-MM-DD format for API
  const formatDateForAPI = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return null
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const saveSingleAttendance = async () => {
    if (mode !== "single" || !lesson || loading) return
    const statusToSave = isExcused ? "Excused" : attendanceStatus
    if (!statusToSave) {
      Swal.fire("Notice", "Please select an attendance status (Present, Absent, Late) or mark as excused.", "info")
      return
    }
    setLoading(true)
    try {
      const response = await axiosInstance.post("/Class/MarkAttendance", null, {
        params: {
          classId: lesson.classId,
          scheduleId: lesson.scheduleId,
          studentId: studentId,
          date: formatDateForAPI(lesson.date || lesson.startTime),
          attendanceStatus: statusToSave,
        },
      })
      if (response.data?.IsSuccess) {
        Swal.fire({ icon: "success", title: "Attendance Saved", text: `Status updated to ${statusToSave} successfully.`, timer: 1500, showConfirmButton: false })
        refreshStats()
        onSuccess()
        onClose()
      } else {
        throw new Error(response.data?.Message)
      }
    } catch (error) {
      Swal.fire("Error", "Could not save attendance. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleExcused = () => {
    const newExcused = !isExcused
    setIsExcused(newExcused)
    setAttendanceStatus(newExcused ? "Excused" : null)
  }

  const saveBulkAttendance = async () => {
    if (mode !== "bulk" || !lessons || lessons.length === 0) return
    const statusToSave = attendanceStatus
    if (!statusToSave) {
      Swal.fire("Notice", "Please select an attendance status (Present, Absent, Late) or mark as excused.", "info")
      return
    }
    setLoading(true)
    try {
      const payload = {
        studentId,
        attendanceStatus: statusToSave,
        items: lessons.map(l => ({ scheduleId: l.sessionId, date: l.attendanceDate }))
      }
      const response = await axiosInstance.post("/Class/MarkAttendanceBulk", payload)
      if (response.data?.IsSuccess !== false) {
        Swal.fire({ icon: "success", title: "Attendance Updated", text: `Marked ${lessons.length} lesson(s) as ${statusToSave}`, timer: 1500, showConfirmButton: false })
        refreshStats()
        onSuccess()
        onClose()
      } else {
        throw new Error(response.data?.Message)
      }
    } catch (err) {
      console.error(err)
      Swal.fire("Error", "Bulk attendance update failed", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (mode === "single") saveSingleAttendance()
    else saveBulkAttendance()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 grid place-items-center z-[60] px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Student attendance</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center  hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student and Lesson Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User size={16} className="text-gray-500" />
              <span className="text-gray-600">Student:</span>
              <span className="font-medium text-gray-900">{studentName}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <BookOpen size={16} className="text-gray-500" />
              <span className="text-gray-600">Class:</span>
           <span className="font-medium text-gray-900">
  {mode === "single" ? lesson?.className || "—" : "Multiple lessons"}
</span>

            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-gray-600">Lesson date and time:</span>
              <span className="font-medium text-gray-900">
  {mode === "single"
    ? `${lessonDate}, ${lessonTime}`
    : lessons!
        .map(l => {
          const d = new Date(l.attendanceDate)
          return d.toLocaleDateString("en-GB")
        })
        .join(", ")
  }
</span>

            </div>
          </div>

          {/* Attendance Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
              </div>
              {loadingAttendance ? (
                <span className="text-sm text-gray-500">Loading...</span>
              ) : attendanceData && attendanceData.AttendanceStatus && attendanceData.AttendanceStatus !== "NotTaken" ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Current status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    attendanceData.AttendanceStatus === "Present" ? "bg-green-100 text-green-800" :
                    attendanceData.AttendanceStatus === "Absent" ? "bg-red-100 text-red-800" :
                    attendanceData.AttendanceStatus === "Late" ? "bg-orange-100 text-orange-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {attendanceData.AttendanceStatus}
                  </span>
                  {attendanceData.AttendanceDate && (
                    <span className="text-xs text-gray-500">
                      ({formatDate(attendanceData.AttendanceDate)})
                    </span>
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => {
                  setAttendanceStatus("Present")
                  setIsExcused(false)
                }}
                disabled={mode === "single" && isExcused}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                  attendanceStatus === "Present"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-green-50"
                } ${isExcused ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <CheckCircle size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700">Present</span>

              <button
                onClick={() => {
                  setAttendanceStatus("Absent")
                  setIsExcused(false)
                }}
                disabled={isExcused}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                  attendanceStatus === "Absent"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-red-50"
                } ${isExcused ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <X size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700">Absent</span>

              <button
                onClick={() => {
                  setAttendanceStatus("Late")
                  setIsExcused(false)
                }}
                disabled={isExcused}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                  attendanceStatus === "Late"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-50"
                } ${isExcused ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Clock size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700">Late</span>

              <button
                type="button"
                onClick={() => {
                  if (mode === "bulk") {
                    const isCurrentlyExcused = attendanceStatus === "Excused"
                    setAttendanceStatus(isCurrentlyExcused ? null : "Excused")
                  } else {
                    handleToggleExcused()
                  }
                }}
                title="Mark as excused"
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                  (mode === "bulk" ? attendanceStatus === "Excused" : isExcused)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                }`}
              >
                <ShieldCheck size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700">Excused</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="h-10 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="h-10 px-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

// Add Attachment Modal Component
function AddAttachmentModal({
  studentId,
  studentName,
  onClose,
  onSuccess,
  uploading
}: {
  studentId: number
  studentName: string
  onClose: () => void
  onSuccess: (formData: FormData) => Promise<void>
  uploading: boolean
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [folderName, setFolderName] = useState("")
  const [folderId, setFolderId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0) {
      Swal.fire("Error", "Please select at least one file", "error")
      return
    }

    const formData = new FormData()
    
    // The API expects [FromForm] List<Attachment>
    // Format as documents[index].FieldName for array binding in ASP.NET Core
    selectedFiles.forEach((file, index) => {
      // Get file type from file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
      const fileType = fileExtension
      
      formData.append(`documents[${index}].Id`, "0")
      formData.append(`documents[${index}].FileDetails`, file)
      formData.append(`documents[${index}].FileType`, fileType)
      formData.append(`documents[${index}].FolderName`, folderName || "")
      formData.append(`documents[${index}].StudentName`, studentName)
      formData.append(`documents[${index}].URL`, "") // Will be set by backend
      formData.append(`documents[${index}].CreatedBy`, "") // Will be set by backend
      formData.append(`documents[${index}].CreatedOn`, new Date().toISOString())
      formData.append(`documents[${index}].FolderID`, folderId?.toString() || "0")
      formData.append(`documents[${index}].StudentID`, studentId.toString())
      formData.append(`documents[${index}].IsDeleted`, "false")
    })

    await onSuccess(formData)
    
    // Reset form
    setSelectedFiles([])
    setFolderName("")
    setFolderId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }


  

  return (
    <div
      className="fixed inset-0 bg-black/40 grid place-items-center z-[60] px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Attachment</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center  hover:bg-gray-100 text-gray-500"
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Student Info */}
            <div className="flex items-center gap-3 text-sm p-3 bg-gray-50 ">
              <User size={16} className="text-gray-500" />
              <span className="text-gray-600">Student:</span>
              <span className="font-medium text-gray-900">{studentName}</span>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Files <span className="text-red-500">*</span>
                {selectedFiles.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500">({selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected)</span>
                )}
              </label>
              <div className="border-2 border-dashed border-gray-300  p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                  multiple
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Paperclip size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 mb-1">
                    {selectedFiles.length > 0 
                      ? `Click to add more files (${selectedFiles.length} selected)`
                      : "Click to upload or drag and drop"}
                  </span>
                  <span className="text-xs text-gray-500">
                    PDF, DOC, DOCX, JPG, PNG, etc. (Multiple files supported)
                  </span>
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 "
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Paperclip size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-2 text-sm text-red-600 hover:text-red-700 flex-shrink-0"
                        disabled={uploading}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Folder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder Name (Optional)
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full h-10 px-3  border border-gray-200 bg-white text-sm"
                disabled={uploading}
              />
            </div>

            {/* Folder ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder ID (Optional)
              </label>
              <input
                type="number"
                value={folderId || ""}
                onChange={(e) => setFolderId(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Enter folder ID"
                className="w-full h-10 px-3  border border-gray-200 bg-white text-sm"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4  border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4  bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? "Uploading..." : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}