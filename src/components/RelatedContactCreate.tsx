

import { useNavigate } from "react-router-dom"

export default function RelatedContactCreate() {
  const navigate = useNavigate()

  // UI helper for the admin flat look
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#f2f2f2] px-4 py-2 border-t border-b text-[13px] font-semibold text-gray-800">
      {title}
    </div>
  );

  return (
    <div className="pl-[72px] w-full min-h-screen bg-gray-50 py-8 px-6">
      <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Add related contact</h1>
        </div>
        <div className="border-t border-dotted border-gray-300 mb-1" />
        <div className="border-t border-dotted border-gray-300 mb-6" />
      <div className="max-w-3xl mx-auto bg-white border border-gray-300 shadow-sm overflow-hidden">
        
        {/* Top dark title bar */}
        <div className="bg-[#2b2b2e] px-4 py-2 text-white text-sm font-semibold flex items-center justify-between">
          <div>Add Related Contact</div>
        </div>

        <form>
          {/* Section Header */}
          <SectionHeader title="Contact Information" />

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">First name <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" 
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Surname <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[13px] text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[13px] text-gray-700 mb-1">Phone</label>
                <div className="flex items-center gap-0">
                   <div className="flex items-center gap-1 h-[34px] px-2 border border-gray-300 border-r-0 bg-gray-50">
                    <span className="text-[13px]">🇮🇪 +353</span>
                  </div>
                  <input 
                    type="tel"
                    className="flex-1 h-[34px] px-2 border border-gray-300 bg-white text-[13px]" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t bg-white">
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              className="h-[34px] px-3 border border-gray-300 text-[13px] bg-white hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button 
              type="button"
              className="h-[34px] px-3 bg-blue-600 hover:bg-blue-700 text-white text-[13px]"
            >
              Add contact
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}