import { useNavigate } from "react-router-dom"
import AddStaffForm from "./AddStaffForm"

export default function StaffCreate() {
  const navigate = useNavigate()
  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Add staff</h1>
        </div>
        <AddStaffForm isOpen={true} asPage onClose={() => navigate(-1)} />
      </div>
    </div>
  )
}


