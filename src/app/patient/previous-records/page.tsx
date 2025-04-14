'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function PreviousRecords() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('records');
  const [viewMode, setViewMode] = useState('list');
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [medicationReminders, setMedicationReminders] = useState<Record<string, boolean>>({});
  const [dailyHealthLogs, setDailyHealthLogs] = useState<any[]>([]);
  
  // Simulated API response for demo purposes
  // In a real app, this would come from an API call based on the logged-in user's Clerk ID
  const generateSampleRecordsForUser = (userId: string) => {
    // This is just for demo - in a real app, records would be fetched from your database
    return [
      {
        id: '1',
        date: '2024-03-10',
        recordType: 'Annual Checkup',
        doctor: 'Dr. Neha',
        notes: 'Patient is in good health. Blood pressure normal at 120/80. Recommended continued exercise and balanced diet.',
        symptoms: 'Routine checkup, no complaints',
        diagnosis: 'Healthy, no concerns',
        vitals: {
          temperature: '36.5',
          bloodPressure: '120/80',
          heartRate: '72',
          respiratoryRate: '16',
          oxygenSaturation: '98',
        },
        medication: 'No medications prescribed',
        followUp: 'Annual checkup in 12 months',
        patientId: userId,
        doctorId: 'doc_12345'
      },
      {
        id: '2',
        date: '2024-01-15',
        recordType: 'Flu Treatment',
        doctor: 'Dr. Smith',
        notes: 'Patient presented with fever (38.5°C), sore throat, and fatigue. Diagnosed with seasonal influenza. Prescribed bed rest and Oseltamivir.',
        symptoms: 'Fever, sore throat, fatigue, body aches',
        diagnosis: 'Seasonal Influenza Type A',
        vitals: {
          temperature: '38.5',
          bloodPressure: '125/85',
          heartRate: '88',
          respiratoryRate: '18',
          oxygenSaturation: '96',
        },
        medication: 'Oseltamivir 75mg twice daily for 5 days',
        followUp: 'Return if symptoms worsen or do not improve within 3 days',
        patientId: userId,
        doctorId: 'doc_67890'
      },
      {
        id: '3',
        date: '2023-11-22',
        recordType: 'Follow-up',
        doctor: 'Dr. Neha',
        notes: 'Follow-up after minor surgery. Incision healing well. No signs of infection. Cleared for normal activities.',
        symptoms: 'Minimal discomfort at incision site',
        diagnosis: 'Post-operative recovery - satisfactory',
        vitals: {
          temperature: '36.7',
          bloodPressure: '118/78',
          heartRate: '75',
          respiratoryRate: '15',
          oxygenSaturation: '99',
        },
        medication: 'Continue Acetaminophen 500mg as needed for pain',
        followUp: 'No follow-up needed unless complications arise',
        patientId: userId,
        doctorId: 'doc_12345'
      }
    ];
  };
  
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    
    if (isLoaded && user) {
      // Add patientName to existing records if missing
      const updateRecordsWithPatientName = () => {
        try {
          const recordsJSON = localStorage.getItem('patientRecords');
          if (recordsJSON) {
            const records = JSON.parse(recordsJSON);
            let needsUpdate = false;
            
            // Check if any records are missing patient name
            const updatedRecords = records.map((record: any) => {
              if (!record.patientName && record.patientId === user.id) {
                needsUpdate = true;
                return {
                  ...record,
                  patientName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`,
                };
              }
              return record;
            });
            
            // Save updated records if changes were made
            if (needsUpdate) {
              localStorage.setItem('patientRecords', JSON.stringify(updatedRecords));
              console.log('Updated patient records with missing patient names');
            }
            
            setPatientRecords(updatedRecords);
          } else {
            // Generate initial records
            const initialRecords = generateSampleRecordsForUser(user.id);
            
            // Add patient name to all records
            const recordsWithName = initialRecords.map(record => ({
              ...record,
              patientName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`,
            }));
            
            setPatientRecords(recordsWithName);
            localStorage.setItem('patientRecords', JSON.stringify(recordsWithName));
          }
        } catch (error) {
          console.error('Error loading records:', error);
          toast.error('Failed to load medical records');
        }
      };
      
      // Check and update daily logs with patient name
      const updateLogsWithPatientName = () => {
        try {
          const logsJSON = localStorage.getItem('patientDailyLogs');
          if (logsJSON) {
            const logs = JSON.parse(logsJSON);
            let needsUpdate = false;
            
            // Check if any logs are missing patient name
            const updatedLogs = logs.map((log: any) => {
              if (!log.patientName && (log.userId === user.id || !log.userId)) {
                needsUpdate = true;
                return {
                  ...log,
                  patientName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`,
                  patientId: user.id
                };
              }
              return log;
            });
            
            // Save updated logs if changes were made
            if (needsUpdate) {
              localStorage.setItem('patientDailyLogs', JSON.stringify(updatedLogs));
              console.log('Updated daily logs with missing patient names');
            }
            
            setDailyHealthLogs(updatedLogs);
          } else {
            setDailyHealthLogs([]);
          }
        } catch (error) {
          console.error('Error loading health logs:', error);
        }
      };
      
      updateRecordsWithPatientName();
      updateLogsWithPatientName();
      
      // Check if there's a tab parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam === 'medications') {
        setActiveTab('medications');
      }
      
      // Load saved medication reminders
      const savedReminders = localStorage.getItem('medicationReminders');
      console.log('Saved medication reminders from localStorage:', savedReminders);
      
      if (savedReminders) {
        const parsedReminders = JSON.parse(savedReminders);
        console.log('Parsed reminders:', parsedReminders);
        setMedicationReminders(parsedReminders);
        
        // Check if we have any active reminders
        const activeRemindersCount = Object.values(parsedReminders).filter(val => !!val).length;
        console.log(`Found ${activeRemindersCount} active medication reminders`);
        
        if (activeRemindersCount > 0) {
          toast.success(`You have ${activeRemindersCount} active medication reminder(s)`);
        }
      } else {
        console.log('No saved medication reminders found');
        // Initialize with empty object
        localStorage.setItem('medicationReminders', JSON.stringify({}));
      }
    }
    
    setMounted(true);
    
    // Create listener for reset event
    const handleReset = () => {
      console.log('Reset event received');
      localStorage.removeItem('medicationReminders');
      setMedicationReminders({});
      toast.success('All medication reminders have been reset');
    };
    
    window.addEventListener('resetMedicationReminders', handleReset);
    
    return () => {
      window.removeEventListener('resetMedicationReminders', handleReset);
    };
  }, [isLoaded, user, router]);
  
  const fetchPatientRecords = async () => {
    if (!user?.id) return;
    
    setIsLoadingRecords(true);
    
    try {
      // Get records from localStorage
      const recordsJSON = localStorage.getItem('patientRecords');
      
      if (recordsJSON) {
        const allRecords = JSON.parse(recordsJSON);
        // Filter records by patient name (in a real app, this would be by patient ID)
        // For demo, we'll just show all records since we're not enforcing patient IDs
        setPatientRecords(allRecords);
      } else {
        // If no records found in localStorage, use sample data for demo
        const sampleRecords = generateSampleRecordsForUser(user.id);
        setPatientRecords(sampleRecords);
        
        // Store the sample records in localStorage for testing
        localStorage.setItem('patientRecords', JSON.stringify(sampleRecords));
      }
    } catch (error) {
      console.error('Error fetching patient records:', error);
      toast.error('Failed to load your medical records');
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Fetch daily health logs and deduplicate by symptom
  const fetchDailyHealthLogs = () => {
    try {
      const logsJSON = localStorage.getItem('patientDailyLogs');
      if (logsJSON) {
        const parsedLogs = JSON.parse(logsJSON);
        
        // Create a map to track unique symptoms
        const uniqueSymptomMap = new Map();
        
        // Filter logs to keep only the most recent entry for each symptom
        const uniqueLogs = parsedLogs.reduce((acc: any[], log: any) => {
          // Create a simplified version of the symptoms for comparison (lowercase, no extra spaces)
          const symptomKey = log.symptoms.toLowerCase().trim();
          
          // If we haven't seen this symptom yet, or if this log is more recent than the one we have
          if (!uniqueSymptomMap.has(symptomKey) || 
              new Date(log.date) > new Date(uniqueSymptomMap.get(symptomKey).date)) {
            uniqueSymptomMap.set(symptomKey, log);
          }
          
          return acc;
        }, []);
        
        // Convert the map values back to an array
        const dedupedLogs = Array.from(uniqueSymptomMap.values());
        
        setDailyHealthLogs(dedupedLogs);
      }
    } catch (error) {
      console.error('Error fetching daily health logs:', error);
    }
  };

  // Check URL parameters for log viewing
  useEffect(() => {
    if (mounted && dailyHealthLogs.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const viewLogId = urlParams.get('view');
      
      if (viewLogId) {
        const logToView = dailyHealthLogs.find(log => log.id === viewLogId);
        if (logToView) {
          setSelectedLog(logToView);
          setShowLogModal(true);
        }
      }
    }
  }, [mounted, dailyHealthLogs]);

  // Filter records based on search term
  const filteredRecords = patientRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.recordType?.toLowerCase().includes(searchLower) ||
      record.doctor?.toLowerCase().includes(searchLower) ||
      record.diagnosis?.toLowerCase().includes(searchLower) ||
      record.date?.toLowerCase().includes(searchLower)
    );
  });

  const openRecordDetails = (record: any) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  const toggleMedicationReminder = (recordId: string) => {
    console.log('Toggle reminder for record ID:', recordId);
    
    // Make sure we're working with a valid ID
    if (!recordId) {
      console.error('No record ID provided');
      toast.error('Error: No record ID found');
      return;
    }
    
    // Get the current record
    const currentRecord = patientRecords.find(record => record.id === recordId);
    if (!currentRecord || !currentRecord.medication) {
      toast.error('No medication information found for this record');
      return;
    }
    
    // Check if we already have a reminder for this medication (case insensitive)
    const normalizedMedication = currentRecord.medication.toLowerCase().trim();
    let duplicateReminderRecordId: string | null = null;
    
    // Look for any existing reminder with the same medication
    Object.entries(medicationReminders).forEach(([id, isActive]) => {
      if (isActive && id !== recordId) {
        const record = patientRecords.find(r => r.id === id);
        if (record && record.medication && 
            record.medication.toLowerCase().trim() === normalizedMedication) {
          duplicateReminderRecordId = id;
        }
      }
    });
    
    // If we found a duplicate, offer to replace it
    if (duplicateReminderRecordId && !medicationReminders[recordId]) {
      const duplicateRecord = patientRecords.find(r => r.id === duplicateReminderRecordId);
      if (window.confirm(`You already have a reminder for "${duplicateRecord?.medication}". Would you like to replace it with this newer record?`)) {
        // Disable the old reminder and enable the new one
        const updatedReminders = { 
          ...medicationReminders,
          [duplicateReminderRecordId]: false,
          [recordId]: true
        };
        
        setMedicationReminders(updatedReminders);
        localStorage.setItem('medicationReminders', JSON.stringify(updatedReminders));
        toast.success('Medication reminder updated to use the newer record');
        
        // Add notification for the newly enabled reminder
        addMedicationReminderNotification(currentRecord, recordId);
      } else {
        // User chose not to replace
        toast.success('Existing medication reminder was kept');
      }
      return;
    }
    
    // No duplicates found, proceed as normal
    const updatedReminders = { 
      ...medicationReminders,
      [recordId]: !medicationReminders[recordId]
    };
    
    console.log('Updated reminders:', updatedReminders);
    setMedicationReminders(updatedReminders);
    localStorage.setItem('medicationReminders', JSON.stringify(updatedReminders));
    
    if (updatedReminders[recordId]) {
      toast.success('Medication reminder set successfully!');
      addMedicationReminderNotification(currentRecord, recordId);
    } else {
      toast.success('Medication reminder removed');
    }
  };
  
  // Helper function to add medication reminder notification
  const addMedicationReminderNotification = (record: any, recordId: string) => {
    const notification = {
      id: Date.now().toString(),
      type: 'medication_reminder',
      message: `Reminder: Take your medication - ${record.medication}`,
      date: new Date().toISOString(),
      read: false,
      recordId: recordId
    };
    
    const existingNotifications = localStorage.getItem('patientNotifications') || '[]';
    const parsedNotifications = JSON.parse(existingNotifications);
    parsedNotifications.push(notification);
    localStorage.setItem('patientNotifications', JSON.stringify(parsedNotifications));
    console.log('Added notification', notification);
    
    // Force-check for medication reminders in the notifications page
    const event = new CustomEvent('medicationReminderSet', { detail: { recordId }});
    window.dispatchEvent(event);
  };

  const openLogDetails = (log: any) => {
    setSelectedLog(log);
    setShowLogModal(true);
  };

  const closeLogModal = () => {
    setShowLogModal(false);
    setSelectedLog(null);
  };

  const toggleMedicationNotification = (medicine: string) => {
    if (!selectedLog) return;
    
    // Get the current reminders
    const currentReminders = { ...medicationReminders };
    const notificationKey = `${selectedLog.id}_${medicine}`;
    
    // Toggle the reminder for this medication
    currentReminders[notificationKey] = !currentReminders[notificationKey];
    
    // Update state and localStorage
    setMedicationReminders(currentReminders);
    localStorage.setItem('medicationReminders', JSON.stringify(currentReminders));
    
    if (currentReminders[notificationKey]) {
      // Create notification if enabled
      const notification = {
        id: Date.now().toString(),
        type: 'medication_reminder',
        message: `Reminder: Take your medication - ${medicine}`,
        date: new Date().toISOString(),
        read: false,
        logId: selectedLog.id,
        medicine: medicine
      };
      
      const existingNotifications = JSON.parse(localStorage.getItem('patientNotifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('patientNotifications', JSON.stringify(existingNotifications));
      
      toast.success(`Notifications enabled for ${medicine}`);
    } else {
      toast.success(`Notifications disabled for ${medicine}`);
    }
  };

  // Add this function to toggle all medications for a log
  const toggleAllMedicationsForLog = (enable: boolean) => {
    if (!selectedLog || !selectedLog.medicationTaken || selectedLog.medicationTaken.length === 0) return;
    
    // Get the current reminders
    const currentReminders = { ...medicationReminders };
    
    // Toggle all medications in this log
    selectedLog.medicationTaken.forEach((medicine: string) => {
      const notificationKey = `${selectedLog.id}_${medicine}`;
      currentReminders[notificationKey] = enable;
    });
    
    // Update state and localStorage
    setMedicationReminders(currentReminders);
    localStorage.setItem('medicationReminders', JSON.stringify(currentReminders));
    
    if (enable) {
      // Create notifications for all enabled medications
      const notifications = selectedLog.medicationTaken.map((medicine: string) => ({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        type: 'medication_reminder',
        message: `Reminder: Take your medication - ${medicine}`,
        date: new Date().toISOString(),
        read: false,
        logId: selectedLog.id,
        medicine: medicine
      }));
      
      const existingNotifications = JSON.parse(localStorage.getItem('patientNotifications') || '[]');
      localStorage.setItem('patientNotifications', JSON.stringify([...existingNotifications, ...notifications]));
      
      toast.success(`Notifications enabled for all medications`);
    } else {
      toast.success(`Notifications disabled for all medications`);
    }
  };

  const clearAllMedicalRecords = () => {
    if (window.confirm('Are you sure you want to clear all your medical records? This action cannot be undone.')) {
      // Clear medical records
      localStorage.removeItem('patientRecords');
      setPatientRecords([]);
      toast.success('All medical records cleared');
    }
  };

  const clearAllHealthLogs = () => {
    if (window.confirm('Are you sure you want to clear all your health logs? This action cannot be undone.')) {
      // Clear daily health logs
      localStorage.removeItem('patientDailyLogs');
      setDailyHealthLogs([]);
      toast.success('All health logs cleared');
    }
  };

  const clearAllMedicationReminders = () => {
    if (window.confirm('Are you sure you want to disable all medication reminders? This action cannot be undone.')) {
      // Clear all medication reminders
      localStorage.setItem('medicationReminders', JSON.stringify({}));
      setMedicationReminders({});
      toast.success('All medication reminders disabled');
    }
  };

  if (!isLoaded || !user) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center border-b backdrop-blur-sm bg-white/90 sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <Link href="/" className="text-xl font-semibold transform transition-transform duration-300 hover:scale-105">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-black">AidX</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/find-us" 
            className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1"
          >
            Find us
          </Link>
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1"
          >
            Main page
          </Link>
          <button
            onClick={() => router.push('/patient/dashboard')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn" style={{ animationDuration: '0.5s' }}>
        <div className="flex flex-col items-center mb-10">
          <div className="border border-blue-200 p-6 inline-block mb-6 rounded-full bg-gradient-to-r from-blue-50 to-white shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-black">YOUR MEDICAL RECORDS</h1>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">View your complete medical history, track your progress, and access all your past records in one place.</p>
          </div>
          
          {/* Medication Reminder Count - Enhanced UI */}
          {Object.keys(medicationReminders).filter(id => medicationReminders[id]).length > 0 && (
            <div className="mb-6 flex justify-center">
              <div 
                onClick={() => setActiveTab('medications')}
                className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg py-3 px-6 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all duration-300 group"
              >
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-sm">
                  {Object.keys(medicationReminders).filter(id => medicationReminders[id]).length}
                </div>
                <div>
                  <p className="font-medium text-amber-800">Active Medication Reminders</p>
                  <p className="text-xs text-amber-700">Click to view and manage your reminders</p>
                </div>
                <div className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Improved Tabs */}
        <div className="mb-8 flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex shadow-sm">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-5 py-2 rounded-md transition-all duration-300 ${
                activeTab === 'records' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-md text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Medical Records
            </button>
            <button
              onClick={() => setActiveTab('medications')}
              className={`px-5 py-2 rounded-md transition-all duration-300 ${
                activeTab === 'medications' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-md text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Medications & Health Logs
            </button>
          </div>
        </div>

        {/* Search and Controls with improved UI */}
        {activeTab === 'records' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-black">Medical Records</h2>
              {filteredRecords.length > 0 && (
                <button
                  onClick={clearAllMedicalRecords}
                  className="text-sm text-red-600 hover:text-red-800 hover:underline flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All Records
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by date, doctor, diagnosis, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 hover:shadow-md"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Medical Records Table */}
        {activeTab === 'records' && (
          <div className="w-full animate-fadeIn" style={{ animationDuration: '0.5s' }}>
            {isLoadingRecords ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-pulse text-gray-500">Loading your medical records...</div>
              </div>
            ) : (
              <>
                {filteredRecords.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-50 to-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredRecords.map((record) => (
                            <tr key={record.id} className="hover:bg-blue-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{record.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${record.recordType === 'Annual Checkup' ? 'bg-green-100 text-green-800' : 
                                   record.recordType === 'Follow-up' ? 'bg-blue-100 text-blue-800' : 
                                   record.recordType === 'Emergency' ? 'bg-red-100 text-red-800' : 
                                   'bg-purple-100 text-purple-800'}`}>
                                  {record.recordType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                                    {record.doctor.split(' ').map((name: string) => name[0]).join('')}
                                  </div>
                                  <div className="ml-3 text-sm text-gray-900">{record.doctor}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate">{record.diagnosis || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  onClick={() => openRecordDetails(record)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg"
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
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
                    <div className="mb-4">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-gray-800">No Medical Records Found</h3>
                    <p className="text-gray-600 mb-4">You don't have any medical records in the system yet.</p>
                    <p className="text-gray-500 text-sm">Records will appear here after your doctor visits.</p>
                  </div>
                )}
                
                {filteredRecords.length > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">Showing {filteredRecords.length} of {patientRecords.length} records</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Medications & Health Logs Section */}
        {activeTab === 'medications' && (
          <div className="w-full animate-fadeIn" style={{ animationDuration: '0.5s' }}>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Medications & Reminders</h2>
                <div className="flex gap-3">
                  {Object.keys(medicationReminders).filter(id => medicationReminders[id]).length > 0 && (
                    <button
                      onClick={clearAllMedicationReminders}
                      className="text-sm text-red-600 hover:text-red-800 hover:underline"
                    >
                      Disable All Reminders
                    </button>
                  )}
                </div>
              </div>
              {Object.keys(medicationReminders).filter(id => medicationReminders[id]).length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {Object.keys(medicationReminders).filter(id => medicationReminders[id]).length}
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Active Medication Reminders</p>
                      <p className="text-xs text-amber-700">You will receive notifications for these medications</p>
                    </div>
                  </div>
                  <button
                    onClick={clearAllMedicationReminders}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Disable All
                  </button>
                </div>
              )}
            </div>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Active Medication Reminders</h2>
              </div>
              
              {Object.keys(medicationReminders).filter(id => medicationReminders[id]).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(medicationReminders).filter(id => medicationReminders[id]).map(reminderId => {
                    // Check if it's a medical record reminder or daily log reminder
                    if (!reminderId.includes('_')) {
                      // Medical record reminder
                      const record = patientRecords.find(r => r.id === reminderId);
                      return record ? (
                        <div key={reminderId} className="bg-white rounded-lg border p-4 hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium mb-1">{record.medication}</div>
                              <div className="text-sm text-gray-500">Prescribed: {record.date}</div>
                              <div className="text-xs text-blue-600 mt-1">From medical records</div>
                            </div>
                            <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              Active
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <button 
                              onClick={() => openRecordDetails(record)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => {
                                const updatedReminders = { ...medicationReminders, [reminderId]: false };
                                setMedicationReminders(updatedReminders);
                                localStorage.setItem('medicationReminders', JSON.stringify(updatedReminders));
                                toast.success('Medication reminder disabled');
                              }}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Disable Reminder
                            </button>
                          </div>
                        </div>
                      ) : null;
                    } else {
                      // Daily log medication reminder
                      const [logId, medicine] = reminderId.split('_');
                      const log = dailyHealthLogs.find(l => l.id === logId);
                      
                      return log ? (
                        <div key={reminderId} className="bg-white rounded-lg border p-4 hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium mb-1">{medicine}</div>
                              <div className="text-sm text-gray-500">Logged: {log.date}</div>
                              <div className="text-xs text-green-600 mt-1">From daily health log</div>
                            </div>
                            <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              Active
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <button 
                              onClick={() => openLogDetails(log)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              View Log Details
                            </button>
                            <button 
                              onClick={() => {
                                const updatedReminders = { ...medicationReminders, [reminderId]: false };
                                setMedicationReminders(updatedReminders);
                                localStorage.setItem('medicationReminders', JSON.stringify(updatedReminders));
                                toast.success(`Reminder for ${medicine} disabled`);
                              }}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Disable Reminder
                            </button>
                          </div>
                        </div>
                      ) : null;
                    }
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-4">You don't have any active medication reminders.</p>
                  <button
                    onClick={() => setActiveTab('records')}
                    className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800"
                  >
                    View Medical Records
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Daily Health Logs</h2>
                {dailyHealthLogs.length > 0 && (
                  <button
                    onClick={clearAllHealthLogs}
                    className="text-sm text-red-600 hover:text-red-800 hover:underline"
                  >
                    Clear All Logs
                  </button>
                )}
              </div>
              
              {dailyHealthLogs.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symptoms</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medications Taken</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dailyHealthLogs
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.date}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {log.symptoms.length > 50 ? log.symptoms.substring(0, 50) + '...' : log.symptoms}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {log.medicationTaken && log.medicationTaken.length > 0 
                                ? log.medicationTaken.join(', ')
                                : 'None recorded'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => openLogDetails(log)}
                                className="text-black hover:text-gray-700 transition-colors px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-4">You haven't created any daily health logs yet.</p>
                  <Link
                    href="/patient/dailylog"
                    className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 inline-block"
                  >
                    Create Health Log
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Record Details Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold">Medical Record Details</h3>
              <button 
                onClick={closeModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-8">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Patient Information</h4>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <p className="mb-2">
                        <span className="font-medium text-gray-700">Name:</span> 
                        <span className="ml-2 text-gray-900">{selectedRecord.patientName || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`}</span>
                      </p>
                      <p className="mb-2">
                        <span className="font-medium text-gray-700">Date:</span> 
                        <span className="ml-2 text-gray-900">{new Date(selectedRecord.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Record Type:</span> 
                        <span className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${selectedRecord.recordType === 'Annual Checkup' ? 'bg-green-100 text-green-800' : 
                           selectedRecord.recordType === 'Follow-up' ? 'bg-blue-100 text-blue-800' : 
                           selectedRecord.recordType === 'Emergency' ? 'bg-red-100 text-red-800' : 
                           'bg-purple-100 text-purple-800'}`}>
                          {selectedRecord.recordType}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Attending Physician</h4>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex items-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden mr-4 bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {selectedRecord.doctor.split(' ').map((name: string) => name[0]).join('')}
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-900">{selectedRecord.doctor}</p>
                        <p className="text-sm text-gray-600">Appointment Date: {new Date(selectedRecord.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Diagnosis</h4>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <p className="text-gray-900">{selectedRecord.diagnosis || 'No diagnosis provided'}</p>
                    </div>
                  </div>
                  
                  {selectedRecord.symptoms && (
                    <div className="mb-8">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">Symptoms</h4>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <p className="text-gray-900">{selectedRecord.symptoms}</p>
                      </div>
                    </div>
                  )}

                  {/* Medication Reminder Section */}
                  {selectedRecord.medication && selectedRecord.medication !== 'No medications prescribed' && (
                    <div className="mb-8">
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-amber-800">Medication Reminder</h4>
                        </div>
                        <p className="text-amber-700 mb-5">
                          Would you like to receive reminders for this medication?
                        </p>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Direct localStorage manipulation for simplicity
                            const reminders = JSON.parse(localStorage.getItem('medicationReminders') || '{}');
                            reminders[selectedRecord.id] = true;
                            localStorage.setItem('medicationReminders', JSON.stringify(reminders));
                            
                            // Update state
                            setMedicationReminders({...reminders});
                            
                            // Create notification
                            const notification = {
                              id: Date.now().toString(),
                              type: 'medication_reminder',
                              message: `Reminder: Take your medication - ${selectedRecord.medication}`,
                              date: new Date().toISOString(),
                              read: false,
                              recordId: selectedRecord.id
                            };
                            
                            const existingNotifications = JSON.parse(localStorage.getItem('patientNotifications') || '[]');
                            existingNotifications.push(notification);
                            localStorage.setItem('patientNotifications', JSON.stringify(existingNotifications));
                            
                            toast.success('Medication reminder enabled successfully!');
                          }}
                          className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg"
                        >
                          Enable Reminder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  {selectedRecord.vitals && (
                    <div className="mb-8">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">Vital Signs</h4>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                          {selectedRecord.vitals.temperature && (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="text-sm text-gray-500 mb-1">Temperature</div>
                              <div className="flex items-end">
                                <span className="text-2xl font-bold text-blue-600">{selectedRecord.vitals.temperature}</span>
                                <span className="text-sm text-gray-600 ml-1">°C</span>
                              </div>
                            </div>
                          )}
                          {selectedRecord.vitals.bloodPressure && (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="text-sm text-gray-500 mb-1">Blood Pressure</div>
                              <div className="text-2xl font-bold text-blue-600">{selectedRecord.vitals.bloodPressure}</div>
                            </div>
                          )}
                          {selectedRecord.vitals.heartRate && (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="text-sm text-gray-500 mb-1">Heart Rate</div>
                              <div className="flex items-end">
                                <span className="text-2xl font-bold text-blue-600">{selectedRecord.vitals.heartRate}</span>
                                <span className="text-sm text-gray-600 ml-1">bpm</span>
                              </div>
                            </div>
                          )}
                          {selectedRecord.vitals.respiratoryRate && (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="text-sm text-gray-500 mb-1">Respiratory Rate</div>
                              <div className="flex items-end">
                                <span className="text-2xl font-bold text-blue-600">{selectedRecord.vitals.respiratoryRate}</span>
                                <span className="text-sm text-gray-600 ml-1">breaths/min</span>
                              </div>
                            </div>
                          )}
                          {selectedRecord.vitals.oxygenSaturation && (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="text-sm text-gray-500 mb-1">Oxygen Saturation</div>
                              <div className="flex items-end">
                                <span className="text-2xl font-bold text-blue-600">{selectedRecord.vitals.oxygenSaturation}</span>
                                <span className="text-sm text-gray-600 ml-1">%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedRecord.medication && (
                    <div className="mb-8">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">Medication</h4>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-gray-900">{selectedRecord.medication}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedRecord.notes && (
                    <div className="mb-8">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">Notes</h4>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-gray-900">{selectedRecord.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedRecord.followUp && (
                    <div className="mb-8">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">Follow-up Plan</h4>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-gray-900">{selectedRecord.followUp}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button 
                  onClick={closeModal}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:from-blue-700 hover:to-blue-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Health Log Details Modal */}
      {showLogModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Daily Health Log Details</h3>
              <button 
                onClick={closeLogModal}
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
                    <h4 className="text-lg font-semibold mb-2">Log Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm"><span className="font-medium">Date:</span> {selectedLog.date}</p>
                      <p className="text-sm mt-2"><span className="font-medium">Created:</span> {new Date(selectedLog.createdAt).toLocaleString()}</p>
                      {selectedLog.lastUpdated && (
                        <p className="text-sm mt-1"><span className="font-medium">Last Updated:</span> {new Date(selectedLog.lastUpdated).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Symptoms</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedLog.symptoms}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  {selectedLog.aiSuggestion && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">AI Recommendation</h4>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        {selectedLog.aiSuggestion.advice && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-blue-800 mb-1">Medical Advice</h5>
                            <p className="text-sm text-blue-700">{selectedLog.aiSuggestion.advice}</p>
                          </div>
                        )}
                        
                        {selectedLog.aiSuggestion.morning && selectedLog.aiSuggestion.morning.length > 0 && (
                          <div className="mb-2">
                            <h5 className="text-sm font-medium text-blue-800 mb-1">Morning Recommendation</h5>
                            <ul className="list-disc list-inside text-sm text-blue-700 pl-2">
                              {selectedLog.aiSuggestion.morning.map((med: string, idx: number) => (
                                <li key={`morning-${idx}`}>{med}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {selectedLog.aiSuggestion.afternoon && selectedLog.aiSuggestion.afternoon.length > 0 && (
                          <div className="mb-2">
                            <h5 className="text-sm font-medium text-blue-800 mb-1">Afternoon Recommendation</h5>
                            <ul className="list-disc list-inside text-sm text-blue-700 pl-2">
                              {selectedLog.aiSuggestion.afternoon.map((med: string, idx: number) => (
                                <li key={`afternoon-${idx}`}>{med}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {selectedLog.aiSuggestion.night && selectedLog.aiSuggestion.night.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-800 mb-1">Night Recommendation</h5>
                            <ul className="list-disc list-inside text-sm text-blue-700 pl-2">
                              {selectedLog.aiSuggestion.night.map((med: string, idx: number) => (
                                <li key={`night-${idx}`}>{med}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Medications Taken & Notification Section */}
              {selectedLog.medicationTaken && selectedLog.medicationTaken.length > 0 && (
                <div className="mt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold">Medications Taken</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleAllMedicationsForLog(true)}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Enable All
                      </button>
                      <button
                        onClick={() => toggleAllMedicationsForLog(false)}
                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Disable All
                      </button>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notifications</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedLog.medicationTaken.map((medicine: string, idx: number) => {
                          const reminderKey = `${selectedLog.id}_${medicine}`;
                          const hasReminder = medicationReminders[reminderKey];
                          
                          return (
                            <tr key={`med-${idx}`} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {medicine}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end">
                                  <span className="mr-3 text-sm text-gray-600">
                                    {hasReminder ? 'Enabled' : 'Disabled'}
                                  </span>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      className="sr-only peer"
                                      checked={!!hasReminder}
                                      onChange={() => toggleMedicationNotification(medicine)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">Toggle the switches to enable or disable medication reminders for each medication.</p>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <button 
                  onClick={closeLogModal}
                  className="px-6 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-8 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">AidX Copyrights reserved 2025</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">
                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9-.83-1.48-1.73-1.73-.47-.13-.22-1.1-.28-1.9.07-.8.1-1.49.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9-.83-1.48-1.73-1.73z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
} 