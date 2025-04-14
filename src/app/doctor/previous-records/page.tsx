'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  email?: string;
  phone?: string;
}

interface Record {
  id: string;
  patientId: string;
  patientName?: string;
  date: string;
  recordType: string;
  doctor?: string;
  symptoms?: string;
  diagnosis?: string;
  medication?: string;
  notes?: string;
  followUp?: string;
  isPatientCreated?: boolean;
  userId?: string;
  vitals?: {
    temperature?: string;
    bloodPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
  };
}

interface MedicationLog {
  id: string;
  patientId?: string;
  userId?: string;
  patientName?: string;
  medication: string;
  medicine?: string;
  reason?: string;
  date?: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  reminderTime?: string;
  isActive?: boolean;
}

export default function DoctorPreviousRecords() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [records, setRecords] = useState<Record[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('records');
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearType, setClearType] = useState<'all' | 'filtered' | 'selected' | 'all-medications' | 'filtered-medications'>('all');

  // Generate sample patient data for demonstration
  const generateSamplePatients = (): Patient[] => {
    return [
      { id: 'pat_1', name: 'John Doe', age: 45, gender: 'Male' },
      { id: 'pat_2', name: 'Jane Smith', age: 32, gender: 'Female' },
      { id: 'pat_3', name: 'Mike Johnson', age: 58, gender: 'Male' },
      { id: 'pat_4', name: 'Sara Wilson', age: 29, gender: 'Female' },
      { id: 'pat_5', name: 'Robert Brown', age: 41, gender: 'Male' },
      { id: 'pat_6', name: 'Emily Davis', age: 36, gender: 'Female' },
    ];
  };

  // Generate sample records with patient information
  const generateAllRecords = (patientsList: Patient[]): Record[] => {
    let allRecords: Record[] = [];
    
    patientsList.forEach(patient => {
      // Generate 1-3 records per patient
      const recordCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < recordCount; i++) {
        const recordDate = new Date();
        recordDate.setDate(recordDate.getDate() - Math.floor(Math.random() * 60)); // Random date in last 60 days
        
        allRecords.push({
          id: `rec_${patient.id}_${i}`,
          patientId: patient.id,
          patientName: patient.name,
          date: recordDate.toISOString().split('T')[0],
          recordType: ['Annual Checkup', 'Follow-up', 'Emergency', 'Consultation'][Math.floor(Math.random() * 4)],
          doctor: 'Dr. Neha',
          symptoms: ['Fever', 'Cough', 'Headache', 'Fatigue', 'Routine checkup'][Math.floor(Math.random() * 5)],
          diagnosis: ['Common Cold', 'Influenza', 'Migraine', 'Healthy', 'Hypertension'][Math.floor(Math.random() * 5)],
          vitals: {
            temperature: (36 + Math.random() * 2).toFixed(1),
            bloodPressure: `${110 + Math.floor(Math.random() * 30)}/${70 + Math.floor(Math.random() * 20)}`,
            heartRate: (60 + Math.floor(Math.random() * 40)).toString(),
            respiratoryRate: (12 + Math.floor(Math.random() * 8)).toString(),
            oxygenSaturation: (94 + Math.floor(Math.random() * 6)).toString(),
          },
          medication: ['Paracetamol 500mg', 'Amoxicillin 250mg', 'No medications prescribed', 'Ibuprofen 400mg'][Math.floor(Math.random() * 4)],
          notes: 'Patient was examined and appropriate treatment was prescribed.',
          followUp: ['In 2 weeks', 'In 1 month', 'Not required', 'Annual'][Math.floor(Math.random() * 4)],
          isPatientCreated: false
        });
      }
    });
    
    // Sort by date (most recent first)
    return allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    
    // Load or generate patient records
    if (isLoaded && user) {
      const loadRecords = () => {
        try {
          // Check if we have stored records in localStorage
          const storedRecords = localStorage.getItem('doctorPatientRecords');
          const storedPatients = localStorage.getItem('doctorPatients');
          
          // Get any patient-created records
          const patientRecords = localStorage.getItem('patientRecords');
          const patientDailyLogs = localStorage.getItem('patientDailyLogs');
          const patientMedicineLogs = localStorage.getItem('patientMedicineLogs');
          
          let allRecords: Record[] = [];
          let patientsList: Patient[] = [];
          let medicineLogs: MedicationLog[] = [];
          
          if (storedRecords && storedPatients) {
            patientsList = JSON.parse(storedPatients);
            allRecords = JSON.parse(storedRecords);
          } else {
            // Generate sample data for demonstration
            patientsList = generateSamplePatients();
            allRecords = generateAllRecords(patientsList);
          }
          
          // Log what users we have stored
          console.log('Current patient list before adding Mitadru:', patientsList.map(p => p.name).join(', '));
          
          // Add Mitadru as a patient if not already in the list
          const mitadruExists = patientsList.some((p: any) => 
            p.name === 'Mitadru' || 
            p.name === 'mitadru' || 
            (p.name && p.name.toLowerCase().includes('mitadru'))
          );
          
          if (!mitadruExists) {
            console.log('Adding Mitadru to patient list');
            patientsList.push({
              id: 'usr_mitadru',
              name: 'Mitadru',
              age: 30,
              gender: 'Male'
            });
          }
          
          // Merge in any patient-created records if they exist
          if (patientRecords) {
            try {
              const parsedPatientRecords = JSON.parse(patientRecords);
              console.log('Found patient records:', parsedPatientRecords.length);
              
              // Add patient name if not present
              const recordsWithPatientName = parsedPatientRecords.map((record: any) => {
                console.log('Processing record:', record.id, 'Patient name:', record.patientName, 'Patient ID:', record.patientId, 'User ID:', record.userId);
                
                if (!record.patientName || record.patientName.trim() === '') {
                  // Try to find matching patient by ID
                  const patient = patientsList.find((p: any) => 
                    p.id === record.patientId || 
                    p.id === record.userId
                  );
                  
                  if (patient) {
                    console.log(`Found matching patient by ID: ${patient.name}`);
                    return { ...record, patientName: patient.name };
                  }
                  
                  // Default to Mitadru
                  console.log('No matching patient found, defaulting to Mitadru');
                  return { ...record, patientName: 'Mitadru' };
                }
                return record;
              });
              
              // Add these to our records array
              allRecords = [...allRecords, ...recordsWithPatientName];
            } catch (e) {
              console.error('Error parsing patient records:', e);
            }
          }
          
          // Merge in any patient daily logs if they exist
          if (patientDailyLogs) {
            try {
              const parsedDailyLogs = JSON.parse(patientDailyLogs);
              
              // Format daily logs as medical records
              const logsAsRecords = parsedDailyLogs.map((log: any) => {
                let patientName = log.patientName;
                
                // Fix missing patient name
                if (!patientName || patientName.trim() === '') {
                  const patient = patientsList.find((p: any) => p.id === log.patientId || p.id === log.userId);
                  if (patient) {
                    patientName = patient.name;
                  } else {
                    patientName = 'Mitadru'; // Default to Mitadru if no name found
                  }
                }
                
                return {
                  id: `log_${log.id}`,
                  patientId: log.patientId || log.userId || 'unknown',
                  patientName: patientName,
                  date: log.date,
                  recordType: 'Daily Health Log',
                  doctor: 'Self-reported',
                  symptoms: log.symptoms || 'Not specified',
                  diagnosis: 'Self-assessment',
                  medication: log.medicationTaken ? log.medicationTaken.join(', ') : 'None reported',
                  notes: log.notes || 'No additional notes',
                  followUp: 'Not specified',
                  isPatientCreated: true
                };
              });
              
              // Add these to our records array
              allRecords = [...allRecords, ...logsAsRecords];
            } catch (e) {
              console.error('Error parsing patient daily logs:', e);
            }
          }
          
          // Load medication logs if they exist
          if (patientMedicineLogs) {
            try {
              const parsedMedicineLogs = JSON.parse(patientMedicineLogs);
              
              // Ensure each medicine log has a patient name
              medicineLogs = parsedMedicineLogs.map((log: any) => {
                let patientName = log.patientName;
                
                // Fix missing patient name
                if (!patientName || patientName.trim() === '') {
                  const patient = patientsList.find((p: any) => p.id === log.patientId || p.id === log.userId);
                  if (patient) {
                    patientName = patient.name;
                  } else {
                    patientName = 'Mitadru'; // Default to Mitadru if no name found
                  }
                }
                
                return {
                  ...log,
                  patientName: patientName
                };
              });
              
              setMedicationLogs(medicineLogs);
            } catch (e) {
              console.error('Error parsing medicine logs:', e);
            }
          }
          
          // Sort by date (most recent first)
          allRecords = allRecords.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setPatients(patientsList);
          setRecords(allRecords);
          
          // Store the merged data
          localStorage.setItem('doctorPatients', JSON.stringify(patientsList));
          localStorage.setItem('doctorPatientRecords', JSON.stringify(allRecords));
        } catch (error) {
          console.error('Error loading records:', error);
          toast.error('Failed to load patient records');
        } finally {
          setLoading(false);
        }
      };
      
      loadRecords();
    }
    
    setMounted(true);
  }, [isLoaded, user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const openRecordDetails = (record: any) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  // Filter records based on search and patient filter
  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      record.patientName?.toLowerCase().includes(searchLower) ||
      record.recordType?.toLowerCase().includes(searchLower) ||
      record.symptoms?.toLowerCase().includes(searchLower) ||
      record.diagnosis?.toLowerCase().includes(searchLower) ||
      record.medication?.toLowerCase().includes(searchLower) ||
      record.date?.toLowerCase().includes(searchLower);
    
    const matchesPatient = !patientFilter || record.patientId === patientFilter;
    
    return matchesSearch && matchesPatient;
  });
  
  // Filter medication logs based on search and patient filter
  const filteredMedicationLogs = medicationLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      log.patientName?.toLowerCase().includes(searchLower) ||
      log.medicine?.toLowerCase().includes(searchLower) ||
      log.reason?.toLowerCase().includes(searchLower) ||
      log.date?.toLowerCase().includes(searchLower);
    
    const matchesPatient = !patientFilter || log.patientId === patientFilter || log.userId === patientFilter;
    
    return matchesSearch && matchesPatient;
  });

  const handleClearRecords = (type: 'all' | 'filtered' | 'selected' | 'all-medications' | 'filtered-medications') => {
    setClearType(type);
    setShowClearModal(true);
  };

  const handleClearMedications = () => {
    try {
      if (clearType === 'all-medications') {
        // Directly clear all from localStorage first
        localStorage.removeItem('patientMedicineLogs');
        // Update state to empty array
        setMedicationLogs([]);
        toast.success('All medication logs have been cleared');
      } else if (clearType === 'filtered-medications') {
        // Get current logs from localStorage to ensure we're not out of sync
        const currentLogsJSON = localStorage.getItem('patientMedicineLogs');
        let currentLogs: MedicationLog[] = [];
        
        if (currentLogsJSON) {
          try {
            currentLogs = JSON.parse(currentLogsJSON);
          } catch (e) {
            console.error('Error parsing logs from localStorage:', e);
            // Continue with empty array if parsing fails
          }
        }
        
        // Filter out the logs that match the current filtered logs
        const filterIds = new Set(filteredMedicationLogs.map(log => log.id));
        const logsToKeep = currentLogs.filter((log: MedicationLog) => !filterIds.has(log.id));
        
        // Save back to localStorage
        localStorage.setItem('patientMedicineLogs', JSON.stringify(logsToKeep));
        
        // Update component state
        setMedicationLogs(logsToKeep);
        
        toast.success(`${filteredMedicationLogs.length} filtered medication logs have been cleared`);
      }
      
      setShowClearModal(false);
    } catch (error) {
      console.error('Error clearing medication logs:', error);
      toast.error('Failed to clear medication logs. Please try again.');
    }
  };

  const confirmClearRecords = () => {
    try {
      if (clearType === 'all') {
        // Clear all records from localStorage
        localStorage.removeItem('doctorPatientRecords');
        setRecords([]);
        toast.success('All patient records have been cleared');
      } else if (clearType === 'filtered') {
        // Clear only the currently filtered records
        const recordsToKeep = records.filter(record => !filteredRecords.some(fr => fr.id === record.id));
        localStorage.setItem('doctorPatientRecords', JSON.stringify(recordsToKeep));
        setRecords(recordsToKeep);
        toast.success(`${filteredRecords.length} filtered records have been cleared`);
      } else if (clearType.includes('medications')) {
        // Use the special medication clearing function
        handleClearMedications();
        return; // Return early since handleClearMedications will close the modal
      }
      
      setShowClearModal(false);
    } catch (error) {
      console.error('Error clearing records:', error);
      toast.error('Failed to clear records. Please try again.');
    }
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
            onClick={handleSignOut}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Patient Records</h1>
            <p className="text-gray-600">Access and manage all patient medical history</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
            {activeTab === 'records' && (
              <>
                <Link 
                  href="/doctor/patient-checkup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center transition-all hover:bg-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Record
                </Link>
                <button
                  onClick={() => handleClearRecords(filteredRecords.length < records.length ? 'filtered' : 'all')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center transition-all hover:bg-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {filteredRecords.length < records.length && searchTerm ? 'Clear Filtered Records' : 'Clear All Records'}
                </button>
              </>
            )}
            {activeTab === 'medications' && (
              <button
                onClick={() => handleClearRecords(filteredMedicationLogs.length < medicationLogs.length ? 'filtered-medications' : 'all-medications')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center transition-all hover:bg-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {filteredMedicationLogs.length < medicationLogs.length && searchTerm ? 'Clear Filtered Medications' : 'Clear All Medications'}
              </button>
            )}
          </div>
        </div>
        
        {/* Summary Dashboard - Only visible on records tab */}
        {activeTab === 'records' && !loading && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{records.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{patients.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Recent Records</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {records.filter(r => new Date(r.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">In the last 30 days</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Record Types</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {new Set(records.map(r => r.recordType)).size}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="mb-6 flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                activeTab === 'records' 
                  ? 'bg-white shadow-sm text-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Medical Records
            </button>
            <button
              onClick={() => setActiveTab('medications')}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                activeTab === 'medications' 
                  ? 'bg-white shadow-sm text-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Medications & Health Logs
            </button>
          </div>
        </div>
        
        {/* Enhanced Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by patient name, diagnosis, or symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="w-full md:w-1/3 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <select
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
              >
                <option value="">All Patients</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {activeTab === 'records' && (
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="text-sm text-gray-600 self-center mr-2">Filter by type:</div>
              <button 
                onClick={() => setSearchTerm(searchTerm.includes('Checkup') ? searchTerm.replace('Checkup', '').trim() : (searchTerm + ' Checkup').trim())}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  searchTerm.includes('Checkup') 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                Checkup
              </button>
              <button 
                onClick={() => setSearchTerm(searchTerm.includes('Follow-up') ? searchTerm.replace('Follow-up', '').trim() : (searchTerm + ' Follow-up').trim())}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  searchTerm.includes('Follow-up') 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                Follow-up
              </button>
              <button 
                onClick={() => setSearchTerm(searchTerm.includes('Emergency') ? searchTerm.replace('Emergency', '').trim() : (searchTerm + ' Emergency').trim())}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  searchTerm.includes('Emergency') 
                    ? 'bg-red-100 text-red-800 border border-red-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                Emergency
              </button>
              <button 
                onClick={() => setSearchTerm(searchTerm.includes('Consultation') ? searchTerm.replace('Consultation', '').trim() : (searchTerm + ' Consultation').trim())}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  searchTerm.includes('Consultation') 
                    ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                Consultation
              </button>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-1 text-xs text-gray-700 hover:text-gray-900 flex items-center ml-auto"
                >
                  Clear filters
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          activeTab === 'records' ? (
            // Card-based layout for better responsiveness
            <div>
              {filteredRecords.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No records found</h3>
                  <p className="mt-2 text-gray-500">No records match your current search criteria. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredRecords.map((record) => (
                    <div 
                      key={record.id} 
                      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md hover:translate-y-[-4px]"
                    >
                      <div className={`h-2 ${
                        record.recordType?.includes('Emergency') ? 'bg-red-500' :
                        record.recordType?.includes('Follow-up') ? 'bg-blue-500' :
                        record.recordType?.includes('Checkup') ? 'bg-green-500' :
                        record.recordType?.includes('Consultation') ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}></div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-lg text-gray-900 mb-1">{record.patientName || 'Unknown Patient'}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {record.date}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.recordType?.includes('Emergency') ? 'bg-red-100 text-red-800' :
                            record.recordType?.includes('Follow-up') ? 'bg-blue-100 text-blue-800' :
                            record.recordType?.includes('Checkup') ? 'bg-green-100 text-green-800' :
                            record.recordType?.includes('Consultation') ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {record.recordType || 'Unknown'}
                          </span>
                        </div>
                        
                        {record.diagnosis && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Diagnosis</div>
                            <p className="text-sm text-gray-800">{record.diagnosis}</p>
                          </div>
                        )}
                        
                        {record.vitals && Object.values(record.vitals).some(v => v) && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Vital Signs</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {record.vitals.temperature && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-1">Temp:</span> 
                                  <span className={`${
                                    parseFloat(record.vitals.temperature) > 38 ? 'text-red-600' :
                                    parseFloat(record.vitals.temperature) < 35 ? 'text-blue-600' :
                                    'text-green-600'
                                  }`}>
                                    {record.vitals.temperature} °C
                                  </span>
                                </div>
                              )}
                              {record.vitals.bloodPressure && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-1">BP:</span> {record.vitals.bloodPressure}
                                </div>
                              )}
                              {record.vitals.heartRate && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-1">HR:</span> {record.vitals.heartRate} bpm
                                </div>
                              )}
                              {record.vitals.respiratoryRate && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-1">RR:</span> {record.vitals.respiratoryRate} bpm
                                </div>
                              )}
                              {record.vitals.oxygenSaturation && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-1">O₂:</span> {record.vitals.oxygenSaturation}%
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              record.isPatientCreated 
                                ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                : 'bg-green-50 text-green-700 border border-green-100'
                            }`}>
                              {record.isPatientCreated ? 'Patient Entry' : 'Doctor Entry'}
                            </span>
                          </div>
                          <button 
                            onClick={() => openRecordDetails(record)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                          >
                            View Details
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Medications & Health Logs Tab
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">Patient Medication Logs</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMedicationLogs.length > 0 ? (
                        filteredMedicationLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {log.patientName || 'Unknown Patient'}
                                {log.patientName === 'Mitadru' && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Current User
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{log.medicine}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{log.reason}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No medication logs found for the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">Health Logs Summary</h2>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.map(patient => {
                      const patientLogs = records.filter(record => 
                        (record.patientId === patient.id || record.userId === patient.id) && 
                        record.recordType === 'Daily Health Log'
                      );
                      
                      if (patientLogs.length === 0) return null;
                      
                      return (
                        <div key={patient.id} className="p-4 border rounded-lg bg-gray-50">
                          <h3 className="font-semibold text-lg mb-2">{patient.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Total health logs: <span className="font-medium">{patientLogs.length}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Latest entry: <span className="font-medium">
                              {patientLogs.sort((a: any, b: any) => 
                                new Date(b.date).getTime() - new Date(a.date).getTime()
                              )[0]?.date || 'None'}
                            </span>
                          </p>
                          <button
                            onClick={() => {
                              setPatientFilter(patient.id);
                              setActiveTab('records');
                              setSearchTerm('Health Log');
                            }}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                          >
                            View all logs
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Record Details Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Patient Record Details</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Patient Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm"><span className="font-medium">Name:</span> 
                        <span className="ml-1 font-bold text-base">
                          {selectedRecord.patientName || 'Unknown Patient'}
                        </span>
                        {selectedRecord.patientName === 'Mitadru' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Current User
                          </span>
                        )}
                      </p>
                      <p className="text-sm mt-2"><span className="font-medium">Record Date:</span> {selectedRecord.date}</p>
                      <p className="text-sm mt-1"><span className="font-medium">Record Type:</span> {selectedRecord.recordType}</p>
                      {selectedRecord.isPatientCreated && (
                        <p className="text-sm mt-2 text-blue-600 font-semibold">
                          This is a self-reported record created by the patient
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Diagnosis</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.diagnosis || 'No diagnosis provided'}</p>
                      {selectedRecord.isPatientCreated && selectedRecord.diagnosis === 'Self-assessment' && (
                        <p className="text-xs mt-2 text-blue-600 italic">
                          Self-reported by patient. No medical verification.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Symptoms</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.symptoms || 'No symptoms recorded'}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Notes</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.notes || 'No notes provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Vital Signs</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedRecord.vitals && (
                        <>
                          <p className="text-sm"><span className="font-medium">Temperature:</span> {selectedRecord.vitals.temperature}°C</p>
                          <p className="text-sm mt-1"><span className="font-medium">Blood Pressure:</span> {selectedRecord.vitals.bloodPressure}</p>
                          <p className="text-sm mt-1"><span className="font-medium">Heart Rate:</span> {selectedRecord.vitals.heartRate} bpm</p>
                          <p className="text-sm mt-1"><span className="font-medium">Respiratory Rate:</span> {selectedRecord.vitals.respiratoryRate} breaths/min</p>
                          <p className="text-sm mt-1"><span className="font-medium">Oxygen Saturation:</span> {selectedRecord.vitals.oxygenSaturation}%</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Medication</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.medication || 'No medication prescribed'}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Follow-up Plan</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.followUp || 'No follow-up required'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3 justify-center">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg transition-all duration-300 hover:bg-gray-300"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    // In a real application, this would navigate to an edit page or open an edit modal
                    toast.success('Record edit functionality would be implemented here');
                  }}
                  className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800"
                >
                  Update Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Records Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-slideUp">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 text-center mb-6">
                {clearType === 'all' 
                  ? 'Are you sure you want to clear all patient records? This action cannot be undone.' 
                  : clearType === 'filtered'
                  ? `Are you sure you want to clear ${filteredRecords.length} filtered records? This action cannot be undone.`
                  : clearType === 'all-medications'
                  ? 'Are you sure you want to clear all medication logs? This action cannot be undone.'
                  : `Are you sure you want to clear ${filteredMedicationLogs.length} filtered medication logs? This action cannot be undone.`
                }
              </p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg transition-all hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearRecords}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg transition-all hover:bg-red-700"
                >
                  Yes, Clear {clearType.includes('medications') ? 'Medications' : 'Records'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">AidX Copyrights reserved 2025</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">Facebook</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">LinkedIn</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">YouTube</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 