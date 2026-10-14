import {
  FileText,
  Bell,
  Settings,
  Users,
  LayoutDashboard,
  NotebookPen,
  Calendar,
  CreditCard,
  MessageSquare,
  BarChart3,
  Building2,
  BookOpen,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
  import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "./AuthContext";
import axiosInstance from "./axiosInstance";

  const logo = "/src/assets/logo.webp";

  const items = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { id: "calendar", icon: Calendar, label: "Calendar", path: "/calendar" },
    { id: "people", icon: Users, label: "People", path: "/people" },
    { id: "notes", icon: BookOpen, label: "Classes & Events", path: "/notes" },
    { id: "payments", icon: CreditCard, label: "Payments", path: "/payments" },
    { id: "communication", icon: MessageSquare, label: "Communication", path: "/communication" },
    { id: "reports", icon: BarChart3, label: "Reports", path: "/reports" },
    { id: "school", icon: Building2, label: "School Management", path: "/school" },
    { id: "student-requests", icon: ClipboardList, label: "Student Requests", path: "/student-requests" },
  ];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpanded, setIsExpanded } = useSidebar();
  const { user } = useAuth();
  const [pendingStudentRequestCount, setPendingStudentRequestCount] = useState(0);

  useEffect(() => {
    if (user?.role?.toLowerCase() !== "admin") return;
    let active = true;
    const loadCount = async () => {
      try {
        const [requests, holidays] = await Promise.all([
          axiosInstance.get("/StudentPortalRequests/GetPending"),
          axiosInstance.get("/StudentHolidayWorkflow/GetPendingRequests")
        ]);
        if (!active) return;
        const requestCount = requests.data?.IsSuccess && Array.isArray(requests.data.Data) ? requests.data.Data.length : 0;
        const holidayCount = holidays.data?.IsSuccess && Array.isArray(holidays.data.Data) ? holidays.data.Data.length : 0;
        setPendingStudentRequestCount(requestCount + holidayCount);
      } catch { if (active) setPendingStudentRequestCount(0); }
    };
    void loadCount();
    const interval = window.setInterval(loadCount, 30_000);
    return () => { active = false; window.clearInterval(interval); };
  }, [user?.role]);
  const active = items.find((i) => location.pathname.startsWith(i.path))?.id ||
                 (location.pathname === "/compose" ? "communication" : "dashboard");

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-indigo-50 to-blue-50 flex flex-col items-center transition-all duration-300 overflow-visible z-40 ${
      isExpanded ? 'w-[325px]' : 'w-[117px]'
    }`}>
        {/* Logo removed as per design */}
        <div className="h-[24px] w-full" />

        {/* Navigation */}
        <nav className="flex flex-col gap-4 py-8 flex-1 mt-4 overflow-visible">
          {items.map(({ id, icon: Icon, label, path }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                aria-label={label}
                onClick={() => navigate(path)}
                className={`h-12 rounded-2xl transition-colors duration-200 group flex items-center gap-3 px-4 relative
                  ${
                    isActive
                      ? "text-indigo-600 bg-white"
                      : "text-gray-500 hover:text-indigo-600 hover:bg-white"
                  }
                  ${isExpanded ? 'w-full justify-start' : 'w-20 justify-center'}
                `}
              >
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-indigo-600" : "text-gray-600 group-hover:text-indigo-500"
                  }`}
                />
                {!isExpanded && id === "student-requests" && pendingStudentRequestCount > 0 && <span className="absolute right-3 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />}
                {isExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap flex items-center gap-2">
                    {label}
                    {id === "student-requests" && pendingStudentRequestCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] text-white">{pendingStudentRequestCount}</span>}
                  </span>
                )}
                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <span className="absolute left-full ml-3 px-3 py-1 rounded-lg text-sm bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-50 whitespace-nowrap">
                    {label}{id === "student-requests" && pendingStudentRequestCount > 0 ? ` · ${pendingStudentRequestCount} pending` : ""}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider removed */}

        {/* Toggle Button */}
        <div className="pb-6">
          <button
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-12 w-12 grid place-items-center rounded-2xl text-gray-500 hover:text-indigo-600 hover:bg-white transition-colors duration-200"
          >
            {isExpanded ? (
              <ChevronLeft size={20} strokeWidth={1.8} />
            ) : (
              <ChevronRight size={20} strokeWidth={1.8} />
            )}
          </button>
        </div>
      </aside>
    );
  }

