import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Edit, 
  MessageSquare, 
  Printer, 
  MoreHorizontal,
  ChevronDown,
  Calendar,
  DollarSign,
  GraduationCap,
  MapPin,
  BookOpen,
  Clock,
  Users,
  Plus,
  Eye,
  Download,
  Copy,
  FileText,
  Paperclip,
  CheckSquare,
  FormInput,
  Award,
  Info,
  X
} from "lucide-react";

const classData = {
  title: "Advanced_AM_DCE1_PART 1",
  subtitle: "General English with Exam Preparation, C1",
  classCode: "0355/0005",
  awardingBody: "ELT",
  schedule: "Friday (9:00-10:30), Monday (9:00-10:30) and 3 more",
  repeats: "Repeats weekly from 02-01-2025 to 31-05-2027",
  price: "No fee",
  teacher: "Colm Delmar1",
  classroom: "Limerick",
  totalLessons: 628,
  totalLessonsHours: "942:00",
  totalHoursTaught: "312:00",
  createdBy: "Asif Omer",
  createdDate: "02-01-2025 11:35"
};

const tabs = [
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "students", label: "Students", icon: Users },
  { id: "fees", label: "Fees", icon: DollarSign },
  { id: "receipts", label: "Receipts", icon: FileText },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "attachments", label: "Attachments", icon: Paperclip },
  { id: "assignments", label: "Assignments", icon: CheckSquare },
  { id: "forms", label: "Forms", icon: FormInput },
  { id: "gradebooks", label: "Gradebooks", icon: Award }
];

