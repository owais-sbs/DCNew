import { useState } from "react"
import { X } from "lucide-react"

interface AddStudentFormProps {
  isOpen: boolean
  onClose: () => void
  asPage?: boolean
}

export default function AddStudentForm({ isOpen, onClose, asPage }: AddStudentFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    gender: "Not specified",
    registrationDate: "20-10-2025",
    dateOfBirth: "",
    idNumber: "DCE3318",
    photo: null as File | null,
    preferredPaymentMethod: "",
    discount: "0.00",
    mobilePhone: "",
    homePhone: "",
    email: "",
    streetAddress: "",
    city: "",
    zipCode: "",
    state: "",
    country: "Ireland",
    timezone: "Europe/London",
    nationality: "",
    gnibExpiryDate: "",
    finishedCourseDate: "",
    courseLevel: "",
    hoursPerWeek: "",
    courseCode: "",
    passportNumber: "",
    passportExpiryDate: "",
    courseStartDate: "",
    courseEndDate: "",
    attendance: "",
    courseTitle: "",
    modeOfStudy: "",
    numberOfWeeks: "",
    tuitionFees: "",
    department: "",
    externalExam: "",
    externalExamDate: "",
    scoreExternalExam: "",
    dateOfPayment: "",
    duration: "",
    schedule: "",
    ilepReference: "",
    endOfExamPaid: "",
    generalNotes: "",
    medicalNotes: "",
    classSubject: "",
    classLevel: "",
    allowSubstituteLessons: false,
    substituteLessonsPerMonth: "",
    substituteStartDate: "",
    substituteEndDate: ""
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, photo: file }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Student data:', formData)
    onClose()
  }

  if (!asPage && !isOpen) return null

  const WrapperStart = asPage
    ? "div"
    : ("div" as any)

  return (
    <div className={asPage ? "" : "fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"} onClick={asPage ? undefined : onClose}>
      <div className={`w-full ${asPage ? "" : "max-w-4xl"} bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden ${asPage ? "" : "max-h-[90vh] overflow-y-auto"}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add student</h2>
          {!asPage && (
            <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  required
                />
                <p className="text-red-500 text-xs mt-1">This field is required</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex gap-4">
                  {["Male", "Female", "Not specified"].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender === option}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration date *</label>
                <input
                  type="text"
                  value={formData.registrationDate}
                  onChange={(e) => handleInputChange('registrationDate', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">dd-mm-yyyy</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
                <input
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
                <p className="text-gray-500 text-xs mt-1">Please confirm ID after student has been created.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="photo"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    className="hidden"
                  />
                  <label htmlFor="photo" className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm cursor-pointer flex items-center">
                    Choose file
                  </label>
                  <span className="text-sm text-gray-500">No file chosen</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">Accepted file types: jpg, jpeg, png, gif</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred payment method</label>
                <select
                  value={formData.preferredPaymentMethod}
                  onChange={(e) => handleInputChange('preferredPaymentMethod', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                >
                  <option value="">select</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile phone</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                    <span className="text-sm">🇮🇪</span>
                    <span className="text-sm">+353</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.mobilePhone}
                    onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home phone</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                    <span className="text-sm">🇮🇪</span>
                    <span className="text-sm">+353</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.homePhone}
                    onChange={(e) => handleInputChange('homePhone', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address (recommended)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street address</label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP/Post code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province/Region</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                  <span className="text-sm">🇮🇪</span>
                  <span className="text-sm">Ireland</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time zone and Country */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time zone</label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                  <span className="text-sm">Europe/London</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                  <span className="text-sm">🇮🇪</span>
                  <span className="text-sm">Ireland</span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GNIB Expiry Date</label>
                <input
                  type="text"
                  value={formData.gnibExpiryDate}
                  onChange={(e) => handleInputChange('gnibExpiryDate', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
                <input
                  type="text"
                  value={formData.passportExpiryDate}
                  onChange={(e) => handleInputChange('passportExpiryDate', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Finished Course Date</label>
                <input
                  type="text"
                  value={formData.finishedCourseDate}
                  onChange={(e) => handleInputChange('finishedCourseDate', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Start Date</label>
                <input
                  type="text"
                  value={formData.courseStartDate}
                  onChange={(e) => handleInputChange('courseStartDate', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Level</label>
                <input
                  type="text"
                  value={formData.courseLevel}
                  onChange={(e) => handleInputChange('courseLevel', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course End Date</label>
                <input
                  type="text"
                  value={formData.courseEndDate}
                  onChange={(e) => handleInputChange('courseEndDate', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours Per Week</label>
                <input
                  type="text"
                  value={formData.hoursPerWeek}
                  onChange={(e) => handleInputChange('hoursPerWeek', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance</label>
                <input
                  type="text"
                  value={formData.attendance}
                  onChange={(e) => handleInputChange('attendance', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) => handleInputChange('courseCode', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  value={formData.courseTitle}
                  onChange={(e) => handleInputChange('courseTitle', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Study</label>
                <input
                  type="text"
                  value={formData.modeOfStudy}
                  onChange={(e) => handleInputChange('modeOfStudy', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Weeks</label>
                <input
                  type="text"
                  value={formData.numberOfWeeks}
                  onChange={(e) => handleInputChange('numberOfWeeks', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Fees</label>
                <input
                  type="text"
                  value={formData.tuitionFees}
                  onChange={(e) => handleInputChange('tuitionFees', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">External Exam</label>
                <input
                  type="text"
                  value={formData.externalExam}
                  onChange={(e) => handleInputChange('externalExam', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Course Code Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Code</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) => handleInputChange('courseCode', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Level</label>
                <input
                  type="text"
                  value={formData.courseLevel}
                  onChange={(e) => handleInputChange('courseLevel', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">External Exam</label>
                <input
                  type="text"
                  value={formData.externalExam}
                  onChange={(e) => handleInputChange('externalExam', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of External Exam</label>
                <input
                  type="text"
                  value={formData.externalExamDate}
                  onChange={(e) => handleInputChange('externalExamDate', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score External Exam</label>
                <input
                  type="text"
                  value={formData.scoreExternalExam}
                  onChange={(e) => handleInputChange('scoreExternalExam', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Payment</label>
                <input
                  type="text"
                  value={formData.dateOfPayment}
                  onChange={(e) => handleInputChange('dateOfPayment', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => handleInputChange('schedule', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ILEP reference number</label>
                <select
                  value={formData.ilepReference}
                  onChange={(e) => handleInputChange('ilepReference', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                >
                  <option value="">Select</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">End of Exam paid</label>
                <input
                  type="text"
                  value={formData.endOfExamPaid}
                  onChange={(e) => handleInputChange('endOfExamPaid', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Other details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Other details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">General notes</label>
                <textarea
                  value={formData.generalNotes}
                  onChange={(e) => handleInputChange('generalNotes', e.target.value)}
                  className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical notes</label>
                <textarea
                  value={formData.medicalNotes}
                  onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
                  className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Class options */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class options</h3>
            <p className="text-sm text-gray-600 mb-4">If selected, this student can only be enrolled in these subjects or levels. Leaving it blank allows the student to be enrolled in any classes.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class subject</label>
                <select
                  value={formData.classSubject}
                  onChange={(e) => handleInputChange('classSubject', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                >
                  <option value="">Select</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class level</label>
                <select
                  value={formData.classLevel}
                  onChange={(e) => handleInputChange('classLevel', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                >
                  <option value="">Select</option>
                </select>
              </div>
            </div>
          </div>

          {/* Substitute lessons */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Substitute lessons</h3>
            <p className="text-sm text-gray-600 mb-4">Allow substitute lessons, and set the number of substitute lessons per month and the start and end date for the substitute lessons. <span className="text-blue-600 cursor-pointer">Learn more</span></p>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.allowSubstituteLessons}
                  onChange={(e) => handleInputChange('allowSubstituteLessons', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Allow substitute lessons</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Substitute lessons per month</label>
                  <input
                    type="text"
                    value={formData.substituteLessonsPerMonth}
                    onChange={(e) => handleInputChange('substituteLessonsPerMonth', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
                  <input
                    type="text"
                    value={formData.substituteStartDate}
                    onChange={(e) => handleInputChange('substituteStartDate', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                    placeholder="select..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
                  <input
                    type="text"
                    value={formData.substituteEndDate}
                    onChange={(e) => handleInputChange('substituteEndDate', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                    placeholder="select..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enroll in classes */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enroll in classes</h3>
            <p className="text-sm text-gray-600 mb-4">Enroll the student in a class</p>
            <button type="button" className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">
              Select classes
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-10 px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm"
            >
              Add and new
            </button>
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-blue-600 text-white text-sm"
            >
              Add student
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
