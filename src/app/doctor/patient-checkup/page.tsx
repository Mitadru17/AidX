'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FiUser, FiCalendar, FiMail, FiActivity, 
  FiFileText, FiClipboard, FiChevronRight, 
  FiChevronLeft, FiSave, FiPlus, FiCheck,
  FiThermometer, FiHeart, FiDroplet, FiWind, FiPercent,
  FiChevronDown
} from 'react-icons/fi';
import Image from 'next/image';

// In a real app, this would come from your API, connected to Clerk
const SAMPLE_CLERK_PATIENTS = [
  { id: 'user_2NYfKPR1zB1fTVGtA9mp2dGgFxZ', name: 'John Smith', email: 'john@example.com' },
  { id: 'user_2NYG3PWc9fuGhyt5dKP8cdFgHiR', name: 'Sarah Johnson', email: 'sarah@example.com' },
  { id: 'user_2NYH6QWr3Gyh8uU4eRQ9efGiJsQ', name: 'Miguel Rodriguez', email: 'miguel@example.com' },
  { id: 'user_2NYI9TYt7Hzj9vV5fSR0ghKjLtR', name: 'Aisha Patel', email: 'aisha@example.com' }
];

// Common diagnosis templates
const DIAGNOSIS_TEMPLATES = [
  { label: 'Common Cold', value: 'Acute viral nasopharyngitis with mild congestion and sore throat.' },
  { label: 'Hypertension', value: 'Essential hypertension with BP readings consistently above normal range.' },
  { label: 'Type 2 Diabetes', value: 'Type 2 diabetes mellitus with suboptimal glycemic control.' },
  { label: 'Anxiety', value: 'Generalized anxiety disorder with somatic symptoms and sleep disturbances.' }
];

// Common treatment templates
const TREATMENT_TEMPLATES = [
  { label: 'Cold/Flu', value: 'Acetaminophen 500mg every 6 hours for fever/pain as needed. Increase fluid intake. Rest for 2-3 days. Return if symptoms worsen or persist beyond 5 days.' },
  { label: 'Hypertension', value: 'Lisinopril 10mg daily. Low sodium diet. 30 minutes exercise 5 days/week. Monitor BP at home. Follow up in 4 weeks.' },
  { label: 'Antibiotics', value: 'Amoxicillin 500mg three times daily for 7 days. Take with food. Complete entire course even if feeling better.' },
  { label: 'Pain Management', value: 'Ibuprofen 400mg every 6 hours as needed with food. Ice affected area 20 minutes 3 times daily. Avoid strenuous activity for 5 days.' }
];

