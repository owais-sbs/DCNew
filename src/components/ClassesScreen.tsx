import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from './axiosInstance';
import Swal from "sweetalert2";

import {
  Search,
  Filter,
  Grid3X3,
  Download,
  Plus,
  Eye,
  MoreHorizontal,
  Users
} from "lucide-react";

// 1. DEFINE TYPES
// Type for the raw data from your API
interface ApiClass {
  ClassId: number;
  ClassTitle: string;
  ClassSubject: string;
  ClassLevel: string;
  ClassDescription: string;
  TeacherId: number;
  StartDate: string;
  EndDate: string;
  IsActive: boolean;
}

// Type for the data our component will use (the old 'sampleClasses' format)
interface ClassData {
  id: number;
  title: string;
  subtitle: string;
  students: number; // NOTE: This is missing from your API response
  status: string;
  teacher: string; // NOTE: API gives TeacherId, UI expects name
  classroom: string; // NOTE: This is missing from your API response
  starts: string;
  ends: string;
  recurringDayTime: string; // Recurring Day/Time
  paymentFrequency: string; // Payment Frequency
  paymentFees: string; // Payment Fees
}

// Student interface for tooltip
interface Student {
  id: number;
  name: string;
  phone: string;
  email: string;
  initials: string;
}





// 2. DATE FORMATTING HELPER
// Converts "2025-11-07T00:00:00" to "07-11-2025"
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    console.error("Invalid date format:", dateString);
    return "Invalid Date";
  }
};


export default function ClassesScreen() {
  const navigate = useNavigate();

  // 3. STATE FOR API DATA, LOADING, AND ERRORS
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [hoveredClassId, setHoveredClassId] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  // Generate dummy students for a class
  const generateDummyStudents = (classId: number, count: number): Student[] => {
    const dummyNames = [
      "Carlotta Scaramuzza", "Emyle Fernanda Vilalba Mat", "Muhammead Patel", 
      "Tanetzia Salinas Osorio", "Abdullah Jan", "Maria Garcia", "John Smith",
      "Sarah Johnson", "David Brown", "Emma Wilson", "Michael Davis", "Lisa Anderson",
      "James Taylor", "Sophia Martinez", "Robert Thomas", "Olivia Jackson", "William White",
      "Isabella Harris", "Joseph Martin", "Ava Thompson"
    ];
    
    const dummyPhones = ["353857208236", "353831330558", "353834074840", "3530834368847", "529831252831"];
    const dummyEmails = ["student1@example.com", "student2@example.com", "student3@example.com", "student4@example.com", "student5@example.com"];
    
    return Array.from({ length: count }, (_, i) => {
      const nameIndex = (classId + i) % dummyNames.length;
      const name = dummyNames[nameIndex];
      const initials = name
        .split(" ")
        .slice(0, 2)
        .map(n => n[0])
        .join("")
        .toUpperCase();
      
      return {
        id: classId * 100 + i,
        name: name,
        phone: dummyPhones[(classId + i) % dummyPhones.length],
        email: dummyEmails[(classId + i) % dummyEmails.length],
        initials: initials
      };
    });
  };

  // 4. STATE FOR FILTERS (most were already here)
  const [searchQuery, setSearchQuery] = useState(""); // Added state for search
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [classroomOpen, setClassroomOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [teacherQuery, setTeacherQuery] = useState("");
  const [teacher, setTeacher] = useState<string>("All");
  const [classroom, setClassroom] = useState<string>("All");
  const [classType, setClassType] = useState<string>("V"); // Note: API doesn't provide this
  const [status, setStatus] = useState<string>("All");

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);


  // Filter options (still hardcoded, see "Next Steps" below)
  const teacherOptions = useMemo(() => [
    "All", "Abbey teacher", "Adao Lopes Teacher", "Ane 1", "Anne Smiddy Elisabeth",
    "Aoife Sinead Buckley", "Ava Collopy", "Beni Teacher", "Carla Kerr", "Cathrine Teacher",
    "Colm Delmar1", "Conor O’Riordan", "Daiana Teacher"
  ].filter(n => n.toLowerCase().includes(teacherQuery.toLowerCase())), [teacherQuery]);

  const classroomOptions = [
    "All", "Class 1", "Cork", "France", "Galway", "Kildere (02)", "Kildere (2)",
    "Leitrim", "Leitrim (05)", "Limerick", "Limerick (06)", "Meath", "Monaghan (06)", "Online Lesson"
  ];

  // Debounce search query
  const [searchQueryDebounced, setSearchQueryDebounced] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQueryDebounced(searchQuery);
      setPageNumber(1); // Reset to first page on search
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 5. DATA FETCHING WITH useEffect
  useEffect(() => {
  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/Class/GetAllClassesWithPagination', {
        params: { 
          pageNumber, 
          pageSize,
          search: searchQueryDebounced || null
        }
      });

      if (response.data && response.data.IsSuccess) {
        const rawItems: ApiClass[] = response.data?.Data?.Data ?? [];
        const mappedData: ClassData[] = rawItems.map((apiClass: ApiClass) => {
          const dummyStudentCount = (apiClass.ClassId % 20) + 5;
          return {
            id: apiClass.ClassId,
            title: apiClass.ClassTitle,
            subtitle: apiClass.ClassDescription || `${apiClass.ClassSubject}${apiClass.ClassLevel ? `, ${apiClass.ClassLevel}` : ''}`,
            students: dummyStudentCount,
            status: apiClass.IsActive ? "Active" : "Inactive",
            teacher: `Teacher ID: ${apiClass.TeacherId}`,
            classroom: "N/A",
            starts: formatDate(apiClass.StartDate),
            ends: formatDate(apiClass.EndDate),
            recurringDayTime: "N/A",
            paymentFrequency: "None",
            paymentFees: "N/A",
          };
        });

        setClasses(mappedData);
        setTotalCount(Number(response.data?.Data?.TotalCount ?? 0));
      } else {
        setClasses([]);
        setTotalCount(0);
        setError(response.data?.Message ?? "Failed to fetch classes");
      }
    } catch (err: any) {
      console.error("API Error:", err);
      setError(err?.message ?? "An error occurred while fetching classes.");
      setClasses([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  fetchClasses();
}, [pageNumber, pageSize, searchQueryDebounced]);

  // 6. FILTERING LOGIC
  // This memo recalculates the list only when the data or filters change
  // Note: Search is now handled server-side, so we only filter by other criteria
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      // Teacher Filter
      // Note: This matches against "Teacher ID: 1" for now.
      const matchesTeacher = teacher === "All" || cls.teacher.includes(teacher);

      // Classroom Filter
      // Note: This will only match "N/A" or "All" until API provides data.
      const matchesClassroom = classroom === "All" || cls.classroom === classroom;
      
      // Status Filter
      const matchesStatus = status === "All" || cls.status === status;

      // Class Type Filter (Academic/Non Academic)
      // This filter is not implemented as the API doesn't provide this data.
      
      return matchesTeacher && matchesClassroom && matchesStatus;
    });
  }, [classes, teacher, classroom, status]);


  const handleSelectAll = () => {
    // Use filteredClasses to select all *visible* rows
    if (selectedRows.length === filteredClasses.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredClasses.map(c => c.id));
    }
  };

  const handleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };



   const [openDropdown, setOpenDropdown] = useState<number | null>(null)

