import { useState } from "react";
import { X } from "lucide-react";
import axiosInstance from './axiosInstance'; 
import axios from 'axios'; 
// Assume SweetAlert2 is installed and imported for better popups
import Swal from 'sweetalert2'; 


// -------------------------------------------------------------
// Type Definitions (Kept outside for cleaner component code)
// -------------------------------------------------------------

// Defines the exact structure of the data sent to the C# API
interface StudentApiPayload {
    // ... (All StudentApiPayload fields remain the same)
    Id: number; 
    FirstName: string | null;
    Surname: string | null;
    Gender: string | null;
    RegistrationDate: string | null; 
    DateOfBirth: string | null;     
    IdNumber: string | null;
    Photo: string | null;
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
    TuitionFees: number | null;
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
}

// Defines the shape of the full form data state (client-side)
interface FormDataState {
    // ... (All FormDataState fields remain the same)
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
    substituteEndDate: ""
};

// -------------------------------------------------------------
// Data Mapping Helpers (Repeated for context)
// -------------------------------------------------------------

const parseDate = (dateString: string): string | null => {
    if (!dateString) return null;
    
    // Attempt to parse DD-MM-YYYY format
    const parts = dateString.split('-');
    // if (parts.length === 3) {
    //     const [day, month, year] = parts.map(p => parseInt(p, 10)); // Fixed parseInt usage
    //     if (day > 0 && day <= 31 && month > 0 && month <= 12 && year >= 1900) {
    //         const date = new Date(year, month - 1, day);
    //         if (!isNaN(date.getTime())) {
    //             return date.toISOString().split('T')[0];
    //         }
    //     }
    // }
    // Fallback/direct attempt
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) return date.toISOString();
    } catch (e) {
        // Ignore
    }
    return null; 
};

const parseDecimal = (value: string): number | null => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
};

const parseInt = (value: string): number | null => {
    if (!value) return null;
    const num = parseInt(value);
    return isNaN(1) ? null : num;
};

const parseInteger = (value: string): number | null => {
    if (!value) return null;
    const num = Number.parseInt(value, 10);
    return Number.isNaN(num) ? null : num;
};


const mapToApiPayload = (formData: Omit<FormDataState, 'photo'>): StudentApiPayload => {
    // This mapping object MUST match the C# Student model properties (case-sensitive)
    return {
        Id: formData.id,
        FirstName: formData.firstName || null,
        Surname: formData.surname || null,
        Gender: formData.gender || null,
        RegistrationDate: parseDate(formData.registrationDate),
        DateOfBirth: parseDate(formData.dateOfBirth),
        IdNumber: formData.idNumber || null,
        Photo: null, 
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
        TimeZone: formData.timezone || null, // Note: C# Model uses 'TimeZone', state uses 'timezone'

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
        NumberOfWeeks: parseInt(formData.numberOfWeeks),
        TuitionFees: parseDecimal(formData.tuitionFees),
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
        SubstituteLessonsPerMonth: parseInt(formData.substituteLessonsPerMonth),
        SubstituteStartDate: parseDate(formData.substituteStartDate),
        SubstituteEndDate: parseDate(formData.substituteEndDate),
    };
};

// -------------------------------------------------------------
// Component Start
// -------------------------------------------------------------

