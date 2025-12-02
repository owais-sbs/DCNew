import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

import {
  Plus,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  MessageSquare,
  Users,
  LogOut,
  HelpCircle,
  Star,
  BookOpen,
  FileText,
} from "lucide-react";
import { useSidebar } from "../contexts/SidebarContext";

const logo = "/src/assets/logo.webp";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddNewOpen, setIsAddNewOpen] = useState(false);
  const { isExpanded } = useSidebar();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };
  
  // Get profile menu items based on role
  const getProfileMenuItems = () => {
    if (user?.role === 'Student') {
      return [
        { icon: User, label: "My account" },
        { icon: HelpCircle, label: "Help center" },
        { icon: LogOut, label: "Log out" },
      ];
    }
    
    // Admin and Teacher menu items
    return [
      { icon: User, label: "My account" },
      { icon: Settings, label: "School settings" },
      { icon: CreditCard, label: "Subscription & billing" },
      { icon: MessageSquare, label: "Add SMS credits" },
      { icon: Settings, label: "User permissions" },
      { icon: Star, label: "Classic UI" },
      { icon: HelpCircle, label: "Help center" },
      { icon: Star, label: "Feature ideas" },
      { icon: Star, label: "Become an affiliate" },
      { icon: LogOut, label: "Log out" },
    ];
  };
  
  const profileMenuItems = getProfileMenuItems();
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsAddNewOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-indigo-50 via-blue-50 to-white border-b border-blue-100 shadow-sm">
      <div className={`transition-all duration-300 ${isExpanded ? 'pl-[325px]' : 'pl-[117px]'}`}>
        {/* Increased height & spacing */}
        <div className="h-20 flex items-center justify-between px-8 relative">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="DCEDU Logo"
              className="h-16 w-auto object-contain" // logo bigger now
            />
            <span className="text-2xl font-semibold text-indigo-700 tracking-tight">
              DCEDU
            </span>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-3 rounded-full border border-blue-100 bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base placeholder:text-blue-300 shadow-sm"
              />
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-5 relative">
            
            {/* Add New Dropdown - Only show for Admin and Teacher */}
            {user?.role !== 'Student' && (
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsAddNewOpen(!isAddNewOpen)}
                  className="h-11 px-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-base transition"
                >
                  <Plus size={20} />
                  Add new
                </button>

                {isAddNewOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-lg border border-blue-100 p-3 z-30">
                    {[
                      { icon: BookOpen, label: "Class", path: "/notes/add-class" },
                      { icon: FileText, label: "Document", path: "/notes/documents" },
                      { icon: Users, label: "Student", path: "/people/students/new" },
                      { icon: Users, label: "Teacher", path: "/people/teachers/new" },
                      { icon: Users, label: "Staff", path: "/people/staffs/new" },
                      { icon: Users, label: "Related contact", path: "/people/related/new" },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          navigate(item.path);
                          setIsAddNewOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50 transition"
                      >
                        <item.icon size={18} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-12 w-12 flex items-center justify-center rounded-full border border-blue-200 bg-white hover:bg-blue-50 transition relative"
              >
                {user?.name ? (
                  <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                    {getUserInitials()}
                  </div>
                ) : (
                  <img
                    src={logo}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                )}
                <ChevronDown
                  size={18}
                  className="absolute right-[-18px] top-1/2 -translate-y-1/2 text-gray-500"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-lg border border-blue-100 p-4 z-30">
                  <div className="flex items-center gap-3 border-b pb-3 mb-2">
                    {user?.name ? (
                      <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-base font-semibold">
                        {getUserInitials()}
                      </div>
                    ) : (
                      <img
                        src={logo}
                        alt="Profile"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-base font-semibold">{user?.name || "User"}</p>
                      <p className="text-sm text-gray-500">{user?.role || "User"}</p>
                    </div>
                  </div>
                  {profileMenuItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={item.label === "Log out" ? logout : undefined}
                      className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50 transition"
                    >
                      <item.icon size={18} />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
