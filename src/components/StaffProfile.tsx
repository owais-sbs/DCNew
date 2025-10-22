import { useParams, useNavigate } from "react-router-dom"
import { ChevronDown, Plus, Download, MoreHorizontal, CheckCircle, Clock, FileText, User, Calendar, DollarSign, Receipt, Users, StickyNote, Paperclip, BookOpen, Award, FilePlus, Sun, Archive, Trash2, CreditCard, Mail, Megaphone, BarChart3, Calendar as CalendarIcon, FileCheck } from "lucide-react"
import { useState, useEffect } from "react"

export default function StaffProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("profile")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState<string | null>(null)
  
  console.log('StaffProfile rendered with id:', id)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const staff = {
    id,
    name: "Lia Reception",
    role: "Staff",
    email: "lia@example.com",
    idNumber: "S001",
    department: "Reception",
    joinedDate: "June 2022"
  }

  const tabs = [
    "Profile", "Classes", "Notes", "Attachments", "Permissions", "Attendance"
  ]

  const renderProfileContent = () => (
    <div className="space-y-6">
      {/* Contact Details */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Mobile phone</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Home phone</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Date of birth</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ID number</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Staff type</div>
              <div className="text-sm text-gray-900 mt-1">-</div>
            </div>
          </div>
        </div>
      </div>

      {/* Address and General Notes */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address and General Notes</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500">Address</div>
            <div className="text-sm text-gray-900 mt-1">Ireland</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">General notes</div>
            <div className="text-sm text-gray-900 mt-1">-</div>
          </div>
        </div>
      </div>

      {/* School Portal */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">School Portal</h3>
        <p className="text-sm text-gray-600 mb-6">Enable or disable access to your school portal.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-2">Access to School Portal</div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                </div>
                <span className="text-sm text-gray-700">Disabled</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Username</div>
              <div className="text-sm text-gray-900 mt-1">not set</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Automatic reminders</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm text-gray-700">Enabled</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Invitation</div>
              <div className="mt-1">
                <button className="text-sm text-blue-600 hover:text-blue-700">Invite to portal</button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Lia has not signed up yet!</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Password</div>
              <div className="text-sm text-gray-900 mt-1">not set</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Last login</div>
              <div className="text-sm text-gray-900 mt-1">never</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">Created date: 29-06-2022 17:33</div>
        </div>
      </div>
    </div>
  )

  const renderClassesContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Assigned classes</h2>
        </div>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Assign to a class
        </button>
      </div>
      
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <BookOpen size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Lia is not assigned to any Classes</h3>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2 mt-4">
          <Plus size={16} /> Assign to a Class
        </button>
      </div>
    </div>
  )

  const renderNotesContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
        </div>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New note
        </button>
      </div>
      
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <StickyNote size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add notes about Lia</h3>
        <p className="text-gray-600 mb-4">Notes concerning Lia will appear here.</p>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New note
        </button>
      </div>
    </div>
  )

  const renderAttachmentsContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attachments</h2>
        </div>
      </div>
      
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Paperclip size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add attachments</h3>
        <p className="text-gray-600 mb-4">You can add and store relevant documents and files here.</p>
        <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Add attachment
        </button>
      </div>
    </div>
  )

  const renderPermissionsContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose what this staff member can view or do in the School Portal</h2>
          <p className="text-gray-600">These permissions will only apply to this staff member and will not affect any other staff member.</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* General access */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General access</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="radio" name="general-access" className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">View all school information</div>
                <div className="text-sm text-gray-600">Can view info about ALL Classes, Lessons, students and Related contacts. The permissions below set out how much access they will have to this information.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input type="radio" name="general-access" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">View assigned information</div>
                <div className="text-sm text-gray-600">Can only view information related to the Classes and students they are assigned to</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">View archived information</div>
                <div className="text-sm text-gray-600">Note: This setting can only be changed for individual staff</div>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teachers</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view teacher profiles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Classes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classes</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">View classes - Can view classes and schedule</div>
              </div>
            </div>
          </div>
        </div>

        {/* Class lessons */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class lessons</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">View lessons - Can view lessons and all related information</div>
              </div>
            </div>
          </div>
        </div>

        {/* Staffs */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staffs</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view staff profiles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments and receipts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payments and receipts</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view student payments or receipts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Email and SMS notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email and SMS notifications</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">Send email and SMS - Can send both Email and SMS messages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Classrooms */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classrooms</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view classrooms</div>
              </div>
            </div>
          </div>
        </div>

        {/* Prospects */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prospects</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view prospects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Students and related contacts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students and related contacts</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">View students - Can view students, their related contacts and their contact information</div>
              </div>
            </div>
          </div>
        </div>

        {/* Library and attachments */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Library and attachments</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">View attachments - Can view and download attachments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports and exports */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports and exports</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot export</div>
              </div>
            </div>
          </div>
        </div>

        {/* School management */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">School management</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium text-gray-900">Use default</div>
                <div className="text-sm text-gray-600">None - Cannot view school management</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end pt-6">
        <button className="h-10 px-6 rounded-lg bg-blue-600 text-white text-sm">
          Save changes
        </button>
      </div>
    </div>
  )

  const renderAttendanceContent = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attendance</h2>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value="10-2025" 
            className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
            readOnly
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Attendance</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 9 }, (_, i) => {
              const date = new Date(2025, 9, i + 1) // October 2025
              const day = String(date.getDate()).padStart(2, '0')
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const year = date.getFullYear()
              return (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">{day}-{month}-{year}</td>
                  <td className="py-3 px-4 text-gray-700">-</td>
                  <td className="py-3 px-4 text-gray-700">-</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderContent = () => {
    switch(activeTab.toLowerCase()) {
      case "profile": return renderProfileContent()
      case "classes": return renderClassesContent()
      case "notes": return renderNotesContent()
      case "attachments": return renderAttachmentsContent()
      case "permissions": return renderPermissionsContent()
      case "attendance": return renderAttendanceContent()
      default: return renderProfileContent()
    }
  }

  return (
    <div>
      <div className="px-6 py-6">
        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white text-xl font-semibold">LR</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 truncate">{staff.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Staff</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <button className="inline-flex items-center gap-1 text-indigo-600" onClick={() => alert('Add phone')}>+ add phone</button>
                <button className="inline-flex items-center gap-1 text-indigo-600" onClick={() => alert('Add email')}>+ add email</button>
                <div className="inline-flex items-center gap-1 text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  0
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div>Joined {staff.joinedDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Message Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'message' ? null : 'message')}
                  className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                >
                  Message <ChevronDown size={14} />
                </button>
                {openDropdown === 'message' && (
                  <div className="dropdown-container absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div 
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setOpenDropdown(null)
                        setOpenModal('sms')
                      }}
                    >
                      <Megaphone size={16} /> Send SMS
                    </div>
                    <div 
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setOpenDropdown(null)
                        setOpenModal('email')
                      }}
                    >
                      <Mail size={16} /> Send email
                    </div>
                    <div 
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setOpenDropdown(null)
                        setOpenModal('announcement')
                      }}
                    >
                      <Megaphone size={16} /> Send announcement
                    </div>
                  </div>
                )}
              </div>

              {/* Print Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'print' ? null : 'print')}
                  className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                >
                  Print <ChevronDown size={14} />
                </button>
                {openDropdown === 'print' && (
                  <div className="dropdown-container absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Print Profile</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Print Schedule</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">Print Reports</div>
                  </div>
                )}
              </div>

              {/* More Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'more' ? null : 'more')}
                  className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                >
                  More <ChevronDown size={14} />
                </button>
                {openDropdown === 'more' && (
                  <div className="dropdown-container absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 right-0 top-full">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <FileText size={16} /> Edit
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <Sun size={16} /> Set holiday
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <User size={16} /> Invite to portal
                    </div>
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <Archive size={16} /> Archive
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
                      <Trash2 size={16} /> Delete
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {tabs.map((tab, i) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`relative h-9 px-3 text-sm transition-colors ${
                  activeTab === tab 
                    ? 'text-blue-700 font-medium' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      {openModal === 'sms' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send sms message</h3>
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                <span className="text-gray-500">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="text-sm text-blue-600 cursor-pointer">0 people selected</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value="InfoSMS" 
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                    readOnly
                  />
                  <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500">
                    <span className="text-sm">i</span>
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">Message *</label>
                  <button className="text-sm text-gray-500">▼</button>
                  <button className="h-4 w-4 grid place-items-center rounded-full border border-gray-300 text-gray-500">
                    <span className="text-xs">i</span>
                  </button>
                </div>
                <textarea 
                  className="w-full h-32 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-none"
                  placeholder="Type your message here..."
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>You have 459 characters left</span>
                  <span>1 message</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Message will be delivered to <span className="text-blue-600">0 people</span> and cost 0 credits
              </div>
              <div className="flex items-center gap-3 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Remaining SMS credits: 0</span>
                </div>
                <button className="h-8 px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm inline-flex items-center gap-1">
                  <CreditCard size={14} /> Add credit
                </button>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  onClick={() => setOpenModal(null)}
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openModal === 'email' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send email message</h3>
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                <span className="text-gray-500">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="text-sm text-blue-600 cursor-pointer">0 people selected</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input 
                  type="text" 
                  value="Asif Omer (info@dcedu.ie)" 
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input 
                  type="text" 
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea 
                  className="w-full h-32 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-none"
                  placeholder="Type your message here..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  onClick={() => setOpenModal(null)}
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openModal === 'announcement' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send announcement message</h3>
              <button onClick={() => setOpenModal(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                <span className="text-gray-500">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600 cursor-pointer">1 person selected</span>
                  <button className="h-6 w-6 grid place-items-center rounded text-blue-600">
                    <User size={14} />
                  </button>
                  <button className="h-6 w-6 grid place-items-center rounded text-blue-600">
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value="Asif Omer (info@dcedu.ie)" 
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                    readOnly
                  />
                  <button className="h-10 w-10 grid place-items-center rounded-xl border border-gray-200 bg-white text-gray-500">
                    <span className="text-sm">i</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input 
                  type="text" 
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">Message *</label>
                  <button className="text-sm text-blue-600">Insert variable ▼</button>
                  <button className="h-4 w-4 grid place-items-center rounded-full border border-gray-300 text-gray-500">
                    <span className="text-xs">i</span>
                  </button>
                </div>
                {/* Rich text editor toolbar */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm font-bold">B</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm italic">I</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm underline">U</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-sm line-through">S</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">≡</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 bg-yellow-200">A</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200 text-xs">14</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">•</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">1.</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">→</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">←</button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">🔗</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">📹</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">📷</button>
                    <button className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">📎</button>
                  </div>
                  <textarea 
                    className="w-full h-32 px-3 py-2 text-sm resize-none border-0 focus:ring-0"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule send (optional)</label>
                  <input 
                    type="text" 
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                    placeholder="Select date and time"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry date (optional)</label>
                  <input 
                    type="text" 
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                    placeholder="Select expiry date"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  onClick={() => setOpenModal(null)}
                  className="h-10 px-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm"
                >
                  Cancel
                </button>
                <button className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
