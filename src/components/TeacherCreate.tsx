import { useNavigate } from "react-router-dom"
import AddTeacherForm from "./AddTeacherForm"

export default function TeacherCreate() {
  const navigate = useNavigate()
  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Add teacher</h1>
        </div>
        <div className="border-t border-dotted border-gray-300 mb-1" />
        <div className="border-t border-dotted border-gray-300 mb-6" />
        <AddTeacherForm isOpen={true} asPage onClose={() => navigate(-1)} />
      </div>
    </div>
  )
}