const handleEdit = (id: number) => {
  // go to edit page – adjust route if your app uses a different pattern
  navigate(`/notes/edit-class/${id}`)
}

const handleDelete = async (id: number) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this student?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    // Add this didOpen block to force the colors
    didOpen: () => {
      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();

      if (confirmBtn) {
        confirmBtn.style.setProperty('background-color', '#d33', 'important');
        confirmBtn.style.setProperty('color', '#ffffff', 'important');
      }
      if (cancelBtn) {
        cancelBtn.style.setProperty('background-color', '#3085d6', 'important');
        cancelBtn.style.setProperty('color', '#ffffff', 'important');
      }
    }
  });

  if (!confirm.isConfirmed) return;

  try {
    // API call → Class/Delete/15
    const response = await axiosInstance.delete(`/class/Delete?id=${id}`);

    if (response.data?.IsSuccess) {
      Swal.fire({
        title: "Deleted!",
        text: "Student has been deleted successfully.",
        icon: "success",
      });

      
    } else {
      Swal.fire({
        title: "Error",
        text: response.data?.Message || "Unable to delete student.",
        icon: "error",
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      title: "Error",
      text: "Something went wrong while deleting.",
      icon: "error",
    });
  } finally {
    setOpenDropdown(null);
  }
};

const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
const startEntry = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
const endEntry = Math.min(totalCount, pageNumber * pageSize);
const pageSizeSelectValue = pageSize === totalCount ? "all" : pageSize;

