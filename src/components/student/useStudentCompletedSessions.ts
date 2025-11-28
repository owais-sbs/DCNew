import { useEffect, useState, useCallback } from "react"
import axiosInstance from "../axiosInstance"

type ApiResponse = {
  IsSuccess: boolean
  Data: any[] | null
  Message?: string
}

export type CompletedSession = {
  id: number
  classId: number | null
  teacherId: number | null
  date: string | null
  startTime: string | null
  endTime: string | null
  dayOfWeek: string | null
  raw: any
}

export function useStudentCompletedSessions(studentId: number) {
  const [sessions, setSessions] = useState<CompletedSession[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get<ApiResponse>("/Student/GetCompletedSessions", {
        params: { studentId }
      })

      if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
        const mapped = response.data.Data.map((item) => ({
          id: item.Id,
          classId: item.ClassId,
          teacherId: item.TeacherId,
          date: item.Date || item.StartTime,
          startTime: item.StartTime,
          endTime: item.EndTime,
          dayOfWeek: item.DayOfWeek,
          raw: item
        }))
        setSessions(mapped)
      } else {
        setSessions([])
        if (response.data?.Message) {
          setError(response.data.Message)
        }
      }
    } catch (err: any) {
      console.error("Failed to load completed sessions", err)
      setError(err?.message || "Unable to load completed sessions.")
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return { sessions, loading, error, refresh: fetchSessions }
}

