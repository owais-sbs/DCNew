import { useNavigate } from "react-router-dom"
import AddStudentForm from "./AddStudentForm"

export default function StudentCreate() {
  const navigate = useNavigate()
  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Add student</h1>
        </div>
        {/* Reuse existing form UI as a full-screen form */}
        <AddStudentForm isOpen={true} asPage onClose={() => navigate(-1)} />
      </div>
    </div>
  )
}


