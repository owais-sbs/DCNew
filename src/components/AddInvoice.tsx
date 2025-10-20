import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, FileText, Plus, ThumbsUp, ChevronDown } from "lucide-react"

export default function AddInvoice() {
  const navigate = useNavigate()
  const [selectedStudent, setSelectedStudent] = useState("Abdul Hameed")
  const [showFeeModal, setShowFeeModal] = useState(false)

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="text-2xl font-semibold text-gray-800 mb-6">New invoice</div>

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

            {/* New invoice */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={20} className="text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800">New invoice</h3>
              </div>
              
              <div className="text-center py-8">
                <div className="text-4xl text-blue-400 mb-4">
                  <ThumbsUp size={48} />
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-2">No overdue payments</div>
                <div className="text-sm text-gray-600 mb-2">This student's payments are all up-to-date.</div>
                <div className="text-sm text-gray-600 mb-4">You can add future fees or custom payment items and create a new receipt.</div>
                <button 
                  onClick={() => setShowFeeModal(true)}
                  className="h-10 px-6 rounded-xl bg-indigo-600 text-white inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add a fee
                </button>
              </div>
            </div>

            {/* Fee modal */}
            {showFeeModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Add fees and discounts to this receipt</h3>
                    <button 
                      onClick={() => setShowFeeModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Left side - Fees */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Fees</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="radio" name="feeType" defaultChecked className="text-indigo-600" />
                          <span className="text-sm text-gray-700">Add from this student's class or additional fees</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="feeType" className="text-indigo-600" />
                          <span className="text-sm text-gray-700">Add all future fees in selected period</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="feeType" className="text-indigo-600" />
                          <span className="text-sm text-gray-700">Add a custom fee</span>
                        </label>
                      </div>
                    </div>

                    {/* Right side - Selection */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                        <select className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white">
                          <option>Abdul Hameed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select class or additional fee</label>
                        <select className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white">
                          <option>Select class or additional fee...</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select items to add</label>
                        <select className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white">
                          <option>Select ...</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Modal footer */}
                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setShowFeeModal(false)}
                      className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-gray-700"
                    >
                      <X size={16} />
                    </button>
                    <button className="h-9 px-4 rounded-lg bg-indigo-600 text-white inline-flex items-center gap-2">
                      <FileText size={16} />
                      Add to invoice
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar - empty for now */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit">
            <div className="text-sm text-gray-500">Additional options or information can go here</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Add fees and discounts to this receipt</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Fees</span>
              <span className="text-sm text-gray-500">Select Student</span>
            </div>
            <button 
              onClick={() => navigate("/payments/invoices")}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button 
            onClick={() => navigate("/payments/invoices")}
            className="h-10 px-6 rounded-xl border border-gray-200 bg-white text-gray-700"
          >
            Cancel
          </button>
          <button className="h-10 px-6 rounded-xl bg-indigo-600 text-white">
            Create invoice
          </button>
        </div>
      </div>
    </div>
  )
}
