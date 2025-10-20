  import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
  import Sidebar from "./components/Sidebar"
  import Header from "./components/Header"
  import Dashboard from "./components/Dashboard"
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
          {/* Sidebar */}
          <Sidebar />

          {/* Header */}
          <Header />

          {/* Routed Pages */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Calendar Tabs */}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/calendar/teacher" element={<Calendar showTeacher />} />
            <Route path="/calendar/classroom" element={<Calendar />} />

            {/* People */}
            <Route path="/people" element={<PeopleDashboard />} />
            <Route path="/people/students/:id" element={<StudentProfile />} />
            <Route path="/people/students" element={<PeopleDashboard />} />
            <Route path="/people/teachers/:id" element={<TeacherProfile />} />
            <Route path="/people/teachers" element={<PeopleDashboard />} />
            <Route path="/people/staffs/:id" element={<StaffProfile />} />
            <Route path="/people/staffs" element={<PeopleDashboard />} />
            <Route path="/people/related" element={<PeopleDashboard />} />
            <Route path="/people/prospects" element={<PeopleDashboard />} />

            {/* Notes section (Classes & events) */}
            <Route path="/notes" element={<NotesDashboard />} />
            <Route path="/notes/classes" element={<NotesClasses />} />
            <Route path="/notes/events" element={<NotesEvents />} />

            {/* Payments */}
            <Route path="/payments" element={<PaymentsDashboard />} />
            <Route path="/payments/received" element={<PaymentsDashboard />} />
            <Route path="/payments/overdue" element={<PaymentsDashboard />} />
            <Route path="/payments/future" element={<PaymentsDashboard />} />
            <Route path="/payments/invoices" element={<PaymentsDashboard />} />
            <Route path="/payments/refunds" element={<PaymentsDashboard />} />
            <Route path="/payments/add-refund" element={<AddRefund />} />
            <Route path="/payments/add-invoice" element={<AddInvoice />} />
            <Route path="/payments/add-payment" element={<AddPayment />} />

            {/* Communication */}
            <Route path="/communication" element={<CommunicationDashboard />} />
            <Route path="/communication/email" element={<CommunicationDashboard />} />
            <Route path="/communication/sms" element={<CommunicationDashboard />} />
            <Route path="/communication/announcements" element={<CommunicationDashboard />} />
            <Route path="/compose" element={<Compose />} />

            {/* Reports */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/attendance" element={<AttendanceReports />} />
            <Route path="/reports/lessons" element={<LessonReports />} />

            {/* School Management */}
            <Route path="/school" element={<SchoolManagement />} />
            <Route path="/school/inventory" element={<SchoolManagement />} />
            <Route path="/school/signatures" element={<SchoolManagement />} />
            <Route path="/school/library" element={<SchoolManagement />} />
            <Route path="/school/expenses/new" element={<ExpenseForm />} />
            <Route path="/school/inventory/new" element={<InventoryForm />} />
          </Routes>
        </div>
      </Router>
    )
  }
