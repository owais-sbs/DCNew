import { useNavigate } from "react-router-dom"
import AddStudentForm from "./AddStudentForm"

export default function StudentCreate() {
  const navigate = useNavigate()
  return (
    <div className="pl-[72px] min-h-screen bg-white">
      <div className="px-6 py-6">
        {/* Page title + dotted separator (match reference UI) */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Add Student</h1>
        </div>
        <div className="border-t border-dotted border-gray-300 mb-1" />
        <div className="border-t border-dotted border-gray-300 mb-6" />
        {/* Reuse existing form UI as a full-screen form */}
        <AddStudentForm isOpen={true} asPage onClose={() => navigate(-1)} />
      </div>
    </div>
  )
}