export default function PatientCheckup() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step navigation
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form states
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [date, setDate] = useState('');
  const [useCustomId, setUseCustomId] = useState(false);
  const [customPatientId, setCustomPatientId] = useState('');
  const [recordType, setRecordType] = useState('Routine Checkup');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [vitals, setVitals] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
  });
  const [medication, setMedication] = useState('');
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [patients, setPatients] = useState(SAMPLE_CLERK_PATIENTS);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [showTemplates, setShowTemplates] = useState({ diagnosis: false, treatment: false });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    
    // Set current date
    const today = new Date();
    setDate(today.toISOString().split('T')[0]);
    setMounted(true);
    
    // In a real app, you would fetch actual patients from your database
    // Example API call (commented out as this is just a demo):
    /*
    const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
        const response = await fetch('/api/patients');
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients list');
      } finally {
        setIsLoadingPatients(false);
      }
    };
    
    fetchPatients();
    */
  }, [isLoaded, user, router]);

  const handleVitalChange = (field: keyof typeof vitals, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName || !recordType) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create record object
      const recordData = {
        patientName,
        patientEmail,
        doctorId: user?.id,
        doctorName: `Dr. ${user?.firstName} ${user?.lastName}`,
        date,
        recordType,
        symptoms,
        diagnosis,
        vitals,
        medication,
        notes,
        followUp,
        createdAt: new Date().toISOString(),
        id: Date.now().toString() // Generate a unique ID for the record
      };
      
      // In a real app, this would be an API call to save the record
      // Here we'll save to localStorage to simulate the functionality
      const existingRecords = localStorage.getItem('patientRecords') || '[]';
      const parsedRecords = JSON.parse(existingRecords);
      parsedRecords.push(recordData);
      localStorage.setItem('patientRecords', JSON.stringify(parsedRecords));
      
      // Add a notification for the patient
      const notification = {
        id: Date.now().toString(),
        type: 'appointment_notes',
        message: `Dr. ${user?.firstName} ${user?.lastName} has added a new medical record for you.`,
        date: new Date().toISOString(),
        read: false
      };
      
      const existingNotifications = localStorage.getItem('patientNotifications') || '[]';
      const parsedNotifications = JSON.parse(existingNotifications);
      parsedNotifications.push(notification);
      localStorage.setItem('patientNotifications', JSON.stringify(parsedNotifications));
      
      toast.success('Patient record saved successfully');
      
      // Reset form (except patient details for consecutive entries)
      setRecordType('Routine Checkup');
      setSymptoms('');
      setDiagnosis('');
      setVitals({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: '',
      });
      setMedication('');
      setNotes('');
      setFollowUp('');
      setCurrentStep(1);
      
    } catch (error) {
      console.error('Error saving patient record:', error);
      toast.error('Failed to save patient record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Basic validation before proceeding
    if (currentStep === 1 && !patientName) {
      toast.error('Please enter patient name before continuing');
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getVitalColor = (field: string, value: string) => {
    if (!value) return 'bg-gray-100';
    
    switch (field) {
      case 'temperature':
        const temp = parseFloat(value);
        if (temp < 35) return 'bg-blue-100 text-blue-800';
        if (temp > 38) return 'bg-red-100 text-red-800';
        return 'bg-green-100 text-green-800';
      
      case 'bloodPressure':
        const [systolic, diastolic] = value.split('/').map(Number);
        if (systolic > 140 || diastolic > 90) return 'bg-red-100 text-red-800';
        if (systolic < 90 || diastolic < 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
      
      case 'heartRate':
        const hr = parseInt(value);
        if (hr > 100) return 'bg-red-100 text-red-800';
        if (hr < 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
      
      case 'respiratoryRate':
        const rr = parseInt(value);
        if (rr > 20) return 'bg-red-100 text-red-800';
        if (rr < 12) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
      
      case 'oxygenSaturation':
        const o2 = parseInt(value);
        if (o2 < 92) return 'bg-red-100 text-red-800';
        if (o2 < 95) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
      
      default:
        return 'bg-gray-100';
    }
  };

  const applyTemplate = (type: 'diagnosis' | 'treatment', value: string) => {
    if (type === 'diagnosis') {
      setDiagnosis(value);
      setShowTemplates({ ...showTemplates, diagnosis: false });
    } else {
      setMedication(value);
      setShowTemplates({ ...showTemplates, treatment: false });
    }
    toast.success(`Template applied successfully`);
  };

  if (!isLoaded || !user) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center border-b backdrop-blur-sm bg-white shadow-sm sticky top-0 z-50 transition-all duration-300">
        <Link href="/" className="text-xl font-semibold transform transition-transform duration-300 hover:scale-105">
          AidX
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/doctor/dashboard" 
            className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1"
          >
            Dashboard
          </Link>
          <button
            onClick={() => router.push('/doctor/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn" style={{ animationDuration: '0.5s' }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-blue-600 p-4 inline-block mr-6 rounded-xl shadow-md">
              <FiClipboard size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Patient Checkup</h1>
              <p className="text-gray-600">Document patient assessment and treatment plan</p>
            </div>
          </div>
          
          {user && (
            <div className="text-right">
              <div className="text-sm font-medium">{`Dr. ${user.firstName} ${user.lastName}`}</div>
              <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index}
                className={`relative flex-1 ${index < totalSteps - 1 ? 'after:content-[""] after:h-1 after:w-full after:absolute after:top-4 after:-right-4 after:z-0' : ''} ${
                  index < currentStep 
                    ? 'after:bg-blue-600' 
                    : 'after:bg-gray-200'
                }`}
              >
                <div 
                  className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm ${
                    index + 1 === currentStep 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : index + 1 < currentStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1 < currentStep ? <FiCheck size={16} /> : index + 1}
                </div>
                <div className={`mt-2 text-xs font-medium ${index + 1 === currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                  {index === 0 ? 'Patient Info' : index === 1 ? 'Clinical Assessment' : 'Treatment Plan'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Step 1: Patient Information */}
          {currentStep === 1 && (
            <div className="p-6 animate-fadeIn" style={{ animationDuration: '0.3s' }}>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <FiUser className="mr-2 text-blue-600" />
                Patient Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Enter the patient's full name
                  </div>
                </div>
                
                <div>
                  <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      id="patientEmail"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="patient@example.com"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Optional: used for patient notifications
                  </div>
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="recordType" className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Type *
                  </label>
                  <div className="relative">
                    <FiActivity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      id="recordType"
                      value={recordType}
                      onChange={(e) => setRecordType(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white pr-10"
                      required
                    >
                      <option value="Routine Checkup">Routine Checkup</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Specialist Consultation">Specialist Consultation</option>
                      <option value="Vaccination">Vaccination</option>
                      <option value="Lab Results">Lab Results</option>
                      <option value="Surgery">Surgery</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FiChevronDown className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Clinical Assessment */}
          {currentStep === 2 && (
            <div className="p-6 animate-fadeIn" style={{ animationDuration: '0.3s' }}>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <FiActivity className="mr-2 text-blue-600" />
                Clinical Assessment
              </h2>
              
              <div className="mb-6">
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Symptoms & Complaints
                </label>
                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter patient symptoms and complaints"
                />
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <FiActivity className="mr-2 text-blue-600" />
                  Vital Signs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="temperature" className="block text-sm text-gray-700 mb-1 flex items-center">
                      <FiThermometer className="mr-1 text-blue-600" size={16} />
                      Temperature (°C)
                    </label>
                    <input
                      type="text"
                      id="temperature"
                      value={vitals.temperature}
                      onChange={(e) => handleVitalChange('temperature', e.target.value)}
                      className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${getVitalColor('temperature', vitals.temperature)}`}
                      placeholder="36.5"
                    />
                    {vitals.temperature && (
                      <div className="mt-1 text-xs font-medium">
                        {parseFloat(vitals.temperature) > 38 ? 'Elevated' : 
                         parseFloat(vitals.temperature) < 35 ? 'Low' : 'Normal'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="bloodPressure" className="block text-sm text-gray-700 mb-1 flex items-center">
                      <FiDroplet className="mr-1 text-blue-600" size={16} />
                      Blood Pressure (mmHg)
                    </label>
                    <input
                      type="text"
                      id="bloodPressure"
                      value={vitals.bloodPressure}
                      onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                      className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${getVitalColor('bloodPressure', vitals.bloodPressure)}`}
                      placeholder="120/80"
                    />
                    {vitals.bloodPressure && (
                      <div className="mt-1 text-xs font-medium">
                        {(() => {
                          const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
                          if (systolic > 140 || diastolic > 90) return 'Hypertension';
                          if (systolic < 90 || diastolic < 60) return 'Hypotension';
                          return 'Normal';
                        })()}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="heartRate" className="block text-sm text-gray-700 mb-1 flex items-center">
                      <FiHeart className="mr-1 text-blue-600" size={16} />
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="text"
                      id="heartRate"
                      value={vitals.heartRate}
                      onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                      className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${getVitalColor('heartRate', vitals.heartRate)}`}
                      placeholder="72"
                    />
                    {vitals.heartRate && (
                      <div className="mt-1 text-xs font-medium">
                        {parseInt(vitals.heartRate) > 100 ? 'Tachycardia' : 
                         parseInt(vitals.heartRate) < 60 ? 'Bradycardia' : 'Normal'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="respiratoryRate" className="block text-sm text-gray-700 mb-1 flex items-center">
                      <FiWind className="mr-1 text-blue-600" size={16} />
                      Respiratory Rate (bpm)
                    </label>
                    <input
                      type="text"
                      id="respiratoryRate"
                      value={vitals.respiratoryRate}
                      onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
                      className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${getVitalColor('respiratoryRate', vitals.respiratoryRate)}`}
                      placeholder="16"
                    />
                    {vitals.respiratoryRate && (
                      <div className="mt-1 text-xs font-medium">
                        {parseInt(vitals.respiratoryRate) > 20 ? 'Elevated' : 
                         parseInt(vitals.respiratoryRate) < 12 ? 'Low' : 'Normal'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="oxygenSaturation" className="block text-sm text-gray-700 mb-1 flex items-center">
                      <FiPercent className="mr-1 text-blue-600" size={16} />
                      Oxygen Saturation (%)
                    </label>
                    <input
                      type="text"
                      id="oxygenSaturation"
                      value={vitals.oxygenSaturation}
                      onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                      className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${getVitalColor('oxygenSaturation', vitals.oxygenSaturation)}`}
                      placeholder="98"
                    />
                    {vitals.oxygenSaturation && (
                      <div className="mt-1 text-xs font-medium">
                        {parseInt(vitals.oxygenSaturation) < 92 ? 'Low' : 
                         parseInt(vitals.oxygenSaturation) < 95 ? 'Borderline' : 'Normal'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
                    Diagnosis
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowTemplates({...showTemplates, diagnosis: !showTemplates.diagnosis})}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FiPlus size={12} className="mr-1" />
                    {showTemplates.diagnosis ? 'Hide Templates' : 'Use Template'}
                  </button>
                </div>
                {showTemplates.diagnosis && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {DIAGNOSIS_TEMPLATES.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => applyTemplate('diagnosis', template.value)}
                        className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700 hover:bg-blue-100"
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter diagnosis"
                />
              </div>
            </div>
          )}

          {/* Step 3: Treatment Plan */}
          {currentStep === 3 && (
            <div className="p-6 animate-fadeIn" style={{ animationDuration: '0.3s' }}>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <FiFileText className="mr-2 text-blue-600" />
                Treatment Plan
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="medication" className="block text-sm font-medium text-gray-700">
                    Medication & Prescription
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowTemplates({...showTemplates, treatment: !showTemplates.treatment})}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FiPlus size={12} className="mr-1" />
                    {showTemplates.treatment ? 'Hide Templates' : 'Use Template'}
                  </button>
                </div>
                {showTemplates.treatment && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {TREATMENT_TEMPLATES.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => applyTemplate('treatment', template.value)}
                        className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700 hover:bg-blue-100"
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  id="medication"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter medication and dosage instructions"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes & Recommendations
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter additional notes and recommendations"
                />
              </div>
              
              <div>
                <label htmlFor="followUp" className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Plan
                </label>
                <textarea
                  id="followUp"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter follow-up instructions"
                />
              </div>
            </div>
          )}

          {/* Navigation and Submit Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 flex items-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiChevronLeft className="mr-2" />
                Previous
              </button>
            ) : (
              <div></div>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 flex items-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <FiChevronRight className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 flex items-center text-white rounded-lg transition-colors ${
                  isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <FiSave className="mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Record'}
              </button>
            )}
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-600">AidX Copyrights reserved 2025</p>
        </div>
      </footer>
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
} 