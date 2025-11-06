import { useState } from "react"

type GroupKey = "attendance" | "lesson" | "class" | "student" | "payment"

export default function Reports() {
  const [openGroup, setOpenGroup] = useState<GroupKey | null>("attendance")
  const [activeGroup, setActiveGroup] = useState<GroupKey>("attendance")
  const [activeItem, setActiveItem] = useState<string>("student_attendance")

  const select = (group: GroupKey, item: string) => {
    setActiveGroup(group)
    setActiveItem(item)
  }

  const toggleGroup = (group: GroupKey) => {
    setOpenGroup(openGroup === group ? null : group)
  }

  const Title = getTitle(activeGroup, activeItem)

  return (
    <div>
      <div className="px-6 py-6 grid grid-cols-[280px_1fr] gap-6">
        {/* Left sidebar tree */}
        <aside className="bg-white border border-gray-200 rounded-xl py-4 shadow-sm h-max">
          <div className="px-4 pb-2 text-[15px] font-semibold text-gray-800">Reports</div>
          <nav className="px-2 space-y-2 text-gray-700">
            {/* Attendance reports */}
            <div>
              <button onClick={()=>toggleGroup("attendance")} className="flex items-center gap-2 w-full text-left text-[14px] font-semibold text-gray-900 px-2 py-2 hover:bg-gray-50 rounded-lg">
                <span className={`transition-transform ${openGroup==="attendance"?"rotate-90":""}`}>›</span>
                Attendance reports
              </button>
              {openGroup==="attendance" && (
                <div className="mt-1 space-y-1 pl-6">
                  <SidebarItem label="Student attendance" active={activeGroup==="attendance" && activeItem==="student_attendance"} onClick={()=>select("attendance","student_attendance")} />
                  <SidebarItem label="Student absence" active={activeGroup==="attendance" && activeItem==="student_absence"} onClick={()=>select("attendance","student_absence")} />
                  <SidebarItem label="Pending attendance" active={activeGroup==="attendance" && activeItem==="pending_attendance"} onClick={()=>select("attendance","pending_attendance")} />
                  <SidebarItem label="Student attendance hours" active={activeGroup==="attendance" && activeItem==="attendance_hours"} onClick={()=>select("attendance","attendance_hours")} />
                </div>
              )}
            </div>

            {/* Lesson reports */}
            <div>
              <button onClick={()=>toggleGroup("lesson")} className="flex items-center gap-2 w-full text-left text-[14px] font-semibold text-gray-900 px-2 py-2 hover:bg-gray-50 rounded-lg">
                <span className={`transition-transform ${openGroup==="lesson"?"rotate-90":""}`}>›</span>
                Lesson reports
              </button>
              {openGroup==="lesson" && (
                <div className="mt-1 space-y-1 pl-6">
                  <SidebarItem label="Lesson details" active={activeGroup==="lesson" && activeItem==="lesson_details"} onClick={()=>select("lesson","lesson_details")} />
                  <SidebarItem label="Lesson grades" active={activeGroup==="lesson" && activeItem==="lesson_grades"} onClick={()=>select("lesson","lesson_grades")} />
                </div>
              )}
            </div>

            {/* Class reports */}
            <div>
              <button onClick={()=>toggleGroup("class")} className="flex items-center gap-2 w-full text-left text-[14px] font-semibold text-gray-900 px-2 py-2 hover:bg-gray-50 rounded-lg">
                <span className={`transition-transform ${openGroup==="class"?"rotate-90":""}`}>›</span>
                Class reports
              </button>
              {openGroup==="class" && (
                <div className="mt-1 space-y-1 pl-6">
                  <SidebarItem label="Class enrolment" active={activeGroup==="class" && activeItem==="class_enrolment"} onClick={()=>select("class","class_enrolment")} />
                  <SidebarItem label="Class unenrollment" active={activeGroup==="class" && activeItem==="class_unenrollment"} onClick={()=>select("class","class_unenrollment")} />
                  <SidebarItem label="Gradebook grades" active={activeGroup==="class" && activeItem==="gradebook_grades"} onClick={()=>select("class","gradebook_grades")} />
                </div>
              )}
            </div>

            {/* Student reports */}
            <div>
              <button onClick={()=>toggleGroup("student")} className="flex items-center gap-2 w-full text-left text-[14px] font-semibold text-gray-900 px-2 py-2 hover:bg-gray-50 rounded-lg">
                <span className={`transition-transform ${openGroup==="student"?"rotate-90":""}`}>›</span>
                Student reports
              </button>
              {openGroup==="student" && (
                <div className="mt-1 space-y-1 pl-6">
                  <SidebarItem label="Student notes" active={activeGroup==="student" && activeItem==="student_notes"} onClick={()=>select("student","student_notes")} />
                  <SidebarItem label="Student behaviour" active={activeGroup==="student" && activeItem==="student_behaviour"} onClick={()=>select("student","student_behaviour")} />
                </div>
              )}
            </div>

            {/* Payment reports */}
            <div>
              <button onClick={()=>toggleGroup("payment")} className="flex items-center gap-2 w-full text-left text-[14px] font-semibold text-gray-900 px-2 py-2 hover:bg-gray-50 rounded-lg">
                <span className={`transition-transform ${openGroup==="payment"?"rotate-90":""}`}>›</span>
                Payment reports
              </button>
              {openGroup==="payment" && (
                <div className="mt-1 space-y-1 pl-6">
                  <SidebarItem label="Fees" active={activeGroup==="payment" && activeItem==="fees"} onClick={()=>select("payment","fees")} />
                  <SidebarItem label="Outstanding payment" active={activeGroup==="payment" && activeItem==="outstanding_payment"} onClick={()=>select("payment","outstanding_payment")} />
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Right content */}
        <section>
          <div className="text-2xl font-semibold text-gray-800 mb-1">{Title}</div>
          <SubHeader group={activeGroup} item={activeItem} />

          <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
            {renderView(activeGroup, activeItem)}
          </div>
        </section>
      </div>
    </div>
  )
}

function SidebarItem({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${active?"bg-indigo-50 text-indigo-700":"hover:bg-gray-50"}`}>{label}</button>
  )
}

function getTitle(group: GroupKey, item: string) {
  if (group === "attendance") {
    if (item === "student_attendance") return "Student attendance report"
    if (item === "student_absence") return "Student absence report"
    if (item === "pending_attendance") return "Pending attendance report"
    if (item === "attendance_hours") return "Student attendance hours report"
  }
  if (group === "lesson") {
    if (item === "lesson_details") return "Lesson details report"
    if (item === "lesson_grades") return "Lesson grade report"
  }
  if (group === "class") {
    if (item === "class_enrolment") return "Class enrolment report"
    if (item === "class_unenrollment") return "Class unenrolment report"
    if (item === "gradebook_grades") return "Gradebook grades report"
  }
  if (group === "student") {
    if (item === "student_notes") return "Student notes report"
    if (item === "student_behaviour") return "Student behaviour report"
  }
  if (group === "payment") {
    if (item === "fees") return "Fees report"
    if (item === "outstanding_payment") return "Outstanding payments report"
  }
  return "Reports"
}

function SubHeader({ group, item }: { group: GroupKey; item: string }) {
  const right = (
    <div className="ml-auto flex items-center gap-2">
      <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">⟳</button>
      <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">▦</button>
      <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Export</button>
    </div>
  )

  // Payment reports have different filter layout
  if (group === "payment") {
    if (item === "fees") {
      return (
        <div>
          <div className="text-sm text-gray-500 mb-4">0 / 443 Records</div>
          <div className="mb-3 flex items-center gap-3">
            <input placeholder="Search columns ..." className="w-80 h-10 px-4 rounded-xl border border-gray-200 bg-white" />
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Student: ▾</button>
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Status: All ▾</button>
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Date: 01-10-2025 - 31-10-2025</button>
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Date Filter By: Due date ▾</button>
            {right}
          </div>
        </div>
      )
    }
    if (item === "outstanding_payment") {
      return (
        <div>
          <div className="text-sm text-gray-500 mb-4">441 / 441 Records</div>
          <div className="mb-3 flex items-center gap-3">
            <input placeholder="Search columns ..." className="w-80 h-10 px-4 rounded-xl border border-gray-200 bg-white" />
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Student: ▾</button>
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Date:</button>
            {right}
          </div>
        </div>
      )
    }
  }

  return (
    <div>
      <div className="text-sm text-gray-500 mb-4">&nbsp;</div>
      <div className="mb-3 flex items-center gap-3">
        <input placeholder="Search columns ..." className="w-80 h-10 px-4 rounded-xl border border-gray-200 bg-white" />
        {(group!=="student" || item!=="student_behaviour") && (
          <>
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Class: ▾</button>
            {(group==="attendance" && item==="student_attendance") || (group==="lesson" && item==="lesson_grades") || (group==="student" && item==="student_notes") ? (
              <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Student: ▾</button>
            ) : null}
          </>
        )}
        <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Date: 01-10-2025 - 31-10-2025</button>
        {right}
      </div>
    </div>
  )
}

function renderView(group: GroupKey, item: string) {
  if (group === "attendance" && item === "student_attendance") return <TableStudentAttendance />
  if (group === "attendance" && item === "student_absence") return <TableStudentAbsence />
  if (group === "attendance" && item === "pending_attendance") return <TablePendingAttendance />
  if (group === "attendance" && item === "attendance_hours") return <TableAttendanceHours />

  if (group === "lesson" && item === "lesson_details") return <TableLessonDetails />
  if (group === "lesson" && item === "lesson_grades") return <TableLessonGrades />

  if (group === "class" && item === "class_enrolment") return <TableClassEnrolment />
  if (group === "class" && item === "class_unenrollment") return <TableClassUnenrollment />
  if (group === "class" && item === "gradebook_grades") return <TableGradebookGrades />

  if (group === "student" && item === "student_notes") return <TableStudentNotes />
  if (group === "student" && item === "student_behaviour") return <TableStudentBehaviour />

  if (group === "payment" && item === "fees") return <TableFees />
  if (group === "payment" && item === "outstanding_payment") return <TableOutstandingPayment />

  return null
}

// ===== Attendance tables =====
function TableStudentAttendance() {
  const rows = Array.from({ length: 8 }).map((_, i) => ({
    cls: "PM A2 WALID/ DIMITRO",
    subject: "",
    level: "A2",
    type: "",
    teacher: "Walid Teacher",
    student: ["Rejane Costa Pereira","Julio Cesar Hernandez Silvestre","Reginaldo Ferreira De Oliveira"][i % 3],
    date: "01-10-2025",
    time: "13:00-15:00",
    dur: "2hours",
    attendance: ["Present","Absent"][i%2],
  }))
  const headers = ["Class","Subject","Level","Class type","Teacher","Student","Lesson Date","Lesson Time","Duration","Attendance","Excused","Personal student notes"]
  return <SimpleTable headers={headers} rows={rows} />
}

function TableStudentAbsence() {
  const rows = Array.from({ length: 10 }).map((_, i) => ({ name: ["Constanza Anaiss Padilla Toro","Marco Aurelio Dos Santos Savenagi","Maria Gabriela Pereira Da Silva"][i % 3], count: 1 }))
  const headers = ["Student name","Absence count"]
  return <SimpleTable headers={headers} rows={rows} />
}

function TablePendingAttendance() {
  const rows = Array.from({ length: 6 }).map((_, i) => ({
    cls: "PM B1",
    subject: "",
    level: "B1",
    type: "",
    teacher: "Anne Smiddy Teacher",
    student: ["Aneiris Amanda Cermeno Pargas","Gabriel Henrique Barrozo Sobrinho","Mariana Ramirez Ortega"][i % 3],
    date: "30-10-2025",
    time: "15:15-17:00",
    dur: "1 hour 45 minutes",
  }))
  const headers = ["Class","Subject","Level","Class type","Teacher","Student","Lesson date","Lesson time","Duration"]
  return <SimpleTable headers={headers} rows={rows} />
}

function TableAttendanceHours() {
  const rows = Array.from({ length: 12 }).map((_, i) => ({
    name: ["Kleber Dos Santos Silva","Thabiso Michael Pheto","Marco Antonio Contreras Bravo"][i%3],
    cls: "PM B1 DIMITRO/ANNE",
    subject: "",
    level: "B1",
    type: "",
    hours: ["24:15","09:15","34:00"][i%3],
  }))
  const headers = ["Student Name","Class","Subject","Level","Class type","Total Present hours"]
  return <SimpleTable headers={headers} rows={rows} />
}

// ===== Lesson tables =====
function TableLessonDetails() {
  const rows = Array.from({ length: 6 }).map((_, i) => ({
    cls: ["Room2 D7","Room9 D7","Room4 D7"][i % 3],
    subject: ["200525|pm|A1","b2|pm","B2(2) pm"][i % 3],
    level: ["A1","B1","B2"][i % 3],
    credit: "",
    type: ["pm","pm","pm"][i % 3],
    date: "31-10-2025",
    time: "15:30-17:00",
    duration: "1 hour 30 minutes",
    teacher: ["Olga Teacher","Sophie Teacher","Penny Teacher"][i % 3],
  }))
  const headers = ["Class","Class subject","Class level","Credit hours","Class type","Lesson date","Lesson time","Lesson duration","Teacher"]
  return <SimpleTable headers={headers} rows={rows} />
}

function TableLessonGrades() {
  const rows = Array.from({ length: 10 }).map((_, i) => ({
    cls: ["Room3 D7","Room11 D7","Room 7 D7"][i % 3],
    subject: ["A2 pm","B1 pm","A2 am"][i % 3],
    level: ["A2","B1","A2"][i % 3],
    teacher: ["Daiana Teacher","Edmund Patrick Teacher","Daiana Teacher"][i % 3],
    student: ["Rodolfo Marques de Azevedo","Deborah Lima De Ataide Leite","Cesar Augusto Sosa Leiva"][i % 3],
    date: ["31-10-2025","31-10-2025","31-10-2025"][i % 3],
    time: ["15:30-17:00","15:15-17:00","11:00-12:30"][i % 3],
    grade: "%",
  }))
  const headers = ["Class","Subject","Level","Teacher","Student","Lesson Date","Lesson Time","Grade"]
  return <SimpleTable headers={headers} rows={rows} />
}

// ===== Class tables =====
function TableClassEnrolment() {
  const rows = Array.from({ length: 8 }).map((_, i) => ({
    cls: ["AM B1 WALID/ABBEY","Advanced__AM__DCE1__PART 1","Cork Classroom C1 AM ABAIGH/ANNE"][i%3],
    subject: ["","General English with Exam Preparation","" ][i%3],
    level: ["B1","C1","C1 am"][i%3],
    type: ["B1","C1","C1 am"][i%3],
    start: "01-01-2025",
    end: "03-01-2028",
  }))
  const headers = ["Class","Subject","Level","Class type","Class start date","Class end date"]
  return <SimpleTable headers={headers} rows={rows} />
}

function TableClassUnenrollment() {
  const rows = Array.from({ length: 8 }).map((_, i) => ({
    cls: ["AM B1 WALID/ABBEY","Advanced__AM__DCE1__PART 1","Cork Classroom C1 AM ABAIGH/ANNE"][i%3],
    subject: ["","General English with Exam Preparation","" ][i%3],
    level: ["B1","C1","a1"][i%3],
    type: ["B1","C1","a1"][i%3],
    start: "01-01-2025",
    end: "03-01-2028",
  }))
  const headers = ["Class","Subject","Level","Class type","Class start date","Class end date"]
  return <SimpleTable headers={headers} rows={rows} />
}

function TableGradebookGrades() {
  // Empty state with columns and pagination controls stub
  const headers = ["Class","Class start date","Class end date","Gradebook Name","Student Name","Grade Date","Grade Name","Grade weight","Grade Value","Grade"]
  return (
    <div className="p-4">
      <table className="w-full text-sm min-w-[1200px]">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {headers.map(h => (<th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>))}
          </tr>
        </thead>
      </table>
      <div className="px-4 py-10 text-center text-gray-500">No records found</div>
      <div className="px-4 py-3 flex items-center gap-3">
        <button className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">25 ▾</button>
        <div className="ml-auto flex items-center gap-2">
          <button className="h-9 w-9 rounded-xl border border-gray-200">⟨</button>
          <button className="h-9 w-9 rounded-xl border border-gray-200">⟩</button>
        </div>
      </div>
    </div>
  )
}

// ===== Student tables =====
function TableStudentNotes() {
  const rows = Array.from({ length: 6 }).map((_, i) => ({
    first: ["Anderson","Alaa","Alejandro"][i%3],
    last: ["Rafael","Ibrahim","Contreras"][i%3],
    message: "An invitation email was sent to the Student.",
    lesson: "",
    date: "02-10-2025",
    time: ["09:12:26","13:18:15","14:51:55"][i%3],
    teacher: ["Asif Omer","Asif Omer","Asif Omer"][i%3],
    noteType: "Communication",
    createdBy: "Asif Omer",
    createdDate: "02-10-2025",
  }))
  const headers = ["First name","Last name","Messsage","Lesson name","Lesson date","Lesson time","Teacher","Note type","Created by","Created date"]
  return <SimpleTable headers={headers} rows={rows} />
}

function TableStudentBehaviour() {
  // Empty state as per screenshot
  const headers = ["Class","Subject","Level","Teacher","Student","Lesson Date","Lesson Time","Gold Stars Description","Red Flag Description"]
  return (
    <div className="p-4">
      <table className="w-full text-sm min-w-[1200px]">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {headers.map(h => (<th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>))}
          </tr>
        </thead>
      </table>
      <div className="px-4 py-10 text-center text-gray-500">No records found</div>
      <div className="px-4 py-3 flex items-center gap-3">
        <button className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">25 ▾</button>
        <div className="ml-auto flex items-center gap-2">
          <button className="h-9 w-9 rounded-xl border border-gray-200">⟨</button>
          <button className="h-9 w-9 rounded-xl border border-gray-200">⟩</button>
        </div>
      </div>
    </div>
  )
}

// ===== Generic table =====
function SimpleTable({ headers, rows }: { headers: string[]; rows: any[] }) {
  return (
    <table className="w-full text-sm min-w-[1100px]">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          {headers.map(h => (<th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b last:border-0 border-gray-100">
            {headers.map((h, j) => (
              <td key={j} className="px-4 py-3">{(r as any)[mapKey(h)] ?? ""}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ===== Payment tables =====
function TableFees() {
  // Empty state with pagination controls as per image
  const headers = ["Student","Related Contact","Related Contact Identification","Preferred payment method","Class Name","Teacher","Class Description","Due date","Paid Date","Payment method","Description","Payment Frequency","Amount","Discount","Status","total","Receipt #"]
  return (
    <div className="p-4">
      <table className="w-full text-sm min-w-[1600px]">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {headers.map(h => (<th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>))}
          </tr>
        </thead>
      </table>
      <div className="px-4 py-10 text-center text-gray-500">No records found</div>
      <div className="px-4 py-3 flex items-center gap-3">
        <button className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">25 ▾</button>
        <span className="text-sm text-gray-500">Showing 0 - 0 of 0 entries</span>
        <div className="ml-auto flex items-center gap-2">
          <button className="h-9 w-9 rounded-xl border border-gray-200">⟨</button>
          <button className="h-9 w-9 rounded-xl border border-gray-200">⟩</button>
        </div>
      </div>
    </div>
  )
}

function TableOutstandingPayment() {
  const rows = Array.from({ length: 8 }).map((_, i) => ({
    student: ["John Doe","Jane Smith","Mike Johnson"][i%3],
    teacher: ["Teacher A","Teacher B","Teacher C"][i%3],
    className: ["Class A","Class B","Class C"][i%3],
    dueDate: ["07-10-2019","31-05-2019","13-06-2019"][i%3],
    description: ["Exam","Book","€1600 (Price for Morning Class Renewal Course) Price includes: 25 Weeks General English (15 Hours per Week) expected asdasdada asdaasd"][i%3],
    paymentMethod: "custom",
    frequency: ["custom","hour"][i%2],
    amount: ["€120.00","€50.00","€1,600.00","€52.50"][i%4],
    discount: "€0.00",
  }))
  const headers = ["Student","Teacher","Class Name","Due date","Description","Preferred payment method","Payment Frequency","Amount","Discount"]
  return <SimpleTable headers={headers} rows={rows} />
}

function mapKey(h: string) {
  return h
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z ]/g, "")
    .replace(/ /g, (m)=>({"class":"cls","messsage":"message"} as any)[m] || "_")
    .replace("student name","name")
}