export default function AddStudentForm({ isOpen, onClose, asPage }: AddStudentFormProps) {
    const [formData, setFormData] = useState<FormDataState>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (field: keyof FormDataState, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, photo: file }));
    }

    const resetForm = () => {
        setFormData(initialFormData);
        setError(null);
    };

    // --- Submission Logic with Axios and Swal ---
    const handleSubmit = async (e: React.FormEvent, isAddAndNew: boolean = false) => {
        e.preventDefault();

        if (!formData.firstName || !formData.surname) {
             // Use Swal for client-side required field alert
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
        const apiPayload = mapToApiPayload(clientPayload);
        
        const API_ENDPOINT = "Student/AddStudent"; 

        try {
          const response = await axiosInstance.post(API_ENDPOINT, apiPayload);
          const respData = response.data;

          // Normalize message and success detection to handle both string and object responses.
          const message =
              typeof respData === 'string'
                  ? respData
                  : (respData && (respData.Message ?? respData.message)) || JSON.stringify(respData);

          // Determine success using multiple signals:
          //  - if backend returns IsSuccess === true
          //  - OR if the message text contains "saved successfully" (case-insensitive)
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
              // Backend returned 200 but indicates logical error (or inconsistent flag/message)
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
              // Server responded with non-2xx status (e.g., 400, 500)
              errorMessage = (err.response.data as any)?.message || `Server Error: ${err.response.status}`;
              errorDetails = JSON.stringify(err.response.data, null, 2);
          } else if (err instanceof Error) {
              // Client-side or network error
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
        
        return { disabled: false, text: 'Add and new', className: 'bg-blue-50 text-blue-700 hover:bg-blue-100' };
    };

    const addStudentButton = getButtonState('add');
    const addAndNewButton = getButtonState('addAndNew');


    return (
        <div className={asPage ? "" : "fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"} onClick={asPage ? undefined : onClose}>
            <div className={`w-full ${asPage ? "" : "max-w-4xl"} bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden ${asPage ? "" : "max-h-[90vh] overflow-y-auto"}`} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Add student</h2>
                    {!asPage && (
                        <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100" disabled={isLoading}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">
                    {/* --- Global Error Message (Optional, Swal handles the primary alert) --- */}
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            **Last Submission Error:** {error}
                        </div>
                    )}
                    
                    {/* ------------------------------------------------------------- */}
                    {/* Personal details */}
                    {/* ------------------------------------------------------------- */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                    required
                                />
                                <p className={`text-red-500 text-xs mt-1 ${formData.firstName ? 'hidden' : ''}`}>This field is required</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                                <input
                                    type="text"
                                    value={formData.surname}
                                    onChange={(e) => handleInputChange('surname', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                <div className="flex gap-4">
                                    {["Male", "Female", "Not specified"].map((option) => (
                                        <label key={option} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={option}
                                                checked={formData.gender === option}
                                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm text-gray-700">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration date *</label>
                                <input
                                    type="text"
                                    value={formData.registrationDate}
                                    onChange={(e) => handleInputChange('registrationDate', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                    required
                                />
                                <p className="text-gray-500 text-xs mt-1">dd-mm-yyyy</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
                                <input
                                    type="text"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                    placeholder="dd-mm-yyyy"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID number</label>
                                <input
                                    type="text"
                                    value={formData.idNumber}
                                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                                <p className="text-gray-500 text-xs mt-1">Please confirm ID after student has been created.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        id="photo"
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/jpg,image/png,image/gif"
                                        className="hidden"
                                    />
                                    <label htmlFor="photo" className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm cursor-pointer flex items-center">
                                        Choose file
                                    </label>
                                    <span className="text-sm text-gray-500">{formData.photo ? formData.photo.name : 'No file chosen'}</span>
                                </div>
                                <p className="text-gray-500 text-xs mt-1">Accepted file types: jpg, jpeg, png, gif</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred payment method</label>
                                <select
                                    value={formData.preferredPaymentMethod}
                                    onChange={(e) => handleInputChange('preferredPaymentMethod', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                >
                                    <option value="">select</option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={formData.discount}
                                        onChange={(e) => handleInputChange('discount', e.target.value)}
                                        className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                    />
                                    <span className="text-sm text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ------------------------------------------------------------- */}
                    {/* Contact details */}
                    {/* ------------------------------------------------------------- */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile phone</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                                        <span className="text-sm">🇮🇪</span>
                                        <span className="text-sm">+353</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={formData.mobilePhone}
                                        onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                                        className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Home phone</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                                        <span className="text-sm">🇮🇪</span>
                                        <span className="text-sm">+353</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={formData.homePhone}
                                        onChange={(e) => handleInputChange('homePhone', e.target.value)}
                                        className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email address (recommended)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street address</label>
                                <input
                                    type="text"
                                    value={formData.streetAddress}
                                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP/Post code</label>
                                <input
                                    type="text"
                                    value={formData.zipCode}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province/Region</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                                    <span className="text-sm">🇮🇪</span>
                                    <span className="text-sm">Ireland</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time zone and Country */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time zone</label>
                                <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                                    <span className="text-sm">Europe/London</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 bg-white">
                                    <span className="text-sm">🇮🇪</span>
                                    <span className="text-sm">Ireland</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Custom Fields (Course/Passport/Visa) */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Fields</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                                <input
                                    type="text"
                                    value={formData.nationality}
                                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                                <input
                                    type="text"
                                    value={formData.passportNumber}
                                    onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">GNIB Expiry Date</label>
                                <input
                                    type="text"
                                    value={formData.gnibExpiryDate}
                                    onChange={(e) => handleInputChange('gnibExpiryDate', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
                                <input
                                    type="text"
                                    value={formData.passportExpiryDate}
                                    onChange={(e) => handleInputChange('passportExpiryDate', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Finished Course Date</label>
                                <input
                                    type="text"
                                    value={formData.finishedCourseDate}
                                    onChange={(e) => handleInputChange('finishedCourseDate', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Start Date</label>
                                <input
                                    type="text"
                                    value={formData.courseStartDate}
                                    onChange={(e) => handleInputChange('courseStartDate', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Level</label>
                                <input
                                    type="text"
                                    value={formData.courseLevel}
                                    onChange={(e) => handleInputChange('courseLevel', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course End Date</label>
                                <input
                                    type="text"
                                    value={formData.courseEndDate}
                                    onChange={(e) => handleInputChange('courseEndDate', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hours Per Week</label>
                                <input
                                    type="text"
                                    value={formData.hoursPerWeek}
                                    onChange={(e) => handleInputChange('hoursPerWeek', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance</label>
                                <input
                                    type="text"
                                    value={formData.attendance}
                                    onChange={(e) => handleInputChange('attendance', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                                <input
                                    type="text"
                                    value={formData.courseCode}
                                    onChange={(e) => handleInputChange('courseCode', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                                <input
                                    type="text"
                                    value={formData.courseTitle}
                                    onChange={(e) => handleInputChange('courseTitle', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Study</label>
                                <input
                                    type="text"
                                    value={formData.modeOfStudy}
                                    onChange={(e) => handleInputChange('modeOfStudy', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Weeks</label>
                                <input
                                    type="text"
                                    value={formData.numberOfWeeks}
                                    onChange={(e) => handleInputChange('numberOfWeeks', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Fees</label>
                                <input
                                    type="text"
                                    value={formData.tuitionFees}
                                    onChange={(e) => handleInputChange('tuitionFees', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">External Exam</label>
                                <input
                                    type="text"
                                    value={formData.externalExam}
                                    onChange={(e) => handleInputChange('externalExam', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Course Code Section - Payment Details */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details & Payment Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Course Code, Course Level, External Exam are repeated in the original code, but kept for fidelity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of External Exam</label>
                                <input
                                    type="text"
                                    value={formData.externalExamDate}
                                    onChange={(e) => handleInputChange('externalExamDate', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Score External Exam</label>
                                <input
                                    type="text"
                                    value={formData.scoreExternalExam}
                                    onChange={(e) => handleInputChange('scoreExternalExam', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Payment</label>
                                <input
                                    type="text"
                                    value={formData.dateOfPayment}
                                    onChange={(e) => handleInputChange('dateOfPayment', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                <input
                                    type="text"
                                    value={formData.duration}
                                    onChange={(e) => handleInputChange('duration', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                                <input
                                    type="text"
                                    value={formData.schedule}
                                    onChange={(e) => handleInputChange('schedule', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ILEP reference number</label>
                                <select
                                    value={formData.ilepReference}
                                    onChange={(e) => handleInputChange('ilepReference', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                >
                                    <option value="">Select</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">End of Exam paid</label>
                                <input
                                    type="text"
                                    value={formData.endOfExamPaid}
                                    onChange={(e) => handleInputChange('endOfExamPaid', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Other details */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Other details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">General notes</label>
                                <textarea
                                    value={formData.generalNotes}
                                    onChange={(e) => handleInputChange('generalNotes', e.target.value)}
                                    className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medical notes</label>
                                <textarea
                                    value={formData.medicalNotes}
                                    onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
                                    className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Class options */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class options</h3>
                        <p className="text-sm text-gray-600 mb-4">If selected, this student can only be enrolled in these subjects or levels. Leaving it blank allows the student to be enrolled in any classes.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class subject</label>
                                <select
                                    value={formData.classSubject}
                                    onChange={(e) => handleInputChange('classSubject', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                >
                                    <option value="">Select</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class level</label>
                                <select
                                    value={formData.classLevel}
                                    onChange={(e) => handleInputChange('classLevel', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                >
                                    <option value="">Select</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Substitute lessons */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Substitute lessons</h3>
                        <p className="text-sm text-gray-600 mb-4">Allow substitute lessons, and set the number of substitute lessons per month and the start and end date for the substitute lessons. <span className="text-blue-600 cursor-pointer">Learn more</span></p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.allowSubstituteLessons}
                                    onChange={(e) => handleInputChange('allowSubstituteLessons', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">Allow substitute lessons</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Substitute lessons per month</label>
                                    <input
                                        type="text"
                                        value={formData.substituteLessonsPerMonth}
                                        onChange={(e) => handleInputChange('substituteLessonsPerMonth', e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                        disabled={!formData.allowSubstituteLessons}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
                                    <input
                                        type="text"
                                        value={formData.substituteStartDate}
                                        onChange={(e) => handleInputChange('substituteStartDate', e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                        placeholder="select..."
                                        disabled={!formData.allowSubstituteLessons}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
                                    <input
                                        type="text"
                                        value={formData.substituteEndDate}
                                        onChange={(e) => handleInputChange('substituteEndDate', e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm"
                                        placeholder="select..."
                                        disabled={!formData.allowSubstituteLessons}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enroll in classes */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enroll in classes</h3>
                        <p className="text-sm text-gray-600 mb-4">Enroll the student in a class</p>
                        <button type="button" className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm" disabled={isLoading}>
                            Select classes
                        </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            className={`h-10 px-4 rounded-xl border border-blue-200 text-sm ${addAndNewButton.className}`}
                            disabled={addAndNewButton.disabled}
                        >
                            {addAndNewButton.text}
                        </button>
                        <button
                            type="submit"
                            className={`h-10 px-4 rounded-xl text-white text-sm ${addStudentButton.className}`}
                            disabled={addStudentButton.disabled}
                        >
                            {addStudentButton.text}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}