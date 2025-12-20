import { useState, useEffect } from "react";
import { X, Search, Loader2, ChevronDown } from "lucide-react";
import axiosInstance from './axiosInstance'; 
import axios from 'axios'; 
import Swal from 'sweetalert2';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

// -------------------------------------------------------------
// Type Definitions (Kept outside for cleaner component code)
// -------------------------------------------------------------
interface StudentApiPayload {
    Id: number; 
    FirstName: string | null;
    Surname: string | null;
    Gender: string | null;
    RegistrationDate: string | null; 
    DateOfBirth: string | null;
    AccountId: number | null;
    IdNumber: string | null;
    Photo: string | null;
    Password: string | null;
    PreferredPaymentMethod: string | null;
    Discount: number | null; 
    MobilePhone: string | null;
    HomePhone: string | null;
    Email: string | null;
    StreetAddress: string | null;
    City: string | null;
    ZipCode: string | null;
    State: string | null;
    Country: string | null;
    TimeZone: string | null;
    Nationality: string | null;
    PassportNumber: string | null;
    GnibExpiryDate: string | null;
    PassportExpiryDate: string | null;
    FinishedCourseDate: string | null;
    CourseStartDate: string | null;
    CourseLevel: string | null;
    CourseEndDate: string | null;
    HoursPerWeek: number | null;
    Attendance: string | null;
    CourseCode: string | null;
    CourseTitle: string | null;
    ModeOfStudy: string | null;
    NumberOfWeeks: number | null;
    TuitionFees: string | null;
    Department: string | null;
    ExternalExam: string | null;
    ExternalExamDate: string | null;
    ScoreExternalExam: string | null;
    DateOfPayment: string | null;
    Duration: string | null;
    Schedule: string | null;
    IlepReference: string | null;
    EndOfExamPaid: string | null;
    GeneralNotes: string | null;
    MedicalNotes: string | null;
    ClassSubject: string | null;
    ClassLevel: string | null;
    AllowSubstituteLessons: boolean | null;
    SubstituteLessonsPerMonth: number | null; 
    SubstituteStartDate: string | null;
    SubstituteEndDate: string | null;
    CreatedOn: string | null;
    CreatedBy: number | null;
    UpdatedOn: string | null;
    UpdatedBy: number | null;
    IsActive: boolean | null;
    IsDeleted: boolean | null;
    IsEnrollment?: boolean | null;
    ClassId?: number | null;
}

interface FormDataState {
    id: number; 
    firstName: string;
    surname: string;
    gender: string;
    registrationDate: string;
    dateOfBirth: string;
    idNumber: string;
    photo: File | null;
    preferredPaymentMethod: string;
    discount: string;
    mobilePhone: string;
    homePhone: string;
    email: string;
    streetAddress: string;
    city: string;
    zipCode: string;
    state: string;
    country: string;
    timezone: string;
    nationality: string;
    gnibExpiryDate: string;
    finishedCourseDate: string;
    courseLevel: string;
    hoursPerWeek: string;
    courseCode: string;
    passportNumber: string;
    passportExpiryDate: string;
    courseStartDate: string;
    courseEndDate: string;
    attendance: string;
    courseTitle: string;
    modeOfStudy: string;
    numberOfWeeks: string;
    tuitionFees: string;
    department: string;
    externalExam: string;
    externalExamDate: string;
    scoreExternalExam: string;
    dateOfPayment: string;
    duration: string;
    schedule: string;
    ilepReference: string;
    endOfExamPaid: string;
    generalNotes: string;
    medicalNotes: string;
    classSubject: string;
    classLevel: string;
    allowSubstituteLessons: boolean;
    substituteLessonsPerMonth: string;
    substituteStartDate: string;
    substituteEndDate: string;
    selectedClassId: number | null;
    selectedClassName: string | null;
}

interface AddStudentFormProps {
    isOpen: boolean;
    onClose: () => void;
    asPage?: boolean;
}

