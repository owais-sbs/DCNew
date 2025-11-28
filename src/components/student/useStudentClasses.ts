import { useEffect, useState, useCallback } from "react"
import axiosInstance from "../axiosInstance"

export const STUDENT_PORTAL_ID = 7

export type StudentClass = {
  id: number
  title: string
  code: string | null
  description: string | null
  startDate: string | null
  endDate: string | null
  raw: any
}

type ApiResponse = {
  IsSuccess: boolean
  Data: any[]
  Message?: string
}

export function useStudentClasses(studentId: number) {
  const [classes, setClasses] = useState<StudentClass[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get<ApiResponse>("/Student/GetStudentClasses", {
        params: { studentId }
      })

      if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
        const mapped = response.data.Data.map((cls) => ({
          id: cls.Id,
          title: cls.ClassTitle,
          code: cls.ClassCode,
          description: cls.ClassDescription,
          startDate: cls.StartDate,
          endDate: cls.EndDate,
          raw: cls
        }))
        setClasses(mapped)
      } else {
        setClasses([])
        setError(response.data?.Message || "Failed to load classes.")
      }
    } catch (err: any) {
      console.error("Failed to load student classes", err)
      setError(err?.message || "Something went wrong while loading classes.")
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  return { classes, loading, error, refresh: fetchClasses }
}

