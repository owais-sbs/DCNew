import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axiosInstance from "./axiosInstance"
import {
  Plus,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  MessageSquare,
  LogOut,
  HelpCircle,
  Star,
  BookOpen,
  FileText,
  Users,
  PenTool,
  Search,
  UserPlus,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { useSidebar } from "../contexts/SidebarContext";

const logo = "/src/assets/DCE_newlogo.png";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddNewOpen, setIsAddNewOpen] = useState(false);
  const { isExpanded } = useSidebar();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [students, setStudents] = useState<any[]>([]);
const [isSearching, setIsSearching] = useState(false);
const [showResults, setShowResults] = useState(false);
  
  // Mock subscription check based on your image
  const subscriptionEnded = true; 


  const [searchQuery, setSearchQuery] = useState(""); // Add this

  // 1. Reusable search function
const executeSearch = async (query?: string) => {
  const trimmedQuery = (query ?? searchQuery).trim();

  if (!trimmedQuery) {
    setShowResults(false);
    return;
  }

  try {
    setIsSearching(true);

    const response = await axiosInstance.get(
      "/Student/GetAllWithPagination",
      {
        params: {
          search: trimmedQuery,
          pageNumber: 1,
          pageSize: 5
        }
      }
    );

    setStudents(response.data?.Data?.Data || []);
    setShowResults(true);
  } catch (error) {
    console.error("Student search error", error);
  } finally {
    setIsSearching(false);
  }
};



// 2. Updated Keyboard Handler
const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    executeSearch();
  }
};

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (!target.closest(".search-container")) {
      setShowResults(false);
    }

    if (!target.closest(".dropdown-container")) {
      setIsAddNewOpen(false);
      setIsProfileOpen(false);
    }
  };

  document.addEventListener("click", handleClickOutside);

  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


  // Your original Profile Menu Items
  const getProfileMenuItems = () => {
    if (user?.role === 'Student') {
      return [
        { icon: User, label: "My account" },
        { icon: HelpCircle, label: "Help center" },
        { icon: LogOut, label: "Log out" },
      ];
    }
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

  // Your original Add New items mapped to specific icons for the Grid Layout
  const addNewItems = [
    // { icon: CreditCard, label: "Payment", path: "/payments/new" }, // Added mock for visual balance
    { icon: BookOpen, label: "Class", path: "/notes/add-class" },
    { icon: FileText, label: "Document", path: "/notes/documents" },

    { icon: Users, label: "Student", path: "/people/students/new" },
    { icon: GraduationCap, label: "Teacher", path: "/people/teachers/new" },
    { icon: Briefcase, label: "Staff", path: "/people/staffs/new" },

    // { icon: UserPlus, label: "Prospect", path: "/people/prospects/new" }, // Added mock
    
    
    { icon: Users, label: "Related Contact", path: "/people/related/new" },
    // { icon: MessageSquare, label: "Group Msg", path: "/messaging/new" }, // Added mock
    
   
    { icon: PenTool, label: "Signature", path: "/signatures" },
  ];

  return (
    <div className="flex flex-col sticky top-0 z-20">
      {/* Dark Header */}
      <header className="bg-[#2B2F3E] border-b border-gray-700 shadow-sm h-14">
        <div className={`transition-all duration-300 h-full flex items-center justify-between px-4 ${isExpanded ? 'pl-[325px]' : 'pl-[117px]'}`}>
          
          {/* Left: Logo & Text */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-6 w-auto object-contain" />
          
          </div>

          {/* Center: Search Bar (Dark Theme) */}
          <div className="flex-1 max-w-sm mx-6">
  <div className="flex-1 max-w-sm mx-6">
  <div className="relative group">
    <input
  type="text"
  placeholder="Search students"
  value={searchQuery}
  onChange={(e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length >= 2) {
      executeSearch(value);
    } else {
      setShowResults(false);
      setStudents([]);
    }
  }}
  onKeyDown={handleSearch}
  className="w-full pl-3 pr-3 py-1.5 rounded bg-[#3F4454] text-sm text-gray-200"
/>


{showResults && (
  <div className="absolute mt-1 w-full bg-white rounded shadow-lg border z-50">

    {isSearching && (
      <div className="px-4 py-2 text-sm text-gray-500">
        Searching...
      </div>
    )}

    {!isSearching && students.length === 0 && (
      <div className="px-4 py-2 text-sm text-gray-500">
        No students found
      </div>
    )}

    {!isSearching &&
      students.map((student) => (
        <button
  key={student.Id}
  onMouseDown={(e) => e.stopPropagation()}
  onClick={() => {
    navigate(`/people/students/${student.Id}`);
    setShowResults(false);
    setSearchQuery("");
  }}
  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm"
>

          <div className="font-medium text-gray-800">
            {student.FirstName} {student.Surname}
          </div>
          <div className="text-xs text-gray-500">
            {student.Email || student.MobilePhone}
          </div>
        </button>
      ))}
  </div>
)}



    
  </div>
</div>
</div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 relative">
            
            {/* ADD NEW BUTTON - SQUARED & DARK */}
            {user?.role !== 'Student' && (
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsAddNewOpen(!isAddNewOpen)}
                  className="h-9 w-9 flex items-center justify-center rounded bg-[#3F4454] hover:bg-[#4E5466] text-white transition-colors"
                >
                  <Plus size={20} />
                </button>

                {/* GRID DROPDOWN MENU */}
                {isAddNewOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-md shadow-2xl border border-gray-200 z-50 overflow-hidden">
                     {/* Little arrow pointing up */}
                    <div className="absolute top-0 right-3 -mt-1 w-2 h-2 bg-white transform rotate-45 border-t border-l border-gray-200"></div>
                    
                    <div className="px-4 py-2 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                      Add New
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 p-2">
                      {addNewItems.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            navigate(item.path);
                            setIsAddNewOpen(false);
                          }}
                          className="flex flex-col items-center justify-center gap-1 p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors group"
                        >
                          <item.icon size={20} className="text-gray-500 group-hover:text-blue-600 mb-1" />
                          <span className="text-[11px] font-medium leading-none text-center">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Section */}
            <div className="relative dropdown-container ml-2">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded hover:bg-[#3F4454] transition-colors"
              >
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-white leading-none">{user?.name || "Asif"}</div>
                    {/* Organization Logo Placeholder if needed */}
                </div>
                {user?.name ? (
                  <div className="h-8 w-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold border-2 border-[#2B2F3E]">
                    {getUserInitials()}
                  </div>
                ) : (
                  <img src={logo} alt="Profile" className="h-8 w-8 rounded-full" />
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-xl border border-gray-100 py-1 z-50">
                   <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-bold text-gray-800">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-500">{user?.role || "Admin"}</p>
                  </div>
                  {profileMenuItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={item.label === "Log out" ? logout : undefined}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Subscription Alert Banner */}
      {/* {subscriptionEnded && (
        <div className={`bg-blue-50 border-b border-blue-200 px-6 py-3 transition-all duration-300 ${isExpanded ? 'pl-[345px]' : 'pl-[137px]'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
             <div className="text-sm text-blue-800">
               <span className="font-bold">Your subscription has ended</span>
               <span className="mx-1 hidden sm:inline">|</span>
               <span className="opacity-90">We were unable to renew your subscription which ended on 11-12-2025. Kindly update your billing info to renew your subscription.</span>
             </div>
             <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded shadow-sm whitespace-nowrap transition-colors">
               Update Billing Info
             </button>
          </div>
        </div>
      )} */}
    </div>
  );
}