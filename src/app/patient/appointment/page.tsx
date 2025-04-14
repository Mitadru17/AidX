'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast, { Toaster } from "react-hot-toast";
import { FaCalendarAlt, FaClock, FaArrowRight, FaArrowLeft, FaUserMd, FaClipboardList, FaNotesMedical, FaRegCheckCircle, FaStethoscope, FaComments, FaCalendarCheck, FaExclamationCircle, FaInfoCircle, FaListAlt, FaEnvelope, FaPrescriptionBottleAlt, FaAllergies, FaRegClock, FaRegCalendarAlt, FaSignOutAlt, FaCheckCircle, FaHospital } from "react-icons/fa";
import { addMonths, format } from 'date-fns';
import { FiArrowLeft, FiArrowRight, FiCalendar, FiClock, FiUser, FiInfo, FiMail } from "react-icons/fi";
import { IoArrowBack, IoCheckmarkOutline, IoCalendarOutline, IoHome, IoInformationCircleOutline, IoLogOutOutline, IoWarningOutline, IoCheckmarkCircleOutline, IoArrowForward } from "react-icons/io5";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

// Define interface for doctor
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  availability: string;
  image: string;
  rating: number;
  reviews: number;
}

// Interface for input field props
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  textarea?: boolean;
}

// Interface for action button props
interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  icon?: React.ReactNode;
}

// Interface for date card props
interface DateCardProps {
  date: string;
  day: string;
  active: boolean;
  onClick: () => void;
}

// Interface for time slot props
interface TimeSlotProps {
  time: string;
  active: boolean;
  onClick: () => void;
}

// Interface for step card props
interface StepCardProps {
  stepNumber: number;
  title: string;
  active: boolean;
  completed: boolean;
}

// Helper function to get appointment type description
const getAppointmentTypeDescription = (type: string): string => {
  switch(type) {
    case "General Checkup":
      return "Regular health assessment for preventive care";
    case "Specialist Consultation":
      return "See a specialist for specific health concerns";
    case "Follow-up":
      return "Follow up on a previous appointment or treatment";
    case "Urgent Care":
      return "Urgent care for immediate medical attention";
    default:
      return "";
  }
};

// Component for input fields
const InputField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  error, 
  textarea = false 
}: InputFieldProps) => (
  <div>
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        }`}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        }`}
      />
    )}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

// Component for action buttons
const ActionButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  loading = false,
  icon = null
}: ActionButtonProps) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`flex items-center justify-center px-6 py-3 rounded-md font-medium transition duration-300 ${
      loading ? "opacity-70 cursor-not-allowed" : ""
    } ${
      variant === "primary"
        ? "bg-blue-600 hover:bg-blue-700 text-white"
        : variant === "secondary"
        ? "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
        : ""
    }`}
  >
    {loading ? (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ) : icon ? (
      <span className="mr-2">{icon}</span>
    ) : null}
    {children}
  </button>
);

// Component for date selection cards
const DateCard = ({ date, day, active, onClick }: DateCardProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center p-3 rounded-lg border transition duration-200 ${
      active
        ? "bg-blue-100 border-blue-500 text-blue-700"
        : "bg-white border-gray-300 hover:bg-gray-50"
    }`}
  >
    <span className="text-xs font-medium mb-1">{day}</span>
    <span className="text-lg font-semibold">{date}</span>
  </button>
);

// Component for time selection
const TimeSlot = ({ time, active, onClick }: TimeSlotProps) => (
  <button
    onClick={onClick}
    className={`py-2 px-3 rounded-md border text-center transition duration-200 ${
      active
        ? "bg-blue-100 border-blue-500 text-blue-700"
        : "bg-white border-gray-300 hover:bg-gray-50"
    }`}
  >
    {time}
  </button>
);

// Component for progress steps
const StepCard = ({ stepNumber, title, active, completed }: StepCardProps) => (
  <div className="flex flex-col items-center">
    <div 
      className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 transition-colors ${
        completed 
          ? "bg-green-500 text-white" 
          : active 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-700"
      }`}
    >
      {completed ? (
        <IoCheckmarkOutline className="w-6 h-6" />
      ) : (
        stepNumber
      )}
    </div>
    <span className={`text-sm ${active ? "font-medium text-blue-800" : "text-gray-600"}`}>
      {title}
    </span>
  </div>
);

