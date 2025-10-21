import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const sampleClasses = [
  {
    id: 1,
    title: "Advanced_AM_DCE1_PART 1",
    subtitle: "General English with Exam Preparation, C1",
    students: 0,
    status: "Active",
    teacher: "Colm Delmar1",
    classroom: "Limerick",
    starts: "02-01-2025",
    ends: "31-05-2027"
  },
  {
    id: 2,
    title: "Advanced_AM_DCE1_PART 2",
    subtitle: "General English with Exam Preparation, C1",
    students: 10,
    status: "Active",
    teacher: "Colm Delmar1",
    classroom: "Limerick",
    starts: "02-01-2025",
    ends: "29-01-2027"
  },
  {
    id: 3,
    title: "Advanced_PM_DCE1_PART 1",
    subtitle: "General English with Exam Preparation, C1",
    students: 8,
    status: "Active",
    teacher: "Colm Delmar1",
    classroom: "Galway",
    starts: "01-01-2025",
    ends: "03-01-2028"
  },
  {
    id: 4,
    title: "Advanced_PM_DCE1_PART 2",
    subtitle: "General English with Exam Preparation, C1",
    students: 11,
    status: "Active",
    teacher: "Colm Delmar1",
    classroom: "Galway",
    starts: "01-01-2025",
    ends: "03-01-2028"
  },
  {
    id: 5,
    title: "AM B1 WALID/ABBEY",
    subtitle: "B1",
    students: 12,
    status: "Active",
    teacher: "2 Teachers",
    classroom: "Cork",
    starts: "01-01-2025",
    ends: "03-01-2028"
  },
  {
    id: 6,
    title: "Cork Classroom C1 AM ABAIGH/ANNE",
    subtitle: "C1 am",
    students: 14,
    status: "Active",
    teacher: "2 Teachers",
    classroom: "Cork",
    starts: "10-02-2025",
    ends: "03-01-2028"
  },
  {
    id: 7,
    title: "Elementary_AM_DCE1_PART 1",
    subtitle: "General English with Exam Preparation, A1",
    students: 12,
    status: "Active",
    teacher: "Dmytro olgin Teacher",
    classroom: "Cork",
    starts: "02-01-2025",
    ends: "29-01-2027"
  },
  {
    id: 8,
    title: "Elementary_AM_DCE1_PART 2",
    subtitle: "General English with Exam Preparation, A1",
    students: 11,
    status: "Active",
    teacher: "Dimitrina Teacher",
    classroom: "Cork",
    starts: "01-01-2025",
    ends: "03-01-2028"
  }
];

export default function ClassesScreen() {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleSelectAll = () => {
    if (selectedRows.length === sampleClasses.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sampleClasses.map(c => c.id));
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

        {/* Classes count */}
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-gray-600" />
          <span className="text-lg font-medium text-gray-800">107 Classes</span>
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>Teacher: All</option>
          </select>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>Classroom: All</option>
          </select>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>Class type: V</option>
          </select>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>Status: All</option>
          </select>

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
                    checked={selectedRows.length === sampleClasses.length}
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
              {sampleClasses.map((cls) => (
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
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div>
                        <div 
                          className="text-blue-600 font-medium cursor-pointer hover:underline"
                          onClick={() => navigate('/notes/class-details')}
                        >
                          {cls.title}
                        </div>
                        <div className="text-sm text-gray-600">{cls.subtitle}</div>
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
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
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
                        onClick={() => navigate('/notes/class-details')}
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
