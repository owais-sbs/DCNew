import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { SidebarProvider } from "./contexts/SidebarContext"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import ContentWrapper from "./components/ContentWrapper"
import ChatIcon from "./components/ChatIcon"
import Dashboard from "./components/Dashboard"
import Login from "./components/Login"
import Calendar from "./components/Calendar"
import PeopleDashboard from "./components/PeopleDashboard"
import StudentProfile from "./components/StudentProfile"
import TeacherProfile from "./components/TeacherProfile"
import StaffProfile from "./components/StaffProfile"
import StudentCreate from "./components/StudentCreate"
import TeacherCreate from "./components/TeacherCreate"
import StaffCreate from "./components/StaffCreate"
import RelatedContactCreate from "./components/RelatedContactCreate"
import ProspectCreate from "./components/ProspectCreate"
import NotesDashboard from "./components/NotesDashboard"
import NotesClasses from "./components/NotesClasses"
import NotesEvents from "./components/NotesEvents"
import PaymentsDashboard from "./components/PaymentsDashboard"
import CommunicationDashboard from "./components/CommunicationDashboard"
import Compose from "./components/Compose"
import Reports from "./components/Reports"
import AttendanceReports from "./components/AttendanceReports"
import LessonReports from "./components/LessonReports"
import SchoolManagement from "./components/SchoolManagement"
import ExpenseForm from "./components/ExpenseForm"
import InventoryForm from "./components/InventoryForm"
import AddRefund from "./components/AddRefund"
import AddInvoice from "./components/AddInvoice"
import AddPayment from "./components/AddPayment"
import AddClassForm from "./components/AddClassForm"
import ClassDetailsScreen from "./components/ClassDetailsScreen"
import "react-datepicker/dist/react-datepicker.css";


