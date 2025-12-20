import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import axiosInstance from "./axiosInstance";
import Swal from "sweetalert2";

// ------------------------------------------------------------------
// 1. Type Definitions
// ------------------------------------------------------------------

type StudentFormState = {
  id: number | null;
  isActive: boolean;

  // Basic
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  idNumber: string;
  preferredPaymentMethod: string;
  discount: string;
  registrationDate: string;

  // Contact
  email: string;
  mobilePhone: string;
  homePhone: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
  timeZone: string;

  // Identity
  nationality: string;
  passportNumber: string;
  passportExpiryDate: string;
  gnibExpiryDate: string;

  // Course
  courseTitle: string;
  courseCode: string;
  courseLevel: string;
  modeOfStudy: string;
  department: string;
  courseStartDate: string;
  courseEndDate: string;
  finishedCourseDate: string;
  numberOfWeeks: string;
  hoursPerWeek: string;
  tuitionFees: string;
  attendance: string;
  
  // Payment / Exam Extras
  externalExam: string;
  externalExamDate: string;
  scoreExternalExam: string;
  dateOfPayment: string;
  duration: string;
  schedule: string;
  ilepReference: string;
  endOfExamPaid: string;

  // Notes
  generalNotes: string;
  medicalNotes: string;

  // Class Options
  classSubject: string;
  classLevel: string;

  // Substitute
  allowSubstituteLessons: boolean;
  substituteLessonsPerMonth: string;
  substituteStartDate: string;
  substituteEndDate: string;
};

const emptyForm: StudentFormState = {
  id: null,
  isActive: true,
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  idNumber: "",
  preferredPaymentMethod: "",
  registrationDate: "",
  discount: "",
  email: "",
  mobilePhone: "",
  homePhone: "",
  streetAddress: "",
  city: "",
  zipCode: "",
  state: "",
  country: "",
  timeZone: "",
  nationality: "",
  passportNumber: "",
  passportExpiryDate: "",
  gnibExpiryDate: "",
  courseTitle: "",
  courseCode: "",
  courseLevel: "",
  modeOfStudy: "",
  department: "",
  courseStartDate: "",
  courseEndDate: "",
  finishedCourseDate: "",
  numberOfWeeks: "",
  hoursPerWeek: "",
  tuitionFees: "",
  attendance: "",
  externalExam: "",
  externalExamDate: "",
  scoreExternalExam: "",
  dateOfPayment: "",
  duration: "",
  schedule: "",
  ilepReference: "",
  endOfExamPaid: "",
  generalNotes: "",
  medicalNotes: "",
  classSubject: "",
  classLevel: "",
  allowSubstituteLessons: false,
  substituteLessonsPerMonth: "",
  substituteStartDate: "",
  substituteEndDate: "",
};

// Helper to convert "2025-10-20T00:00:00" -> "2025-10-20"
const toDateInput = (val?: string | null) => {
  if (!val) return "";
  return val.split("T")[0] ?? "";
};

// ------------------------------------------------------------------
// 2. Component
// ------------------------------------------------------------------

export default function EditStudent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<StudentFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showClassModal, setShowClassModal] = useState(false);
   const [classes, setClasses] = useState<any[]>([]);
   const [loadingClasses, setLoadingClasses] = useState(false);
   const [classPageNumber, setClassPageNumber] = useState(1);
   const [classPageSize] = useState(10);
   const [classTotalCount, setClassTotalCount] = useState(0);
   const [classSearchQuery, setClassSearchQuery] = useState("");
   const [classSearchDebounced, setClassSearchDebounced] = useState("");

   const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
   const [selectedClassName, setSelectedClassName] = useState<string | null>(null);


   useEffect(() => {
  const t = setTimeout(() => {
    setClassSearchDebounced(classSearchQuery);
    setClassPageNumber(1);
  }, 500);
  return () => clearTimeout(t);
}, [classSearchQuery]);