// small helper to build page buttons (1, ..., 4, 5, 6, ..., last)
const pageButtons = () => {
  const pages: (number | string)[] = [];
  const maxButtons = 5;
  let left = Math.max(1, pageNumber - 2);
  let right = Math.min(totalPages, pageNumber + 2);

  if (pageNumber <= 3) {
    left = 1;
    right = Math.min(totalPages, maxButtons);
  } else if (pageNumber + 2 >= totalPages) {
    right = totalPages;
    left = Math.max(1, totalPages - maxButtons + 1);
  }

  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push("...");
  }

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < totalPages) {
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return pages;
};



  return (
    <div className="px-6 py-6">
      {/* Header with title */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">{totalCount} Classes</h1>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Q Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters and action buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* Teacher dropdown */}
          <div className="relative">
            <button 
              onClick={()=>{setTeacherOpen(!teacherOpen); setClassroomOpen(false); setTypeOpen(false); setStatusOpen(false);}} 
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2 hover:bg-gray-50"
            >
              <span>Teacher: {teacher}</span>
              <span className="text-gray-500">▾</span>
            </button>
            {teacherOpen && (
              <div className="absolute mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-2">
                <input autoFocus value={teacherQuery} onChange={e=>setTeacherQuery(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-gray-200 mb-2" />
                <div className="max-h-72 overflow-auto">
                  {teacherOptions.map(name => (
                    <button key={name} onClick={()=>{setTeacher(name); setTeacherOpen(false);}} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between ${name===teacher? 'bg-gray-50':''}`}>{name}{name===teacher && <span>✔</span>}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Classroom dropdown */}
          <div className="relative">
            <button 
              onClick={()=>{setClassroomOpen(!classroomOpen); setTeacherOpen(false); setTypeOpen(false); setStatusOpen(false);}} 
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2 hover:bg-gray-50"
            >
              <span>Classroom: {classroom}</span>
              <span className="text-gray-500">▾</span>
            </button>
            {classroomOpen && (
              <div className="absolute mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-2 max-h-80 overflow-auto">
                {classroomOptions.map(name => (
                  <button key={name} onClick={()=>{setClassroom(name); setClassroomOpen(false);}} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between ${name===classroom? 'bg-gray-50':''}`}>{name}{name===classroom && <span>✔</span>}</button>
                ))}
              </div>
            )}
          </div>
          
          {/* Class type dropdown */}
          <div className="relative">
            <button 
              onClick={()=>{setTypeOpen(!typeOpen); setTeacherOpen(false); setClassroomOpen(false); setStatusOpen(false);}} 
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2 hover:bg-gray-50"
            >
              <span>Class type:</span>
              <span className="text-gray-500">▾</span>
            </button>
            {typeOpen && (
              <div className="absolute mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-2">
                {['Academic','Non Academic'].map(name => (
                  <button key={name} onClick={()=>{setClassType(name); setTypeOpen(false);}} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between ${name===classType? 'bg-gray-50':''}`}>{name}{name===classType && <span>✔</span>}</button>
                ))}
              </div>
            )}
          </div>
          
          {/* Status dropdown */}
          <div className="relative">
            <button 
              onClick={()=>{setStatusOpen(!statusOpen); setTeacherOpen(false); setClassroomOpen(false); setTypeOpen(false);}} 
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2 hover:bg-gray-50"
            >
              <span>Status: {status}</span>
              <span className="text-gray-500">▾</span>
            </button>
            {statusOpen && (
              <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-2">
                {['All','Active','Scheduled','Ended','Archived'].map(name => (
                  <button key={name} onClick={()=>{setStatus(name); setStatusOpen(false);}} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between ${name===status? 'bg-gray-50':''}`}>{name}{name===status && <span>✔</span>}</button>
                ))}
              </div>
            )}
          </div>

          {/* Icon buttons */}
          <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
          </button>
          <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Action buttons on the right */}
        <div className="flex items-center gap-3">
          <button className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => navigate('/notes/add-class')}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm text-sm"
          >
            <Plus size={16} /> Add class
          </button>
        </div>
      </div>

      {/* Classes table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={filteredClasses.length > 0 && selectedRows.length === filteredClasses.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">Title</th>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">Status</th>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">Teacher</th>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">Classroom</th>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">Starts</th>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">Ends</th>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">Recurring Day/Time</th>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">Payment Frequency</th>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">Payment Fees</th>
              <th className="px-4 py-3 font-medium text-left border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-gray-500">
                  Loading classes...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-red-600">
                  Error: {error}
                </td>
              </tr>
            )}
            {!loading && !error && filteredClasses.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-gray-500">
                  No classes found.
                </td>
              </tr>
            )}
            {!loading && !error && filteredClasses.map((cls) => (
              <tr key={cls.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(cls.id)}
                    onChange={() => handleSelectRow(cls.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3 text-indigo-700">
                  <div className="flex items-start gap-2 justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${cls.status === 'Active' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium text-gray-800 cursor-pointer hover:underline text-blue-600"
                          onClick={() => navigate(`/notes/class-details/${cls.id}`)}
                        >
                          {cls.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{cls.subtitle}</div>
                      </div>
                    </div>
                    <div 
                      className="flex items-center gap-1 text-gray-700 flex-shrink-0 ml-2 relative cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredClassId(cls.id);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPosition({
                          x: rect.right + 10,
                          y: rect.top
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredClassId(null);
                        setTooltipPosition(null);
                      }}
                    >
                      <Users size={16} className="text-gray-500" />
                      <span className="text-sm font-medium">{cls.students}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {cls.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{cls.teacher}</td>
                <td className="px-4 py-3 text-gray-700">{cls.classroom}</td>
                <td className="px-4 py-3 text-gray-700">{cls.starts}</td>
                <td className="px-4 py-3 text-gray-700">{cls.ends}</td>
                <td className="px-4 py-3 text-gray-700">{cls.recurringDayTime}</td>
                <td className="px-4 py-3 text-gray-700">{cls.paymentFrequency}</td>
                <td className="px-4 py-3 text-gray-700">{cls.paymentFees}</td>
                <td className="px-4 py-3 relative">
  {/* More button */}
  <button
    type="button"
    onClick={() =>
      setOpenDropdown(openDropdown === cls.id ? null : cls.id)
    }
    className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"
    aria-label="More actions"
  >
    <MoreHorizontal size={18} />
  </button>

  {/* Dropdown */}
  {openDropdown === cls.id && (
    <div className="absolute right-0 mt-2 w-36 rounded-xl border bg-white shadow-md z-50">
      <button
        type="button"
        onClick={() => handleEdit(cls.id)}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => handleDelete(cls.id)}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
      >
        Delete
      </button>
    </div>
  )}
