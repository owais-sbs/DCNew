import { useNavigate } from "react-router-dom"

export default function ExpenseForm() {
  const navigate = useNavigate()

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 text-sm font-semibold text-gray-800">
            Expense details
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            {/* Row 1: Name | Amount | Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input className="w-full h-10 px-3 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
                <div className="flex max-w-full">
                  <span className="inline-flex items-center justify-center h-10 px-3 rounded-l-xl border border-gray-200 bg-gray-50">€</span>
                  <input className="w-full h-10 px-3 rounded-r-xl border border-gray-200 border-l-0" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Payment Method</label>
                <select className="w-full h-10 px-3 rounded-xl border border-gray-200" defaultValue="">
                  <option value="" disabled>select</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Bank transfer</option>
                </select>
              </div>
            </div>

            {/* Row 2: Expense Number | Category | Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Expense Number</label>
                <input className="w-full h-10 px-3 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <input className="w-full h-10 px-3 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Location</label>
                <input className="w-full h-10 px-3 rounded-xl border border-gray-200" />
              </div>
            </div>

            {/* Row 3: Description (full width as per image) */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Description</label>
              <textarea className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200" />
            </div>

            {/* Row 4: Date of Issue | Completed Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Date of Issue</label>
                <input type="text" defaultValue="20-10-2025" className="w-full h-10 px-3 rounded-xl border border-gray-200" />
                <div className="text-xs text-gray-400 mt-1">dd-mm-yyyy</div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Completed Date</label>
                <input type="text" defaultValue="20-10-2025" className="w-full h-10 px-3 rounded-xl border border-gray-200" />
                <div className="text-xs text-gray-400 mt-1">dd-mm-yyyy</div>
              </div>
            </div>

            {/* Row 5: Notes | Attachment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Notes</label>
                <textarea className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Attachment</label>
                <div className="text-sm text-gray-600 mb-2">No file selected...</div>
                <label className="inline-flex items-center h-10 px-4 rounded-xl border border-gray-200 bg-white cursor-pointer">
                  <input type="file" className="hidden" />
                  Browse...
                </label>
                <div className="text-xs text-gray-400 mt-2">Upload file</div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
            <button onClick={()=>navigate(-1)} className="h-10 px-4 rounded-xl bg-gray-100 text-gray-700">Cancel</button>
            <button className="h-10 px-4 rounded-xl bg-indigo-50 text-indigo-700">Add and new</button>
            <button className="h-10 px-4 rounded-xl bg-indigo-600 text-white">Add Expense</button>
          </div>
        </div>
      </div>
    </div>
  )
}


