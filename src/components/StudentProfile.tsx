 import { useParams, useNavigate } from "react-router-dom"
import { ChevronDown, Plus, Download, MoreHorizontal, CheckCircle, Clock, FileText, User, Calendar, DollarSign, Receipt, Users, StickyNote, Paperclip, BookOpen, Award, FilePlus, Sun, Archive, Trash2, CreditCard, Mail, Megaphone, BarChart3, Calendar as CalendarIcon, FileCheck } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import axiosInstance from "./axiosInstance"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

type StudentFieldKey =
  | "Name"
  | "Student ID"
  | "Address"
  | "Date of Birth"
  | "Nationality"
  | "Passport Number"
  | "Course Start Date"
  | "Course End Date"
  | "Course Title"
  | "Course Level"
  | "Mode of Study"
  | "Number of Weeks"
  | "Hours Per Week"
  | "Tuition Fees"
  | "Course Code"

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
  const { id } = useParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("profile")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [portalInviteOpen, setPortalInviteOpen] = useState(false)
  const [studentdetails, setStudent] = useState<any>(null)
  const [openDocumentId, setOpenDocumentId] = useState<string | null>(null)
  const documentContentRef = useRef<HTMLDivElement | null>(null)

  

  // ✅ MOVE THESE UP
  const [classesSubTab, setClassesSubTab] = useState<'classes'|'lessons'|'events'>('classes')
  const [feesTab, setFeesTab] = useState<'grouped'|'individual'>('grouped')

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axiosInstance.get(`/Student/GetById/${id}`);
        if (response.data?.IsSuccess) setStudent(response.data.Data);
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

  // ✅ SAFE TO RETURN NOW
  if (!studentdetails) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading student profile...
      </div>
    );
  }

  const studentName = `${studentdetails.FirstName ?? ""} ${studentdetails.LastName ?? studentdetails.Surname ?? ""}`.trim();

  const age = studentdetails.DateOfBirth
  ? Math.floor(
      (new Date().getTime() - new Date(studentdetails.DateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    )
  : null;

  

  const studentAddress = [
    studentdetails.StreetAddress,
    studentdetails.City,
    studentdetails.State,
    studentdetails.ZipCode,
    studentdetails.Country
  ]
    .filter(Boolean)
    .join(", ")

  const defaultFieldKeys: StudentFieldKey[] = [
    "Name",
    "Student ID",
    "Address",
    "Date of Birth",
    "Nationality",
    "Passport Number",
    "Course Start Date",
    "Course End Date",
    "Course Title",
    "Course Level",
    "Mode of Study",
    "Number of Weeks",
    "Hours Per Week",
    "Tuition Fees",
    "Course Code"
  ]

  const studentFieldResolvers: Record<StudentFieldKey, () => string> = {
    "Name": () => studentName || "—",
    "Student ID": () => studentdetails.IdNumber || "—",
    "Address": () => studentAddress || "—",
    "Date of Birth": () => formatDateValue(studentdetails.DateOfBirth),
    "Nationality": () => studentdetails.Nationality || "—",
    "Passport Number": () => studentdetails.PassportNumber || "—",
    "Course Start Date": () => formatDateValue(studentdetails.CourseStartDate),
    "Course End Date": () => formatDateValue(studentdetails.CourseEndDate),
    "Course Title": () => studentdetails.CourseTitle || "—",
    "Course Level": () => studentdetails.CourseLevel || "—",
    "Mode of Study": () => studentdetails.ModeOfStudy || "—",
    "Number of Weeks": () => studentdetails.NumberOfWeeks ?? "—",
    "Hours Per Week": () => studentdetails.HoursPerWeek ?? "—",
    "Tuition Fees": () => formatCurrency(studentdetails.TuitionFees),
    "Course Code": () => studentdetails.CourseCode || "—"
  }

  const getStudentFieldValue = (key: StudentFieldKey) => studentFieldResolvers[key]()

  const documentButtonLabels = [
    "Confirmation of Enrolment (Colm Delmar)",
    "Letter of Acceptance (Colm)",
    "Bank Letter (Ahmed)",
    "Letter of Acceptance (Ahmed)",
    "Leap Card Letter",
    "Confirmation of Enrolment (Ahmed)",
    "Holiday Letter (Carla)",
    "Student Status Letter (Colm Delmar)",
    "Student Reference Letter for GNIB",
    "Christmas Holiday Letter (Carla)",
    "Summer Holiday - Reference Letter",
    "Exit Letter - No Show (Colm)",
    "Exit Letter - Exam Later Date",
    "Exit Letter - Exam Taken",
    "Exit Letter - Covid-19",
    "Exit Letter - Short Term",
    "gnib 2025",
    "Certificate of Attendance (2025)",
    "Letter of Acceptance (2025)",
    "Confirmation of Enrollment (2025)"
  ]

  const documentTemplateOverrides: Record<string, Partial<Omit<DocumentTemplateContent, "id" | "label">>> = {
    [slugify("Confirmation of Enrolment (Colm Delmar)")]: {
      heading: "Confirmation of Enrolment",
      recipientLines: [
        "To,",
        "Garda National Immigration Bureau:",
        "13-14 Burgh Quay, Dublin 2."
      ],
      paragraphs: [
        "We are pleased to confirm that the below-named student has been enrolled on a course at Dublin Centre of Education, as follows. This 8-month course is listed on the Interim List of Eligible Programmes (ILEP) under Dublin Centre of Education."
      ],
      closingLines: [
        "The student has agreed to abide by the rules and regulations governing their study set by the Irish National Immigration Bureau. This student is covered by Learner Protection Insurance through Endeavour Insurance Services, Academic+.",
        "Should you require any further information regarding this student, please do not hesitate to contact us on +353 1 538 1502 or info@dcedu.ie."
      ],
      signatureName: "Colm Delmar",
      signatureRole: "Director of Studies."
    },
    [slugify("Letter of Acceptance (Colm)")]: {
      heading: "Letter of Acceptance",
      subheading: "Re: Letter of Acceptance",
      paragraphs: [
        "Following your application, it has been agreed to offer you a place on the programme detailed below. This 8-month course is listed on the Interim List of Eligible Programmes (ILEP) under Dublin Centre of Education.",
        "You have been issued with private medical insurance and Learner Protection insurance cover for the current academic period of 8 months. This policy is administered by Endeavour Insurance Services, Academic+, which will be activated upon your arrival. Your registration will take place immediately after arrival in the college. Your detailed timetable, course materials, module handouts etc. will be provided to you during registration."
      ],
      closingLines: [
        "Should you require any further information, please do not hesitate to contact us on +353 1 538 1502 or info@dcedu.ie."
      ],
      signatureName: "Colm Delmar",
      signatureRole: "Director of Studies."
    },
    [slugify("Bank Letter (Ahmed)")]: {
      heading: "Bank Letter",
      paragraphs: [
        "We are pleased to confirm that the below-named student is currently enrolled on a course at Dublin Centre of Education, as follows, and we request that you open a bank account for our student:"
      ],
      closingLines: [
        "Should you require any further information regarding this student, please do not hesitate to contact us on +353 1 538 1502 or info@dcedu.ie."
      ],
      signatureName: "Asif Omer",
      signatureRole: "Manager"
    }
  }

  const documentTemplates: DocumentTemplateContent[] = documentButtonLabels.map((label) => {
    const id = slugify(label)
    const override = documentTemplateOverrides[id] ?? {}

    return {
      id,
      label,
      heading: override.heading ?? label,
      subheading: override.subheading,
      recipientLines: override.recipientLines ?? ["To whom it may concern,"],
      paragraphs:
        override.paragraphs ??
        [
          `${studentName || "The student"} has been issued the document "${label}". The details of their enrolment are outlined below.`,
          "Please retain this letter for your records and contact us if additional information is needed."
        ],
      fieldKeys: override.fieldKeys ?? defaultFieldKeys,
      closingLines:
        override.closingLines ?? [
          "Should you require any further information regarding this student, please do not hesitate to contact us on +353 1 538 1502 or info@dcedu.ie."
        ],
      signatureName: override.signatureName ?? "Asif Omer",
      signatureRole: override.signatureRole ?? "Director of Studies"
    }
  })

  const activeDocumentTemplate = documentTemplates.find((doc) => doc.id === openDocumentId) || null

  const tabs = [
    "Profile", "Activity", "Classes", "Attendance", "Fees", "Receipts", 
    "Related contacts", "Notes", "Attachments", "Assignments", "Grades", 
    "Create documents", "Holidays"
  ]

  const renderActivityContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
          <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl">
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Classes</h2>
          <p className="text-gray-600 mt-1">The classes that {studentName} is enrolled in</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setClassesSubTab('classes')}
              className={`h-8 px-3 rounded-lg text-sm transition-colors ${
                classesSubTab === 'classes' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Classes
            </button>
            <button 
              onClick={() => setClassesSubTab('lessons')}
              className={`h-8 px-3 rounded-lg text-sm transition-colors ${
                classesSubTab === 'lessons' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Lessons
            </button>
            <button 
              onClick={() => setClassesSubTab('events')}
              className={`h-8 px-3 rounded-lg text-sm transition-colors ${
                classesSubTab === 'events' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Events
            </button>
          </div>
          <button 
            onClick={() => setOpenModal('enroll-event')}
            className="h-8 px-3 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-1"
          >
            <Plus size={14} /> Enroll
          </button>
        </div>
      </div>
      
      {classesSubTab === 'classes' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Class</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Teacher</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date & time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Enrolled</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Unenrolled</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { class: "PM A2 WALID/DIMITRO", level: "A2", teacher: "2 teachers", schedule: "Monday (15:15-17:00), Tuesday (15:15-17:00) and 6 more", enrolled: "20-10-2025", unenrolled: "", status: "Active", statusColor: "bg-green-100 text-green-800" }
              ].map((cls, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <div>
                        <div className="font-medium text-gray-900">{cls.class}</div>
                        <div className="text-sm text-gray-500">{cls.level}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{cls.teacher}</td>
                  <td className="py-3 px-4 text-gray-700">{cls.schedule}</td>
                  <td className="py-3 px-4 text-gray-700">{cls.enrolled}</td>
                  <td className="py-3 px-4 text-gray-700">{cls.unenrolled}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${cls.statusColor}`}>
                      {cls.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {classesSubTab === 'lessons' && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
              <option>Attendance: All</option>
            </select>
            <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
              <option>Behaviour: All</option>
            </select>
            <select className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
              <option>Class: All</option>
            </select>
            <div className="relative">
              <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
                Date: 01-01-2013 - 01-01-2030 <ChevronDown size={14} />
              </button>
            </div>
            <button className="h-10 w-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
              <Clock size={16} className="text-gray-500" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Class</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Attendance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Behaviour</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Grade</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "20-10-2025 13:00-15:00", class: "PM A2 WALID/DIMITRO A2", attendance: "Present", attendanceColor: "bg-green-100 text-green-800" },
                  { date: "21-10-2025 13:00-15:00", class: "PM A2 WALID/DIMITRO A2", attendance: "Present", attendanceColor: "bg-green-100 text-green-800" },
                  { date: "22-10-2025 13:00-15:00", class: "PM A2 WALID/DIMITRO A2", attendance: "Absent", attendanceColor: "bg-red-100 text-red-800" },
                  { date: "23-10-2025 13:00-15:00", class: "PM A2 WALID/DIMITRO A2", attendance: "Present", attendanceColor: "bg-green-100 text-green-800" }
                ].map((lesson, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">{lesson.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <div className="font-medium text-gray-900">{lesson.class}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${lesson.attendanceColor}`}>
                        {lesson.attendance}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">-</td>
                    <td className="py-3 px-4 text-gray-700">-</td>
                    <td className="py-3 px-4 text-gray-700">-</td>
                    <td className="py-3 px-4">
                      <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {classesSubTab === 'events' && (
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <BookOpen size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enroll {studentName} in an Event</h3>
          <button 
            onClick={() => setOpenModal('enroll-event')}
            className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} /> Register for an event
          </button>
        </div>
      )}
    </div>
  )

  const renderAttendanceContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart Placeholder */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="h-48 w-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full border-8 border-green-500 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">88.8%</div>
                  <div className="text-sm text-gray-600">Present</div>
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
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-gray-700">Present</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700">167 hours</td>
                <td className="py-3 px-4 text-gray-700">111</td>
                <td className="py-3 px-4 text-gray-700">88.80</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-gray-700">Absent</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700">21 hours</td>
                <td className="py-3 px-4 text-gray-700">14</td>
                <td className="py-3 px-4 text-gray-700">11.20</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-gray-700">Late</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700">0</td>
                <td className="py-3 px-4 text-gray-700">0</td>
                <td className="py-3 px-4 text-gray-700">0</td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <span className="text-gray-700">Excused</span>
                </td>
                <td className="py-3 px-4 text-gray-700">0</td>
                <td className="py-3 px-4 text-gray-700">0</td>
                <td className="py-3 px-4 text-gray-700">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )


  const renderFeesContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
            <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
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
            <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Receipts</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-3 rounded-lg bg-blue-600 text-white text-sm">Receipts</button>
          <button className="h-8 px-3 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Invoices</button>
          <button className="h-8 px-3 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Refund</button>
        </div>
      </div>
      
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Receipt size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add {studentName}'s first payment.</h3>
        <p className="text-gray-600 mb-4">{studentName}'s receipts will appear here once a payment is made.</p>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New payment
        </button>
      </div>
    </div>
  )

  const renderRelatedContactsContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Users size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add {studentName}'s relationships</h3>
        <p className="text-gray-600 mb-4">Add {studentName}'s mother, father and any other related contacts here.</p>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Add relationship
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
        <div className="flex items-center gap-3">
          <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
            Note type: All <ChevronDown size={14} />
          </button>
          <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
            Note privacy: All <ChevronDown size={14} />
          </button>
          <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
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

  const renderAttachmentsContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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

  const renderAssignmentsContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create documents</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {documentTemplates.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setOpenDocumentId(doc.id)}
            className="h-12 px-3 rounded-lg bg-blue-50 text-blue-700 text-sm hover:bg-blue-100 transition-colors text-left"
          >
            {doc.label}
          </button>
        ))}
      </div>
    </div>
  )

  const handlePrintDocument = async () => {
    if (!documentContentRef.current || !activeDocumentTemplate) return

    try {
      const canvas = await html2canvas(documentContentRef.current, {
        scale: 2,
        useCORS: true
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

      const sanitizedTitle = activeDocumentTemplate.heading.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      pdf.save(`${sanitizedTitle || "student-document"}.pdf`)
    } catch (error) {
      console.error("Failed to generate PDF", error)
      alert("Unable to generate PDF. Please try again.")
    }
  }

  const renderDocumentModal = () => {
    if (!activeDocumentTemplate) return null
    const todayDisplay = formatDateValue(new Date().toISOString())

    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenDocumentId(null)}>
        <div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create document</h3>
            <button onClick={() => setOpenDocumentId(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
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
              {activeDocumentTemplate.recipientLines && (
                <div className="text-sm text-gray-700 space-y-1">
                  {activeDocumentTemplate.recipientLines.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              )}
              {activeDocumentTemplate.subheading && (
                <p className="text-sm font-medium text-gray-700">{activeDocumentTemplate.subheading}</p>
              )}
              <h2 className="text-center text-lg font-semibold text-gray-900">
                {activeDocumentTemplate.heading}
              </h2>
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                {activeDocumentTemplate.paragraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {activeDocumentTemplate.fieldKeys.map((fieldKey) => (
                      <tr key={fieldKey} className="border-t border-gray-200 first:border-t-0">
                        <td className="bg-gray-50 font-medium px-4 py-2 w-1/3">{fieldKey}</td>
                        <td className="px-4 py-2 text-gray-800">{getStudentFieldValue(fieldKey)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                {activeDocumentTemplate.closingLines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>

              <div className="space-y-1 text-sm text-gray-900">
                <p>Yours faithfully,</p>
                <p className="font-semibold">{activeDocumentTemplate.signatureName}</p>
                <p>{activeDocumentTemplate.signatureRole}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button className="h-10 px-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm inline-flex items-center gap-2">
              <FilePlus size={16} /> Save to students profile
            </button>
            <button className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2">
              <Mail size={16} /> Send document
            </button>
            <button
              onClick={handlePrintDocument}
              className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2"
            >
              <Download size={16} /> Print
            </button>
            <button
              onClick={() => setOpenDocumentId(null)}
              className="h-10 px-4 rounded-lg bg-gray-800 text-white text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderHolidaysContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Sun size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add a holiday for {studentName}</h3>
        <p className="text-gray-600 mb-4">Holidays for {studentName} will appear here.</p>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Add holiday
        </button>
      </div>
    </div>
  )

  const renderProfileContent = () => (
    <div className="space-y-6">
      {/* Contact Details */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.Email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.MobilePhone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.StreetAddress}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">City</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.City}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Country</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.Country}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Postcode</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.ZipCode}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Identity Information */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Identity Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Nationality</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.Nationality}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Passport Number</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.PassportNumber?.split('T')[0]}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Passport Expiry Date</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.PassportExpiryDate?.split('T')[0]}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">GNIB Expiry Date</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.GnibExpiryDate?.split('T')[0] || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Course Title</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.CourseTitle}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Course Start Date</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.CourseStartDate?.split('T')[0]}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Course End Date</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.CourseEndDate?.split('T')[0]}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Attendance</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.Attendance}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Course Level</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.CourseLevel}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Mode of Study</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.CourseLevel}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Number of Weeks</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.NumberOfWeeks}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Hours Per Week</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.HoursPerWeek}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Tuition Fees</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.TuitionFees}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Course Code</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.CourseCode}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Date of External Exam</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.ExternalExam}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Duration</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">End of Exam paid</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Department</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">External Exam</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Score External Exam</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.ScoreExternalExam}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Date of Payment</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.DateOfPayment?.split('T')[0]}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Schedule</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.Schedule}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ILEP reference number</div>
              <div className="text-sm text-gray-900 mt-1">{studentdetails.IlepReference}</div>
            </div>
          </div>
        </div>
      </div>

      {/* School Portal */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">School Portal</h3>
        <p className="text-sm text-gray-600 mb-6">Enable or disable this student's access to your school portal.</p>
        
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
              <div className="text-sm text-gray-900 mt-1">{studentName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Automatic reminders</div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
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
                  onClick={() => setPortalInviteOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Invite to portal
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Abdurrakhim has created an account</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Password</div>
              <div className="mt-1">
                <button className="text-sm text-blue-600 hover:text-blue-700">Change password</button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Last login</div>
              <div className="text-sm text-gray-900 mt-1">never</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Delete account</div>
              <div className="mt-1">
                <button className="text-sm text-blue-600 hover:text-blue-700">Delete portal account</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">Created by: Asif Omer</div>
          <div className="text-xs text-gray-500">Created date: 04-04-2025 15:25</div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch(activeTab.toLowerCase()) {
      case "profile": return renderProfileContent()
      case "activity": return renderActivityContent()
      case "classes": return renderClassesContent()
      case "attendance": return renderAttendanceContent()
      case "fees": return renderFeesContent()
      case "receipts": return renderReceiptsContent()
      case "related contacts": return renderRelatedContactsContent()
      case "notes": return renderNotesContent()
      case "attachments": return renderAttachmentsContent()
      case "assignments": return renderAssignmentsContent()
      case "grades": return renderGradesContent()
      case "create documents": return renderCreateDocumentsContent()
      case "holidays": return renderHolidaysContent()
      default: return renderProfileContent()
    }
  }

  return (
    <div>
      <div className="px-6 py-6">
        
        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <img src={`https://i.pravatar.cc/96?img=${(Number(id||1)%70)+1}`} className="h-16 w-16 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 truncate">{studentName}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Student</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div>{studentdetails.Gender || "-"}</div>
                  <div>{age ? `${age} years old` : "-"}</div>

                  {studentdetails.MobilePhone ? (
                    <div>{studentdetails.MobilePhone}</div>
                  ) : (
                    <button className="inline-flex items-center gap-1 text-indigo-600" onClick={() => alert('Add phone')}>
                      + add phone
                    </button>
                  )}

                  <a className="text-blue-700" href={`mailto:${studentdetails.Email}`}>
                    {studentdetails.Email}
                  </a>

                <div className="inline-flex items-center gap-1 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  1
                </div>
                <div className="text-emerald-700">€0</div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div>Joined April 2025</div>
                <div>Attended 3 days ago</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Payment Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'payment' ? null : 'payment')}
                  className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                >
                  Payment <ChevronDown size={14} />
                </button>
                {openDropdown === 'payment' && (
                  <div className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={()=>{setOpenDropdown(null); navigate('/payments/add-payment')}}>
                      <CreditCard size={16} /> New payment
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={()=>{setOpenDropdown(null); navigate('/payments/add-invoice')}}>
                      <FileText size={16} /> New invoice
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={()=>{setOpenDropdown(null); navigate('/payments/add-refund')}}>
                      <Archive size={16} /> New refund
                    </div>
                  </div>
                )}
              </div>

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

              {/* Reports Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'reports' ? null : 'reports')}
                  className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                >
                  Reports <ChevronDown size={14} />
                </button>
                {openDropdown === 'reports' && (
                  <div className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <BarChart3 size={16} /> Student report
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <CalendarIcon size={16} /> Student schedule
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <FileCheck size={16} /> Student transcript
                    </div>
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
                  <div className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <FileText size={16} /> Edit
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <Sun size={16} /> Set holiday
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
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

      {/* Register for Event Modal */}
      {openModal === 'enroll-event' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Enroll Student</h3>
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                <span className="text-gray-500">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg">
                  <CalendarIcon size={16} />
                  Select a event
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
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
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm">
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
              <button className="h-9 px-4 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700">
                ✉️ Send by email
              </button>
            </div>

            <div className="p-6 space-y-8 bg-gray-50 overflow-y-auto">
              <div className="bg-white border border-indigo-200 rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">How to invite people to Teach 'n Go</h2>
                <p className="text-sm text-gray-700">
                  Teach 'n Go is great for managing your classes and students. It gets better when teachers, students and related contacts are involved too!
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  You can send email invites or print out invitations to hand out. If an email is available, we recommend emailing the link to your school members for a smoother sign up. Links to download the mobile app are also included in the email.
                </p>

                <div className="mt-6 border border-indigo-200 rounded-2xl overflow-hidden">
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

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
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

                <div className="border border-gray-200 rounded-2xl overflow-hidden">
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
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
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

                <div className="border border-gray-200 rounded-2xl p-4 flex gap-3 items-start">
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
    </div>
  )
}