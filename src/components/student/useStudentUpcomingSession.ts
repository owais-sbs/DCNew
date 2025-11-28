import { useEffect, useState, useCallback } from "react"
import axiosInstance from "../axiosInstance"

type ApiResponse = {
  IsSuccess: boolean
  Data: any | null
  Message?: string
}

export type UpcomingSession = {
  id: number
  classId: number | null
  teacherId: number | null
  date: string | null
  startTime: string | null
  endTime: string | null
  dayOfWeek: string | null
  raw: any
}

export function useStudentUpcomingSession(studentId: number) {
  const [session, setSession] = useState<UpcomingSession | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get<ApiResponse>("/Student/GetNextUpcomingSession", {
        params: { studentId }
      })

      if (response.data?.IsSuccess && response.data.Data) {
        const data = response.data.Data
        setSession({
          id: data.Id,
          classId: data.ClassId,
          teacherId: data.TeacherId,
          date: data.Date || data.StartTime,
          startTime: data.StartTime,
          endTime: data.EndTime,
          dayOfWeek: data.DayOfWeek,
          raw: data
        })
      } else {
        setSession(null)
        if (response.data && response.data.Message) {
          setError(response.data.Message)
        }
      }
    } catch (err: any) {
      console.error("Failed to load upcoming session", err)
      setError(err?.message || "Unable to load upcoming session.")
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return { session, loading, error, refresh: fetchSession }
}