export default function ClassDetailsScreen() {
  const [activeTab, setActiveTab] = useState("lessons");

  const renderTabContent = () => {
    switch (activeTab) {
      case "lessons":
        return <LessonsContent />;
      case "students":
        return <StudentsContent />;
      case "fees":
        return <FeesContent />;
      case "receipts":
        return <ReceiptsContent />;
      case "notes":
        return <NotesContent />;
      case "attachments":
        return <AttachmentsContent />;
      case "assignments":
        return <AssignmentsContent />;
      case "forms":
        return <FormsContent />;
      case "gradebooks":
        return <GradebooksContent />;
      default:
        return <LessonsContent />;
    }
  };

  return (
    <div>
      <div className="px-6 py-6">
        {/* Class Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h1 className="text-2xl font-bold text-gray-800">{classData.title}</h1>
              <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
                <ChevronDown className="h-3 w-3" />
              </button>
              <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print
                <ChevronDown className="h-3 w-3" />
              </button>
              <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <MoreHorizontal className="h-4 w-4" />
                More
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">{classData.subtitle}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Class code:</span>
              <span className="text-sm font-medium">{classData.classCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Awarding body:</span>
              <span className="text-sm font-medium">{classData.awardingBody}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Schedule:</span>
              <span className="text-sm font-medium">{classData.schedule}</span>
              <Edit className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-sm font-medium">{classData.price}</span>
              <Edit className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Teacher:</span>
              <span className="text-sm font-medium text-blue-600 cursor-pointer">{classData.teacher}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Classroom:</span>
              <span className="text-sm font-medium">{classData.classroom}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Total lessons:</span>
              <span className="text-sm font-medium">{classData.totalLessons}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Total lessons hours:</span>
              <span className="text-sm font-medium">{classData.totalLessonsHours}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Total hours taught:</span>
              <span className="text-sm font-medium">{classData.totalHoursTaught}</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Created by: {classData.createdBy} Created date: {classData.createdDate}
          </p>
        </div>

        {/* Tabs - underline style */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative -mb-px px-1 py-3 text-sm font-medium transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </span>
                <span
                  className={`absolute left-0 right-0 bottom-0 h-[2px] ${
                    isActive ? "bg-blue-600" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}

// Individual tab content components
function LessonsContent() {
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number | null>(null);
  const [openStudentMenu, setOpenStudentMenu] = useState<number | null>(null);
  const navigate = useNavigate();
  const lessons = [
    { date: "17-10-2025", weekday: "Fri", time: "9:00 - 10:30", room: "Room 11 D7", teacher: { name: "Colm Delmar1", initials: "CD" }, students: 0 },
    { date: "24-10-2025", weekday: "Fri", time: "9:00 - 10:30", room: "Room 11 D7", teacher: { name: "Colm Delmar1", initials: "CD" }, students: 0 },
    { date: "31-10-2025", weekday: "Fri", time: "9:00 - 10:30", room: "Room 11 D7", teacher: { name: "Colm Delmar1", initials: "CD" }, students: 0 },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Lessons</h2>
          <p className="text-gray-600">View and manage lessons for this class</p>
        </div>
        <button
          onClick={() => setShowAddLessonModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add lesson
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>Date: Most relevant</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>Sort: Ascending</option>
        </select>
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <Clock className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {lessons.map((l, i) => (
          <article
            key={i}
            onClick={() => setSelectedLessonIdx(i)}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium text-gray-900">{l.date}</div>
                  <div className="text-sm text-gray-600">{l.weekday}, {l.time}</div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>{l.room}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-gray-400" /> {l.students}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{l.teacher.name}</span>
                  <div className="w-7 h-7 bg-blue-100 rounded-full grid place-items-center">
                    <span className="text-xs font-semibold text-blue-700">{l.teacher.initials}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showAddLessonModal && (
        <AddLessonModal onClose={() => setShowAddLessonModal(false)} />
      )}

      {selectedLessonIdx !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setSelectedLessonIdx(null)}>
          <div className="w-full max-w-7xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <div className="text-lg font-semibold text-gray-900">{lessons[selectedLessonIdx].date} • {lessons[selectedLessonIdx].room}</div>
                <div className="text-sm text-gray-600">{lessons[selectedLessonIdx].weekday}, {lessons[selectedLessonIdx].time}</div>
              </div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setSelectedLessonIdx(null)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-0">
              {/* Main content: Students grid */}
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Students 9</h3>
                  <div className="flex items-center gap-2">
                    {["Attendance", "Behaviour", "Grade", "Message"].map((label) => (
                      <button key={label} className="px-3 h-8 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1">
                        {label}
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.44l3.71-4.21a.75.75 0 111.08 1.04l-4.25 4.83a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" /></svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow relative">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://i.pravatar.cc/80?img=${(i % 70) + 1}`}
                          alt={`Student ${i+1}`}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">Student {i+1}</div>
                          <div className="relative group mt-2">
                            <button className="w-full h-8 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 group-hover:bg-gray-50">
                              Take attendance
                            </button>
                            <div className="absolute left-0 top-full mt-1 hidden group-hover:flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-20">
                              <button className="px-2 py-1 rounded-md text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Present</button>
                              <button className="px-2 py-1 rounded-md text-xs bg-rose-100 text-rose-700 hover:bg-rose-200">Absent</button>
                              <button className="px-2 py-1 rounded-md text-xs bg-amber-100 text-amber-700 hover:bg-amber-200">Late</button>
                            </div>
                          </div>
                        </div>
                        <button
                          className="h-8 w-8 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                          onClick={() => setOpenStudentMenu(openStudentMenu === i ? null : i)}
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01"/></svg>
                        </button>
                      </div>

                      {openStudentMenu === i && (
                        <div className="absolute right-3 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => setOpenStudentMenu(null)}>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            Add/Edit note
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => setOpenStudentMenu(null)}>
                            <span className="inline-block h-4 w-4 rounded border"></span>
                            Mark as excused
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenStudentMenu(null); navigate('/people/students/DCE0001'); }}>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            View profile
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600" onClick={() => setOpenStudentMenu(null)}>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            Remove from class
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right sidebar */}
              <aside className="border-l border-gray-200 p-6 bg-gray-50">
                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-gray-800 mb-3">Edit</div>
                    <div className="space-y-2">
                      {[
                        { label: "Teacher", path: "/people/teachers" },
                        { label: "Date & time", path: "/calendar" },
                        { label: "Cancel lesson", path: "/notes/classes" },
                        { label: "Location", path: "/calendar/classroom" },
                        { label: "Class details", path: "/notes/class-details" },
                      ].map((item) => (
                        <button key={item.label} onClick={() => navigate(item.path)} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">{item.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-3">Actions</div>
                    <div className="space-y-2">
                      {[
                        { label: "Add students", path: "/people/students/new" },
                        { label: "Add prospects", path: "/people/prospects/new" },
                        { label: "Add attachment", path: "/notes/class-details" },
                        { label: "Add assignment", path: "/notes/class-details" },
                        { label: "Invite to portal", path: "/compose" },
                        { label: "Print register", path: "/reports/attendance" },
                      ].map((item) => (
                        <button key={item.label} onClick={() => navigate(item.path)} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">{item.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StudentsContent() {
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Students</h2>
          <p className="text-gray-600">View and manage students enrolled in this class</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Grouped by student</span>
            <div className="w-10 h-6 bg-blue-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-800">
            <BookOpen className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Enroll students
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Present hours</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Enrolled</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: "Abdul Hameed", id: "DCE3277", phone: "", email: "abdulhameed@onepathsolutions.com", enrolled: "02-10-2025", status: "Unenrolled" },
              { name: "Eduardo Augusto Manuel Antonio", id: "DCE2345", phone: "0833445736", email: "edupendela@gmail.com", enrolled: "02-01-2025", status: "Unenrolled" },
              { name: "Etelvina Pomponet Souza Soares Bisneta", id: "DCE2164", phone: "0833814206", email: "etelvinapomponet@icloud.com", enrolled: "16-01-2025", status: "Unenrolled" },
              { name: "Muhammead Patel", id: "DCE2221", phone: "76893534", email: "pmoha698@gmail.com", enrolled: "02-01-2025", status: "Unenrolled" },
              { name: "Pablo Bogdan Begara Lopez", id: "DCE2369", phone: "", email: "paulbega808@gmail.com", enrolled: "02-01-2025", status: "Unenrolled" },
              { name: "Anujin Enkhtsatsral", id: "DCE2314", phone: "0899868570", email: "goimonshn@gmail.com", enrolled: "02-01-2025", status: "Archived" },
              { name: "Brisa Del Mar Montes Ascencio", id: "DCE2320", phone: "0838521309", email: "mar.montes369@gmail.com", enrolled: "16-01-2025", status: "Archived" }
            ].map((student, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{student.phone || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{student.email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">00:00</td>
                <td className="px-4 py-3 text-sm text-gray-900">{student.enrolled}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.status === "Unenrolled" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 text-gray-600 hover:text-gray-800">
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEnrollModal && (
        <EnrollStudentsModal onClose={() => setShowEnrollModal(false)} />
      )}
    </>
  );
}

function FeesContent() {
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Fees</h2>
        <div className="flex items-center gap-2">
          <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
            true ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}>
            Grouped by student
          </button>
          <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
            false ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}>
            Individual fees
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <BookOpen className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Set a price for this class</h3>
        <p className="text-gray-600 mb-6">
          Fees owed for this class will appear here once you set a price for this class and enroll students.
        </p>
        <button
          onClick={() => setShowEditPriceModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
        >
          <Plus className="h-4 w-4" />
          Set the class price
        </button>
      </div>

      {showEditPriceModal && (
        <EditPriceModal onClose={() => setShowEditPriceModal(false)} />
      )}
    </>
  );
}

function ReceiptsContent() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Receipts</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <FileText className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No payments received for this class</h3>
        <p className="text-gray-600 mb-6">
          Receipts for payments made for this class will appear here.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
          <Plus className="h-4 w-4" />
          New payment
        </button>
      </div>
    </>
  );
}

function NotesContent() {
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showCopyNotesModal, setShowCopyNotesModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddNoteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New note
          </button>
          <button
            onClick={() => setShowCopyNotesModal(true)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy notes
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <FileText className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Add notes about Advanced_AM_DCE1_PART 1</h3>
        <p className="text-gray-600 mb-6">
          Notes concerning Advanced_AM_DCE1_PART 1 will appear here.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setShowAddNoteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New note
          </button>
          <button
            onClick={() => setShowCopyNotesModal(true)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy notes
          </button>
        </div>
      </div>

      {showAddNoteModal && (
        <AddNoteModal onClose={() => setShowAddNoteModal(false)} />
      )}
      {showCopyNotesModal && (
        <CopyNotesModal onClose={() => setShowCopyNotesModal(false)} />
      )}
    </>
  );
}

function AttachmentsContent() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Attachments</h2>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add attachment
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy attachments
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <Paperclip className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Add attachments</h3>
        <p className="text-gray-600 mb-6">
          You can add and store relevant documents and files here.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add attachment
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy attachments
          </button>
        </div>
      </div>
    </>
  );
}

function AssignmentsContent() {
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          Assignments
          <Info className="h-4 w-4 text-gray-400" />
        </h2>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add assignment
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy assignments
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <CheckSquare className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Assignments will appear here once a teacher has added them.</h3>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setShowAddAssignmentModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add assignment
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy assignments
          </button>
        </div>
      </div>

      {showAddAssignmentModal && (
        <AddAssignmentModal onClose={() => setShowAddAssignmentModal(false)} />
      )}
    </>
  );
}

