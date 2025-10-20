  import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
  import Sidebar from "./components/Sidebar"
  import Header from "./components/Header"
  import Dashboard from "./components/Dashboard"
  import Login from "./components/Login"
  import Calendar from "./components/Calendar"
import PeopleDashboard from "./components/PeopleDashboard"
import StudentProfile from "./components/StudentProfile"
import TeacherProfile from "./components/TeacherProfile"
import StaffProfile from "./components/StaffProfile"
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
import "react-datepicker/dist/react-datepicker.css";


  export default function App() {
    return (
      <Router>
        <div
          className="min-h-screen bg-gray-100 text-neutral-700"
          style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
        >
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
                  <Dashboard />
                </>
              }
            />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Calendar Tabs */}
            <Route path="/calendar" element={<><Sidebar /><Header /><Calendar /></>} />
            <Route path="/calendar/teacher" element={<><Sidebar /><Header /><Calendar showTeacher /></>} />
            <Route path="/calendar/classroom" element={<><Sidebar /><Header /><Calendar /></>} />

            {/* People */}
            <Route path="/people" element={<><Sidebar /><Header /><PeopleDashboard /></>} />
            <Route path="/people/students/:id" element={<><Sidebar /><Header /><StudentProfile /></>} />
            <Route path="/people/students" element={<><Sidebar /><Header /><PeopleDashboard /></>} />
            <Route path="/people/teachers/:id" element={<><Sidebar /><Header /><TeacherProfile /></>} />
            <Route path="/people/teachers" element={<><Sidebar /><Header /><PeopleDashboard /></>} />
            <Route path="/people/staffs/:id" element={<><Sidebar /><Header /><StaffProfile /></>} />
            <Route path="/people/staffs" element={<><Sidebar /><Header /><PeopleDashboard /></>} />
            <Route path="/people/related" element={<><Sidebar /><Header /><PeopleDashboard /></>} />
            <Route path="/people/prospects" element={<><Sidebar /><Header /><PeopleDashboard /></>} />

            {/* Notes section (Classes & events) */}
            <Route path="/notes" element={<><Sidebar /><Header /><NotesDashboard /></>} />
            <Route path="/notes/classes" element={<><Sidebar /><Header /><NotesClasses /></>} />
            <Route path="/notes/events" element={<><Sidebar /><Header /><NotesEvents /></>} />

            {/* Payments */}
            <Route path="/payments" element={<><Sidebar /><Header /><PaymentsDashboard /></>} />
            <Route path="/payments/received" element={<><Sidebar /><Header /><PaymentsDashboard /></>} />
            <Route path="/payments/overdue" element={<><Sidebar /><Header /><PaymentsDashboard /></>} />
            <Route path="/payments/future" element={<><Sidebar /><Header /><PaymentsDashboard /></>} />
            <Route path="/payments/invoices" element={<><Sidebar /><Header /><PaymentsDashboard /></>} />
            <Route path="/payments/refunds" element={<><Sidebar /><Header /><PaymentsDashboard /></>} />
            <Route path="/payments/add-refund" element={<><Sidebar /><Header /><AddRefund /></>} />
            <Route path="/payments/add-invoice" element={<><Sidebar /><Header /><AddInvoice /></>} />
            <Route path="/payments/add-payment" element={<><Sidebar /><Header /><AddPayment /></>} />

            {/* Communication */}
            <Route path="/communication" element={<><Sidebar /><Header /><CommunicationDashboard /></>} />
            <Route path="/communication/email" element={<><Sidebar /><Header /><CommunicationDashboard /></>} />
            <Route path="/communication/sms" element={<><Sidebar /><Header /><CommunicationDashboard /></>} />
            <Route path="/communication/announcements" element={<><Sidebar /><Header /><CommunicationDashboard /></>} />
            <Route path="/compose" element={<><Sidebar /><Header /><Compose /></>} />

            {/* Reports */}
            <Route path="/reports" element={<><Sidebar /><Header /><Reports /></>} />
            <Route path="/reports/attendance" element={<><Sidebar /><Header /><AttendanceReports /></>} />
            <Route path="/reports/lessons" element={<><Sidebar /><Header /><LessonReports /></>} />

            {/* School Management */}
            <Route path="/school" element={<><Sidebar /><Header /><SchoolManagement /></>} />
            <Route path="/school/inventory" element={<><Sidebar /><Header /><SchoolManagement /></>} />
            <Route path="/school/signatures" element={<><Sidebar /><Header /><SchoolManagement /></>} />
            <Route path="/school/library" element={<><Sidebar /><Header /><SchoolManagement /></>} />
            <Route path="/school/expenses/new" element={<><Sidebar /><Header /><ExpenseForm /></>} />
            <Route path="/school/inventory/new" element={<><Sidebar /><Header /><InventoryForm /></>} />
          </Routes>
        </div>
      </Router>
    )
  }