useEffect(() => {
  if (!showClassModal) return;

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await axiosInstance.get(
        "/Class/GetAllClassesWithPagination",
        {
          params: {
            pageNumber: classPageNumber,
            pageSize: classPageSize,
            search: classSearchDebounced?.trim() || undefined,
          },
        }
      );

      console.log("Classes API:", res.data);

      if (res.data?.IsSuccess) {
        setClasses(res.data.Data?.Data || []);
        setClassTotalCount(res.data.Data?.TotalCount || 0);
      } else {
        setClasses([]);
      }
    } catch (e) {
      console.error(e);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  fetchClasses();
}, [showClassModal, classPageNumber, classSearchDebounced]);

  // --- LOAD STUDENT BY ID ---
  useEffect(() => {
  const fetchStudent = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/Student/GetById/${id}`);
      const data = res.data?.Data;

      if (!data) {
        alert("Student not found");
        navigate("/people");
        return;
      }

      setForm({
        id: data.Id ?? Number(id),
        isActive: data.IsActive ?? true,
        firstName: data.FirstName ?? "",
        lastName: data.Surname ?? data.LastName ?? "",
        gender: data.Gender ?? "",
        dateOfBirth: toDateInput(data.DateOfBirth),
        registrationDate: toDateInput(data.RegistrationDate),
        idNumber: data.IdNumber ?? "",
        preferredPaymentMethod: data.PreferredPaymentMethod ?? "",
        discount: data.Discount?.toString() ?? "",
        email: data.Email ?? "",
        mobilePhone: data.MobilePhone ?? "",
        homePhone: data.HomePhone ?? "",
        streetAddress: data.StreetAddress ?? "",
        city: data.City ?? "",
        zipCode: data.ZipCode ?? "",
        state: data.State ?? "",
        country: data.Country ?? "",
        timeZone: data.TimeZone ?? "",
        nationality: data.Nationality ?? "",
        passportNumber: data.PassportNumber ?? "",
        passportExpiryDate: toDateInput(data.PassportExpiryDate),
        gnibExpiryDate: toDateInput(data.GnibExpiryDate),
        courseTitle: data.CourseTitle ?? "",
        courseCode: data.CourseCode ?? "",
        courseLevel: data.CourseLevel ?? "",
        modeOfStudy: data.ModeOfStudy ?? "",
        department: data.Department ?? "",
        courseStartDate: toDateInput(data.CourseStartDate),
        courseEndDate: toDateInput(data.CourseEndDate),
        finishedCourseDate: toDateInput(data.FinishedCourseDate),
        attendance: data.Attendance ?? "",
        numberOfWeeks: data.NumberOfWeeks?.toString() ?? "",
        hoursPerWeek: data.HoursPerWeek?.toString() ?? "",
        tuitionFees: data.TuitionFees?.toString() ?? "",
        externalExam: data.ExternalExam ?? "",
        externalExamDate: toDateInput(data.ExternalExamDate),
        scoreExternalExam: data.ScoreExternalExam ?? "",
        dateOfPayment: toDateInput(data.DateOfPayment),
        duration: data.Duration ?? "",
        schedule: data.Schedule ?? "",
        ilepReference: data.IlepReference ?? "",
        endOfExamPaid: data.EndOfExamPaid ?? "",
        generalNotes: data.GeneralNotes ?? "",
        medicalNotes: data.MedicalNotes ?? "",
        classSubject: data.ClassSubject ?? "",
        classLevel: data.ClassLevel ?? "",
        allowSubstituteLessons: data.AllowSubstituteLessons ?? false,
        substituteLessonsPerMonth: data.SubstituteLessonsPerMonth?.toString() ?? "",
        substituteStartDate: toDateInput(data.SubstituteStartDate),
        substituteEndDate: toDateInput(data.SubstituteEndDate),
      });

      // ✅ ADD THIS PART
      setSelectedClassId(data.ClassId ?? null);
      setSelectedClassName(data.ClassTitle ?? null);

    } catch (err) {
      console.error("Failed to fetch student", err);
      alert("Failed to load student");
      navigate("/people");
    } finally {
      setLoading(false);
    }
  };

  fetchStudent();
}, [id, navigate]);


  // --- Handlers ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id) {
      alert("Missing student Id");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        Id: form.id,
        IsActive: Boolean(form.isActive),
        IsDeleted: false,
        FirstName: form.firstName,
        Surname: form.lastName,
        Gender: form.gender,
        DateOfBirth: form.dateOfBirth || null,
        RegistrationDate: form.registrationDate || null,
        IdNumber: form.idNumber || null,
        PreferredPaymentMethod: form.preferredPaymentMethod || null,
        Discount: form.discount ? parseFloat(form.discount) : null,
        Email: form.email || null,
        MobilePhone: form.mobilePhone || null,
        HomePhone: form.homePhone || null,
        StreetAddress: form.streetAddress || null,
        City: form.city || null,
        ZipCode: form.zipCode || null,
        State: form.state || null,
        Country: form.country || null,
        TimeZone: form.timeZone || null,
        Nationality: form.nationality || null,
        PassportNumber: form.passportNumber || null,
        PassportExpiryDate: form.passportExpiryDate || null,
        GnibExpiryDate: form.gnibExpiryDate || null,
        CourseTitle: form.courseTitle || null,
        CourseCode: form.courseCode || null,
        CourseLevel: form.courseLevel || null,
        ModeOfStudy: form.modeOfStudy || null,
        Department: form.department || null,
        CourseStartDate: form.courseStartDate || null,
        CourseEndDate: form.courseEndDate || null,
        FinishedCourseDate: form.finishedCourseDate || null,
        Attendance: form.attendance || null,
        NumberOfWeeks: form.numberOfWeeks ? parseInt(form.numberOfWeeks) : null,
        HoursPerWeek: form.hoursPerWeek ? parseFloat(form.hoursPerWeek) : null,
        TuitionFees: form.tuitionFees || null,
        ExternalExam: form.externalExam || null,
        ExternalExamDate: form.externalExamDate || null,
        ScoreExternalExam: form.scoreExternalExam || null,
        DateOfPayment: form.dateOfPayment || null,
        Duration: form.duration || null,
        Schedule: form.schedule || null,
        IlepReference: form.ilepReference || null,
        EndOfExamPaid: form.endOfExamPaid || null,
        GeneralNotes: form.generalNotes || null,
        MedicalNotes: form.medicalNotes || null,
        ClassSubject: form.classSubject || null,
        ClassLevel: form.classLevel || null,
        AllowSubstituteLessons: form.allowSubstituteLessons,
        SubstituteLessonsPerMonth: form.substituteLessonsPerMonth ? parseInt(form.substituteLessonsPerMonth) : null,
        SubstituteStartDate: form.substituteStartDate || null,
        SubstituteEndDate: form.substituteEndDate || null,
        IsEnrollment: Boolean(selectedClassId),
        ClassId: selectedClassId,
      };

      const res = await axiosInstance.post("/Student/AddStudent", payload);

      if (res.data?.IsSuccess || (typeof res.data === 'string' && res.data.includes('successfully'))) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Student updated successfully',
            timer: 1500,
            showConfirmButton: false
        });
        navigate("/people"); 
      } else {
        alert(res.data?.Message || "Failed to update student");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.Message || "Error updating student");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600 flex items-center justify-center h-64">
        Loading student data...
      </div>
    );
  }

  const studentName = `${form.firstName} ${form.lastName}`.trim() || "Student";

  // UI helper for the admin flat look
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#f2f2f2] px-4 py-2 border-t border-b text-[13px] font-semibold text-gray-800">
      {title}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto bg-white border border-gray-300 shadow-sm overflow-hidden">
        
        {/* Top dark title bar */}
        <div className="bg-[#2b2b2e] px-4 py-2 text-white text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="text-white opacity-80 hover:opacity-100">
                <ArrowLeft size={16} />
             </button>
             <span>Edit {studentName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] opacity-90">Active:</span>
            <input 
              type="checkbox" 
              name="isActive" 
              checked={form.isActive} 
              onChange={handleChange} 
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-0 space-y-0">
          
          {/* 1. BASIC INFORMATION */}
          <SectionHeader title="Personal Details" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]">
                     <option value="">Select</option>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                     <option value="Other">Other</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Registration Date</label>
                  <input 
                    type="date" 
                    name="registrationDate" 
                    value={form.registrationDate} 
                    readOnly 
                    className="w-full h-[34px] px-2 border border-gray-300 bg-gray-100 text-gray-500 text-[13px] cursor-not-allowed" 
                  />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">ID Number</label>
                  <input name="idNumber" value={form.idNumber} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Payment Method</label>
                  <select name="preferredPaymentMethod" value={form.preferredPaymentMethod} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]">
                     <option value="">Select</option>
                     <option value="cash">Cash</option>
                     <option value="card">Card</option>
                     <option value="bank">Bank Transfer</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Discount (%)</label>
                  <input type="number" name="discount" value={form.discount} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
            </div>
          </div>

          {/* 2. CONTACT DETAILS */}
          <SectionHeader title="Contact Details" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Mobile Phone</label>
                  <input name="mobilePhone" value={form.mobilePhone} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Home Phone</label>
                  <input name="homePhone" value={form.homePhone} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div className="md:col-span-1"></div> {/* Spacer */}

               <div className="md:col-span-2">
                  <label className="block text-[13px] text-gray-700 mb-1">Street Address</label>
                  <input name="streetAddress" value={form.streetAddress} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">City</label>
                  <input name="city" value={form.city} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Postcode</label>
                  <input name="zipCode" value={form.zipCode} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">State / Province</label>
                  <input name="state" value={form.state} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Country</label>
                  <input name="country" value={form.country} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Time Zone</label>
                  <input name="timeZone" value={form.timeZone} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
            </div>
          </div>

          {/* 3. IDENTITY */}
          <SectionHeader title="Identity Information" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Nationality</label>
                  <input name="nationality" value={form.nationality} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Passport Number</label>
                  <input name="passportNumber" value={form.passportNumber} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Passport Expiry</label>
                  <input type="date" name="passportExpiryDate" value={form.passportExpiryDate} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">GNIB Expiry</label>
                  <input type="date" name="gnibExpiryDate" value={form.gnibExpiryDate} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
            </div>
          </div>

          {/* 4. COURSE & PAYMENT */}
          <SectionHeader title="Course & Payment Details" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="md:col-span-2">
                  <label className="block text-[13px] text-gray-700 mb-1">Course Title</label>
                  <input name="courseTitle" value={form.courseTitle} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Course Code</label>
                  <input name="courseCode" value={form.courseCode} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Department</label>
                  <input name="department" value={form.department} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Start Date</label>
                  <input type="date" name="courseStartDate" value={form.courseStartDate} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">End Date</label>
                  <input type="date" name="courseEndDate" value={form.courseEndDate} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Finished Date</label>
                  <input type="date" name="finishedCourseDate" value={form.finishedCourseDate} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Level</label>
                  <input name="courseLevel" value={form.courseLevel} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Mode of Study</label>
                  <input name="modeOfStudy" value={form.modeOfStudy} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Weeks</label>
                  <input type="number" name="numberOfWeeks" value={form.numberOfWeeks} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Hours/Week</label>
                  <input type="number" name="hoursPerWeek" value={form.hoursPerWeek} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Tuition Fees</label>
                  <input type="text" name="tuitionFees" value={form.tuitionFees} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">External Exam</label>
                  <input name="externalExam" value={form.externalExam} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Exam Date</label>
                  <input type="date" name="externalExamDate" value={form.externalExamDate} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Exam Score</label>
                  <input name="scoreExternalExam" value={form.scoreExternalExam} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Date of Payment</label>
                  <input type="date" name="dateOfPayment" value={form.dateOfPayment} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">ILEP Ref</label>
                  <input name="ilepReference" value={form.ilepReference} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Schedule</label>
                  <input name="schedule" value={form.schedule} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Attendance</label>
                  <input name="attendance" value={form.attendance} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]" />
               </div>
            </div>
          </div>

          {/* 5. NOTES */}
          <SectionHeader title="Notes" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">General Notes</label>
                  <textarea name="generalNotes" value={form.generalNotes} onChange={handleChange} className="w-full h-32 px-2 py-2 border border-gray-300 bg-white text-[13px] resize-none" />
               </div>
               <div>
                  <label className="block text-[13px] text-gray-700 mb-1">Medical Notes</label>
                  <textarea name="medicalNotes" value={form.medicalNotes} onChange={handleChange} className="w-full h-32 px-2 py-2 border border-gray-300 bg-white text-[13px] resize-none" />
               </div>
            </div>
          </div>

          {/* 6. CLASS ENROLLMENT LIMITS */}
          {/* 6. CLASS ENROLLMENT LIMITS */}
<SectionHeader title="Class Enrollment Limits" />
<div className="p-4">
  <p className="text-[12px] text-gray-500 mb-3">Only fill this if you want to restrict the student to specific subjects/levels.</p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
         <label className="block text-[13px] text-gray-700 mb-1">Class Subject</label>
         <select name="classSubject" value={form.classSubject} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]">
            <option value="">Select</option>
            {/* Added the missing option from your API */}
            <option value="General English With Exam Preparation">General English With Exam Preparation</option>
            <option value="General English">General English</option>
            <option value="Business English">Business English</option>
         </select>
      </div>
      <div>
         <label className="block text-[13px] text-gray-700 mb-1">Class Level</label>
         <select name="classLevel" value={form.classLevel} onChange={handleChange} className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]">
            <option value="">Select</option>
                                    <option value="200525">200525</option>
                                    <option value="a1">a1</option>
                                    <option value="A1">A1</option>
                                    <option value="A1 20 25">A1 20 25</option>
                                    <option value="A1 am">A1 am</option>
                                    <option value="A1(2)">A1(2)</option>
                                    <option value="A1(2) am">A1(2) am</option>
                                    <option value="A1(2) pm">A1(2) pm</option>
                                    <option value="A1(3) pm">A1(3) pm</option>
                                    <option value="a2">a2</option>
                                    <option value="A2">A2</option>
                                    <option value="A2 am">A2 am</option>
                                    <option value="A2 pm">A2 pm</option>
                                    <option value="A2(2) pm">A2(2) pm</option>
                                    <option value="am">am</option>
                                    <option value="B1">B1</option>
                                    <option value="B1 am">B1 am</option>
                                    <option value="B1 new am">B1 new am</option>
                                    <option value="B1 pm">B1 pm</option>
                                    <option value="B2">B2</option>
                                    <option value="b2">b2</option>
                                    <option value="B2 new am">B2 new am</option>
                                    <option value="B2(2) pm">B2(2) pm</option>
                                    <option value="C1">C1</option>
                                    <option value="C1 am">C1 am</option>
                                    <option value="C1 pm">C1 pm</option>
                                    <option value="C1(2) pm">C1(2) pm</option>
                                    <option value="p2">p2</option>
                                    <option value="pm">pm</option>
         </select>
      </div>
  </div>
</div>


          <SectionHeader title="Enroll in classes" />
<div className="p-4">
  <p className="text-[13px] text-gray-600 mb-3">
    Enroll the student in a class
  </p>

  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => setShowClassModal(true)}
      className="h-[34px] px-3 border border-gray-300 bg-white text-[13px]"
    >
      {selectedClassName || "Select class"}
    </button>

    {selectedClassId && (
      <button
        type="button"
        onClick={() => {
          setSelectedClassId(null);
          setSelectedClassName(null);
        }}
        className="h-[34px] px-3 border border-red-200 text-red-700 bg-white text-[13px]"
      >
        Clear
      </button>
    )}
  </div>
</div>


{showClassModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
       onClick={() => setShowClassModal(false)}>

    <div className="bg-white w-full max-w-4xl border border-gray-300"
         onClick={(e) => e.stopPropagation()}>

      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-[16px] font-semibold">Select Class</h2>
        <button onClick={() => setShowClassModal(false)}>×</button>
      </div>

      <div className="p-4 max-h-[60vh] overflow-y-auto">
        {/* Search */}
        <div className="mb-4 relative">
          <input
            value={classSearchQuery}
            onChange={(e) => setClassSearchQuery(e.target.value)}
            placeholder="Search classes..."
            className="w-full h-[34px] px-3 border border-gray-300 text-[13px]"
          />
        </div>

        {/* List */}
        {loadingClasses ? (
          <div className="py-12 text-center">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No classes found</div>
        ) : (
          <div className="space-y-2">
            {classes.map((cls: any) => (
              <div
                key={cls.ClassId || cls.Id}

                onClick={() => {
                  setSelectedClassId(cls.ClassId || cls.Id);
                  setSelectedClassName(cls.ClassTitle || "Unnamed Class");
                  setShowClassModal(false);
                }}
                className={`p-3 border cursor-pointer ${
                  selectedClassId === cls.ClassId
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-[14px]">
                  {cls.ClassTitle}
                </div>
                <div className="text-[13px] text-gray-600">
                  {cls.ClassSubject} {cls.ClassLevel && `- ${cls.ClassLevel}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}


          {/* 7. SUBSTITUTE LESSONS */}
          {/* <SectionHeader title="Substitute Lessons" />
          <div className="p-4">
             <div className="flex items-center gap-2 mb-3">
                 <input 
                   type="checkbox" 
                   name="allowSubstituteLessons" 
                   checked={form.allowSubstituteLessons} 
                   onChange={handleChange} 
                   className="h-4 w-4 rounded border-gray-300"
                 />
                 <span className="text-[13px] font-medium text-gray-700">Allow Substitute Lessons</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-[13px] text-gray-700 mb-1">Lessons per Month</label>
                    <input 
                        type="number" 
                        name="substituteLessonsPerMonth" 
                        value={form.substituteLessonsPerMonth} 
                        onChange={handleChange} 
                        disabled={!form.allowSubstituteLessons}
                        className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px] disabled:bg-gray-100 disabled:text-gray-400" 
                    />
                 </div>
                 <div>
                    <label className="block text-[13px] text-gray-700 mb-1">Start Date</label>
                    <input 
                        type="date" 
                        name="substituteStartDate" 
                        value={form.substituteStartDate} 
                        onChange={handleChange} 
                        disabled={!form.allowSubstituteLessons}
                        className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px] disabled:bg-gray-100 disabled:text-gray-400" 
                    />
                 </div>
                 <div>
                    <label className="block text-[13px] text-gray-700 mb-1">End Date</label>
                    <input 
                        type="date" 
                        name="substituteEndDate" 
                        value={form.substituteEndDate} 
                        onChange={handleChange} 
                        disabled={!form.allowSubstituteLessons}
                        className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px] disabled:bg-gray-100 disabled:text-gray-400" 
                    />
                 </div>
             </div>
          </div> */}

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t bg-white">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-[34px] px-3 border border-gray-300 text-[13px] bg-white hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-[34px] px-3 bg-blue-600 text-white text-[13px] hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Update Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}