export default function BookAppointment() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentType, setAppointmentType] = useState("checkup");
  const [doctor, setDoctor] = useState("Dr. Smith");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [alternateDate, setAlternateDate] = useState("");
  const [alternateTime, setAlternateTime] = useState("");
  const [reason, setReason] = useState("");
  const [currentMeds, setCurrentMeds] = useState("");
  const [allergies, setAllergies] = useState("");
  const [sendReminder, setSendReminder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
  }, [isLoaded, user, router]);

  useEffect(() => {
    // Reset validation error when step changes or inputs are filled
    setValidationError("");
  }, [currentStep, selectedDate, selectedTime, reason]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (currentStep === 1 && !selectedDate) {
      setValidationError("Please select a date");
      return;
    }
    
    if (currentStep === 1 && !selectedTime) {
      setValidationError("Please select a time");
      return;
    }
    
    if (currentStep === 2 && !reason) {
      setValidationError("Please provide a reason for your visit");
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
      return;
    }
    
    // Final submission
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store appointment in local storage for demo purposes
      const appointment = {
        type: appointmentType,
        doctor,
        date: selectedDate,
        time: selectedTime,
        alternateDate,
        alternateTime,
        reason,
        currentMeds,
        allergies,
        sendReminder,
        patientName: user?.fullName || "Patient",
        patientEmail: user?.primaryEmailAddress?.emailAddress || "",
        createdAt: new Date().toISOString()
      };
      
      // Get existing appointments or initialize empty array
      const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
      
      // Add new appointment
      existingAppointments.push(appointment);
      
      // Save back to localStorage
      localStorage.setItem("appointments", JSON.stringify(existingAppointments));
      
      setBookingComplete(true);
      toast.success("Appointment booked successfully!");
      
    } catch (error) {
      toast.error("Failed to book appointment. Please try again.");
      console.error("Error booking appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Available time slots
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"
  ];

  // Available dates for next 7 days
  const getAvailableDates = () => {
    const dates = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      dates.push({
        date: `${date.getDate()} ${months[date.getMonth()]}`,
        dayName: days[date.getDay()],
        fullDate: date.toLocaleDateString()
      });
    }
    
    return dates;
  };

  const availableDates = getAvailableDates();
  
  // Available doctors
  const doctors = ["Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown"];
  
  // Appointment types
  const appointmentTypes = ["Checkup", "Follow-up", "Consultation", "Emergency", "Vaccination"];
  
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <nav className="py-4 px-6 flex justify-between items-center border-b backdrop-blur-sm bg-white/90 sticky top-0 z-50 transition-all duration-300 shadow-sm">
          <Link href="/" className="text-xl font-semibold transform transition-transform duration-300 hover:scale-105">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-black">AidX</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/find-us" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">
              Find us
            </Link>
            <Link href="/patient/dashboard" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">
              Main page
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-black text-white rounded-full transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
            >
              Logout
            </button>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center p-8 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg animate-fadeIn">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-3">Appointment Confirmed!</h2>
            <p className="text-green-700 mb-6">Your appointment has been scheduled successfully.</p>
            <div className="p-6 bg-white rounded-xl border border-green-100 mb-8 text-left shadow-md">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-gray-500 font-medium flex items-center">
                  <FaListAlt className="mr-2 text-green-600" /> Type:
                </div>
                <div className="font-medium">{appointmentType}</div>
                
                <div className="text-gray-500 font-medium flex items-center">
                  <FaUserMd className="mr-2 text-green-600" /> Doctor:
                </div>
                <div className="font-medium">{doctor}</div>
                
                <div className="text-gray-500 font-medium flex items-center">
                  <FaCalendarAlt className="mr-2 text-green-600" /> Date:
                </div>
                <div className="font-medium">{selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</div>
                
                <div className="text-gray-500 font-medium flex items-center">
                  <FaClock className="mr-2 text-green-600" /> Time:
                </div>
                <div className="font-medium">{selectedTime}</div>
                
                {reason && (
                  <>
                    <div className="text-gray-500 font-medium flex items-center">
                      <FaNotesMedical className="mr-2 text-green-600" /> Reason:
                    </div>
                    <div className="font-medium">{reason}</div>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center mt-6">
              <p className="text-sm text-gray-600 flex items-center">
                <FaEnvelope className="mr-2 text-gray-500" /> A confirmation email has been sent. You will receive a reminder 24 hours before your appointment.
              </p>
              <Link 
                href="/patient/dashboard" 
                className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-black text-white rounded-full transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </main>

        <footer className="mt-auto py-8 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-600">AidX Copyrights reserved 2025</p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="#" className="text-gray-600 hover:text-blue-800 transition-all duration-300 hover:-translate-y-1">Facebook</a>
              <a href="#" className="text-gray-600 hover:text-blue-800 transition-all duration-300 hover:-translate-y-1">LinkedIn</a>
              <a href="#" className="text-gray-600 hover:text-blue-800 transition-all duration-300 hover:-translate-y-1">YouTube</a>
              <a href="#" className="text-gray-600 hover:text-blue-800 transition-all duration-300 hover:-translate-y-1">Instagram</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button onClick={() => router.push("/patient/dashboard")} className="flex items-center hover:text-blue-200">
              <IoArrowBack className="mr-1" /> Back to Dashboard
            </button>
          </div>
          <div className="font-semibold text-lg">Book Appointment</div>
          <button onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition duration-300">
            <IoLogOutOutline className="inline-block mr-1" /> Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {!bookingComplete ? (
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                {['Select Date & Time', 'Additional Details', 'Confirm Booking'].map((step, index) => (
                  <StepCard 
                    key={index}
                    stepNumber={index + 1}
                    title={step}
                    active={currentStep === index + 1}
                    completed={currentStep > index + 1}
                  />
                ))}
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              {currentStep === 1 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Date & Time</h2>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-3">Appointment Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {appointmentTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setAppointmentType(type.toLowerCase())}
                          className={`py-2 px-4 rounded-md border transition duration-200 ${
                            appointmentType === type.toLowerCase()
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-3">Select Doctor</label>
                    <div className="grid grid-cols-2 gap-3">
                      {doctors.map(doc => (
                        <button
                          key={doc}
                          onClick={() => setDoctor(doc)}
                          className={`py-3 px-4 rounded-md border transition duration-200 flex items-center ${
                            doctor === doc
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <FaUserMd className="mr-2" />
                          {doc}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-3">Select Date</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                      {availableDates.map((date, index) => (
                        <DateCard
                          key={index}
                          date={date.date}
                          day={date.dayName}
                          active={selectedDate === date.fullDate}
                          onClick={() => setSelectedDate(date.fullDate)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {selectedDate && (
                    <div className="mb-6 animate-fadeIn">
                      <label className="block text-gray-700 font-medium mb-3">Select Time</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {timeSlots.map((time, index) => (
                          <TimeSlot
                            key={index}
                            time={time}
                            active={selectedTime === time}
                            onClick={() => setSelectedTime(time)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedTime && (
                    <div className="mb-2 animate-fadeIn">
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id="alternateTime"
                          checked={!!alternateDate || !!alternateTime}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              setAlternateDate("");
                              setAlternateTime("");
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <label htmlFor="alternateTime" className="ml-2 text-gray-700">
                          Add alternate date/time (if preferred slot is unavailable)
                        </label>
                      </div>
                      
                      {(!!alternateDate || !!alternateTime) && (
                        <div className="pl-6 border-l-2 border-blue-200 mt-4 space-y-4 animate-fadeIn">
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">Alternate Date</label>
                            <select 
                              value={alternateDate} 
                              onChange={(e) => setAlternateDate(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select a date</option>
                              {availableDates.map((date, index) => (
                                <option key={index} value={date.fullDate}>
                                  {date.dayName}, {date.date}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">Alternate Time</label>
                            <select 
                              value={alternateTime} 
                              onChange={(e) => setAlternateTime(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select a time</option>
                              {timeSlots.map((time, index) => (
                                <option key={index} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Additional Details</h2>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2">Appointment Summary</h3>
                    <ul className="text-gray-700 space-y-1">
                      <li><span className="font-medium">Type:</span> {appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1)}</li>
                      <li><span className="font-medium">Doctor:</span> {doctor}</li>
                      <li><span className="font-medium">Date:</span> {selectedDate}</li>
                      <li><span className="font-medium">Time:</span> {selectedTime}</li>
                      {alternateDate && alternateTime && (
                        <li><span className="font-medium">Alternate:</span> {alternateDate} at {alternateTime}</li>
                      )}
                    </ul>
                  </div>
                  
                  <form className="space-y-6">
                    <InputField
                      label="Reason for Visit*"
                      placeholder="Please describe your symptoms or reason for the appointment"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      error={validationError && !reason ? "Please provide a reason for your visit" : ""}
                      textarea
                    />
                    
                    <InputField
                      label="Current Medications (if any)"
                      placeholder="List any medications you are currently taking"
                      value={currentMeds}
                      onChange={(e) => setCurrentMeds(e.target.value)}
                      textarea
                      error=""
                    />
                    
                    <InputField
                      label="Allergies (if any)"
                      placeholder="List any known allergies"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      textarea
                      error=""
                    />
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sendReminder"
                        checked={sendReminder}
                        onChange={(e) => setSendReminder(e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="sendReminder" className="ml-2 text-gray-700">
                        Send me an email reminder 24 hours before the appointment
                      </label>
                    </div>
                  </form>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Confirm Your Appointment</h2>
                  
                  <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-100">
                    <h3 className="font-semibold text-blue-800 text-lg mb-4">Appointment Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Appointment Type</p>
                        <p className="font-medium">{appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Doctor</p>
                        <p className="font-medium">{doctor}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Date</p>
                        <p className="font-medium">{selectedDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Time</p>
                        <p className="font-medium">{selectedTime}</p>
                      </div>
                      {alternateDate && alternateTime && (
                        <div className="col-span-2">
                          <p className="text-gray-500 text-sm mb-1">Alternate Date/Time</p>
                          <p className="font-medium">{alternateDate} at {alternateTime}</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <p className="text-gray-500 text-sm mb-1">Reason for Visit</p>
                        <p className="font-medium">{reason}</p>
                      </div>
                      {currentMeds && (
                        <div className="col-span-2">
                          <p className="text-gray-500 text-sm mb-1">Current Medications</p>
                          <p className="font-medium">{currentMeds}</p>
                        </div>
                      )}
                      {allergies && (
                        <div className="col-span-2">
                          <p className="text-gray-500 text-sm mb-1">Allergies</p>
                          <p className="font-medium">{allergies}</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <p className="text-gray-500 text-sm mb-1">Email Reminder</p>
                        <p className="font-medium">{sendReminder ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-100">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <IoInformationCircleOutline className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Please Note</h3>
                        <div className="mt-1 text-sm text-yellow-700">
                          <p>By confirming this appointment, you agree to arrive 15 minutes before your scheduled time. A cancellation fee may apply if you cancel less than 24 hours before the appointment.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {validationError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <IoWarningOutline className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{validationError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <ActionButton 
                    onClick={goToPreviousStep}
                    variant="secondary"
                    icon={<IoArrowBack />}
                  >
                    Back
                  </ActionButton>
                ) : (
                  <div></div>
                )}
                
                <ActionButton 
                  onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)}
                  variant="primary"
                  loading={isSubmitting}
                  icon={currentStep === 3 ? <IoCheckmarkOutline /> : <IoArrowForward />}
                >
                  {currentStep === 3 ? "Confirm Booking" : "Continue"}
                </ActionButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <IoCheckmarkCircleOutline className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Scheduled!</h2>
              <p className="text-gray-600">Your appointment has been successfully booked.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-4">Appointment Details</h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{doctor}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedDate}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Reason:</span>
                  <span className="font-medium">{reason}</span>
                </li>
              </ul>
            </div>
            
            <p className="text-gray-600 mb-6">
              We've sent a confirmation email to your registered email address. You'll also receive a reminder 24 hours before your appointment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ActionButton 
                onClick={() => router.push("/patient/dashboard")}
                variant="primary"
                icon={<IoHome />}
              >
                Return to Dashboard
              </ActionButton>
              
              <ActionButton 
                onClick={() => {
                  setBookingComplete(false);
                  setCurrentStep(1);
                  setSelectedDate("");
                  setSelectedTime("");
                  setAlternateDate("");
                  setAlternateTime("");
                  setReason("");
                  setCurrentMeds("");
                  setAllergies("");
                  setSendReminder(true);
                }}
                variant="secondary"
                icon={<IoCalendarOutline />}
              >
                Book Another Appointment
              </ActionButton>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© 2023 AidX. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400 transition duration-300">
                <FaFacebook />
              </a>
              <a href="#" className="hover:text-blue-400 transition duration-300">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-blue-400 transition duration-300">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-blue-400 transition duration-300">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <Toaster position="top-right" />
    </div>
  );
} 