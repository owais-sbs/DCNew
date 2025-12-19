import { useParams, useNavigate } from "react-router-dom"
import { ChevronDown, Plus, Download, MoreHorizontal, CheckCircle, Clock, FileText, User, Calendar, DollarSign, Receipt, Users, StickyNote, Paperclip, BookOpen, Award, FilePlus, Sun, Archive, Trash2, CreditCard, Mail, Megaphone, BarChart3, Calendar as CalendarIcon, FileCheck, Flag, Star, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import axiosInstance from "./axiosInstance"
import html2canvas from "html2canvas"
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
  | "End of the course exam fees"

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
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value.split("T")[0] ?? value
  }
  return date.toLocaleDateString("en-GB")
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
  const [portalInviteOpen, setPortalInviteOpen] = useState(false)
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
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [showAddAttachmentModal, setShowAddAttachmentModal] = useState(false)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [signatures, setSignatures] = useState<any[]>([])
  const [loadingSignatures, setLoadingSignatures] = useState(false)
  const [selectedSignatureId, setSelectedSignatureId] = useState<number | null>(null)
  const [profileImageError, setProfileImageError] = useState(false)
  const [signatureBase64Map, setSignatureBase64Map] = useState<Record<number, string>>({})
  const [attendanceStats, setAttendanceStats] = useState<any[]>([])
  const [loadingAttendanceStats, setLoadingAttendanceStats] = useState(false)
  const [attendanceStatsError, setAttendanceStatsError] = useState<string | null>(null)

  // Ref hooks
  const documentContentRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  // Helper function to convert image URL to base64
  const imageUrlToBase64 = async (url: string): Promise<string | null> => {
    try {
      // Use axiosInstance to fetch the image (better CORS handling)
      const response = await axiosInstance.get(url, {
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
          console.log("Image converted to base64 successfully, length:", base64String.length)
          resolve(base64String)
        }
        reader.onerror = (error) => {
          console.error("FileReader error:", error)
          reject(error)
        }
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error("Error converting image to base64:", error)
      // Try fallback with fetch
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
          params: { studentid: parseInt(id) },
          signal: controller.signal
        })
        console.log("Attachments response:", response.data)
        if (response.data?.IsSuccess) {
          setAttachments(response.data.Data || [])
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

  // Fetch lessons for selected class using GetAttendanceForStudentInClass
  const fetchLessons = async (classId: number) => {
    setSelectedClassId(classId)
    setLoadingLessons(true)
    setAttendanceData({}) // Clear previous attendance data
    
    if (!id) {
      setLoadingLessons(false)
      return
    }
    
    try {
      const response = await axiosInstance.get("/Class/GetAttendanceForStudentInClass", {
        params: { 
          classId,
          studentId: Number(id)
        }
      })

      console.log("Lessons response from GetAttendanceForStudentInClass:", response.data)
      if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
        // Map the attendance API response to lessons format
        const mapped = response.data.Data.map((s: any) => ({
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
        setClassesSubTab('lessons')
        
        // Also create attendance data map for easy lookup (used in modal)
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
      } else {
        setLessons([])
        Swal.fire("Error", "Failed to load lessons", "error")
      }
    } catch (error: any) {
      console.error("Error fetching lessons:", error)
      Swal.fire("Error", "Failed to load lessons. Please try again.", "error")
      setLessons([])
    } finally {
      setLoadingLessons(false)
    }
  }

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

  const defaultFieldKeys: StudentFieldKey[] = [
    "Name",
    "Student ID",
    "Address",
    "Date of Birth",
    "Passport Number",
    "Course Start Date",
    "Course End Date",
    "Course Level",
    "Mode of Study",
    "Number of Weeks",
    "Hours Per Week",
    "Tuition Fees",
    "End of the course exam fees",
    "ILEP Programme Reference"
  ]

  const handleOpenInviteModal = () => {
    setPortalInviteOpen(true);
  };

  const handleSendInviteEmail = async () => {
    if (!studentdetails?.Id) {
      Swal.fire("Error", "Student ID is missing", "error");
      return;
    }

    try {
      const response = await axiosInstance.post("/Account/InviteUser", {
        UserId: studentdetails.Id,
        UserType: "student",
      });

      if (response.data?.IsSuccess) {
        Swal.fire({
          icon: "success",
          title: "Invitation Sent",
          text: "The student has been invited to the portal successfully.",
          confirmButtonColor: "#2563eb",
        });
        // Refresh student data to get updated activation code
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
    }
  };

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
    "Nationality": () => studentdetails?.Nationality || "—",
    "Course Start Date": () => formatDateValue(studentdetails?.CourseStartDate),
    "Finished Course Date": () => formatDateValue(studentdetails?.FinishedCourseDate),
    "Course Level": () => studentdetails?.CourseLevel || "—",
    "External Exam": () => studentdetails?.ExternalExam || "—",
    "Date of External Exam": () => formatDateValue(studentdetails?.ExternalExamDate),
    "Score External Exam": () => studentdetails?.ScoreExternalExam || "—",
    "ILEP Programme Reference": () => studentdetails?.IlepReference || "—",
    "ILEP Programme Title": () => studentdetails?.IlepTitle || studentdetails?.IlepProgrammeTitle || "—",
    "Address": () => studentAddress || "—",
    "Passport Number": () => studentdetails?.PassportNumber || "—",
    "Course End Date": () => formatDateValue(studentdetails?.CourseEndDate),
    "Course Title": () => studentdetails?.CourseTitle || "—",
    "Mode of Study": () => studentdetails?.ModeOfStudy || "—",
    "Number of Weeks": () => {
      const weeks = studentdetails?.NumberOfWeeks;
      return weeks ? `${weeks} Weeks` : "—";
    },
    "Hours Per Week": () => studentdetails?.HoursPerWeek?.toString() || "—",
    "Tuition Fees": () => {
      const fees = studentdetails?.TuitionFees;
      if (fees === null || fees === undefined || fees === "") return "—";
      // Check if it's a string that says "Fully Paid" or similar
      if (typeof fees === "string" && fees.toLowerCase().includes("paid")) {
        return fees;
      }
      // Otherwise format as currency
      return formatCurrency(fees);
    },
    "Course Code": () => studentdetails?.CourseCode || "—",
    "ILEP programme reference": () => studentdetails?.IlepReference || "—",
    "End of the Course Exam Fee": () => {
      const examFees = studentdetails?.EndOfExamPaid;
      if (examFees === null || examFees === undefined || examFees === "") return "—";
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
      const examFees = studentdetails?.EndOfExamPaid;
      if (examFees === null || examFees === undefined || examFees === "") return "—";
      // If it's a number, format as currency, otherwise return as string
      const numeric = Number(examFees);
      if (!isNaN(numeric)) {
        return formatCurrency(numeric);
      }
      return examFees.toString();
    }
  }

  const getStudentFieldValue = (key: StudentFieldKey) => studentFieldResolvers[key]()

  // Replace placeholders in document body with student data
  const replacePlaceholders = (text: string) => {
    if (!text) return ""
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
      .replace(/\{ILEPProgrammeTitle\}/g, studentdetails.IlepTitle || studentdetails.IlepProgrammeTitle || "—")
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

  const tabs = [
    "Profile",
    "Activity",
    "Classes",
    "Attendance",
    "Attachments",
    "Create documents"
  ]

  const renderActivityContent = () => (
    <div className="bg-white border border-gray-200  p-6 shadow-sm">
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
        {[
          { date: "17-10-2025", time: "11:15", recorded: "11:50, Oct 17 2025" },
          { date: "17-10-2025", time: "09:00", recorded: "09:15, Oct 17 2025" },
          { date: "16-10-2025", time: "11:15", recorded: "11:45, Oct 16 2025" },
          { date: "16-10-2025", time: "09:00", recorded: "09:10, Oct 16 2025" },
          { date: "15-10-2025", time: "11:15", recorded: "11:30, Oct 15 2025" },
          { date: "15-10-2025", time: "09:00", recorded: "09:05, Oct 15 2025" },
          { date: "14-10-2025", time: "11:15", recorded: "11:40, Oct 14 2025" },
          { date: "14-10-2025", time: "09:00", recorded: "09:20, Oct 14 2025" },
          { date: "13-10-2025", time: "11:15", recorded: "11:25, Oct 13 2025" },
          { date: "13-10-2025", time: "09:00", recorded: "09:00, Oct 13 2025" }
        ].map((activity, i) => (
          <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 ">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle size={16} className="text-blue-600" />
              </div>
              {i < 9 && <div className="w-0.5 h-8 bg-gray-200 mt-2" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">Attendance:</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Present</span>
                <span className="text-sm text-gray-600">was recorded for Class Roon12 D7 - lesson on {activity.date} {activity.time}</span>
              </div>
              <div className="text-xs text-gray-500">{activity.recorded}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )



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


    {/* TABLE */}
    {classesSubTab === "classes" && (
      <div className="overflow-x-auto mt-4">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-300">
              <th className="text-left px-4 py-2">Class</th>
              <th className="text-left px-4 py-2">Teacher</th>
              <th className="text-left px-4 py-2">Recurring Time</th>
              <th className="text-left px-4 py-2">Enrolled</th>
              <th className="text-left px-4 py-2">Unenrolled</th>
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
                    2 teachers
                  </td>

                  {/* Recurring */}
                  <td className="px-4 py-3 text-gray-700">
                    Monday (13:00–15:00), Thursday (13:00–15:00){" "}
                    <span className="text-blue-600 cursor-pointer">and more</span>
                  </td>

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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-gray-400">
                      <FileText size={16} />
                      <Award size={16} />
                      <Printer size={16} />
                      <X size={16} />
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
    // Find Present status for donut chart
    const presentStat = attendanceStats.find((stat: any) => stat.Status?.toLowerCase() === "present")
    const overallPercentage = presentStat?.Percentage || 0
    const overallStatus = presentStat?.Status || "Present"

    return (
      <div className="bg-white border border-gray-200  p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Attendance</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
              Class: <ChevronDown size={14} />
            </button>
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
              Date: Total <ChevronDown size={14} />
            </button>
            <button className="h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-700 flex items-center justify-center">
              <Clock size={16} />
            </button>
          </div>
        </div>

        {loadingAttendanceStats ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
              <p className="text-gray-600">Loading attendance stats...</p>
            </div>
          </div>
        ) : attendanceStatsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{attendanceStatsError}</p>
          </div>
        ) : attendanceStats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No attendance data available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="h-48 w-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
                  <div className={`h-32 w-32 rounded-full border-8 ${getStatusBorderColor(overallStatus)} flex items-center justify-center`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{overallPercentage.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">{overallStatus}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Details Table */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Attendance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Count</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Percentage (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceStats.map((stat: any, index: number) => {
                    const isLast = index === attendanceStats.length - 1
                    return (
                      <tr key={index} className={isLast ? "" : "border-b border-gray-100"}>
                        <td className="py-3 px-4">
                          {stat.Status?.toLowerCase() === "excused" ? (
                            <span className="text-gray-700">{stat.Status}</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${getStatusColor(stat.Status)}`} />
                              <span className="text-gray-700">{stat.Status}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{stat.Time || "0"}</td>
                        <td className="py-3 px-4 text-gray-700">{stat.Count || 0}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {stat.Percentage !== undefined && stat.Percentage !== null
                            ? stat.Percentage.toFixed(1)
                            : stat.Status?.toLowerCase() === "excused" ? "-" : "0"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }


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
            params: { studentid: parseInt(id) }
          })
          if (refreshResponse.data?.IsSuccess) {
            setAttachments(refreshResponse.data.Data || [])
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
                    {attachment.FileName || attachment.URL?.split("/").pop() || "Attachment"}
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
              {attachment.URL && (
                <a
                  href={attachment.URL}
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

  const handlePrintDocument = async () => {
    if (!documentContentRef.current || !selectedDocument) return

    try {
      // Ensure signature image is converted to base64 if not already
      if (selectedSignatureId && signatures.length > 0) {
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
                // Force reload
                img.style.display = 'none'
                img.offsetHeight // Trigger reflow
                img.style.display = 'block'
              }
            })
            // Wait for image to update
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
      }

      // Preload all images in the document (now using base64, so no CORS issues)
      const images = documentContentRef.current.querySelectorAll('img')
      console.log("Found images to preload:", images.length)
      
      const imagePromises = Array.from(images).map((img, index) => {
        return new Promise((resolve) => {
          // Check if image is already loaded
          if (img.complete && img.naturalHeight !== 0) {
            console.log(`Image ${index} already loaded, dimensions: ${img.naturalWidth}x${img.naturalHeight}`)
            resolve(img)
            return
          }
          
          // Wait for image to load
          const loadHandler = () => {
            console.log(`Image ${index} loaded successfully, dimensions: ${img.naturalWidth}x${img.naturalHeight}`)
            resolve(img)
          }
          
          const errorHandler = () => {
            console.warn(`Image ${index} failed to load:`, img.src.substring(0, 100))
            resolve(img) // Continue anyway
          }
          
          img.addEventListener('load', loadHandler, { once: true })
          img.addEventListener('error', errorHandler, { once: true })
          
          // Trigger load if src is set but not loading
          if (img.src && !img.complete) {
            // Image is loading, wait for events
          } else if (!img.src) {
            resolve(img)
          }
        })
      })

      // Wait for all images to load
      await Promise.all(imagePromises)
      console.log("All images preloaded")

      // Additional delay to ensure images are fully rendered in the DOM
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Final check: Verify signature image is loaded and visible
      const signatureImages = documentContentRef.current.querySelectorAll('img')
      signatureImages.forEach((img, idx) => {
        if (img.src && img.src.includes('data:image')) {
          console.log(`Signature image ${idx} src type: base64, loaded: ${img.complete}, dimensions: ${img.naturalWidth}x${img.naturalHeight}`)
          if (!img.complete || img.naturalHeight === 0) {
            console.warn(`Signature image ${idx} not fully loaded, waiting...`)
          }
        }
      })

      const canvas = await html2canvas(documentContentRef.current, {
        scale: 2,
        useCORS: false, // Not needed since we're using base64 images
        allowTaint: false, // Not needed since we're using base64 images
        logging: true, // Enable logging to debug
        backgroundColor: "#ffffff",
        imageTimeout: 30000, // 30 second timeout for images
        removeContainer: false, // Keep container for proper rendering
        onclone: (clonedDoc) => {
          // Verify images in cloned document
          const clonedImages = clonedDoc.querySelectorAll('img')
          clonedImages.forEach((img, idx) => {
            console.log(`Cloned image ${idx}: src=${img.src.substring(0, 50)}..., complete=${img.complete}, naturalHeight=${img.naturalHeight}`)
          })
        }
      })
      
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 12
      const maxWidth = pageWidth - margin * 2
      const maxHeight = pageHeight - margin * 2

      let renderWidth = maxWidth
      let renderHeight = (canvas.height * renderWidth) / canvas.width

      if (renderHeight > maxHeight) {
        const scale = maxHeight / renderHeight
        renderHeight = maxHeight
        renderWidth = renderWidth * scale
      }

      const offsetX = (pageWidth - renderWidth) / 2
      const offsetY = (pageHeight - renderHeight) / 2

      pdf.addImage(imgData, "PNG", offsetX, offsetY, renderWidth, renderHeight)

      const sanitizedTitle = (selectedDocument.Title || "student-document").replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      pdf.save(`${sanitizedTitle}.pdf`)
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

      // Ensure signature image is converted to base64 if not already
      if (selectedSignatureId && signatures.length > 0) {
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

      // Preload all images in the document
      const images = documentContentRef.current.querySelectorAll('img')
      console.log("Found images to preload:", images.length)
      
      const imagePromises = Array.from(images).map((img, index) => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            console.log(`Image ${index} already loaded, dimensions: ${img.naturalWidth}x${img.naturalHeight}`)
            resolve(img)
            return
          }
          
          const loadHandler = () => {
            console.log(`Image ${index} loaded successfully, dimensions: ${img.naturalWidth}x${img.naturalHeight}`)
            resolve(img)
          }
          
          const errorHandler = () => {
            console.warn(`Image ${index} failed to load:`, img.src.substring(0, 100))
            resolve(img)
          }
          
          img.addEventListener('load', loadHandler, { once: true })
          img.addEventListener('error', errorHandler, { once: true })
          
          if (img.src && !img.complete) {
            // Image is loading, wait for events
          } else if (!img.src) {
            resolve(img)
          }
        })
      })

      await Promise.all(imagePromises)
      console.log("All images preloaded")

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate PDF
      const canvas = await html2canvas(documentContentRef.current, {
        scale: 2,
        useCORS: false,
        allowTaint: false,
        logging: true,
        backgroundColor: "#ffffff",
        imageTimeout: 30000,
        removeContainer: false,
        onclone: (clonedDoc) => {
          const clonedImages = clonedDoc.querySelectorAll('img')
          clonedImages.forEach((img, idx) => {
            console.log(`Cloned image ${idx}: src=${img.src.substring(0, 50)}..., complete=${img.complete}, naturalHeight=${img.naturalHeight}`)
          })
        }
      })
      
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 12
      const maxWidth = pageWidth - margin * 2
      const maxHeight = pageHeight - margin * 2

      let renderWidth = maxWidth
      let renderHeight = (canvas.height * renderWidth) / canvas.width

      if (renderHeight > maxHeight) {
        const scale = maxHeight / renderHeight
        renderHeight = maxHeight
        renderWidth = renderWidth * scale
      }

      const offsetX = (pageWidth - renderWidth) / 2
      const offsetY = (pageHeight - renderHeight) / 2

      pdf.addImage(imgData, "PNG", offsetX, offsetY, renderWidth, renderHeight)

      // Convert PDF to Blob
      const pdfBlob = pdf.output('blob')
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
    const processedTo = replacePlaceholders(selectedDocument.To || "")
    const processedFooter = replacePlaceholders(selectedDocument.Footer || "")

    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setSelectedDocument(null)}>
        <div className="w-full max-w-3xl bg-white  border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create document</h3>
            <button onClick={() => setSelectedDocument(null)} className="h-8 w-8 grid place-items-center  hover:bg-gray-100">
              <span className="text-gray-500">×</span>
            </button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto bg-white">
            <div
              ref={documentContentRef}
              className="space-y-5 text-gray-900 bg-white p-6 md:p-8 rounded-xl shadow-sm"
              style={{ minHeight: "fit-content" }}
            >
              <div className="text-sm text-gray-700">Date: {todayDisplay}</div>
              
              {processedTo && (
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {processedTo}
                </div>
              )}

              <h2 className="text-center text-lg font-semibold text-gray-900">
                {selectedDocument.Title || "Document"}
              </h2>

              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {processedBody || "No content available."}
              </div>

              {/* Student Details Table */}
              <div className="border border-gray-300  overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {defaultFieldKeys.map((fieldKey) => (
                      <tr key={fieldKey} className="border-b border-gray-200 last:border-b-0">
                        <td className="bg-gray-50 font-medium px-4 py-3 w-1/3 text-gray-700 border-r border-gray-200">
                          {fieldKey}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {getStudentFieldValue(fieldKey)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {processedFooter && (
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {processedFooter}
                </div>
              )}

              {/* Selected Signature Display in Document */}
              {selectedSignatureId && signatures.length > 0 && (() => {
                const selectedSignature = signatures.find((sig) => sig.id === selectedSignatureId)
                if (selectedSignature) {
                  // Use base64 version if available, otherwise fallback to URL
                  const signatureImageSrc = signatureBase64Map[selectedSignature.id] || selectedSignature.signatureUrl
                  
                  if (signatureImageSrc) {
                    return (
                      <div className="mt-6 pt-6 border-t border-gray-300">
                        <div className="flex items-end justify-end gap-4">
                          <div className="text-right">
                            <img
                              src={signatureImageSrc}
                              alt={selectedSignature.name}
                              className="max-h-20 object-contain"
                              style={{ display: "block", maxWidth: "200px" }}
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
                              <div className="text-xs text-gray-600 mt-1 font-medium">{selectedSignature.name}</div>
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
          <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
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
    )
  }

  const renderHolidaysContent = () => (
    <div className="bg-white border border-gray-200  p-6 shadow-sm">
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Sun size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add a holiday for {studentName}</h3>
        <p className="text-gray-600 mb-4">Holidays for {studentName} will appear here.</p>
        <button className="h-10 px-4  bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Add holiday
        </button>
      </div>
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
        value1={studentdetails?.RegistrationDate?.split("T")[0]}
        label2="Date of Birth"
        value2={studentdetails?.DateOfBirth?.split("T")[0]}
        sub2="Birthday is in 8 days"
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
      />

      {/* CLASS */}
      <Row3
        label1="Class Subjects"
        value1={studentdetails?.ClassSubject}
        label2="Class Levels"
        value2={studentdetails?.ClassLevel}
      />

      {/* IDENTITY */}
      <Row3
        label1="Nationality"
        value1={studentdetails?.Nationality}
        label2="Passport Number"
        value2={studentdetails?.PassportNumber}
        label3="Passport Expiry Date"
        value3={studentdetails?.PassportExpiryDate?.split("T")[0]}
      />

      {/* COURSE DATES */}
      <Row3
        label1="GNIB Expiry Date"
        value1={studentdetails?.GnibExpiryDate?.split("T")[0]}
        label2="Course Start Date"
        value2={studentdetails?.CourseStartDate?.split("T")[0]}
        label3="Course End Date"
        value3={studentdetails?.CourseEndDate?.split("T")[0]}
      />

      {/* COURSE INFO */}
      <Row3
        label1="Finished Course Date"
        value1={studentdetails?.FinishedCourseDate?.split("T")[0]}
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

      <Row3
        label1="Course Code"
        value1={studentdetails?.CourseCode}
        label2="External Exam"
        value2={studentdetails?.ExternalExam}
      />

      {/* EXAM */}
      <Row3
        label1="Date of External Exam"
        value1={studentdetails?.ExternalExamDate?.split("T")[0]}
        label2="Score External Exam"
        value2={studentdetails?.ScoreExternalExam}
        label3="Date of Payment"
        value3={studentdetails?.DateOfPayment?.split("T")[0]}
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
      />

      {/* SCHOOL PORTAL HEADER */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="text-sm font-semibold text-gray-800">
          School Portal
        </div>
        <div className="text-xs text-gray-500">
          Enable or disable the student's access to your portal.
        </div>
      </div>

      {/* SCHOOL PORTAL */}
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
            onClick={handleOpenInviteModal}
            className="text-blue-600 hover:underline"
          >
            Invite to Portal
          </button>
        }
        sub2="Abdullah has not signed up yet!"
        label3="Last Login"
        value3="never"
      />

      <Row3
        label1="Username"
        value1={studentdetails?.Username || "not set"}
        label2="Password"
        value2="not set"
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
      />

      {/* FOOTER */}
      <div className="px-6 py-3 text-xs text-gray-500 bg-gray-50">
        Created By: {studentdetails?.CreatedByName || "Asif Omer"} <br />
        Created Date: {studentdetails?.CreatedOn?.split("T")[0]}
      </div>
    </div>
  )
}


  const renderContent = () => {
    switch(activeTab.toLowerCase()) {
      case "profile": return renderProfileContent()
      case "activity": return renderActivityContent()
      case "classes": return renderClassesContent()
      case "attendance": return renderAttendanceContent()
      case "attachments": return renderAttachmentsContent()
      case "create documents": return renderCreateDocumentsContent()
      default: return renderProfileContent()
    }
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
    {["Payment", "Message", "Reports", "More"].map((label) => (
      <button
        key={label}
        className="h-9 px-3 border border-gray-300 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200"
      >
        {label}
      </button>
    ))}
  </div>
</div>

{/* DOTTED DIVIDER */}
<div className="border-b border-dotted border-gray-300 mb-6" />

{/* PROFILE HEADER */}
<div className="flex items-start gap-6 mb-6">
  {/* Avatar */}
  <div className="h-32 w-32 border border-gray-300 bg-gray-100 flex items-center justify-center">
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

      {portalInviteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" onClick={() => setPortalInviteOpen(false)}>
          <div
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPortalInviteOpen(false)}
                  className="h-9 px-4 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
                >
                  × Close
                </button>
                <button className="h-9 px-4 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-100">
                  🖨 Print
                </button>
              </div>
              <button 
                onClick={handleSendInviteEmail}
                className="h-9 px-4 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                ✉️ Send by email
              </button>
            </div>

            <div className="p-6 space-y-8 bg-gray-50 overflow-y-auto">
              <div className="bg-white border border-indigo-200  shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">How to invite people to Teach 'n Go</h2>
                <p className="text-sm text-gray-700">
                  Teach 'n Go is great for managing your classes and students. It gets better when teachers, students and related contacts are involved too!
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  You can send email invites or print out invitations to hand out. If an email is available, we recommend emailing the link to your school members for a smoother sign up. Links to download the mobile app are also included in the email.
                </p>

                <div className="mt-6 border border-indigo-200  overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-indigo-200">
                    <div className="p-4">
                      <h3 className="text-center text-sm font-semibold text-gray-900 mb-3">Send email invitations</h3>
                      <ol className="list-decimal text-sm text-gray-700 space-y-2 pl-5">
                        <li>Click the "Send by email" button above.</li>
                        <li>An email will be sent with instructions.</li>
                        <li>The recipient will create an account and have access.</li>
                      </ol>
                    </div>
                    <div className="p-4">
                      <h3 className="text-center text-sm font-semibold text-gray-900 mb-3">Give printed invitations</h3>
                      <ol className="list-decimal text-sm text-gray-700 space-y-2 pl-5">
                        <li>Print out the invitation.</li>
                        <li>Hand them out to teachers or students and ask them to follow the instructions.</li>
                      </ol>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-3">Print invitations start on the page below</p>
              </div>

              <div className="bg-white border border-gray-200  shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">You're invited to our school portal</h3>
                    <p className="text-sm text-gray-500">Teach 'n Go</p>
                  </div>
                  <img src="https://app.teachngo.com/static/media/logo.5ae04983d16bf1c3a4e3.svg" alt="Teach 'n Go" className="h-10" />
                </div>

                <div className="space-y-4">
                  <p className="text-gray-900 font-medium">Hello {studentName || "Student"},</p>
                  <p className="text-sm text-gray-600">
                    DCE English Language School is using Teach 'n Go to keep students updated this year. By joining you will be able to view attendance, lesson notes, homework and even your payments.
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    Please create your account by our next lesson. It's super easy and only takes a minute!
                  </p>
                </div>

                <div className="border border-gray-200  overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-900 text-sm">Join DCE English Language School</div>
                  <div className="p-4 text-sm text-gray-700 space-y-2">
                    <ol className="list-decimal space-y-2 pl-5">
                      <li>Open your browser and go to <a href="https://app.teachngo.com/activate" className="text-blue-600 hover:underline">https://app.teachngo.com/activate</a></li>
                      <li>Enter your activation code found in the table below</li>
                      <li>Click on "Activate your code"</li>
                      <li>Type in a <strong>Username</strong></li>
                      <li>Type in a <strong>Password</strong></li>
                      <li>Click on "Create your account"</li>
                      <li>Done!</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <div className="border border-gray-200  overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-900 text-sm">Activation Codes</div>
                    <div className="p-4 text-sm text-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 uppercase">Student</div>
                          <div className="text-sm font-medium text-gray-900">{studentName || "Student"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase">Code</div>
                          <div className="text-sm font-medium text-gray-900">{studentdetails?.PortalActivationCode || studentdetails?.IdNumber || "SENHpJN"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200  p-4 flex gap-3 items-start">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl">💡</div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <div className="font-semibold text-gray-900">How do I login after I have created my account?</div>
                      <p>Simply go to <a href="https://app.teachngo.com" className="text-blue-600 hover:underline">https://app.teachngo.com</a> and enter your username and password.</p>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">I forgot my password. What do I do?</div>
                      <p>You can reset your password by going to <a href="https://app.teachngo.com/forgotPassword" className="text-blue-600 hover:underline">https://app.teachngo.com/forgotPassword</a>. If that doesn't work please contact your teacher at DCE English Language School and they can reset the password for you.</p>
                    </div>
                  </div>
                </div>
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
      {showAttendanceModal && selectedLesson && (
        <StudentAttendanceModal
          studentId={parseInt(id!)}
          studentName={studentName}
          lesson={selectedLesson}
          onClose={() => {
            setShowAttendanceModal(false)
            setSelectedLesson(null)
          }}
          onSuccess={() => {
            // Refresh lessons after updating attendance
            if (selectedClassId) {
              fetchLessons(selectedClassId)
            }
          }}
        />
      )}
    </div>
  )
}

// Student Attendance and Behaviour Modal Component
function StudentAttendanceModal({
  studentId,
  studentName,
  lesson,
  onClose,
  onSuccess
}: {
  studentId: number
  studentName: string
  lesson: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [attendanceStatus, setAttendanceStatus] = useState<"Present" | "Absent" | "Late" | "Excused" | null>(
    lesson.attendance || null
  )
  const [isExcused, setIsExcused] = useState(lesson.attendance === "Excused")
  const [behaviourTab, setBehaviourTab] = useState<"gold" | "red">("gold")
  const [selectedGoldStars, setSelectedGoldStars] = useState<string[]>([])
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([])
  const [grade, setGrade] = useState<string>(lesson.grade || "")
  const [notes, setNotes] = useState<string>(lesson.notes || "")
  const [loading, setLoading] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(true)
  const [attendanceData, setAttendanceData] = useState<any>(null)

  // Fetch attendance data when modal opens
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!lesson.classId || !lesson.scheduleId) {
        setLoadingAttendance(false)
        return
      }

      try {
        const response = await axiosInstance.get("/Class/GetAttendanceForStudentInClass", {
          params: { 
            classId: lesson.classId,
            studentId: studentId
          }
        })

        if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
          // Find the attendance record for this specific session
          const sessionAttendance = response.data.Data.find(
            (item: any) => item.SessionId === lesson.scheduleId
          )
          
          if (sessionAttendance) {
            setAttendanceData(sessionAttendance)
            // Update attendance status from API
            const status = sessionAttendance.AttendanceStatus
            if (status && status !== "NotTaken") {
              if (status === "Excused") {
                setAttendanceStatus("Excused")
                setIsExcused(true)
              } else {
                setAttendanceStatus(status as "Present" | "Absent" | "Late")
                setIsExcused(false)
              }
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching attendance:", error)
      } finally {
        setLoadingAttendance(false)
      }
    }

    fetchAttendanceData()
  }, [lesson.classId, lesson.scheduleId, studentId])

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

  const lessonDate = formatDate(lesson.date || lesson.startTime)
  const lessonTime = lesson.startTime && lesson.endTime
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

  const handleMarkAttendance = async (status: "Present" | "Absent" | "Late") => {
    if (isExcused) return
    
    setLoading(true)
    try {
      const dateForAPI = formatDateForAPI(lesson.date || lesson.startTime)
      const payload = {
        classId: lesson.classId,
        scheduleId: lesson.scheduleId,
        studentId: studentId,
        date: dateForAPI,
        attendanceStatus: status,
      }
      const response = await axiosInstance.post("/Class/MarkAttendance", null, { params: payload })
      if (response.data?.IsSuccess) {
        setAttendanceStatus(status)
        // Update attendance data
        if (attendanceData) {
          setAttendanceData({
            ...attendanceData,
            AttendanceStatus: status,
            AttendanceDate: new Date().toISOString()
          })
        }
        Swal.fire("Success", "Attendance marked successfully", "success")
        onSuccess()
      } else {
        Swal.fire("Error", response.data?.Message || "Failed to mark attendance", "error")
      }
    } catch (error: any) {
      console.error("Error marking attendance:", error)
      Swal.fire("Error", "Failed to mark attendance. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleExcused = async () => {
    const newExcused = !isExcused
    setLoading(true)
    try {
      const dateForAPI = formatDateForAPI(lesson.date || lesson.startTime)
      const payload = {
        classId: lesson.classId,
        scheduleId: lesson.scheduleId,
        studentId: studentId,
        date: dateForAPI,
        attendanceStatus: newExcused ? "Excused" : "None",
      }
      const response = await axiosInstance.post("/Class/MarkAttendance", null, { params: payload })
      if (response.data?.IsSuccess) {
        setIsExcused(newExcused)
        if (newExcused) {
          setAttendanceStatus("Excused")
          // Update attendance data
          if (attendanceData) {
            setAttendanceData({
              ...attendanceData,
              AttendanceStatus: "Excused",
              AttendanceDate: new Date().toISOString()
            })
          }
        } else {
          setAttendanceStatus(null)
          // Update attendance data
          if (attendanceData) {
            setAttendanceData({
              ...attendanceData,
              AttendanceStatus: "NotTaken",
              AttendanceDate: null
            })
          }
        }
        Swal.fire("Success", newExcused ? "Marked as excused" : "Removed excused status", "success")
        onSuccess()
      } else {
        Swal.fire("Error", response.data?.Message || "Failed to update attendance", "error")
      }
    } catch (error: any) {
      console.error("Error updating attendance:", error)
      Swal.fire("Error", "Failed to update attendance. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const goldStarOptions = [
    "Being on Task",
    "Participating",
    "Working Hard",
    "Helping others",
    "On task",
    "Persistence",
    "Teamwork"
  ]

  const redFlagOptions = [
    "Disruptive",
    "Not paying attention",
    "Late arrival",
    "Missing homework",
    "Inappropriate behavior"
  ]

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
          <h2 className="text-xl font-semibold text-gray-900">Student attendance and behaviour</h2>
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
              <span className="font-medium text-gray-900">{lesson.className || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-gray-600">Lesson date and time:</span>
              <span className="font-medium text-gray-900">{lessonDate}, {lessonTime}</span>
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
                onClick={() => handleMarkAttendance("Present")}
                disabled={isExcused || loading}
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
                onClick={() => handleMarkAttendance("Absent")}
                disabled={isExcused || loading}
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
                onClick={() => handleMarkAttendance("Late")}
                disabled={isExcused || loading}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                  attendanceStatus === "Late"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-50"
                } ${isExcused ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Clock size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700">Late</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isExcused}
                onChange={handleToggleExcused}
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Mark as excused</span>
            </label>
          </div>

          {/* Behaviour Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Behaviour</h3>
            </div>
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              <button
                onClick={() => setBehaviourTab("gold")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  behaviourTab === "gold"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Gold star
              </button>
              <button
                onClick={() => setBehaviourTab("red")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  behaviourTab === "red"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Red flag
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {behaviourTab === "gold"
                ? goldStarOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedGoldStars((prev) =>
                          prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
                        )
                      }}
                      className={`p-3  border-2 transition-colors ${
                        selectedGoldStars.includes(option)
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Star
                        size={24}
                        className={`mx-auto mb-1 ${
                          selectedGoldStars.includes(option) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                      <div className="text-xs text-center text-gray-700">{option}</div>
                    </button>
                  ))
                : redFlagOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedRedFlags((prev) =>
                          prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
                        )
                      }}
                      className={`p-3  border-2 transition-colors ${
                        selectedRedFlags.includes(option)
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Flag
                        size={24}
                        className={`mx-auto mb-1 ${
                          selectedRedFlags.includes(option) ? "fill-red-400 text-red-400" : "text-gray-300"
                        }`}
                      />
                      <div className="text-xs text-center text-gray-700">{option}</div>
                    </button>
                  ))}
            </div>
          </div>

          {/* Lesson Grade Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award size={18} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Lesson grade</h3>
            </div>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Enter grade in percentage"
              className="w-full h-10 px-3  border border-gray-200 bg-white text-sm"
            />
          </div>

          {/* Note Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <StickyNote size={18} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Note</h3>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note"
              rows={4}
              className="w-full px-3 py-2  border border-gray-200 bg-white text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="h-10 px-4  border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // TODO: Save grade, notes, and behaviour
              Swal.fire("Success", "Changes saved successfully", "success")
              onSuccess()
              onClose()
            }}
            className="h-10 px-4  bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
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