// Initial state for the form (client-side)
const initialFormData: FormDataState = {
    id: 0, 
    firstName: "",
    surname: "",
    gender: "Not specified",
    registrationDate: new Date().toLocaleDateString('en-IE', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
    dateOfBirth: "",
    idNumber: "",
    photo: null,
    preferredPaymentMethod: "",
    discount: "0.00",
    mobilePhone: "",
    homePhone: "",
    email: "",
    streetAddress: "",
    city: "",
    zipCode: "",
    state: "",
    country: "Ireland",
    timezone: "Europe/London",
    nationality: "",
    gnibExpiryDate: "",
    finishedCourseDate: "",
    courseLevel: "",
    hoursPerWeek: "",
    courseCode: "",
    passportNumber: "",
    passportExpiryDate: "",
    courseStartDate: "",
    courseEndDate: "",
    attendance: "",
    courseTitle: "",
    modeOfStudy: "",
    numberOfWeeks: "",
    tuitionFees: "",
    department: "",
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
    selectedClassId: null,
    selectedClassName: null
};

// -------------------------------------------------------------
// Data Mapping Helpers (Repeated for context)
// -------------------------------------------------------------
const parseDate = (dateString: string): string | null => {
  if (!dateString) return null;

  // yyyy-mm-dd (from input[type="date"])
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString).toISOString();
  }

  // dd-mm-yyyy (from DatePicker / manual input)
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map(Number);
    if (!isNaN(dd) && !isNaN(mm) && !isNaN(yyyy)) {
      return new Date(yyyy, mm - 1, dd).toISOString();
    }
  }

  return null;
};



const parseDDMMYYYYToDate = (value: string): Date | null => {
  if (!value) return null;

  const parts = value.split("-");
  if (parts.length !== 3) return null;

  const [dd, mm, yyyy] = parts.map(Number);
  if (isNaN(dd) || isNaN(mm) || isNaN(yyyy)) return null;

  return new Date(yyyy, mm - 1, dd);
};



const parseDecimal = (value: string): number | null => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
};

const parseIntegerValue = (value: string): number | null => {
    if (!value) return null;
    const num = Number.parseInt(value, 10);
    return Number.isNaN(num) ? null : num;
};

// Helper function to convert File to base64 with data header
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result as string;
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};

const mapToApiPayload = (formData: Omit<FormDataState, 'photo'>, photoBase64?: string): StudentApiPayload => {
    return {
        Id: formData.id,
        FirstName: formData.firstName || null,
        Surname: formData.surname || null,
        Gender: formData.gender || null,
        RegistrationDate: parseDate(formData.registrationDate),
        DateOfBirth: parseDate(formData.dateOfBirth),
        AccountId: null,
        IdNumber: formData.idNumber || null,
        Photo: photoBase64 || null,
        Password: null, 
        PreferredPaymentMethod: formData.preferredPaymentMethod || null,
        Discount: parseDecimal(formData.discount),

        MobilePhone: formData.mobilePhone || null,
        HomePhone: formData.homePhone || null,
        Email: formData.email || null,
        StreetAddress: formData.streetAddress || null,
        City: formData.city || null,
        ZipCode: formData.zipCode || null,
        State: formData.state || null,
        Country: formData.country || null,
        TimeZone: formData.timezone || null,

        Nationality: formData.nationality || null,
        PassportNumber: formData.passportNumber || null,
        GnibExpiryDate: parseDate(formData.gnibExpiryDate),
        PassportExpiryDate: parseDate(formData.passportExpiryDate),
        FinishedCourseDate: parseDate(formData.finishedCourseDate),
        CourseStartDate: parseDate(formData.courseStartDate),
        CourseLevel: formData.courseLevel || null,
        CourseEndDate: parseDate(formData.courseEndDate),
        HoursPerWeek: parseDecimal(formData.hoursPerWeek),
        Attendance: formData.attendance || null,
        CourseCode: formData.courseCode || null,
        CourseTitle: formData.courseTitle || null,
        ModeOfStudy: formData.modeOfStudy || null,
        NumberOfWeeks: parseIntegerValue(formData.numberOfWeeks),
        TuitionFees: formData.tuitionFees || null,
        Department: formData.department || null,
        ExternalExam: formData.externalExam || null,

        ExternalExamDate: parseDate(formData.externalExamDate),
        ScoreExternalExam: formData.scoreExternalExam || null,
        DateOfPayment: parseDate(formData.dateOfPayment),
        Duration: formData.duration || null,
        Schedule: formData.schedule || null,
        IlepReference: formData.ilepReference || null,
        EndOfExamPaid: formData.endOfExamPaid || null,

        GeneralNotes: formData.generalNotes || null,
        MedicalNotes: formData.medicalNotes || null,

        ClassSubject: formData.classSubject || null,
        ClassLevel: formData.classLevel || null,

        AllowSubstituteLessons: formData.allowSubstituteLessons,
        SubstituteLessonsPerMonth: parseIntegerValue(formData.substituteLessonsPerMonth),
        SubstituteStartDate: parseDate(formData.substituteStartDate),
        SubstituteEndDate: parseDate(formData.substituteEndDate),
        CreatedOn: new Date().toISOString(),
        CreatedBy: null,
        UpdatedOn: new Date().toISOString(),
        UpdatedBy: null,
        IsActive: true,
        IsDeleted: false,
        IsEnrollment: !!formData.selectedClassId,
        ClassId: formData.selectedClassId || null,
    };
};

