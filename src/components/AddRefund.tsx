import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, RotateCcw, ChevronDown } from "lucide-react"

export default function AddRefund() {
  const navigate = useNavigate()
  const [selectedStudent, setSelectedStudent] = useState("Abdul Hameed")

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="text-2xl font-semibold text-gray-800 mb-6">Add refund</div>

        <div className="grid grid-cols-[1fr_400px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            {/* Select student(s) */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select student(s)</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <div className="flex items-center gap-2 h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                      <span className="text-sm text-gray-700">{selectedStudent}</span>
                      <button 
                        onClick={() => setSelectedStudent("")}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  You can select more than one student for a combined payment
                </div>
              </div>
            </div>

            {/* Add refund */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw size={20} className="text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800">Add refund</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bill to <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select 
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white"
                    >
                      <option value="Abdul Hameed">Abdul Hameed</option>
                    </select>
                    <div className="flex gap-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                      <button className="text-sm text-blue-600 hover:text-blue-800">Reset</button>
                    </div>
                  </div>
                  
                  {/* Student details */}
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                    <div className="text-sm text-gray-700">Abdul Hameed</div>
                    <div className="text-sm text-gray-500">DCE3277</div>
                    <div className="text-sm text-gray-500">Ireland</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund description
                  </label>
                  <textarea 
                    placeholder="Enter refund description"
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund amount <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number"
                    placeholder="Enter refund amount"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar - empty for now */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit">
            <div className="text-sm text-gray-500">Additional options or information can go here</div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button 
            onClick={() => navigate("/payments/refunds")}
            className="h-10 px-6 rounded-xl border border-gray-200 bg-white text-gray-700"
          >
            Cancel
          </button>
          <button className="h-10 px-6 rounded-xl bg-indigo-600 text-white">
            Add refund
          </button>
        </div>
      </div>
    </div>
  )
}
