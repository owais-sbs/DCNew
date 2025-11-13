import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./contexts/SidebarContext";

import ChatIcon from "./components/ChatIcon";
import Login from "./components/Login";

import Dashboard from "./components/Dashboard";
import Calendar from "./components/Calendar";
import PeopleDashboard from "./components/PeopleDashboard";
import StudentProfile from "./components/StudentProfile";
import TeacherProfile from "./components/TeacherProfile";
import StaffProfile from "./components/StaffProfile";
import StudentCreate from "./components/StudentCreate";
import TeacherCreate from "./components/TeacherCreate";
import StaffCreate from "./components/StaffCreate";
import RelatedContactCreate from "./components/RelatedContactCreate";
import ProspectCreate from "./components/ProspectCreate";

import NotesDashboard from "./components/NotesDashboard";
import AccountCreation from "./components/AccountCreation";
import NotesClasses from "./components/NotesClasses";
import NotesEvents from "./components/NotesEvents";

import PaymentsDashboard from "./components/PaymentsDashboard";
import CommunicationDashboard from "./components/CommunicationDashboard";
import Compose from "./components/Compose";

import Reports from "./components/Reports";
import AttendanceReports from "./components/AttendanceReports";
import LessonReports from "./components/LessonReports";

import SchoolManagement from "./components/SchoolManagement";
import ExpenseForm from "./components/ExpenseForm";
import InventoryForm from "./components/InventoryForm";
import AddRefund from "./components/AddRefund";
import AddInvoice from "./components/AddInvoice";
import AddPayment from "./components/AddPayment";
import AddClassForm from "./components/AddClassForm";
import ClassDetailsScreen from "./components/ClassDetailsScreen";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import ResetPassword from "./components/ResetPassword";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateLayout from "./components/PrivateLayout";

import "react-datepicker/dist/react-datepicker.css";

export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <div
            className="min-h-screen bg-gray-100 text-neutral-700"
            style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
          >
            <ChatIcon />

            <Routes>

              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* PROTECTED & LAYOUT ROUTES */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <Dashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              {/* Calendar */}
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <Calendar />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/calendar/teacher"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <Calendar showTeacher />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/calendar/classroom"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <Calendar />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              {/* People */}
              <Route
                path="/people"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PeopleDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/students/:id"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <StudentProfile />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/students"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PeopleDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/students/new"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <StudentCreate />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/teachers/:id"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <TeacherProfile />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/teachers"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PeopleDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/teachers/new"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <TeacherCreate />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/staffs/:id"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <StaffProfile />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/staffs"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PeopleDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/staffs/new"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <StaffCreate />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/related/new"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <RelatedContactCreate />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/prospects/new"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <ProspectCreate />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/related"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PeopleDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/people/prospects"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PeopleDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              {/* Account Creation */}
              <Route
                path="/account-creation"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <AccountCreation />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              {/* Notes */}
              <Route
                path="/notes"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <NotesDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notes/classes"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <NotesDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notes/events"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <NotesDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notes/add-class"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <AddClassForm />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notes/class-details/:id"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <ClassDetailsScreen />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              {/* Payments */}
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PaymentsDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments/received"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PaymentsDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments/overdue"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PaymentsDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments/future"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PaymentsDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments/invoices"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PaymentsDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments/refunds"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <PaymentsDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments/add-refund"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <AddRefund />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments/add-invoice"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <AddInvoice />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments/add-payment"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <AddPayment />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              {/* Communication */}
              <Route
                path="/communication"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <CommunicationDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/communication/email"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <CommunicationDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/communication/sms"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <CommunicationDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/communication/announcements"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <CommunicationDashboard />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/compose"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <Compose />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              {/* Reports */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <Reports />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports/attendance"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <AttendanceReports />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports/lessons"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <LessonReports />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              {/* School */}
              <Route
                path="/school"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <SchoolManagement />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/school/inventory"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <SchoolManagement />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/school/signatures"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <SchoolManagement />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/school/library"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <SchoolManagement />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/school/expenses/new"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <ExpenseForm />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/school/inventory/new"
                element={
                  <ProtectedRoute>
                    <PrivateLayout>
                      <InventoryForm />
                    </PrivateLayout>
                  </ProtectedRoute>
                }
              />

            </Routes>
          </div>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}
