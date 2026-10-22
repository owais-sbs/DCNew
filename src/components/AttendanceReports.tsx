import { useEffect, useState } from "react"
import axiosInstance from "./axiosInstance"

type AttendanceView = "student" | "absence" | "pending" | "hours"

export default function AttendanceReports() {
  const [active, setActive] = useState<AttendanceView>("student")
  const [studentRows, setStudentRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let activeRequest = true
    axiosInstance.get("/Student/GetAllStudentsSorted")
      .then((response) => {
        if (activeRequest)
          setStudentRows(response.data?.IsSuccess && Array.isArray(response.data.Data) ? response.data.Data : [])
      })
      .catch(() => { if (activeRequest) setStudentRows([]) })
      .finally(() => { if (activeRequest) setLoading(false) })
    return () => { activeRequest = false }
  }, [])

  const titleMap: Record<AttendanceView, string> = {
    student: "Student attendance report",
    absence: "Student absence report",
    pending: "Pending attendance report",
    hours: "Student attendance hours report",
  }

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6 grid grid-cols-[260px_1fr] gap-6">
        {/* Left sidebar tree */}
        <aside className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit">
          <div className="font-semibold text-gray-800 mb-3">Reports</div>
          <nav className="space-y-3 text-gray-700">
            <div>
              <div className="flex items-center gap-2 font-medium text-gray-900 mb-2"> <span className="rotate-90">›</span> Attendance reports</div>
              <div className="space-y-1">
                {[
                  { id: "student", label: "Student attendance" },
                  { id: "absence", label: "Student absence" },
                  { id: "pending", label: "Pending attendance" },
                  { id: "hours", label: "Student attendance hours" },
                ].map((i) => (
                  <button
                    key={i.id}
                    onClick={()=>setActive(i.id as AttendanceView)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${active===i.id?"bg-indigo-50 text-indigo-700":"hover:bg-gray-50"}`}
                  >{i.label}</button>
                ))}
              </div>
            </div>

            {/* Other groups shown collapsed for parity */}
            <div className="flex items-center gap-2"><span>›</span> Lesson reports</div>
            <div className="flex items-center gap-2"><span>›</span> Class reports</div>
            <div className="flex items-center gap-2"><span>›</span> Student reports</div>
            <div className="flex items-center gap-2"><span>›</span> Payment reports</div>
          </nav>
        </aside>

        {/* Right content */}
        <section>
          <div className="text-2xl font-semibold text-gray-800 mb-1">{titleMap[active]}</div>
          <div className="text-sm text-gray-500 mb-4">{active === "student" ? `${studentRows.length} students · calculated from attendance records` : ""}</div>

          {/* Filters row */}
          <div className="mb-3 flex items-center gap-3">
            <input placeholder="Search..." className="w-80 h-10 px-4 rounded-xl border border-gray-200 bg-white" />
            {(active==="student"||active==="pending") && (
              <>
                <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Class: ▾</button>
                {active==="student" && (<button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Student: ▾</button>)}
              </>
            )}
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Date: 01-10-2025 - 31-10-2025</button>
            <div className="ml-auto flex items-center gap-2">
              <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">⟳</button>
              <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">▦</button>
              <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Export</button>
            </div>
          </div>

          {/* Tables */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
            {active === "student" && <StudentAttendanceTable rows={studentRows} loading={loading} />}
            {active === "absence" && <StudentAbsenceTable />}
            {active === "pending" && <PendingAttendanceTable />}
            {active === "hours" && <AttendanceHoursTable />}
          </div>
        </section>
      </div>
    </div>
  )
}

function StudentAttendanceTable({ rows, loading }: { rows: any[]; loading: boolean }) {
  return (
    <table className="w-full text-sm min-w-[1200px]">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          {["Student ID","Student","Course","Calculated attendance"].map(h => (
            <th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>Loading calculated attendance…</td></tr> : rows.map((row) => (
          <tr key={row.Id} className="border-b last:border-0 border-gray-100">
            <td className="px-4 py-3 text-indigo-700">{row.Id}</td>
            <td className="px-4 py-3">{`${row.FirstName ?? ""} ${row.Surname ?? ""}`.trim()}</td>
            <td className="px-4 py-3">{row.CourseTitle || row.CourseLevel || "—"}</td>
            <td className="px-4 py-3 font-medium">{Number(row.CalculatedAttendancePercentage ?? 0).toFixed(2)}%</td>
          </tr>
        ))}
        {!loading && rows.length === 0 && <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>No student attendance data available.</td></tr>}
      </tbody>
    </table>
  )
}

function StudentAbsenceTable() {
  const rows = Array.from({ length: 12 }).map((_, i) => ({
    name: [
      "Constanza Anaiss Padilla Toro",
      "Marco Aurelio Dos Santos Savenagi",
      "Maria Gabriela Pereira Da Silva",
      "Anderson Galvao Da Silva",
      "Ruth Flores Choqueville",
    ][i % 5],
    count: 1,
  }))
  return (
    <table className="w-full text-sm min-w-[900px]">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          {[
            "Student name",
            "Absence count",
          ].map(h => (<th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b last:border-0 border-gray-100">
            <td className="px-4 py-3 text-indigo-700">{r.name}</td>
            <td className="px-4 py-3">{r.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PendingAttendanceTable() {
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
  return (
    <table className="w-full text-sm min-w-[1200px]">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          {["Class","Subject","Level","Class type","Teacher","Student","Lesson date","Lesson time","Duration"].map(h => (
            <th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b last:border-0 border-gray-100">
            <td className="px-4 py-3 text-indigo-700">{r.cls}</td>
            <td className="px-4 py-3">{r.subject}</td>
            <td className="px-4 py-3">{r.level}</td>
            <td className="px-4 py-3">{r.type}</td>
            <td className="px-4 py-3 text-blue-600">{r.teacher}</td>
            <td className="px-4 py-3">{r.student}</td>
            <td className="px-4 py-3">{r.date}</td>
            <td className="px-4 py-3">{r.time}</td>
            <td className="px-4 py-3">{r.dur}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AttendanceHoursTable() {
  const rows = Array.from({ length: 12 }).map((_, i) => ({
    name: [
      "Kleber Dos Santos Silva",
      "Thabiso Michael Pheto",
      "Marco Antonio Contreras Bravo",
      "Mikhail Alejandro Quintal Sanchez",
      "Aneiris Amanda Cermeno Pargas",
    ][i % 5],
    cls: "PM B1 DIMITRO/ANNE",
    subject: "",
    level: "B1",
    type: "",
    hours: ["24:15","09:15","34:00","26:15","29:45"][i % 5],
  }))
  return (
    <table className="w-full text-sm min-w-[1100px]">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          {["Student Name","Class","Subject","Level","Class type","Total Present hours"].map(h => (
            <th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b last:border-0 border-gray-100">
            <td className="px-4 py-3 text-indigo-700">{r.name}</td>
            <td className="px-4 py-3">{r.cls}</td>
            <td className="px-4 py-3">{r.subject}</td>
            <td className="px-4 py-3">{r.level}</td>
            <td className="px-4 py-3">{r.type}</td>
            <td className="px-4 py-3">{r.hours}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}