function FormsContent() {
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          Forms
          <Info className="h-4 w-4 text-gray-400" />
        </h2>
        <button
          onClick={() => setShowCreateFormModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add form
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <FormInput className="h-16 w-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Forms will appear here once they have been added</h3>
        <button
          onClick={() => setShowCreateFormModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
        >
          <Plus className="h-4 w-4" />
          Add form
        </button>
      </div>

      {showCreateFormModal && (
        <CreateFormModal onClose={() => setShowCreateFormModal(false)} />
      )}
    </>
  );
}

function GradebooksContent() {
  const [showAddGradebookModal, setShowAddGradebookModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          Gradebooks
          <Info className="h-4 w-4 text-gray-400" />
        </h2>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy gradebook template
          </button>
          <button
            onClick={() => setShowAddGradebookModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add and edit gradebooks
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Class grade</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Notes</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: "Abdul Hameed", id: "DCE3277" },
              { name: "Anujin Enkhtsatsral", id: "DCE2314" },
              { name: "Brisa Del Mar Montes Ascencio", id: "DCE2320" },
              { name: "Busang Dube", id: "DCE2071" },
              { name: "Cindy Lorena Lopez Villatoro", id: "DCE2230" },
              { name: "Eduardo Augusto Manuel Antonio", id: "DCE2345" }
            ].map((student, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder=""
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder=""
                  />
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 text-gray-600 hover:text-gray-800">
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddGradebookModal && (
        <AddGradebookModal onClose={() => setShowAddGradebookModal(false)} />
      )}
    </>
  );
}

// Modal components (simplified for now)
function AddLessonModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add a new lesson</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">Select the lesson days and times, classroom and teacher</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="text" defaultValue="21-10-2025" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start time *</label>
              <input type="text" placeholder="start time..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End time *</label>
              <input type="text" placeholder="end time..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classroom</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Limerick</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Online lesson link</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Select Teacher</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher hourly fee (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                <input type="text" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <button className="text-blue-600 text-sm hover:underline">+ Add another teacher</button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add lesson
          </button>
        </div>
      </div>
    </div>
  );
}

function EnrollStudentsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Enroll students</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Enroll students in 'Advanced_AM_DCE1_PART 1' Select the date on which the students will be enrolled in the class and then select which students to enroll.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment date *</label>
              <input type="text" defaultValue="21-10-2025" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unenrollment date (optional)</label>
              <input type="text" placeholder="Select date..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select from existing students</h3>
          <div className="flex items-center gap-3 mb-4">
            <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy from another class
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add new student
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">All students</h4>
              <div className="border border-gray-200 rounded-lg h-64 overflow-y-auto">
                {["Evo Calahuma Juchasara", "Jimena Rojas Balderrama", "a b", "Abdul Hameed", "Abdullah Jan", "Abdullah Test", "Abdurrakhim Umirbyek", "Abraham Emmanuel Acosta Garcia"].map((name, index) => (
                  <div key={index} className="p-2 hover:bg-gray-50 cursor-pointer">
                    {name}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Use shift and control keys to select multiple students</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Enrolled students</h4>
              <div className="border border-gray-200 rounded-lg h-64 bg-gray-50 flex items-center justify-center">
                <span className="text-gray-500">No students selected</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function EditPriceModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit price</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add a price</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-2">
              <X className="h-4 w-4" />
              No fee
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hourly fee
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Monthly fee
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Custom fee
            </button>
          </div>
          <p className="text-gray-600">There are no fees for this class.</p>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function AddNoteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add a note</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <button className="p-1 text-gray-600 hover:text-gray-800">B</button>
              <button className="p-1 text-gray-600 hover:text-gray-800">I</button>
              <button className="p-1 text-gray-600 hover:text-gray-800">U</button>
              <button className="p-1 text-gray-600 hover:text-gray-800">S</button>
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <button className="p-1 text-gray-600 hover:text-gray-800">≡</button>
              <button className="p-1 text-gray-600 hover:text-gray-800">≡</button>
              <button className="p-1 text-gray-600 hover:text-gray-800">≡</button>
              <button className="p-1 text-gray-600 hover:text-gray-800">≡</button>
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <button className="p-1 text-gray-600 hover:text-gray-800 bg-yellow-200">A</button>
              <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                <option>14</option>
              </select>
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <button className="p-1 text-gray-600 hover:text-gray-800">•</button>
              <button className="p-1 text-gray-600 hover:text-gray-800">1.</button>
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <button className="p-1 text-gray-600 hover:text-gray-800">🔗</button>
              <button className="p-1 text-gray-600 hover:text-gray-800">📹</button>
              <button className="p-1 text-gray-600 hover:text-gray-800">🖼️</button>
              <button className="p-1 text-gray-600 hover:text-gray-800">📎</button>
            </div>
            <textarea
              className="w-full h-32 border-none resize-none focus:outline-none"
              placeholder="Start typing your note..."
            ></textarea>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2">
                <X className="h-4 w-4" />
                Private
              </button>
              <button className="px-3 py-1 text-gray-600 border border-gray-300 rounded-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Shared
              </button>
              <button className="px-3 py-1 text-gray-600 border border-gray-300 rounded-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Admin
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Note type:</span>
              <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                <option>General</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Notify</span>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <div className="flex items-center gap-2 mt-2 text-blue-600 text-sm">
              <span>0 people selected</span>
              <button className="hover:underline">View</button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add note
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyNotesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Copy notes</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">Select from which class to copy notes.</p>
          <div className="relative">
            <input type="text" placeholder="Select Class" className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-8" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

function AddAssignmentModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Complete the below fields to add a new assignment</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due date *</label>
            <input type="text" defaultValue="21-10-2025" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <button className="p-1 text-gray-600 hover:text-gray-800">B</button>
                <button className="p-1 text-gray-600 hover:text-gray-800">I</button>
                <button className="p-1 text-gray-600 hover:text-gray-800">U</button>
                <button className="p-1 text-gray-600 hover:text-gray-800">S</button>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <button className="p-1 text-gray-600 hover:text-gray-800">≡</button>
                <button className="p-1 text-gray-600 hover:text-gray-800">≡</button>
                <button className="p-1 text-gray-600 hover:text-gray-800">≡</button>
                <button className="p-1 text-gray-600 hover:text-gray-800">≡</button>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <button className="p-1 text-gray-600 hover:text-gray-800 bg-yellow-200">A</button>
                <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                  <option>16</option>
                </select>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <button className="p-1 text-gray-600 hover:text-gray-800">•</button>
                <button className="p-1 text-gray-600 hover:text-gray-800">1.</button>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <button className="p-1 text-gray-600 hover:text-gray-800">🔗</button>
                <button className="p-1 text-gray-600 hover:text-gray-800">📹</button>
                <button className="p-1 text-gray-600 hover:text-gray-800">🖼️</button>
                <button className="p-1 text-gray-600 hover:text-gray-800">📎</button>
              </div>
              <textarea
                className="w-full h-32 border-none resize-none focus:outline-none"
                placeholder="Start typing instructions..."
              ></textarea>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <Paperclip className="h-12 w-12 text-blue-200 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Add attachments</h3>
              <p className="text-gray-600 mb-4">You can add and store relevant documents and files here.</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Add attachment
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add assignment
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateFormModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Create form</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form name</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Basic</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-2">
              <X className="h-4 w-4" />
              Private
            </button>
            <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Shared
            </button>
            <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin
            </button>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Form fields</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Select form fields</h4>
                <div className="space-y-2">
                  {["Text field", "Text area", "Checkbox group", "Radio group", "Dropdown"].map((field, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-2">
                      <FormInput className="h-4 w-4 text-gray-400" />
                      {field}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Drag and drop form fields here</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
                  <span className="text-gray-500">Drop form fields here</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create form
          </button>
        </div>
      </div>
    </div>
  );
}

function AddGradebookModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add and edit gradebooks</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Multiple gradebooks</span>
            <div className="w-10 h-6 bg-gray-200 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Copy grades from another class</span>
            <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy grades from another class
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Grade name</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Grade type</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Grade weight</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Grade order</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Grade date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2">
                      <input type="text" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <select className="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                        <option>Percentage</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <input type="text" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                        <X className="h-4 w-4 text-red-500 cursor-pointer" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="text-blue-600 text-sm hover:underline mt-2">+ Add grade</button>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Save this gradebook as a template</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
