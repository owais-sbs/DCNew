export default function NotesEvents() {
  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          {["Dashboard","Classes","Events"].map((t,i)=> (
            <button key={t} className={`px-4 h-10 rounded-xl text-sm ${i===2?"bg-white shadow-sm border border-blue-200 text-blue-700":"text-gray-700 hover:bg-gray-50"}`}>{t}</button>
          ))}
        </div>
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">No events</div>
      </div>
    </div>
  )
}



