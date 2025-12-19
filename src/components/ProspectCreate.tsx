import { useNavigate } from "react-router-dom"

export default function ProspectCreate() {
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
          <h1 className="text-2xl font-semibold text-gray-900">Add prospect</h1>
        </div>
        <div className="border-t border-dotted border-gray-300 mb-1" />
        <div className="border-t border-dotted border-gray-300 mb-6" />
        
      <div className="max-w-3xl mx-auto bg-white border border-gray-300 shadow-sm overflow-hidden">
        
        {/* Top dark title bar */}
        <div className="bg-[#2b2b2e] px-4 py-2 text-white text-sm font-semibold flex items-center justify-between">
          <div>Add Prospect</div>
        </div>

        <form>
          <SectionHeader title="Prospect Details" />
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Name */}
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" 
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" 
                />
              </div>

              {/* Phone */}
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

              {/* Subject */}
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Subject</label>
                <select className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]">
                  <option>General English</option>
                  <option>IELTS</option>
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Level</label>
                <select className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]">
                  <option>All</option>
                  <option>A1</option>
                  <option>A2</option>
                  <option>B1</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Status</label>
                <select className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]">
                  <option>Active Prospects</option>
                  <option>Converted</option>
                  <option>Lost</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action buttons */}
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
              Add prospect
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}