import axiosInstance from "./axiosInstance"
import { useState, useEffect, useRef, useCallback } from "react"
import Swal from "sweetalert2"
import { Loader2, Paperclip, ChevronDown, UserX, X } from "lucide-react"

type Student = {
  StudentId: number
  FullName: string
  IdNumber: string | null
}

type Template = {
  Id: number
  Title: string
}

export default function SendEmail() {
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [template, setTemplate] = useState<Template[]>([])
  const [formData, setFormData] = useState<{
    StudentIds: number[]
    EmailTemplateId: number
    CustomMessage: string
  }>({
    StudentIds: [],
    EmailTemplateId: 0,
    CustomMessage: "",
  })
  const [directEmails, setDirectEmails] = useState("")
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [source, setSource] = useState<"template" | "custom">("template")
  const [sending, setSending] = useState(false)

  // Filters (same as reporting/export)
  const [filterSearch, setFilterSearch] = useState("")
  const [courseStartFrom, setCourseStartFrom] = useState("")
  const [courseStartTo, setCourseStartTo] = useState("")
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([])
  const [filterClassSearch, setFilterClassSearch] = useState("")
  const [filterClassSearchDebounced, setFilterClassSearchDebounced] = useState("")
  const [filterClassId, setFilterClassId] = useState<number | "">("")
  const [filterClassName, setFilterClassName] = useState("")
  const [onlyUnenrolled, setOnlyUnenrolled] = useState(false)
  const [attendanceFrom, setAttendanceFrom] = useState<number | "">("")
  const [attendanceTo, setAttendanceTo] = useState<number | "">("")
  const [filterPage, setFilterPage] = useState(1)
  const [filterPageSize, setFilterPageSize] = useState(5000)
  const [nationalitiesList, setNationalitiesList] = useState<string[]>([])
  const [loadingNationalities, setLoadingNationalities] = useState(false)
  const [nationalityDropdownOpen, setNationalityDropdownOpen] = useState(false)
  const [classesList, setClassesList] = useState<{ ClassId: number; ClassTitle: string }[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [classDropdownOpen, setClassDropdownOpen] = useState(false)
  const classDropdownRef = useRef<HTMLDivElement>(null)
  const nationalityDropdownRef = useRef<HTMLDivElement>(null)
  const [selectedPanelSearch, setSelectedPanelSearch] = useState("")

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true)
    try {
      const payload: Record<string, unknown> = { Mode: "email", Page: filterPage, PageSize: filterPageSize }
      if (filterSearch.trim()) payload.Search = filterSearch.trim()
      if (courseStartFrom) payload.CourseStartFrom = new Date(courseStartFrom).toISOString()
      if (courseStartTo) payload.CourseStartTo = new Date(courseStartTo).toISOString()
      const validNats = selectedNationalities.filter((n) => n && String(n).trim())
      if (validNats.length > 0) payload.Nationalities = validNats
      if (filterClassId !== "" && filterClassId !== 0) payload.ClassId = filterClassId
      if (onlyUnenrolled) payload.OnlyUnenrolled = true
      if (attendanceFrom !== "") payload.AttendanceFrom = Number(attendanceFrom)
      if (attendanceTo !== "") payload.AttendanceTo = Number(attendanceTo)

      const response = await axiosInstance.post("/Student/FilterStudents", payload)
      const data = response.data?.Data
      const list = Array.isArray(data) ? data : []
      setStudents(
        list.map((s: { StudentId?: number; FullName?: string; IdNumber?: string | null }) => ({
          StudentId: s.StudentId ?? 0,
          FullName: s.FullName ?? "",
          IdNumber: s.IdNumber ?? null,
        }))
      )
    } catch (err) {
      console.error("Error fetching students", err)
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }, [filterSearch, courseStartFrom, courseStartTo, selectedNationalities, filterClassId, onlyUnenrolled, attendanceFrom, attendanceTo, filterPage, filterPageSize])

  const fetchTemplates = async () => {
    try {
      const response = await axiosInstance.get("/EmailTemplate/GetAllEmailTemplates")
      setTemplate(response.data?.Data ?? [])
    } catch (err) {
      console.error("Error fetching templates", err)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Nationalities for filter
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoadingNationalities(true)
      try {
        const res = await axiosInstance.get("/Student/GetAllDistinctNationalities", { signal: controller.signal })
        const data = res.data?.Data ?? res.data?.data
        const raw = Array.isArray(data) ? data : (data?.Items ?? data?.Data ?? [])
        const list = Array.isArray(raw) ? raw : []
        const mapped = list.map((n: unknown) =>
          typeof n === "string" ? n : (n && typeof n === "object" ? String((n as Record<string, unknown>).Name ?? (n as Record<string, unknown>).Value ?? (n as Record<string, unknown>).Nationality ?? "") : "")
        )
        setNationalitiesList([...new Set(mapped.filter(Boolean))].sort())
      } catch (e) {
        if (!controller.signal.aborted) console.error("Failed to fetch nationalities", e)
        setNationalitiesList([])
      } finally {
        if (!controller.signal.aborted) setLoadingNationalities(false)
      }
    }
    load()
    return () => controller.abort()
  }, [])

  // Debounce class search
  useEffect(() => {
    const t = setTimeout(() => setFilterClassSearchDebounced(filterClassSearch.trim()), 400)
    return () => clearTimeout(t)
  }, [filterClassSearch])

  // Fetch classes for filter
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoadingClasses(true)
      try {
        const res = await axiosInstance.get("/Class/GetAllClassesWithPagination", {
          params: { pageNumber: 1, pageSize: 50, search: filterClassSearchDebounced || undefined },
          signal: controller.signal,
        })
        const data = res.data?.Data?.Data ?? res.data?.Data ?? []
        setClassesList(
          Array.isArray(data) ? data.map((c: { ClassId?: number; Id?: number; ClassTitle?: string; Title?: string }) => ({ ClassId: c.ClassId ?? c.Id ?? 0, ClassTitle: c.ClassTitle ?? c.Title ?? "" })) : []
        )
      } catch (e) {
        if (!controller.signal.aborted) console.error("Failed to fetch classes", e)
        setClassesList([])
      } finally {
        if (!controller.signal.aborted) setLoadingClasses(false)
      }
    }
    load()
    return () => controller.abort()
  }, [filterClassSearchDebounced])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target as Node)) setClassDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [classDropdownOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nationalityDropdownRef.current && !nationalityDropdownRef.current.contains(e.target as Node)) setNationalityDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [nationalityDropdownOpen])

  const toggleStudent = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      StudentIds: prev.StudentIds.includes(id)
        ? prev.StudentIds.filter((sid) => sid !== id)
        : [...prev.StudentIds, id],
    }))
  }

  const selectAllStudents = () => {
    setFormData((prev) => ({
      ...prev,
      StudentIds: students.map((s) => s.StudentId),
    }))
  }

  const clearSelectedStudents = () => {
    setFormData((prev) => ({ ...prev, StudentIds: [] }))
  }

  // Resolve selected ids to student details (from current filter list; fallback label if not in list)
  const selectedStudentsList: Student[] = formData.StudentIds.map((id) =>
    students.find((s) => s.StudentId === id) ?? { StudentId: id, FullName: `Student #${id}`, IdNumber: null }
  )
  const selectedPanelSearchLower = selectedPanelSearch.trim().toLowerCase()
  const selectedStudentsFiltered =
    selectedPanelSearchLower === ""
      ? selectedStudentsList
      : selectedStudentsList.filter(
          (s) =>
            (s.FullName ?? "").toLowerCase().includes(selectedPanelSearchLower) ||
            (s.IdNumber ?? "").toLowerCase().includes(selectedPanelSearchLower)
        )

  const parseDirectEmails = (text: string): string[] => {
    return text
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
  }

  const handleSave = async () => {
    const useDirectEmails = directEmails.trim().length > 0
    const emails = useDirectEmails ? parseDirectEmails(directEmails) : []
    const isCustom = source === "custom" || formData.EmailTemplateId == null || formData.EmailTemplateId === 0

    if (useDirectEmails) {
      if (emails.length === 0) {
        Swal.fire({ icon: "warning", title: "Invalid emails", text: "Enter at least one valid email address." })
        return
      }
    } else {
      if (formData.StudentIds.length === 0) {
        Swal.fire({ icon: "warning", title: "No recipients", text: "Select at least one student from the filtered results." })
        return
      }
    }

    if (!isCustom && (formData.EmailTemplateId == null || formData.EmailTemplateId === 0)) {
      Swal.fire({ icon: "warning", title: "Template required", text: "Select an email template." })
      return
    }
    if (isCustom && !formData.CustomMessage?.trim()) {
      Swal.fire({ icon: "warning", title: "Message required", text: "Enter a custom message." })
      return
    }

    setSending(true)
    try {
      const fd = new FormData()
      if (useDirectEmails) {
        emails.forEach((e) => fd.append("Emails", e))
      } else {
        formData.StudentIds.forEach((id) => fd.append("StudentIds", String(id)))
      }
      fd.append("EmailTemplateId", String(isCustom ? 0 : formData.EmailTemplateId))
      fd.append("CustomMessage", isCustom ? (formData.CustomMessage ?? "") : "")

      if (attachmentFile) {
        fd.append("FileDetails", attachmentFile)
        fd.append("FileType", attachmentFile.name.split(".").pop() ?? "bin")
        fd.append("FolderName", "email-attachments")
      }

      const response = await axiosInstance.post("/Email/SendEmailToStudents", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      Swal.fire({
        icon: "success",
        title: "Email Sent",
        text: `Successfully sent to ${response.data?.SentCount ?? emails.length ?? 0} recipient(s)`,
        confirmButtonColor: "#10b981",
      })

      setFormData({
        StudentIds: [],
        EmailTemplateId: 0,
        CustomMessage: "",
      })
      setDirectEmails("")
      setAttachmentFile(null)
      setSource("template")
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: string } }).response?.data
          : "Something went wrong while sending email"
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: typeof msg === "string" ? msg : "Something went wrong while sending email",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex gap-6 w-full">
      {/* Left: form */}
      <div className="flex-1 min-w-0 bg-white rounded-xl p-6">
        <h2 className="text-lg font-medium mb-4">Send Email</h2>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Source</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="source"
              checked={source === "template"}
              onChange={() => {
                setSource("template")
                setFormData((prev) => ({ ...prev, CustomMessage: "" }))
              }}
            />
            Template
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="source"
              checked={source === "custom"}
              onChange={() => {
                setSource("custom")
                setFormData((prev) => ({ ...prev, EmailTemplateId: 0 }))
              }}
            />
            Custom message
          </label>
        </div>
      </div>

      {source === "template" && (
        <div className="mb-4">
          <label className="block mb-2">Select Template</label>
          <select
            value={formData.EmailTemplateId}
            onChange={(e) => handleInputChange("EmailTemplateId", Number(e.target.value))}
            className="w-full border rounded-md p-2"
          >
            <option value={0}>Select</option>
            {template.map((temp) => (
              <option key={temp.Id} value={temp.Id}>
                {temp.Title}
              </option>
            ))}
          </select>
        </div>
      )}

      {source === "custom" && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Custom Message</label>
          <textarea
            rows={6}
            value={formData.CustomMessage}
            onChange={(e) => handleInputChange("CustomMessage", e.target.value)}
            placeholder="Write your custom message here..."
            className="w-full border rounded-md p-3 resize-none"
          />
        </div>
      )}

      {/* Direct emails */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Or send to these emails (comma or newline separated)</label>
        <textarea
          rows={2}
          value={directEmails}
          onChange={(e) => setDirectEmails(e.target.value)}
          placeholder="e.g. a@example.com, b@example.com"
          className="w-full border rounded-md p-3 resize-none text-sm"
        />
      </div>

      {!directEmails.trim() && (
        <>
          {/* Filters (same as reporting/export) */}
          <div className="mb-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Filter students</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Name, ID…"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {loadingStudents ? "Searching…" : `Results: ${students.length}`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course start from</label>
                <input
                  type="date"
                  value={courseStartFrom}
                  onChange={(e) => setCourseStartFrom(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course start to</label>
                <input
                  type="date"
                  value={courseStartTo}
                  onChange={(e) => setCourseStartTo(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="relative" ref={nationalityDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <button
                type="button"
                onClick={() => setNationalityDropdownOpen((o) => !o)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <span className="truncate text-gray-700">{selectedNationalities.length === 0 ? "All nationalities" : `${selectedNationalities.length} selected`}</span>
                <ChevronDown size={16} className="text-gray-400 flex-shrink-0 ml-2" />
              </button>
              {nationalityDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                  {loadingNationalities ? (
                    <div className="px-3 py-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Loading…
                    </div>
                  ) : nationalitiesList.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">No nationalities found</div>
                  ) : (
                    nationalitiesList.map((nat) => (
                      <label key={nat} className="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedNationalities.includes(nat)}
                          onChange={(e) =>
                            setSelectedNationalities((prev) => (e.target.checked ? [...prev, nat] : prev.filter((n) => n !== nat)))
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-800">{nat}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="relative" ref={classDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <input
                type="text"
                value={filterClassId !== "" && filterClassName ? filterClassName : filterClassSearch}
                onChange={(e) => {
                  setFilterClassSearch(e.target.value)
                  setClassDropdownOpen(true)
                  if (filterClassId !== "") {
                    setFilterClassId("")
                    setFilterClassName("")
                  }
                }}
                onFocus={() => setClassDropdownOpen(true)}
                placeholder="Search classes…"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {filterClassId !== "" && filterClassName && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterClassId("")
                    setFilterClassName("")
                    setFilterClassSearch("")
                    setClassDropdownOpen(true)
                  }}
                  className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                  aria-label="Clear class"
                >
                  ×
                </button>
              )}
              {classDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                  {loadingClasses ? (
                    <div className="px-3 py-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Loading…
                    </div>
                  ) : classesList.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">{filterClassSearchDebounced ? "No classes found" : "Type to search classes"}</div>
                  ) : (
                    classesList.map((c) => (
                      <button
                        key={c.ClassId}
                        type="button"
                        onClick={() => {
                          setFilterClassId(c.ClassId)
                          setFilterClassName(c.ClassTitle)
                          setFilterClassSearch("")
                          setClassDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-indigo-50/80"
                      >
                        {c.ClassTitle}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={onlyUnenrolled}
                onChange={(e) => setOnlyUnenrolled(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Only unenrolled students</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance % from</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={attendanceFrom === "" ? "" : attendanceFrom}
                  onChange={(e) => setAttendanceFrom(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance % to</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={attendanceTo === "" ? "" : attendanceTo}
                  onChange={(e) => setAttendanceTo(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="100"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                <input
                  type="number"
                  min={1}
                  value={filterPage}
                  onChange={(e) => setFilterPage(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page size</label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={filterPageSize}
                  onChange={(e) => setFilterPageSize(Math.min(10000, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Filtered results + selection (no dropdown) */}
          <div className="mb-4 rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Filtered students</p>
                <p className="text-xs text-gray-500">
                  {loadingStudents ? "Loading…" : `Showing ${students.length} student(s) · Selected ${formData.StudentIds.length}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={selectAllStudents}
                  disabled={loadingStudents || students.length === 0}
                  className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={clearSelectedStudents}
                  disabled={formData.StudentIds.length === 0}
                  className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="bg-white max-h-72 overflow-auto">
              {loadingStudents ? (
                <div className="px-4 py-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Loading students…
                </div>
              ) : students.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500 text-center">No students found for these filters.</div>
              ) : (
                students.map((student) => {
                  const selected = formData.StudentIds.includes(student.StudentId)
                  return (
                    <label
                      key={student.StudentId}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleStudent(student.StudentId)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-900">
                        {student.FullName} {student.IdNumber ? `(${student.IdNumber})` : ""}
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Attachment */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Attachment (optional)</label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="email-attachment"
            className="hidden"
            onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
          />
          <label
            htmlFor="email-attachment"
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
          >
            <Paperclip size={16} />
            {attachmentFile ? attachmentFile.name : "Choose file"}
          </label>
          {attachmentFile && (
            <button type="button" onClick={() => setAttachmentFile(null)} className="text-sm text-red-600 hover:underline">
              Remove
            </button>
          )}
        </div>
      </div>

      <button
        className="bg-emerald-500 text-white px-6 py-2 rounded-md disabled:opacity-50 flex items-center gap-2"
        onClick={handleSave}
        disabled={sending}
      >
        {sending ? <Loader2 size={18} className="animate-spin" /> : null}
        Send
      </button>
      </div>

      {/* Right: selected students (only when not using direct emails) */}
      {!directEmails.trim() && (
        <aside className="w-full max-w-md min-w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col sticky top-4">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/70">
            <h3 className="text-sm font-semibold text-gray-900">Selected students</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {formData.StudentIds.length} recipient{formData.StudentIds.length !== 1 ? "s" : ""}
            </p>
            {formData.StudentIds.length > 0 && (
              <div className="mt-2">
                <input
                  type="text"
                  value={selectedPanelSearch}
                  onChange={(e) => setSelectedPanelSearch(e.target.value)}
                  placeholder="Search in list…"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            )}
          </div>
          <div className="flex-1 overflow-auto min-h-0 max-h-[calc(100vh-12rem)]">
            {selectedStudentsList.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                <UserX size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No students selected.</p>
                <p className="mt-1 text-xs">Use filters and check the list to add recipients.</p>
              </div>
            ) : selectedStudentsFiltered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No matches for &quot;{selectedPanelSearch.trim()}&quot;
              </div>
            ) : (
              <ul className="py-2">
                {selectedStudentsFiltered.map((s) => (
                  <li
                    key={s.StudentId}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="flex-1 min-w-0 text-sm text-gray-900 truncate">
                      {s.FullName} {s.IdNumber ? `(${s.IdNumber})` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleStudent(s.StudentId)}
                      className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Remove from recipients"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {formData.StudentIds.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50/70">
              <button
                type="button"
                onClick={clearSelectedStudents}
                className="text-xs text-gray-600 hover:text-red-600"
              >
                Clear all
              </button>
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
