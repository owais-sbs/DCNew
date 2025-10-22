import { useNavigate } from "react-router-dom"

export default function ProspectCreate() {
  const navigate = useNavigate()
  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Add prospect</h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                <option>General English</option>
                <option>IELTS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                <option>All</option>
                <option>A1</option>
                <option>A2</option>
                <option>B1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                <option>Active Prospects</option>
                <option>Converted</option>
                <option>Lost</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-6">
            <button onClick={() => navigate(-1)} className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Cancel</button>
            <button className="h-10 px-4 rounded-xl bg-blue-600 text-white text-sm">Add prospect</button>
          </div>
        </div>
      </div>
    </div>
  )
}



