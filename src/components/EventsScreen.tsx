import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Grid3X3, 
  Download, 
  Plus, 
  Eye, 
  MoreHorizontal,
  Calendar
} from "lucide-react";

const sampleEvents = [
  {
    id: 1,
    name: "School Meeting",
    type: "Meeting",
    status: "Active",
    location: "Main Hall",
    date: "15-01-2025",
    time: "10:00 AM"
  },
  {
    id: 2,
    name: "Parent Conference",
    type: "Conference",
    status: "Active",
    location: "Conference Room",
    date: "20-01-2025",
    time: "2:00 PM"
  },
  {
    id: 3,
    name: "Workshop Session",
    type: "Workshop",
    status: "Active",
    location: "Classroom A",
    date: "25-01-2025",
    time: "9:00 AM"
  }
];

interface EventsScreenProps {
  onAddEvent?: () => void;
}

export default function EventsScreen({ onAddEvent }: EventsScreenProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleSelectAll = () => {
    if (selectedRows.length === sampleEvents.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sampleEvents.map(e => e.id));
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

        {/* Events count */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-gray-600" />
          <span className="text-lg font-medium text-gray-800">0 Events</span>
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
            <option>Event type: All</option>
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
            onClick={onAddEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add event
          </button>
        </div>

        {/* Events table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === sampleEvents.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Event type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sampleEvents.length > 0 ? (
                sampleEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(event.id)}
                        onChange={() => handleSelectRow(event.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-blue-600 font-medium">{event.name}</div>
                        <div className="text-sm text-gray-600">{event.type}</div>
                        <div className="text-xs text-gray-500">{event.location} • {event.date} • {event.time}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-600 hover:text-blue-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-gray-800">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing 0 to 0 of 0 entries
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 cursor-not-allowed">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 cursor-not-allowed">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 cursor-not-allowed">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 cursor-not-allowed">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
    </div>
  );
}
