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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendance = useCallback(async () => {
    if (studentId === null) {
      setAttendance([])
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
      } else {
        setAttendance([])
        setError(response.data?.Message || "Failed to load attendance.")
      }
    } catch (err: any) {
      setAttendance([])
      setError(err?.message || "Unable to load attendance.")
    } finally {
      setLoading(false)
    }
  }, [studentId, classId])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  return { attendance, loading, error, refresh: fetchAttendance }
}
