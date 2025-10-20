import { useNavigate } from "react-router-dom"

export default function InventoryForm() {
  const navigate = useNavigate()

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 text-sm font-semibold text-gray-800">
            Item Details
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            {/* Row 1: Name | Serial number | Attachment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input className="w-full h-10 px-3 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Serial number <span className="text-red-500">*</span></label>
                <input className="w-full h-10 px-3 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Attachment</label>
                <div className="text-sm text-gray-600 mb-2">No file selected...</div>
                <label className="inline-flex items-center h-10 px-4 rounded-xl border border-gray-200 bg-white cursor-pointer w-full md:w-auto">
                  <input type="file" className="hidden" />
                  Browse...
                </label>
                <div className="text-xs text-gray-400 mt-2">Upload file</div>
              </div>
            </div>

            {/* Row 2: Location | Description | Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Location</label>
                <input className="w-full h-10 px-3 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <textarea className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Notes</label>
                <textarea className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200" />
              </div>
            </div>

            {/* Row 3: Quantity | Cost | Date of purchase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Quantity</label>
                <input className="w-full h-10 px-3 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Cost</label>
                <input className="w-full h-10 px-3 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Date of purchase</label>
                <input type="text" defaultValue="20-10-2025" className="w-full h-10 px-3 rounded-xl border border-gray-200" />
                <div className="text-xs text-gray-400 mt-1">dd-mm-yyyy</div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
            <button onClick={()=>navigate(-1)} className="h-10 px-4 rounded-xl bg-gray-100 text-gray-700">Cancel</button>
            <button className="h-10 px-4 rounded-xl bg-indigo-50 text-indigo-700">Add and new</button>
            <button className="h-10 px-4 rounded-xl bg-indigo-600 text-white">Add Inventory</button>
          </div>
        </div>
      </div>
    </div>
  )
}


