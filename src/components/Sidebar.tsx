import {
  FileText,
  Settings,
  Users,
  LayoutDashboard,
  Calendar,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  MessageSquare
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "./AuthContext";

// YOUR ORIGINAL LINKS & TEXT PRESERVED
const adminTeacherItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { id: "calendar", icon: Calendar, label: "Calendar", path: "/calendar" },
  { id: "people", icon: Users, label: "People", path: "/people" },
  { id: "notes", icon: BookOpen, label: "Classes & events", path: "/notes" },
  // { id: "payments", icon: CreditCard, label: "Payments", path: "/payments" },
  // { id: "messaging", icon: MessageSquare, label: "Group Messaging", path: "/messaging" },
  // { id: "reports", icon: FileText, label: "Reports", path: "/reports" },
  // { id: "settings", icon: Settings, label: "School Management", path: "/settings" },
];

const studentItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
  { id: "calendar", icon: Calendar, label: "Calendar", path: "/student/calendar" },
  { id: "classes", icon: BookOpen, label: "Classes", path: "/student/classes" },
  { id: "files", icon: FileText, label: "Files", path: "/student/files" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpanded, setIsExpanded } = useSidebar();
  const { user } = useAuth();

  const getMenuItems = () => {
    if (!user) return adminTeacherItems;
    if (user.role === 'Student') return studentItems;
    return adminTeacherItems;
  };

  const items = getMenuItems();
  const active = items.find((i) => location.pathname.startsWith(i.path))?.id || "dashboard";

  const logo = "/src/assets/logo-icon.png";

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-30 transition-all duration-300 ${
        isExpanded ? 'w-[325px]' : 'w-[100px]' // Adjusted width for the stacked look
      }`}
    >
      {/* Top Spacer for Fixed Header */}
     <div className="h-14 bg-[#2b2f3e] w-full shrink-0 flex items-center justify-center">
        <img
          src={logo}
          alt="Logo"
          className="h-6 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 py-4 overflow-y-auto flex-1 scrollbar-thin">
        {items.map(({ id, icon: Icon, label, path }) => {
          const isActive = active === id;
          
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              // DESIGN LOGIC: If Expanded -> Row layout. If Collapsed -> Column (Stacked) layout (MATCHING IMAGE 2)
              className={`group transition-all duration-200 
                ${isExpanded 
                  ? 'flex items-center gap-4 px-6 py-3 min-h-[50px] text-left' 
                  : 'flex flex-col items-center justify-center gap-1 py-4 px-1 min-h-[85px] text-center'
                }
                ${isActive ? "bg-transparent" : "hover:bg-gray-50"}
              `}
            >
              <Icon
                size={isExpanded ? 22 : 26} // Bigger icon when stacked
                strokeWidth={isActive ? 2 : 1.5}
                className={`transition-colors duration-200 ${
                    isActive ? "text-[#1a73e8] fill-blue-50" : "text-[#999999] group-hover:text-gray-600"
                }`}
              />
              
              <span className={`font-medium transition-colors duration-200 leading-tight ${
                 isActive ? "text-[#1a73e8]" : "text-[#888888] group-hover:text-gray-700"
              } ${isExpanded ? 'text-sm' : 'text-[11px] max-w-[80px]'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <div className="p-2 border-t border-gray-100 flex justify-center bg-gray-50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}