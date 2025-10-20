import { useState } from "react"

type LessonView = "details" | "grades"

export default function LessonReports() {
  const [active, setActive] = useState<LessonView>("details")

  const titleMap: Record<LessonView, string> = {
    details: "Lesson details report",
    grades: "Lesson grade report",
  }

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6 grid grid-cols-[260px_1fr] gap-6">
        {/* Left sidebar tree */}
        <aside className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit">
          <div className="font-semibold text-gray-800 mb-3">Reports</div>
          <nav className="space-y-3 text-gray-700">
            <div className="flex items-center gap-2"><span>›</span> Attendance reports</div>
            <div>
              <div className="flex items-center gap-2 font-medium text-gray-900 mb-2"> <span className="rotate-90">›</span> Lesson reports</div>
              <div className="space-y-1">
                {[
                  { id: "details", label: "Lesson details" },
                  { id: "grades", label: "Lesson grades" },
                ].map((i) => (
                  <button
                    key={i.id}
                    onClick={()=>setActive(i.id as LessonView)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${active===i.id?"bg-indigo-50 text-indigo-700":"hover:bg-gray-50"}`}
                  >{i.label}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2"><span>›</span> Class reports</div>
            <div className="flex items-center gap-2"><span>›</span> Student reports</div>
            <div className="flex items-center gap-2"><span>›</span> Payment reports</div>
          </nav>
        </aside>

        {/* Right content */}
        <section>
          <div className="text-2xl font-semibold text-gray-800 mb-1">{titleMap[active]}</div>
          <div className="text-sm text-gray-500 mb-4">{active==="details"?"1897 / 136204 Lessons €0.00 total fee in view":"7597 / 302646 Lesson grades"}</div>

          {/* Filters row */}
          <div className="mb-3 flex items-center gap-3">
            <input placeholder="Search columns ..." className="w-80 h-10 px-4 rounded-xl border border-gray-200 bg-white" />
            {active==="grades" && (<button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Student: ▾</button>)}
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Date: 01-10-2025 - 31-10-2025</button>
            <div className="ml-auto flex items-center gap-2">
              <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">⟳</button>
              <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">▦</button>
              <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Export</button>
            </div>
          </div>

          {/* Tables */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
            {active === "details" && <LessonDetailsTable />}
            {active === "grades" && <LessonGradesTable />}
          </div>
        </section>
      </div>
    </div>
  )
}

function LessonDetailsTable() {
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
  return (
    <table className="w-full text-sm min-w-[1200px]">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          {["Class","Class subject","Class level","Credit hours","Class type","Lesson date","Lesson time","Lesson duration","Teacher"].map(h => (
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
            <td className="px-4 py-3">{r.credit}</td>
            <td className="px-4 py-3">{r.type}</td>
            <td className="px-4 py-3">{r.date}</td>
            <td className="px-4 py-3">{r.time}</td>
            <td className="px-4 py-3">{r.duration}</td>
            <td className="px-4 py-3 text-blue-600">{r.teacher}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function LessonGradesTable() {
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
  return (
    <table className="w-full text-sm min-w-[1200px]">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          {["Class","Subject","Level","Teacher","Student","Lesson Date","Lesson Time","Grade"].map(h => (
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
            <td className="px-4 py-3 text-blue-600">{r.teacher}</td>
            <td className="px-4 py-3">{r.student}</td>
            <td className="px-4 py-3">{r.date}</td>
            <td className="px-4 py-3">{r.time}</td>
            <td className="px-4 py-3">{r.grade}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}


