import { useCallback, useEffect, useState } from "react"
import axiosInstance from "../axiosInstance"

export type StudentAttendance = {
  attendanceId: number
  studentId: number
  classId: number | null
  classTitle: string | null
  date: string | null
  dayOfWeek: string | null
  startTime: string | null
  endTime: string | null
  status: string | null
}

type ApiResponse = {
  IsSuccess: boolean
  Data: any[] | null
  Message?: string
}

export function useStudentAttendance(studentId: number | null, classId?: number) {
  const [attendance, setAttendance] = useState<StudentAttendance[]>([])
  const [percentage, setPercentage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendance = useCallback(async () => {
    if (studentId === null) {
      setAttendance([])
      setPercentage(0)
      setError("This student account is not linked to a student profile.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get<ApiResponse>("/Student/GetAttendance", {
        params: { studentId, ...(classId === undefined ? {} : { classId }) }
      })

      if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
        setAttendance(response.data.Data.map((item) => ({
          attendanceId: item.AttendanceId,
          studentId: item.StudentId,
          classId: item.ClassId,
          classTitle: item.ClassTitle,
          date: item.Date,
          dayOfWeek: item.DayOfWeek,
          startTime: item.StartTime,
          endTime: item.EndTime,
          status: item.AttendanceStatus
        })))
        if (classId === undefined) {
          const summary = await axiosInstance.get<ApiResponse>("/Dashboard/GetStudentAttendanceStats", { params: { studentId } })
          const overall = Array.isArray(summary.data?.Data) ? summary.data.Data[0] : null
          setPercentage(summary.data?.IsSuccess ? Number(overall?.OverallPercentage) || 0 : 0)
        } else {
          const relevant = response.data.Data as any[]
          const eligible = relevant.filter((item) => ["Present", "Late", "Absent"].includes(item.AttendanceStatus))
          const attended = eligible.filter((item) => ["Present", "Late"].includes(item.AttendanceStatus)).length
          setPercentage(eligible.length ? Math.round(attended / eligible.length * 100) : 0)
        }
      } else {
        setAttendance([])
        setPercentage(0)
        setError(response.data?.Message || "Failed to load attendance.")
      }
    } catch (err: any) {
      setAttendance([])
      setPercentage(0)
      setError(err?.message || "Unable to load attendance.")
    } finally {
      setLoading(false)
    }
  }, [studentId, classId])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  return { attendance, percentage, loading, error, refresh: fetchAttendance }
}