export default function App() {
  return (
    <SidebarProvider>
      <Router>
        <div
          className="min-h-screen bg-gray-100 text-neutral-700"
          style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
        >
          {/* Floating Chat Icon - appears on all pages */}
          <ChatIcon />
          
          {/* Routed Pages */}
          <Routes>
            {/* Login is the default route */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

                 {/* Main app layout with Sidebar + Header */}
                 <Route
                   path="/dashboard"
                   element={
                     <>
                       <Sidebar />
                       <Header />
                       <ContentWrapper>
                         <Dashboard />
                       </ContentWrapper>
                     </>
                   }
                 />

                 {/* Calendar Tabs */}
                 <Route path="/calendar" element={<><Sidebar /><Header /><ContentWrapper><Calendar /></ContentWrapper></>} />
                 <Route path="/calendar/teacher" element={<><Sidebar /><Header /><ContentWrapper><Calendar showTeacher /></ContentWrapper></>} />
                 <Route path="/calendar/classroom" element={<><Sidebar /><Header /><ContentWrapper><Calendar /></ContentWrapper></>} />

                 {/* People */}
                 <Route path="/people" element={<><Sidebar /><Header /><ContentWrapper><PeopleDashboard /></ContentWrapper></>} />
                 <Route path="/people/students/:id" element={<><Sidebar /><Header /><ContentWrapper><StudentProfile /></ContentWrapper></>} />
                 <Route path="/people/students" element={<><Sidebar /><Header /><ContentWrapper><PeopleDashboard /></ContentWrapper></>} />
                 <Route path="/people/students/new" element={<><Sidebar /><Header /><ContentWrapper><StudentCreate /></ContentWrapper></>} />
                 <Route path="/people/teachers/:id" element={<><Sidebar /><Header /><ContentWrapper><TeacherProfile /></ContentWrapper></>} />
                 <Route path="/people/teachers" element={<><Sidebar /><Header /><ContentWrapper><PeopleDashboard /></ContentWrapper></>} />
                 <Route path="/people/teachers/new" element={<><Sidebar /><Header /><ContentWrapper><TeacherCreate /></ContentWrapper></>} />
                 <Route path="/people/staffs/:id" element={<><Sidebar /><Header /><ContentWrapper><StaffProfile /></ContentWrapper></>} />
                 <Route path="/people/staffs" element={<><Sidebar /><Header /><ContentWrapper><PeopleDashboard /></ContentWrapper></>} />
                 <Route path="/people/staffs/new" element={<><Sidebar /><Header /><ContentWrapper><StaffCreate /></ContentWrapper></>} />
                 <Route path="/people/related/new" element={<><Sidebar /><Header /><ContentWrapper><RelatedContactCreate /></ContentWrapper></>} />
                 <Route path="/people/prospects/new" element={<><Sidebar /><Header /><ContentWrapper><ProspectCreate /></ContentWrapper></>} />
                 <Route path="/people/related" element={<><Sidebar /><Header /><ContentWrapper><PeopleDashboard /></ContentWrapper></>} />
                 <Route path="/people/prospects" element={<><Sidebar /><Header /><ContentWrapper><PeopleDashboard /></ContentWrapper></>} />

                 {/* Notes section (Classes & events) */}
                 <Route path="/notes" element={<><Sidebar /><Header /><ContentWrapper><NotesDashboard /></ContentWrapper></>} />
                 <Route path="/notes/classes" element={<><Sidebar /><Header /><ContentWrapper><NotesDashboard /></ContentWrapper></>} />
                 <Route path="/notes/events" element={<><Sidebar /><Header /><ContentWrapper><NotesDashboard /></ContentWrapper></>} />
                 <Route path="/notes/add-class" element={<><Sidebar /><Header /><ContentWrapper><AddClassForm /></ContentWrapper></>} />
                 <Route 
                    path="/notes/class-details/:id" 
                    element={<><Sidebar /><Header /><ContentWrapper><ClassDetailsScreen /></ContentWrapper></>} 
                  />
                 {/* Payments */}
                 <Route path="/payments" element={<><Sidebar /><Header /><ContentWrapper><PaymentsDashboard /></ContentWrapper></>} />
                 <Route path="/payments/received" element={<><Sidebar /><Header /><ContentWrapper><PaymentsDashboard /></ContentWrapper></>} />
                 <Route path="/payments/overdue" element={<><Sidebar /><Header /><ContentWrapper><PaymentsDashboard /></ContentWrapper></>} />
                 <Route path="/payments/future" element={<><Sidebar /><Header /><ContentWrapper><PaymentsDashboard /></ContentWrapper></>} />
                 <Route path="/payments/invoices" element={<><Sidebar /><Header /><ContentWrapper><PaymentsDashboard /></ContentWrapper></>} />
                 <Route path="/payments/refunds" element={<><Sidebar /><Header /><ContentWrapper><PaymentsDashboard /></ContentWrapper></>} />
                 <Route path="/payments/add-refund" element={<><Sidebar /><Header /><ContentWrapper><AddRefund /></ContentWrapper></>} />
                 <Route path="/payments/add-invoice" element={<><Sidebar /><Header /><ContentWrapper><AddInvoice /></ContentWrapper></>} />
                 <Route path="/payments/add-payment" element={<><Sidebar /><Header /><ContentWrapper><AddPayment /></ContentWrapper></>} />

                 {/* Communication */}
                 <Route path="/communication" element={<><Sidebar /><Header /><ContentWrapper><CommunicationDashboard /></ContentWrapper></>} />
                 <Route path="/communication/email" element={<><Sidebar /><Header /><ContentWrapper><CommunicationDashboard /></ContentWrapper></>} />
                 <Route path="/communication/sms" element={<><Sidebar /><Header /><ContentWrapper><CommunicationDashboard /></ContentWrapper></>} />
                 <Route path="/communication/announcements" element={<><Sidebar /><Header /><ContentWrapper><CommunicationDashboard /></ContentWrapper></>} />
                 <Route path="/compose" element={<><Sidebar /><Header /><ContentWrapper><Compose /></ContentWrapper></>} />

                 {/* Reports */}
                 <Route path="/reports" element={<><Sidebar /><Header /><ContentWrapper><Reports /></ContentWrapper></>} />
                 <Route path="/reports/attendance" element={<><Sidebar /><Header /><ContentWrapper><AttendanceReports /></ContentWrapper></>} />
                 <Route path="/reports/lessons" element={<><Sidebar /><Header /><ContentWrapper><LessonReports /></ContentWrapper></>} />

                 {/* School Management */}
                 <Route path="/school" element={<><Sidebar /><Header /><ContentWrapper><SchoolManagement /></ContentWrapper></>} />
                 <Route path="/school/inventory" element={<><Sidebar /><Header /><ContentWrapper><SchoolManagement /></ContentWrapper></>} />
                 <Route path="/school/signatures" element={<><Sidebar /><Header /><ContentWrapper><SchoolManagement /></ContentWrapper></>} />
                 <Route path="/school/library" element={<><Sidebar /><Header /><ContentWrapper><SchoolManagement /></ContentWrapper></>} />
                 <Route path="/school/expenses/new" element={<><Sidebar /><Header /><ContentWrapper><ExpenseForm /></ContentWrapper></>} />
                 <Route path="/school/inventory/new" element={<><Sidebar /><Header /><ContentWrapper><InventoryForm /></ContentWrapper></>} />
          </Routes>
        </div>
      </Router>
    </SidebarProvider>
  )
}
