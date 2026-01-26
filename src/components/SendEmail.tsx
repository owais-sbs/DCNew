import axiosInstance from "./axiosInstance"
import { useState, useEffect } from "react"
import Swal from "sweetalert2"

type Student  = {
  Id: number
  IdNumber: number | null
  Email: string
}

type Template = {
  Id: number
  Title: string
}

export default function SendEmail() {

  const [students, setStudents] = useState<Student[]>([])
  const [template , setTemplate] = useState<Template[]>([])
  const [formData, setFormData] = useState<{
    SendToAll: boolean,
    StudentIds: number[],
    EmailTemplateId: number,
    CustomMessage: string
  }>({
    SendToAll: false,
    StudentIds: [],
    EmailTemplateId: 0,
    CustomMessage: ""
  })
  const [isStudentOpen, setIsStudentOpen] = useState(false)
const [search, setSearch] = useState("")
const [source, setSource] = useState<"template" | "custom">("template")





  console.log("This is the form Data", formData)


  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({...prev, [field]: value}))
  }

  const fetchStudents = async () => {
    try{
      const response = await axiosInstance.get("/Student/GetAll")
      console.log(response.data.Data)
      setStudents(response.data.Data)
    }catch(err){
      console.log("an error occured ", err)
    }
  }

  const fetchTemplates = async () => {
    try{
      const response = await axiosInstance.get("/EmailTemplate/GetAllEmailTemplates")
      console.log(response.data.Data)
      setTemplate(response.data.Data)
    }catch(err){
      console.log("An error occured ", err)
    }
  }


  useEffect(() => {
    fetchStudents()
    fetchTemplates()
  }, [])


  const toggleStudent = (id: number) => {
  setFormData(prev => ({
    ...prev,
    StudentIds: prev.StudentIds.includes(id)
      ? prev.StudentIds.filter(sid => sid !== id)
      : [...prev.StudentIds, id]
  }))
}

const selectAllStudents = () => {
  setFormData(prev => ({
    ...prev,
    StudentIds: students.map(s => s.Id)
  }))
}

const filteredStudents = students.filter(s =>
  String(s.IdNumber ?? "").includes(search)
)


const handleSave = async () => {
  try {
    const response = await axiosInstance.post(
      "/Email/SendEmailToStudents",
      formData
    )

    Swal.fire({
      icon: "success",
      title: "Email Sent",
      text: `Successfully sent to ${response.data.SentCount} student(s)`,
      confirmButtonColor: "#10b981",
    })

    // 🔁 RESET EVERYTHING
    setFormData({
      SendToAll: false,
      StudentIds: [],
      EmailTemplateId: 0,
      CustomMessage: "",
    })
    setSource("template")
    setSearch("")
    setIsStudentOpen(false)

  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "Failed",
      text:
        err?.response?.data ??
        "Something went wrong while sending email",
      confirmButtonColor: "#ef4444",
    })
  }
}




  return (
    <div className="bg-white rounded-xl p-6 max-w-4xl">
      <h2 className="text-lg font-medium mb-4">Send Email</h2>

      {/* Source */}
      <div className="mb-4">
  <label className="block mb-2 font-medium">Source</label>
  <div className="flex gap-6">
    <label className="flex items-center gap-2">
      <input
  type="radio"
  name="source"
  checked={source === "template"}
  onChange={() => {
    setSource("template")
    setFormData(prev => ({
      ...prev,
      CustomMessage: ""
    }))
  }}
/>

      Template
    </label>

    <label className="flex items-center gap-2">
      <input
  type="radio"
  name="source"
  checked={source === "custom"}
  onChange={() => {
    setSource("custom")
    setFormData(prev => ({
      ...prev,
      EmailTemplateId: 0
    }))
  }}
/>

      Custom
    </label>
  </div>
</div>


      {/* Template Select */}
     {source === "template" && (
  <div className="mb-4">
    <label className="block mb-2">Select Template</label>
    <select
      value={formData.EmailTemplateId}
      onChange={(e) =>
        handleInputChange("EmailTemplateId", Number(e.target.value))
      }
      className="w-full border rounded-md p-2"
    >
      <option value={0}>Select</option>
      {template.map((temp) => (
        <option key={temp.Id} value={temp.Id}>
          {temp.Title}
        </option>
      ))}
    </select>
  </div>
)}

{source === "custom" && (
  <div className="mb-4">
    <label className="block mb-2 font-medium">Custom Message</label>
    <textarea
      rows={6}
      value = {formData.CustomMessage}
      onChange = {(e) => handleInputChange("CustomMessage", e.target.value)}
      placeholder="Write your custom message here..."
      className="w-full border rounded-md p-3 resize-none"
    />
  </div>
)}



<div className="mb-4 flex items-center gap-2">
  <input
    type="checkbox"
    checked={formData.SendToAll}
    onChange={(e) =>
      setFormData(prev => ({
        ...prev,
        SendToAll: e.target.checked,
        StudentIds: e.target.checked ? [] : prev.StudentIds
      }))
    }
  />
  <label className="font-medium">Send to all students</label>
</div>

      {/* Students */}
     <div className="mb-4 relative">
  <label className="block mb-2 font-medium">Select Students</label>

  {/* Dropdown trigger */}
  <button
    type="button"
    disabled={formData.SendToAll}
    onClick={() => setIsStudentOpen(prev => !prev)}
    className={`
      w-full border rounded-md px-3 py-2 text-left
      flex justify-between items-center
      ${formData.SendToAll ? "bg-gray-100 opacity-70 cursor-not-allowed" : "bg-white"}
    `}
  >
    <span className="truncate">
      {formData.StudentIds.length === 0
        ? "Select students"
        : `${formData.StudentIds.length} student(s) selected`}
    </span>
    <span className="text-gray-500">▾</span>
  </button>

  {/* Dropdown panel */}
  {isStudentOpen && !formData.SendToAll && (
    <div className="absolute z-30 mt-1 w-full bg-white border rounded-md shadow-lg">
      
      {/* Search */}
      <div className="p-2 border-b">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md px-2 py-1 text-sm"
        />
      </div>

      {/* Select all */}
      <div className="p-2 border-b">
        <button
          type="button"
          onClick={selectAllStudents}
          className="text-sm bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200"
        >
          Select All ({students.length})
        </button>
        <p className="text-xs text-gray-500 mt-1">
          {formData.StudentIds.length} selected
        </p>
      </div>

      {/* List */}
      <div className="max-h-60 overflow-auto">
        {filteredStudents.map(student => {
          const selected = formData.StudentIds.includes(student.Id)

          return (
            <div
              key={student.Id}
              onClick={() => toggleStudent(student.Id)}
              className={`
                px-4 py-3 cursor-pointer flex justify-between items-center
                hover:bg-gray-100
                ${selected ? "bg-blue-50" : ""}
              `}
            >
              <span>{student.IdNumber}</span>
              {selected && <span className="text-blue-600">✔</span>}
            </div>
          )
        })}

        {filteredStudents.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No students found</p>
        )}
      </div>
    </div>
  )}
</div>

      {/* Email Type */}
      <div className="mb-4">
        <label className="block mb-2">Email Type</label>
        <select className="w-full border rounded-md p-2">
          <option>Text</option>
          <option>HTML</option>
        </select>
      </div>

      <button className="bg-emerald-500 text-white px-6 py-2 rounded-md" onClick={handleSave}>
        Send
      </button>
    </div>
  );
}
