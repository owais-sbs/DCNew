import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Save, User, Mail, Phone, MapPin, 
  Calendar, BookOpen, DollarSign, FileText, 
  School, Clock, CheckCircle 
} from "lucide-react";
import axiosInstance from "./axiosInstance";
import Swal from "sweetalert2"; // Ensure you have sweetalert2 installed

// ------------------------------------------------------------------
// 1. Type Definitions (Expanded for Full Form)
// ------------------------------------------------------------------

type StudentFormState = {
  id: number | null;
  isActive: boolean; // Added Status

  // Basic
  firstName: string;
  lastName: string; // Maps to Surname in API
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

  // --- LOAD STUDENT BY ID ---
  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/Student/GetById/${id}`);
        const data = res.data?.Data; // Adjusted based on your snippet "res.data?.Data"

        if (!data) {
          alert("Student not found");
          navigate("/people");
          return;
        }

        // Map API Data to Full Form State
        setForm({
          id: data.Id ?? Number(id),
          isActive: data.IsActive ?? true, // Load Active Status

          firstName: data.FirstName ?? "",
          lastName: data.Surname ?? data.LastName ?? "", // Handle Surname mapping
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
    // Handle Checkboxes
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
      // Construct Payload
      const payload = {
        Id: form.id,
        IsActive: Boolean(form.isActive), // Force Boolean
        IsDeleted: false, // Force False

        FirstName: form.firstName,
        Surname: form.lastName, // Map back to API expected "Surname"
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
        TuitionFees: form.tuitionFees ? parseFloat(form.tuitionFees) : null,

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

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit {studentName}
            </h1>
            <p className="text-sm text-gray-500">Update full student record.</p>
          </div>
        </div>

        {/* Active Status Toggle */}
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <label className="inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    name="isActive"
                    className="sr-only peer" 
                    checked={form.isActive}
                    onChange={handleChange}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className={`ms-2 text-sm font-medium ${form.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                </span>
            </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. BASIC INFORMATION */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Personal Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>

                {/* ✅ REGISTRATION DATE - READ ONLY */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                    <input 
                        type="date" 
                        name="registrationDate" 
                        value={form.registrationDate} 
                        readOnly // User cannot edit
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed" // Visual cue
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                    <input name="idNumber" value={form.idNumber} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select name="preferredPaymentMethod" value={form.preferredPaymentMethod} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white">
                        <option value="">Select</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank Transfer</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                    <input type="number" name="discount" value={form.discount} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
            </div>
        </div>

        {/* 2. CONTACT DETAILS */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Mail size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Contact Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
                    <input name="mobilePhone" value={form.mobilePhone} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Home Phone</label>
                    <input name="homePhone" value={form.homePhone} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                
                {/* Full Width Address Row */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <input name="streetAddress" value={form.streetAddress} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input name="city" value={form.city} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                        <input name="zipCode" value={form.zipCode} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                        <input name="state" value={form.state} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input name="country" value={form.country} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                        <input name="timeZone" value={form.timeZone} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                    </div>
                </div>
            </div>
        </div>

        {/* 3. IDENTITY */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Identity Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <input name="nationality" value={form.nationality} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                    <input name="passportNumber" value={form.passportNumber} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry</label>
                    <input type="date" name="passportExpiryDate" value={form.passportExpiryDate} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GNIB Expiry</label>
                    <input type="date" name="gnibExpiryDate" value={form.gnibExpiryDate} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
            </div>
        </div>

        {/* 4. COURSE & PAYMENT */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Course & Payment Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                    <input name="courseTitle" value={form.courseTitle} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                    <input name="courseCode" value={form.courseCode} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input name="department" value={form.department} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" name="courseStartDate" value={form.courseStartDate} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" name="courseEndDate" value={form.courseEndDate} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Finished Date</label>
                    <input type="date" name="finishedCourseDate" value={form.finishedCourseDate} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <input name="courseLevel" value={form.courseLevel} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Study</label>
                    <input name="modeOfStudy" value={form.modeOfStudy} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weeks</label>
                    <input type="number" name="numberOfWeeks" value={form.numberOfWeeks} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours/Week</label>
                    <input type="number" name="hoursPerWeek" value={form.hoursPerWeek} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Fees</label>
                    <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-3 text-gray-400" />
                        <input type="number" name="tuitionFees" value={form.tuitionFees} onChange={handleChange} className="w-full h-10 pl-8 pr-3 rounded-lg border border-gray-300" />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">External Exam</label>
                    <input name="externalExam" value={form.externalExam} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                    <input type="date" name="externalExamDate" value={form.externalExamDate} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Score</label>
                    <input name="scoreExternalExam" value={form.scoreExternalExam} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Payment</label>
                    <input type="date" name="dateOfPayment" value={form.dateOfPayment} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ILEP Ref</label>
                    <input name="ilepReference" value={form.ilepReference} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                    <input name="schedule" value={form.schedule} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attendance</label>
                    <input name="attendance" value={form.attendance} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300" />
                </div>
            </div>
        </div>

        {/* 5. NOTES */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Notes</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">General Notes</label>
                    <textarea name="generalNotes" value={form.generalNotes} onChange={handleChange} className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 resize-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
                    <textarea name="medicalNotes" value={form.medicalNotes} onChange={handleChange} className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 resize-none" />
                </div>
            </div>
        </div>

        {/* 6. CLASS OPTIONS & SUBSTITUTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Options */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <School size={18} className="text-blue-600" />
                    <h2 className="font-semibold text-gray-900">Class Enrollment Limits</h2>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-xs text-gray-500">Only fill this if you want to restrict the student to specific subjects/levels.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Subject</label>
                        <select name="classSubject" value={form.classSubject} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white">
                            <option value="">Select</option>
                            <option value="General English">General English</option>
                            <option value="Business English">Business English</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Level</label>
                        <select name="classLevel" value={form.classLevel} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white">
                            <option value="">Select</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Substitute Lessons */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <Clock size={18} className="text-blue-600" />
                    <h2 className="font-semibold text-gray-900">Substitute Lessons</h2>
                </div>
                <div className="p-6 space-y-4">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="allowSubstituteLessons" checked={form.allowSubstituteLessons} onChange={handleChange} className="w-4 h-4 rounded border-gray-300" />
                        <span className="text-sm font-medium text-gray-700">Allow Substitute Lessons</span>
                    </label>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lessons per Month</label>
                            <input 
                                type="number" 
                                name="substituteLessonsPerMonth" 
                                value={form.substituteLessonsPerMonth} 
                                onChange={handleChange} 
                                disabled={!form.allowSubstituteLessons}
                                className="w-full h-10 px-3 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input 
                                type="date" 
                                name="substituteStartDate" 
                                value={form.substituteStartDate} 
                                onChange={handleChange} 
                                disabled={!form.allowSubstituteLessons}
                                className="w-full h-10 px-3 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input 
                                type="date" 
                                name="substituteEndDate" 
                                value={form.substituteEndDate} 
                                onChange={handleChange} 
                                disabled={!form.allowSubstituteLessons}
                                className="w-full h-10 px-3 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ACTIONS */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3 pb-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-11 px-6 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-6 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Update Student"}
          </button>
        </div>
      </form>
    </div>
  );
}