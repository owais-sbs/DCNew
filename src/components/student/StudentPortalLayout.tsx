import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import Sidebar from "../Sidebar"
import Header from "../Header"
import ContentWrapper from "../ContentWrapper"
import StudentBottomNav from "./StudentBottomNav"

const ALLOWED_STUDENT_PATHS = [
  "/student/dashboard",
  "/student/calendar",
  "/student/classes",
  "/student/files",
  "/student/profile",
]

function isAllowedStudentPath(pathname: string): boolean {
  if (ALLOWED_STUDENT_PATHS.some((p) => pathname === p)) return true
  if (pathname.startsWith("/student/classes/") && pathname !== "/student/classes") return true
  return false
}

export default function StudentPortalLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!location.pathname.startsWith("/student")) return
    if (!isAllowedStudentPath(location.pathname)) {
      navigate("/student/dashboard", { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <>
      <Sidebar />
      <Header />
      <ContentWrapper isStudentPortal>
        <Outlet />
      </ContentWrapper>
      <StudentBottomNav />
    </>
  )
}