// -------------------------------------------------------------
// Component Start
// -------------------------------------------------------------
export default function AddStudentForm({ isOpen, onClose, asPage }: AddStudentFormProps) {
    const [formData, setFormData] = useState<FormDataState>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingId, setIsLoadingId] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [classPageNumber, setClassPageNumber] = useState(1);
    const [classPageSize, setClassPageSize] = useState(10);
    const [classTotalCount, setClassTotalCount] = useState(0);
    const [classSearchQuery, setClassSearchQuery] = useState("");
    const [classSearchDebounced, setClassSearchDebounced] = useState("");

    // Fetch next student ID when form opens
    useEffect(() => {
        const fetchNextStudentId = async () => {
            if (isOpen) {
                try {
                    setIsLoadingId(true);
                    const response = await axiosInstance.get("/Student/GetNextStudentId");
                    if (response?.data?.IsSuccess && response.data.Message) {
                        setFormData(prev => ({ ...prev, idNumber: response.data.Message }));
                    }
                } catch (err) {
                    console.error("Error fetching next student ID:", err);
                } finally {
                    setIsLoadingId(false);
                }
            }
        };
        fetchNextStudentId();
    }, [isOpen]);

    const handleInputChange = (field: keyof FormDataState, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, photo: file }));
    }

    const resetForm = () => {
        setFormData({ ...initialFormData, idNumber: "", selectedClassId: null, selectedClassName: null });
        setError(null);
    };

    // Debounce class search
    useEffect(() => {
        const timer = setTimeout(() => {
            setClassSearchDebounced(classSearchQuery);
            setClassPageNumber(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [classSearchQuery]);

    // Fetch classes for selection modal
    useEffect(() => {
        if (showClassModal) {
            const fetchClasses = async () => {
                setLoadingClasses(true);
                try {
                    const response = await axiosInstance.get('/Class/GetAllClassesWithPagination', {
                        params: {
                            pageNumber: classPageNumber,
                            pageSize: classPageSize,
                            search: classSearchDebounced || null
                        }
                    });
                    if (response.data?.IsSuccess) {
                        setClasses(response.data.Data?.Data || []);
                        setClassTotalCount(Number(response.data.Data?.TotalCount ?? 0));
                    } else {
                        setClasses([]);
                        setClassTotalCount(0);
                    }
                } catch (err) {
                    console.error("Error fetching classes:", err);
                    setClasses([]);
                    setClassTotalCount(0);
                } finally {
                    setLoadingClasses(false);
                }
            };
            fetchClasses();
        }
    }, [showClassModal, classPageNumber, classPageSize, classSearchDebounced]);

    // --- Submission Logic with Axios and Swal ---
    const handleSubmit = async (e: React.FormEvent, isAddAndNew: boolean = false) => {
        e.preventDefault();

        if (!formData.firstName || !formData.surname) {
            await Swal.fire({
                icon: 'warning',
                title: 'Missing Required Fields',
                text: 'First name and Surname are required to proceed.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        setIsLoading(true);
        setError(null);

        const { photo, ...clientPayload } = formData;
        
        // Convert photo to base64 if provided
        let photoBase64: string | undefined;
        if (photo) {
            try {
                photoBase64 = await fileToBase64(photo);
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Photo Conversion Failed',
                    text: 'Failed to convert photo to base64. Please try again.',
                    confirmButtonColor: '#d33'
                });
                setIsLoading(false);
                return;
            }
        }
        
        const apiPayload = mapToApiPayload(clientPayload, photoBase64);
        
        // Log payload for debugging
        console.log("Student payload:", {
            IsEnrollment: apiPayload.IsEnrollment,
            ClassId: apiPayload.ClassId,
            selectedClassId: formData.selectedClassId
        });
        
        const API_ENDPOINT = "Student/AddStudent"; 

        try {
          const response = await axiosInstance.post(API_ENDPOINT, apiPayload);
          const respData = response.data;

          const message =
              typeof respData === 'string'
                  ? respData
                  : (respData && (respData.Message ?? respData.message)) || JSON.stringify(respData);

          const isSuccessFromFlag = respData && typeof respData === 'object' && respData.IsSuccess === true;
          const isSuccessFromMessage = /saved successfully/i.test(message);
          const isSuccess = Boolean(isSuccessFromFlag || isSuccessFromMessage);

          if (isSuccess) {
              await Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: message.includes('successfully') ? message : 'Student record saved successfully.',
                  showConfirmButton: false,
                  timer: 1500
              });

              if (isAddAndNew) {
                  resetForm();
              } else {
                  onClose();
              }
          } else {
              setError(message);
              await Swal.fire({
                  icon: 'error',
                  title: 'Operation Failed',
                  html: `The server returned a successful status, but an error occurred:<br><strong>${message}</strong>`,
                  confirmButtonColor: '#d33'
              });
          }
      } catch (err) {
          let errorMessage = "An unknown network error occurred during submission.";
          let errorDetails = '';

          if (axios.isAxiosError(err) && err.response) {
              errorMessage = (err.response.data as any)?.message || `Server Error: ${err.response.status}`;
              errorDetails = JSON.stringify(err.response.data, null, 2);
          } else if (err instanceof Error) {
              errorMessage = err.message;
          }

          setError(errorMessage);

          await Swal.fire({
              icon: 'error',
              title: 'Submission Failed',
              html: `<strong>${errorMessage}</strong><br><br><small>Check console for technical details.</small>`,
              confirmButtonColor: '#d33'
          });
      } finally {
          setIsLoading(false);
      }
    };
    // --- End Submission Logic ---

    if (!asPage && !isOpen) return null

    // Helper for button state management
    const getButtonState = (buttonAction: 'add' | 'addAndNew') => {
        if (isLoading) {
            return { disabled: true, text: 'Adding...', className: 'bg-blue-400 cursor-not-allowed' };
        }
        
        if (buttonAction === 'add') {
            return { disabled: false, text: 'Add student', className: 'bg-blue-600 hover:bg-blue-700' };
        }
        
        return { disabled: false, text: 'Add and new', className: 'bg-white border text-gray-700 hover:bg-gray-50' };
    };

    const addStudentButton = getButtonState('add');
    const addAndNewButton = getButtonState('addAndNew');

    // UI small helpers for the admin flat look
    const SectionHeader = ({ title }: { title: string }) => (
        <div className="bg-[#f2f2f2] px-4 py-2 border-t border-b text-[13px] font-semibold text-gray-800">
            {title}
        </div>
    );

    return (
        <div className={asPage ? "" : "fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"} onClick={asPage ? undefined : onClose}>
            <div
  className={`bg-white border border-gray-300 overflow-hidden
    ${asPage 
      ? "mx-[250px]" 
      : "max-w-none mx-[100px] max-h-[90vh] overflow-y-auto"
    }`}
  onClick={(e) => e.stopPropagation()}
>
    {/* Top dark title bar (like image) */}
                <div className="bg-[#2b2b2e] px-4 py-2 text-white text-sm font-semibold flex items-center justify-between">
                    <div>Enter Student Details</div>
                    {!asPage && (
                        <button onClick={onClose} className="text-white opacity-80 hover:opacity-100">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <form onSubmit={(e) => handleSubmit(e, false)} className={`${asPage ? "p-0" : "p-0"} space-y-0`}>
                    {/* show global error if exists */}
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-sm">
                            **Last Submission Error:** {error}
                        </div>
                    )}

                    {/* Personal details */}
                    <SectionHeader title="Personal Details" />
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Surname <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.surname}
                                    onChange={(e) => handleInputChange('surname', e.target.value)}
                                    className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Gender</label>
                                <div className="flex gap-0 border border-gray-300 bg-white">
                                    {["Male","Female","Not specified"].map(option => (
                                        <label key={option} className="flex items-center px-3 text-[13px] cursor-pointer">
                                            <input type="radio" name="gender" value={option} checked={formData.gender === option} onChange={(e) => handleInputChange('gender', e.target.value)} className="mr-2" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Registration Date <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.registrationDate}
                                    onChange={(e) => handleInputChange('registrationDate', e.target.value)}
                                    className="w-full h-[34px] px-2 border border-gray-300 bg-white text-[13px]"
                                    required
                                />
                                <p className="text-gray-500 text-xs mt-1">dd-mm-yyyy</p>
                            </div>

                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Date of Birth</label>
                                <DatePicker
                                    selected={formData.dateOfBirth ? (() => {
                                        const parts = formData.dateOfBirth.split('-');
                                        if (parts.length === 3) {
                                            const day = Number.parseInt(parts[0], 10);
                                            const month = Number.parseInt(parts[1], 10);
                                            const year = Number.parseInt(parts[2], 10);
                                            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                                                return new Date(year, month - 1, day);
                                            }
                                        }
                                        const date = new Date(formData.dateOfBirth);
                                        return isNaN(date.getTime()) ? null : date;
                                    })() : null}
                                    onChange={(date: Date | null) => {
                                        if (date) {
                                            const formattedDate = date.toLocaleDateString('en-IE', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
                                            handleInputChange('dateOfBirth', formattedDate);
                                        } else {
                                            handleInputChange('dateOfBirth', '');
                                        }
                                    }}
                                    dateFormat="dd-MM-yyyy"
                                    placeholderText="Select date"
                                    className="w-full h-[34px] px-2 border border-gray-300 text-[13px]"
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Identification Number</label>
                                <input
                                    type="text"
                                    value={formData.idNumber}
                                    disabled
                                    className="w-full h-[34px] px-2 border border-gray-300 bg-gray-100 text-[13px] cursor-not-allowed"
                                    placeholder={isLoadingId ? "Loading..." : ""}
                                />
                                <p className="text-gray-500 text-xs mt-1">Student ID is automatically generated.</p>
                            </div>

                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Photo</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        id="photo"
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/jpg,image/png,image/gif"
                                        className="hidden"
                                    />
                                    <label htmlFor="photo" className="h-[34px] px-3 border border-gray-300 flex items-center text-[13px] cursor-pointer bg-white">Browse...</label>
                                    <span className="text-[13px] text-gray-500">{formData.photo ? formData.photo.name : 'No file selected...'}</span>
                                </div>
                                <p className="text-gray-500 text-xs mt-1">Upload photo in JPG,JPEG,PNG,GIF format only</p>
                            </div>

                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Preferred Payment Method</label>
                                <select value={formData.preferredPaymentMethod} onChange={(e) => handleInputChange('preferredPaymentMethod', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white">
                                    <option value="">select</option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Discount</label>
                                <div className="flex items-center">
                                    <input type="text" value={formData.discount} onChange={(e) => handleInputChange('discount', e.target.value)} className="flex-1 h-[34px] px-2 border border-gray-300 text-[13px] bg-white" />
                                    <span className="ml-2 text-[13px]">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact details */}
                    <SectionHeader title="Contact Details" />
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
  <label className="block text-[13px] text-gray-700 mb-1">
    Mobile Phone
  </label>

  <PhoneInput
    international
    defaultCountry="IE"
    value={formData.mobilePhone}
    onChange={(v) => handleInputChange("mobilePhone", v || "")}
    className="flex items-center h-[34px] border border-gray-300 rounded px-2"
    inputClassName="flex-1 h-full text-[13px] outline-none border-none"
  />
</div>

<div>
  <label className="block text-[13px] text-gray-700 mb-1">
    Home Phone
  </label>

  <PhoneInput
    international
    defaultCountry="IE"
    value={formData.homePhone}
    onChange={(v) => handleInputChange("homePhone", v || "")}
    className="flex items-center h-[34px] border border-gray-300 rounded px-2"
    inputClassName="flex-1 h-full text-[13px] outline-none border-none"
  />
</div>

                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Email address (recommended)</label>
                                <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" />
                            </div>

                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Street Address</label>
                                <input type="text" value={formData.streetAddress} onChange={(e) => handleInputChange('streetAddress', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" />
                            </div>
                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">City</label>
                                <input type="text" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" />
                            </div>
                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">ZIP/Post code</label>
                                <input type="text" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" />
                            </div>

                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">State/Province/Region</label>
                                <input type="text" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" />
                            </div>
                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Country</label>
                                <input type="text" value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" />
                            </div>
                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Time zone</label>
                                <select value={formData.timezone} onChange={(e) => handleInputChange('timezone', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white">
                                    <option>Europe/London</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Custom Fields */}
                    <SectionHeader title="Custom Fields" />
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-[13px] text-gray-700 mb-1">Nationality</label><input type="text" value={formData.nationality} onChange={(e)=>handleInputChange('nationality', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Passport Number</label><input type="text" value={formData.passportNumber} onChange={(e)=>handleInputChange('passportNumber', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Passport Expiry Date</label><input type="date" value={formData.passportExpiryDate} onChange={(e)=>handleInputChange('passportExpiryDate', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>

                            <div><label className="block text-[13px] text-gray-700 mb-1">GNIB Expiry Date</label><input type="date" value={formData.gnibExpiryDate} onChange={(e)=>handleInputChange('gnibExpiryDate', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Course Start Date</label>
                                <DatePicker
                                    selected={formData.courseStartDate ? (() => {
                                        const parts = formData.courseStartDate.split('-');
                                        if (parts.length === 3) {
                                            const day = Number.parseInt(parts[0], 10);
                                            const month = Number.parseInt(parts[1], 10);
                                            const year = Number.parseInt(parts[2], 10);
                                            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                                                return new Date(year, month - 1, day);
                                            }
                                        }
                                        const date = new Date(formData.courseStartDate);
                                        return isNaN(date.getTime()) ? null : date;
                                    })() : null}
                                    onChange={(date)=>{ if(date){ const f=date.toLocaleDateString('en-IE', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g,'-'); handleInputChange('courseStartDate', f);} else handleInputChange('courseStartDate','');}}
                                    dateFormat="dd-MM-yyyy"
                                    className="w-full h-[34px] px-2 border border-gray-300 text-[13px]"
                                /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Course End Date</label>
                                <DatePicker
                                    selected={formData.courseEndDate ? (() => {
                                        const parts = formData.courseEndDate.split('-');
                                        if (parts.length === 3) {
                                            const day = Number.parseInt(parts[0], 10);
                                            const month = Number.parseInt(parts[1], 10);
                                            const year = Number.parseInt(parts[2], 10);
                                            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                                                return new Date(year, month - 1, day);
                                            }
                                        }
                                        const date = new Date(formData.courseEndDate);
                                        return isNaN(date.getTime()) ? null : date;
                                    })() : null}
                                    onChange={(date)=>{ if(date){ const f=date.toLocaleDateString('en-IE', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g,'-'); handleInputChange('courseEndDate', f);} else handleInputChange('courseEndDate','');}}
                                    dateFormat="dd-MM-yyyy"
                                    className="w-full h-[34px] px-2 border border-gray-300 text-[13px]"
                                /></div>

                            <div><label className="block text-[13px] text-gray-700 mb-1">Finished Course Date</label><input type="date" value={formData.finishedCourseDate} onChange={(e)=>handleInputChange('finishedCourseDate', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Attendance</label><input type="text" value={formData.attendance} onChange={(e)=>handleInputChange('attendance', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Course Title</label><input type="text" value={formData.courseTitle} onChange={(e)=>handleInputChange('courseTitle', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>

                            <div><label className="block text-[13px] text-gray-700 mb-1">Course Level</label><input type="text" value={formData.courseLevel} onChange={(e)=>handleInputChange('courseLevel', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Mode of Study</label><input type="text" value={formData.modeOfStudy} onChange={(e)=>handleInputChange('modeOfStudy', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Number of Weeks</label><input type="number" value={formData.numberOfWeeks} onChange={(e)=>handleInputChange('numberOfWeeks', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>

                            <div><label className="block text-[13px] text-gray-700 mb-1">Hours Per Week</label><input type="number" value={formData.hoursPerWeek} onChange={(e)=>handleInputChange('hoursPerWeek', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Tuition Fees</label><input type="text" value={formData.tuitionFees} onChange={(e)=>handleInputChange('tuitionFees', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Department</label><input type="text" value={formData.department} onChange={(e)=>handleInputChange('department', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>

                            <div><label className="block text-[13px] text-gray-700 mb-1">External Exam</label><input type="text" value={formData.externalExam} onChange={(e)=>handleInputChange('externalExam', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                        </div>
                    </div>

                    {/* Course Details & Payment Info */}
                    <SectionHeader title="Course Details & Payment Info" />
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-[13px] text-gray-700 mb-1">Date of External Exam</label><input type="date" value={formData.externalExamDate} onChange={(e)=>handleInputChange('externalExamDate', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Score External Exam</label><input type="text" value={formData.scoreExternalExam} onChange={(e)=>handleInputChange('scoreExternalExam', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Date of Payment</label><input type="date" value={formData.dateOfPayment} onChange={(e)=>handleInputChange('dateOfPayment', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>

                            <div><label className="block text-[13px] text-gray-700 mb-1">Duration</label><input type="number" value={formData.duration} onChange={(e)=>handleInputChange('duration', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Schedule</label><input type="text" value={formData.schedule} onChange={(e)=>handleInputChange('schedule', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">ILEP reference number</label>
                                <select value={formData.ilepReference} onChange={(e)=>handleInputChange('ilepReference', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white">
                                    <option value="">Select</option>
                                    {Array.from({ length: 5 }, (_, i) => {
                                        const num = String(i + 1).padStart(3, '0');
                                        return <option key={num} value={`0355/${num}`}>0355/{num}</option>
                                    })}
                                </select>
                            </div>

                            <div className="md:col-span-2"><label className="block text-[13px] text-gray-700 mb-1">End of Exam paid</label><input type="date" value={formData.endOfExamPaid} onChange={(e)=>handleInputChange('endOfExamPaid', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white" /></div>
                        </div>
                    </div>

                    {/* Other details */}
                    <SectionHeader title="Other Details" />
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">General notes</label>
                                <textarea value={formData.generalNotes} onChange={(e) => handleInputChange('generalNotes', e.target.value)} className="w-full border border-gray-300 h-24 p-2 text-[13px]" />
                            </div>
                            <div>
                                <label className="block text-[13px] text-gray-700 mb-1">Medical notes</label>
                                <textarea value={formData.medicalNotes} onChange={(e) => handleInputChange('medicalNotes', e.target.value)} className="w-full border border-gray-300 h-24 p-2 text-[13px]" />
                            </div>
                        </div>
                    </div>

                    {/* Class options */}
                    <SectionHeader title="Class Options" />
                    <div className="p-4">
                        <p className="text-[13px] text-gray-600 mb-3">If selected, this student can only be enrolled in these subjects or levels. Leaving it blank allows the student to be enrolled in all classes.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-[13px] text-gray-700 mb-1">Class subject</label>
                                <select value={formData.classSubject} onChange={(e)=>handleInputChange('classSubject', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white"><option value="">Select</option><option value="General English With Exam Preparation">General English With Exam Preparation</option></select>
                            </div>
                            <div><label className="block text-[13px] text-gray-700 mb-1">Class level</label>
                                <select value={formData.classLevel} onChange={(e)=>handleInputChange('classLevel', e.target.value)} className="w-full h-[34px] px-2 border border-gray-300 text-[13px] bg-white">
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

                    {/* Enroll in classes */}
                    <SectionHeader title="Enroll in classes" />
                    <div className="p-4">
                        <p className="text-[13px] text-gray-600 mb-3">Enroll the student in a class</p>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setShowClassModal(true)} className="h-[34px] px-3 border border-gray-300 text-[13px] bg-white">{formData.selectedClassName || "Select classes"}</button>
                            {formData.selectedClassId && (
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, selectedClassId: null, selectedClassName: null }))} className="h-[34px] px-3 border border-red-200 text-red-700 text-[13px] bg-white">Clear</button>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 px-4 py-3 border-t bg-white">
                        <button type="button" onClick={onClose} className="h-[34px] px-3 border border-gray-300 text-[13px] bg-white" disabled={isLoading}>Cancel</button>
                        <button type="button" onClick={(e) => handleSubmit(e, true)} className={`h-[34px] px-3 border text-[13px] ${addAndNewButton.className}`} disabled={addAndNewButton.disabled}>{addAndNewButton.text}</button>
                        <button type="submit" className={`h-[34px] px-3 text-white text-[13px] ${addStudentButton.className}`} disabled={addStudentButton.disabled}>{addStudentButton.text}</button>
                    </div>
                </form>

                {/* Class Selection Modal */}
                {showClassModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={() => setShowClassModal(false)}>
                        <div className="bg-white w-full max-w-4xl border border-gray-300" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                <h2 className="text-[16px] font-semibold">Select Class</h2>
                                <button onClick={() => setShowClassModal(false)} className="text-gray-700">×</button>
                            </div>

                            <div className="p-4 max-h-[60vh] overflow-y-auto">
                                {/* Search */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="text" placeholder="Search classes..." value={classSearchQuery} onChange={(e) => setClassSearchQuery(e.target.value)} className="w-full h-[34px] pl-10 pr-4 border border-gray-300 text-[13px]" />
                                    </div>
                                </div>

                                {/* Classes List */}
                                {loadingClasses ? (
                                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
                                ) : classes.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500">No classes found</div>
                                ) : (
                                    <div className="space-y-2">
                                        {classes.map((cls: any) => (
                                            <div key={cls.ClassId} onClick={() => { setFormData(prev => ({ ...prev, selectedClassId: cls.ClassId, selectedClassName: cls.ClassTitle || "Unnamed Class" })); setShowClassModal(false); }} className={`p-3 border ${formData.selectedClassId === cls.ClassId ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'} cursor-pointer`}>
                                                <div className="font-medium text-gray-900 text-[14px]">{cls.ClassTitle || "Unnamed Class"}</div>
                                                <div className="text-[13px] text-gray-600">{cls.ClassSubject}{cls.ClassLevel ? ` - ${cls.ClassLevel}` : ""}</div>
                                                {cls.ClassDescription && <div className="text-xs text-gray-500 mt-1">{cls.ClassDescription}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {classTotalCount > 0 && (
                                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                                        <div className="text-[13px] text-gray-600">Showing {((classPageNumber - 1) * classPageSize) + 1} to {Math.min(classPageNumber * classPageSize, classTotalCount)} of {classTotalCount} classes</div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setClassPageNumber(prev => Math.max(1, prev - 1))} disabled={classPageNumber === 1} className="h-[30px] px-3 border border-gray-300 text-[13px] disabled:opacity-50">Previous</button>
                                            <span className="text-[13px]">Page {classPageNumber} of {Math.ceil(classTotalCount / classPageSize)}</span>
                                            <button onClick={() => setClassPageNumber(prev => Math.min(Math.ceil(classTotalCount / classPageSize), prev + 1))} disabled={classPageNumber >= Math.ceil(classTotalCount / classPageSize)} className="h-[30px] px-3 border border-gray-300 text-[13px] disabled:opacity-50">Next</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
