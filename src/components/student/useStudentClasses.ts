import { useEffect, useState, useCallback } from "react"
import axiosInstance from "../axiosInstance"

// Get studentId from localStorage or return null
export const getStudentId = (): number | null => {
  const studentId = localStorage.getItem('studentId')
  if (studentId) {
    return parseInt(studentId)
  }
  // Fallback: try to get from userInfo
  try {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      return user.studentId || null
    }
  } catch (e) {
    console.error('Error parsing userInfo:', e)
  }
  return null
}

// Keep for backward compatibility, but prefer using getStudentId()
export const STUDENT_PORTAL_ID = getStudentId() || 7

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
    if (!studentId) {
      setClasses([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get<ApiResponse>("/Class/GetClassesByStudent", {
        params: { studentId }
      })

      if (response.data?.IsSuccess && Array.isArray(response.data.Data)) {
        const mapped = response.data.Data
          .filter((cls: any) => cls.IsActive === true)
          .map((cls: any) => ({
            id: cls.ClassId ?? cls.Id,
            title: cls.ClassTitle,
            code: cls.ClassCode ?? null,
            description: cls.ClassDescription ?? null,
            startDate: cls.StartDate ?? null,
            endDate: cls.EndDate ?? null,
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