</td>
              </tr>
            ))}
          </tbody>
      
        </table>

           {/* pagination footer */}
<div className="flex items-center justify-between px-4 py-4 bg-white border-t border-gray-200">
  <div className="text-sm text-gray-600">
    {loading ? (
      "Loading..."
    ) : (
      <>Showing <span className="font-medium">{startEntry}</span> - <span className="font-medium">{endEntry}</span> of <span className="font-medium">{totalCount}</span> Entries</>
    )}
  </div>


  {/* page size selector */}


<select
  value={pageSizeSelectValue}
  onChange={(e) => {
    const v = e.target.value;
    if (v === "all") {
      // show all classes on one page (guard against totalCount being 0)
      setPageSize(Math.max(1, totalCount));
      setPageNumber(1);
    } else {
      setPageSize(Number(v));
      setPageNumber(1);
    }
  }}
  className="form-select text-sm border rounded px-2 py-1"
>
  {[5, 10, 25, 50, 100].map(s => (
    <option key={s} value={s}>{s}</option>
  ))}
  <option value="all">All</option>
</select>


  <div className="flex items-center gap-2">
    <button
      disabled={pageNumber === 1}
      onClick={() => setPageNumber(p => Math.max(1, p - 1))}
      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
    >
      Previous
    </button>


    


    <div className="flex items-center gap-1">
      {pageButtons().map((p, i) =>
      p === "..." ? (
        <span key={`e-${i}`} className="px-2 text-sm text-gray-500">…</span>
      ) : (
        <button
          key={p}
          onClick={() => setPageNumber(Number(p))}
          className={`px-3 h-8 inline-flex items-center justify-center rounded text-sm border ${p === pageNumber ? "bg-orange-500 text-white border-orange-500" : "text-gray-700 border-gray-200 hover:bg-gray-50"}`}
        >
          {p}
        </button>
      ))}
    </div>

    <button
      disabled={pageNumber >= totalPages}
      onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
    >
      Next
    </button>
  </div>
</div>
 
        
      </div>

      {/* Student List Tooltip */}
      {hoveredClassId !== null && tooltipPosition && (() => {
        const classData = filteredClasses.find(c => c.id === hoveredClassId);
        if (!classData) return null;
        const students = generateDummyStudents(hoveredClassId, classData.students);
        const avatarPalette = ["bg-indigo-500", "bg-rose-500", "bg-purple-500", "bg-emerald-500", "bg-blue-500"];
        
        return (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              width: '320px',
              maxHeight: '400px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={() => setHoveredClassId(hoveredClassId)}
            onMouseLeave={() => {
              setHoveredClassId(null);
              setTooltipPosition(null);
            }}
          >
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">{classData.students} students enrolled</h3>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
              {students.map((student, idx) => (
                <div key={student.id} className="px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full grid place-items-center text-white text-xs font-semibold flex-shrink-0 ${avatarPalette[idx % avatarPalette.length]}`}>
                      {student.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-blue-600 truncate">{student.name}</div>
                      <div className="text-xs text-gray-600 truncate">{student.phone}</div>
                      <div className="text-xs text-gray-600 truncate">{student.email}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>
              <span className="text-xs text-gray-600">{classData.teacher}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}