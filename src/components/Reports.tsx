export default function Reports() {
  const rows = Array.from({ length: 12 }).map((_, i) => ({
    cls: "PM A2 WALID/DIMITRO",
    subject: "",
    level: "A2",
    type: "",
    teacher: "Walid Teacher",
    student: [
      "Rejane Costa Pereira",
      "Julio Cesar Hernandez Silvestre",
      "Reginaldo Ferreira De Oliveira",
      "Rodolfo Do Nascimento Rosas",
      "Lidiane Patricia Franca Da Silva",
    ][i % 5],
    date: "01-10-2025",
    time: "13:00-15:00",
    dur: "2hours",
    attendance: ["Present", "Absent"][i % 2],
  }))

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6 grid grid-cols-[260px_1fr] gap-6">
        {/* Left sidebar tree */}
        <aside className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit">
          <div className="font-semibold text-gray-800 mb-3">Reports</div>
          <nav className="space-y-2 text-gray-700">
            {[
              "Attendance reports",
              "Lesson reports",
              "Class reports",
              "Student reports",
              "Payment reports",
            ].map((l) => (
              <div key={l} className="flex items-center gap-2">
                <span className="rotate-90">›</span>
                <span>{l}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Right content */}
        <section>
          <div className="text-2xl font-semibold text-gray-800 mb-4">
            Student attendance report
          </div>
          <div className="text-sm text-gray-500 mb-4">7597 / 302646 Attendance records</div>

          <div className="mb-3 flex items-center gap-3">
            <input placeholder="Search..." className="w-80 h-10 px-4 rounded-xl border border-gray-200 bg-white" />
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Class: ▾</button>
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Student: ▾</button>
            <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Date: 01-10-2025 - 31-10-2025</button>
            <div className="ml-auto flex items-center gap-2">
              <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">⟳</button>
              <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">▦</button>
              <button className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">Export</button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
            <table className="w-full text-sm min-w-[1200px]">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {["Class","Subject","Level","Class type","Teacher","Student","Lesson Date","Lesson Time","Duration","Attendance","Excused","Personal student notes"].map(h => (
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
                    <td className="px-4 py-3">{r.attendance}</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}



