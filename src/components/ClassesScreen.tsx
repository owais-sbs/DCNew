import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from './axiosInstance';

import {
  Search,
  Filter,
  RefreshCw,
  Grid3X3,
  Download,
  Plus,
  Eye,
  MoreHorizontal,
  Users,
  BookOpen
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

  // 5. DATA FETCHING WITH useEffect
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get('/Class/GetAllClasses');

        if (response.data && response.data.IsSuccess) {
          // Map the API data to the component's 'ClassData' structure
          const mappedData: ClassData[] = response.data.Data.map((apiClass: ApiClass) => ({
            id: apiClass.ClassId,
            title: apiClass.ClassTitle,
            subtitle: apiClass.ClassSubject, // Using ClassSubject for subtitle
            students: 0, // <<< WARNING: 'students' count is missing. Defaulting to 0.
            status: apiClass.IsActive ? "Active" : "Inactive",
            teacher: `Teacher ID: ${apiClass.TeacherId}`, // <<< WARNING: API gives ID, not name.
            classroom: "N/A", // <<< WARNING: 'classroom' is missing from API.
            starts: formatDate(apiClass.StartDate),
            ends: formatDate(apiClass.EndDate),
          }));
          setClasses(mappedData);
        } else {
          setError(response.data.Message || "Failed to fetch data.");
        }
      } catch (err: any) {
        console.error("API Error:", err);
        setError(err.message || "An error occurred while fetching classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []); // Empty dependency array [] means this runs once when the component mounts

  // 6. FILTERING LOGIC
  // This memo recalculates the list only when the data or filters change
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      // Search Query Filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        cls.title.toLowerCase().includes(searchLower) ||
        cls.subtitle.toLowerCase().includes(searchLower);

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
      
      return matchesSearch && matchesTeacher && matchesClassroom && matchesStatus;
    });
  }, [classes, searchQuery, teacher, classroom, status]);


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

  return (
    <div className="px-6 py-6">

      {/* Classes count (now dynamic) */}
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-5 w-5 text-gray-600" />
        <span className="text-lg font-medium text-gray-800">
          {filteredClasses.length} Classes 
          {filteredClasses.length !== classes.length && ` (out of ${classes.length})`}
        </span>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4 mb-6 relative">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or subtitle..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Teacher dropdown (unchanged) */}
        <div className="relative">
          <button onClick={()=>{setTeacherOpen(!teacherOpen); setClassroomOpen(false); setTypeOpen(false); setStatusOpen(false);}} className="px-3 py-2 border border-gray-300 rounded-lg text-sm inline-flex items-center gap-2">
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
        
        {/* Classroom dropdown (unchanged) */}
        <div className="relative">
          <button onClick={()=>{setClassroomOpen(!classroomOpen); setTeacherOpen(false); setTypeOpen(false); setStatusOpen(false);}} className="px-3 py-2 border border-gray-300 rounded-lg text-sm inline-flex items-center gap-2">
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
        
        {/* Class type dropdown (unchanged) */}
        <div className="relative">
          <button onClick={()=>{setTypeOpen(!typeOpen); setTeacherOpen(false); setClassroomOpen(false); setStatusOpen(false);}} className="px-3 py-2 border border-gray-300 rounded-lg text-sm inline-flex items-center gap-2">
            <span>Class type: {classType}</span>
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
        
        {/* Status dropdown (unchanged) */}
        <div className="relative">
          <button onClick={()=>{setStatusOpen(!statusOpen); setTeacherOpen(false); setClassroomOpen(false); setTypeOpen(false);}} className="px-3 py-2 border border-gray-300 rounded-lg text-sm inline-flex items-center gap-2">
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

        {/* Action buttons (unchanged) */}
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <Filter className="h-4 w-4" />
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <RefreshCw className="h-4 w-4" />
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <Grid3X3 className="h-4 w-4" />
        </button>
        <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </button>
        <button
          onClick={() => navigate('/notes/add-class')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add class
        </button>
      </div>

      {/* Classes table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  // Use filteredClasses for checkbox state
                  checked={filteredClasses.length > 0 && selectedRows.length === filteredClasses.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Teacher</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Classroom</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Starts</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ends</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* 7. DYNAMIC TABLE BODY */}
            {loading && (
              <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500">
                  Loading classes...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={8} className="text-center p-6 text-red-500">
                  Error: {error}
                </td>
              </tr>
            )}
            {!loading && !error && filteredClasses.length === 0 && (
               <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500">
                  No classes found.
                </td>
              </tr>
            )}
            {/* Map over filteredClasses instead of sampleClasses */}
            {!loading && !error && filteredClasses.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(cls.id)}
                    onChange={() => handleSelectRow(cls.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* This dot color could be dynamic based on status */}
                    <div className={`w-2 h-2 ${cls.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'} rounded-full`}></div>
                    <div>
                      <div
                        className="text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={() => navigate(`/notes/class-details/${cls.id}`)} // TODO: Pass class ID: /notes/class-details/${cls.id}
                      >
                        {cls.title}
                      </div>
                      <div className="text-sm text-gray-600">{cls.subtitle}</div>
                      {/* This will only show if API data includes students > 0 */}
                      {cls.students > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Users className="h-3 w-3" />
                          {cls.students}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium ${cls.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} rounded-full`}>
                    {cls.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{cls.teacher}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{cls.classroom}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{cls.starts}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{cls.ends}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/notes/class-details')} // TODO: Pass class ID
                      className="p-1 text-gray-600 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}