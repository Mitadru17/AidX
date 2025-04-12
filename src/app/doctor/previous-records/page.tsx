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
            onClick={handleSignOut}
            className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Patient Records</h1>
        
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
        
        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
          <div className="w-full md:w-1/3">
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            >
              <option value="">All Patients</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          activeTab === 'records' ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {record.patientName || 'Unknown Patient'}
                            {record.patientName === 'Mitadru' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Current User
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.recordType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.diagnosis}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.isPatientCreated ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Patient
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Doctor
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => openRecordDetails(record)}
                            className="text-black hover:text-gray-700 transition-colors bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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