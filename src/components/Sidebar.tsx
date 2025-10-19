import {
    FileText,
    Bell,
    Settings,
    Users,
    LayoutDashboard,
    NotebookPen,
    LogOut,
    Calendar,
    CreditCard,
    MessageSquare,
    BarChart3,
    Building2,
    BookOpen,
  } from "lucide-react";
  import { useNavigate, useLocation } from "react-router-dom";
  
  const logo = "/src/assets/logo.webp";
  
  const items = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { id: "calendar", icon: Calendar, label: "Calendar", path: "/calendar" },
    { id: "people", icon: Users, label: "People", path: "/people" },
    { id: "notes", icon: BookOpen, label: "Notes", path: "/notes" },
    { id: "payments", icon: CreditCard, label: "Payments", path: "/payments" },
    { id: "communication", icon: MessageSquare, label: "Communication", path: "/communication" },
    { id: "reports", icon: BarChart3, label: "Reports", path: "/reports" },
    { id: "school", icon: Building2, label: "School Management", path: "/school" },
  ];
  
  export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const active = items.find((i) => location.pathname.startsWith(i.path))?.id || "dashboard";
  
    return (
      <aside className="fixed left-0 top-0 h-screen w-[90px] bg-gradient-to-b from-indigo-50 to-blue-50 border-r border-blue-100 flex flex-col items-center shadow-md">
        {/* Logo */}
        <div className="h-[90px] w-full grid place-items-center border-b border-blue-100 mt-1">
          <img
            src={logo}
            alt="DCEDU Logo"
            className="h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
  
        {/* Navigation */}
        <nav className="flex flex-col gap-4 py-6 flex-1 overflow-y-auto scrollbar-hide mt-2">
          {items.map(({ id, icon: Icon, label, path }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                aria-label={label}
                onClick={() => navigate(path)}
                className={`relative h-12 w-12 grid place-items-center rounded-2xl transition-all duration-200 ease-out group
                  ${
                    isActive
                      ? "text-indigo-600 bg-white shadow-[0_0_10px_rgba(99,102,241,0.25)] ring-2 ring-indigo-300 scale-110"
                      : "text-gray-500 hover:text-indigo-600 hover:bg-white hover:shadow-[0_0_8px_rgba(99,102,241,0.15)] hover:scale-105"
                  }`}
              >
                <Icon
                  size={24}
                  strokeWidth={1.8}
                  className={`transition-all duration-200 ${
                    isActive ? "text-indigo-600" : "text-gray-600 group-hover:text-indigo-500"
                  }`}
                />
                {/* Glow effect */}
                {isActive && (
                  <span className="absolute inset-0 rounded-2xl ring-1 ring-indigo-400 animate-pulse opacity-50" />
                )}
                {/* Tooltip */}
                <span className="absolute left-[80px] px-3 py-1 rounded-lg text-sm bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
  
        {/* Divider */}
        <div className="w-10 border-t border-blue-200 mb-3" />
  
        {/* Logout */}
        <div className="pb-6">
          <button
            aria-label="Logout"
            className="h-12 w-12 grid place-items-center rounded-2xl text-gray-500 hover:text-red-500 hover:bg-white hover:shadow-[0_0_8px_rgba(239,68,68,0.25)] hover:scale-105 transition-all duration-200"
          >
            <LogOut size={24} strokeWidth={1.8} />
          </button>
        </div>
      </aside>
    );
  }
  