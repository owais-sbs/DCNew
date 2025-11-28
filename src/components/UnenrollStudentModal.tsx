import { useState } from "react";
import axiosInstance from "./axiosInstance";

export default function UnenrollStudentModal({
  student,
  classId,
  onClose,
  onSuccess
}: {
  student: any;
  classId: number;
  onClose: () => void;
  onSuccess: () => void;
})  {
  const [option, setOption] = useState<"lesson" | "class" | null>(null);
  const [loading, setLoading] = useState(false);

  const unenroll = async () => {
    if (!option) return;

    setLoading(true);

    try {
      if (option === "lesson") {
        // OPTION 1: Remove from this lesson and all following
        const res = await axiosInstance.post("/Class/UnenrollStudentFromClass", null, {
          params: {
            studentId: student.id,
            classId: classId
          },
        });

        console.log(res.data);
        if(res.data.IsSuccess){
            onClose()
            onSuccess()
        }
      } else {
        // OPTION 2: Remove entirely
        const res = await axiosInstance.post("/Class/UnenrollStudentFromAll", null, {
          params: {
            studentId: student.id
          },
        });

        console.log(res.data);
         if(res.data.IsSuccess){
            onClose()
            onSuccess()
        }
      }

      
    } catch (err) {
      console.log("Unenroll error:", err);
      alert("Failed to unenroll student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 grid place-items-center z-[60]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">
            Unenroll {student.name}
          </h2>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <p className="text-gray-600 mt-2">
          You can unenroll the student from a specific date or completely remove them.
        </p>

        <div className="mt-6 space-y-4">

          {/* OPTION 1 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="unenrollOption"
              checked={option === "lesson"}
              onChange={() => setOption("lesson")}
            />
            <div>
              <p className="font-medium">Remove from this lesson and all following lessons</p>
            </div>
          </label>

          {/* OPTION 2 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="unenrollOption"
              checked={option === "class"}
              onChange={() => setOption("class")}
            />
            <div>
              <p className="font-medium">Remove from this class completely</p>
              <p className="text-sm text-gray-500">
                This will erase all references to this student from this class.
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={unenroll}
            disabled={loading || !option}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? "Processing..." : "Unenroll"}
          </button>
        </div>
      </div>
    </div>
  );
}
