export default function NotesClasses() {
  const rows = Array.from({ length: 8 }).map((_, i) => ({
    title: `Advanced_AM_DCE1_PART ${i+1}`,
    status: "Active",
    teacher: i % 2 ? "2 Teachers" : "Colm Delmar1",
    classroom: ["Limerick","Galway","Cork"][i%3],
    starts: "02-01-2025",
    ends: "31-05-2027",
    recurring: "Mon, Wed",
    dayTime: "09:00 - 11:00",
    payFrequency: "Monthly",
    fees: "€120"
  }))
  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          {["Dashboard","Classes","Events"].map((t,i)=> (
            <button key={t} className={`px-4 h-10 rounded-xl text-sm ${i===1?"bg-white shadow-sm border border-blue-200 text-blue-700":"text-gray-700 hover:bg-gray-50"}`}>{t}</button>
          ))}
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-auto">
          <table className="w-full text-sm min-w-[1200px]">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {[
                  "Title","Status","Teacher","Classroom","Starts","Ends","Recurring","Day/Time","Payment frequency","Payment fees"
                ].map(h=> (<th key={h} className="text-left px-4 py-3 border-b border-gray-200 font-medium">{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r,idx)=> (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-indigo-700 underline">{r.title}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{r.status}</span></td>
                  <td className="px-4 py-3 text-blue-600">{r.teacher}</td>
                  <td className="px-4 py-3">{r.classroom}</td>
                  <td className="px-4 py-3">{r.starts}</td>
                  <td className="px-4 py-3">{r.ends}</td>
                  <td className="px-4 py-3">{r.recurring}</td>
                  <td className="px-4 py-3">{r.dayTime}</td>
                  <td className="px-4 py-3">{r.payFrequency}</td>
                  <td className="px-4 py-3">{r.fees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}



