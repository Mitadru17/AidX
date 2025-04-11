'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// In a real app, this would come from your API, connected to Clerk
const SAMPLE_CLERK_PATIENTS = [
  { id: 'user_2NYfKPR1zB1fTVGtA9mp2dGgFxZ', name: 'John Smith', email: 'john@example.com' },
  { id: 'user_2NYG3PWc9fuGhyt5dKP8cdFgHiR', name: 'Sarah Johnson', email: 'sarah@example.com' },
  { id: 'user_2NYH6QWr3Gyh8uU4eRQ9efGiJsQ', name: 'Miguel Rodriguez', email: 'miguel@example.com' },
  { id: 'user_2NYI9TYt7Hzj9vV5fSR0ghKjLtR', name: 'Aisha Patel', email: 'aisha@example.com' }
];

export default function PatientCheckup() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      
    } catch (error) {
      console.error('Error saving patient record:', error);
      toast.error('Failed to save patient record');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || !user) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center border-b backdrop-blur-sm bg-white/80 sticky top-0 z-50 transition-all duration-300">
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
            className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn" style={{ animationDuration: '0.5s' }}>
        <div className="flex items-center justify-center mb-8">
          <div className="bg-black p-6 inline-block mr-6 rounded-2xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Patient Checkup Notes</h1>
            <p className="text-gray-600">Enter patient details and symptoms during checkup</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Information Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Full name"
                  required
                />
                <div className="mt-2 text-xs text-gray-500 italic">
                  Enter the patient's full name
                </div>
              </div>
              
              <div>
                <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Email
                </label>
                <input
                  type="email"
                  id="patientEmail"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="patient@example.com"
                />
                <div className="mt-2 text-xs text-gray-500 italic">
                  Optional: used for patient notifications
                </div>
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="recordType" className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Type *
                </label>
                <select
                  id="recordType"
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
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
              </div>
            </div>
          </div>

          {/* Clinical Assessment Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Clinical Assessment</h2>
            
            <div className="mb-6">
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                Patient Symptoms & Complaints
              </label>
              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter patient symptoms and complaints"
              />
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Vital Signs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="temperature" className="block text-sm text-gray-700 mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="text"
                    id="temperature"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalChange('temperature', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="36.5"
                  />
                </div>
                
                <div>
                  <label htmlFor="bloodPressure" className="block text-sm text-gray-700 mb-1">
                    Blood Pressure (mmHg)
                  </label>
                  <input
                    type="text"
                    id="bloodPressure"
                    value={vitals.bloodPressure}
                    onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="120/80"
                  />
                </div>
                
                <div>
                  <label htmlFor="heartRate" className="block text-sm text-gray-700 mb-1">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="text"
                    id="heartRate"
                    value={vitals.heartRate}
                    onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="72"
                  />
                </div>
                
                <div>
                  <label htmlFor="respiratoryRate" className="block text-sm text-gray-700 mb-1">
                    Respiratory Rate (bpm)
                  </label>
                  <input
                    type="text"
                    id="respiratoryRate"
                    value={vitals.respiratoryRate}
                    onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="16"
                  />
                </div>
                
                <div>
                  <label htmlFor="oxygenSaturation" className="block text-sm text-gray-700 mb-1">
                    Oxygen Saturation (%)
                  </label>
                  <input
                    type="text"
                    id="oxygenSaturation"
                    value={vitals.oxygenSaturation}
                    onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="98"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis
              </label>
              <textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter diagnosis"
              />
            </div>
          </div>

          {/* Treatment Plan Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Treatment Plan</h2>
            
            <div className="mb-6">
              <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
                Medication & Prescription
              </label>
              <textarea
                id="medication"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter follow-up instructions"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg active:translate-y-0 
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">AidX Copyrights reserved 2025</p>
        </div>
      </footer>
    </div>
  );
} 