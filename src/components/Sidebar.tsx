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
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
  import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
  
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
  ];
  
export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpanded, setIsExpanded } = useSidebar();
  const active = items.find((i) => location.pathname.startsWith(i.path))?.id ||
                 (location.pathname === "/compose" ? "communication" : "dashboard");
  
  return (
    <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-indigo-50 to-blue-50 border-r border-blue-100 flex flex-col items-center shadow-md transition-all duration-300 ${
      isExpanded ? 'w-[250px]' : 'w-[90px]'
    }`}>
        {/* Logo */}
        <div className="h-[90px] w-full grid place-items-center border-b border-blue-100 mt-1">
          <img
            src={logo}
            alt="DCEDU Logo"
            className="h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
  
        {/* Navigation */}
        <nav className="flex flex-col gap-4 py-6 flex-1 mt-2">
          {items.map(({ id, icon: Icon, label, path }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                aria-label={label}
                onClick={() => navigate(path)}
                className={`h-12 rounded-2xl transition-colors duration-200 group flex items-center gap-3 px-3
                  ${
                    isActive
                      ? "text-indigo-600 bg-white"
                      : "text-gray-500 hover:text-indigo-600 hover:bg-white"
                  }
                  ${isExpanded ? 'w-full justify-start' : 'w-12 justify-center'}
                `}
              >
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-indigo-600" : "text-gray-600 group-hover:text-indigo-500"
                  }`}
                />
                {isExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {label}
                  </span>
                )}
                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <span className="absolute left-[80px] px-3 py-1 rounded-lg text-sm bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
  
        {/* Divider */}
        <div className="w-10 border-t border-blue-200 mb-3" />

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
  