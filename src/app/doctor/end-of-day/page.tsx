'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Record {
  id: string;
  patientId: string;
  patientName: string;
  diagnosis?: string;
  medication?: string;
  recordType: string;
  date: string;
  symptoms?: string;
  isPatientCreated?: boolean;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
}

interface ReportStats {
  totalPatients: number;
  recordTypes: { [key: string]: number };
  diagnoses: { [key: string]: number };
  medications: { [key: string]: number };
  patientGender: {
    Male: number;
    Female: number;
    Other: number;
  };
  patientAgeGroups: {
    '0-18': number;
    '19-35': number;
    '36-50': number;
    '51-65': number;
    '65+': number;
  };
}

export default function EndOfDayReport() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [reportDate, setReportDate] = useState('');
  const [todaysRecords, setTodaysRecords] = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats>({
    totalPatients: 0,
    recordTypes: {},
    diagnoses: {},
    medications: {},
    patientGender: { Male: 0, Female: 0, Other: 0 },
    patientAgeGroups: { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 }
  });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
    
    // Set today's date as default
    const today = new Date();
    setReportDate(today.toISOString().split('T')[0]);
    
    // Load all records for statistics
    loadAllRecords();

    // Set up real-time data monitoring
    const handleDataChange = () => {
      const today = new Date().toISOString().split('T')[0];
      if (reportDate === today) {
        loadRecordsForDate(today);
        loadAllRecords();
      }
    };

    // Listen for data changes
    window.addEventListener('recordUpdated', handleDataChange);
    window.addEventListener('patientCreated', handleDataChange);
    
    return () => {
      window.removeEventListener('recordUpdated', handleDataChange);
      window.removeEventListener('patientCreated', handleDataChange);
    };
  }, [isLoaded, user, router, reportDate]);

  // Load records when date changes
  useEffect(() => {
    if (reportDate) {
      loadRecordsForDate(reportDate);
    }
  }, [reportDate]);

  const generateSampleDataForDate = (date: string): Record[] => {
    const recordTypes = ['Checkup', 'Follow-up', 'Emergency', 'Vaccination', 'Surgery', 'Physical Therapy'];
    const diagnoses = ['Common Cold', 'Hypertension', 'Diabetes', 'Allergic Rhinitis', 'Anxiety Disorder', 'Influenza', 'COVID-19', 'Asthma'];
    const medications = ['Amoxicillin', 'Lisinopril', 'Metformin', 'Atorvastatin', 'Albuterol', 'Levothyroxine', 'Cetirizine', 'Omeprazole'];
    const symptoms = ['Fever', 'Cough', 'Headache', 'Fatigue', 'Nausea', 'Shortness of breath', 'Sore throat', 'Joint pain'];
    
    // Generate a deterministic but seemingly random number of records for the date
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    
    // Use date components to create a deterministic record count (busier on weekdays)
    const recordCount = Math.max(2, Math.min(15, (dayOfWeek % 7) * 2 + day % 5 + (month % 3) + 3));
    
    const sampleRecords: Record[] = [];
    
    // Get the constant part of the date to ensure consistent IDs
    const dateSeed = date.replace(/-/g, '');
    
    for (let i = 0; i < recordCount; i++) {
      // Create a deterministic but seemingly random record
      const recordTypeIndex = (day + i * month) % recordTypes.length;
      const diagnosisIndex = (month + i * day) % diagnoses.length;
      const medicationIndex = (i + day + month) % medications.length;
      const patientId = `sample_${dateSeed}_${i}`;
      
      sampleRecords.push({
        id: `record_${dateSeed}_${i}`,
        patientId,
        patientName: `Sample Patient ${i + 1}`,
        recordType: recordTypes[recordTypeIndex],
        diagnosis: diagnoses[diagnosisIndex],
        medication: medications[medicationIndex],
        symptoms: symptoms[(i + day) % symptoms.length],
        date,
        isPatientCreated: i % 3 === 0 // Every third patient is self-reported
      });
      
      // Create a corresponding patient in localStorage for consistent visualization
      const patientGender = i % 3 === 0 ? 'Male' : i % 3 === 1 ? 'Female' : 'Other';
      const patientAge = 20 + ((i * day) % 60);
      
      // Store the sample patient data if not exists
      const patientJSON = localStorage.getItem('doctorPatients') || '[]';
      const patients = JSON.parse(patientJSON) as Patient[];
      
      if (!patients.some(p => p.id === patientId)) {
        patients.push({
          id: patientId,
          name: `Sample Patient ${i + 1}`,
          email: `patient${i + 1}@example.com`,
          phone: `+1555${String(i).padStart(7, '0')}`,
          gender: patientGender as 'Male' | 'Female' | 'Other',
          age: patientAge
        });
        localStorage.setItem('doctorPatients', JSON.stringify(patients));
      }
    }
    
    return sampleRecords;
  };

  const loadAllRecords = () => {
    // Get real records from localStorage
    const patientRecordsJSON = localStorage.getItem('doctorPatientRecords');
    const realRecords = patientRecordsJSON ? JSON.parse(patientRecordsJSON) as Record[] : [];
    
    // Generate statistics from the combined records
    setAllRecords(realRecords);
    generateStatistics(realRecords);
  };

  const generateStatistics = (records: Record[]) => {
    const stats: ReportStats = {
      totalPatients: new Set(records.map(r => r.patientId)).size,
      recordTypes: {},
      diagnoses: {},
      medications: {},
      patientGender: { Male: 0, Female: 0, Other: 0 },
      patientAgeGroups: { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 }
    };
    
    records.forEach(record => {
      // Count record types
      const recordType = record.recordType || 'Unknown';
      stats.recordTypes[recordType] = (stats.recordTypes[recordType] || 0) + 1;
      
      // Count diagnoses
      if (record.diagnosis) {
        stats.diagnoses[record.diagnosis] = (stats.diagnoses[record.diagnosis] || 0) + 1;
      }
      
      // Count medications
      if (record.medication && record.medication !== 'None reported' && record.medication !== 'No medications prescribed') {
        stats.medications[record.medication] = (stats.medications[record.medication] || 0) + 1;
      }
      
      // Get patient data for gender and age statistics
      const patientId = record.patientId;
      const patientJSON = localStorage.getItem('doctorPatients');
      if (patientJSON) {
        const patients = JSON.parse(patientJSON) as Patient[];
        const patient = patients.find((p) => p.id === patientId);
        if (patient) {
          // Count gender
          if (patient.gender && patient.gender in stats.patientGender) {
            stats.patientGender[patient.gender] = stats.patientGender[patient.gender] + 1;
          }
          
          // Count age groups
          if (patient.age !== undefined) {
            if (patient.age <= 18) stats.patientAgeGroups['0-18']++;
            else if (patient.age <= 35) stats.patientAgeGroups['19-35']++;
            else if (patient.age <= 50) stats.patientAgeGroups['36-50']++;
            else if (patient.age <= 65) stats.patientAgeGroups['51-65']++;
            else stats.patientAgeGroups['65+']++;
          }
        }
      }
    });
    
    setReportStats(stats);
  };

  const loadRecordsForDate = (date: string) => {
    // Get real records from localStorage
    const patientRecordsJSON = localStorage.getItem('doctorPatientRecords');
    const realRecords = patientRecordsJSON ? JSON.parse(patientRecordsJSON) as Record[] : [];
    
    // Filter real records by date
    const todayRealRecords = realRecords.filter((record) => record.date === date);
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // If looking at today's data, just show real data
    if (date === today) {
      setTodaysRecords(todayRealRecords);
      toast.success(`Showing real-time data for today (${todayRealRecords.length} records)`);
    } else {
      // For other dates, generate sample data
      const sampleRecords = generateSampleDataForDate(date);
      
      // For sample data, show a notification it's sample data
      setTodaysRecords(sampleRecords);
      toast(`Showing sample data for ${date} (${sampleRecords.length} records)`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handlePrint = () => {
    if (printRef.current) {
      // Store the original classNames
      const originalClassNames = printRef.current.className;
      
      // Apply print-specific styling
      printRef.current.className = "p-8 bg-white";
      
      window.print();
      
      // Restore original styling after printing
      printRef.current.className = originalClassNames;
      
      toast.success('Printing report...');
    }
  };

  // Create simple bar chart component
  const SimpleBarChart = ({ data, title, maxBars = 5 }: { data: { [key: string]: number }, title: string, maxBars?: number }) => {
    // Sort data by value in descending order and take top maxBars
    const sortedData = Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxBars);
    
    // Find maximum value for scaling
    const maxValue = sortedData.length > 0 
      ? Math.max(...sortedData.map(([, value]) => value))
      : 0;
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
        <div className="space-y-2">
          {sortedData.map(([key, value], index) => (
            <div key={index} className="flex items-center">
              <span className="text-xs w-24 truncate">{key}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${maxValue > 0 ? value / maxValue * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-xs ml-2">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Create simple donut chart for gender distribution
  const DonutChart = ({ data, title }: { data: { [key: string]: number }, title: string }) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    let startAngle = 0;

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
        <div className="flex items-center">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {Object.entries(data).map(([key, value], i) => {
                if (total === 0) return null;
                
                const percentage = value / total;
                const endAngle = startAngle + percentage * 360;
                
                // Calculate the path for the arc
                const x1 = 50 + 35 * Math.cos(Math.PI * startAngle / 180);
                const y1 = 50 + 35 * Math.sin(Math.PI * startAngle / 180);
                const x2 = 50 + 35 * Math.cos(Math.PI * endAngle / 180);
                const y2 = 50 + 35 * Math.sin(Math.PI * endAngle / 180);
                
                const largeArcFlag = percentage > 0.5 ? 1 : 0;
                
                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');
                
                const color = i === 0 ? '#3B82F6' : i === 1 ? '#F87171' : '#10B981';
                
                const currentAngle = startAngle;
                startAngle = endAngle;
                
                return (
                  <path
                    key={key}
                    d={pathData}
                    fill={color}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
              <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
          </div>
          <div className="ml-4 space-y-1">
            {Object.entries(data).map(([key, value], i) => {
              const color = i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-red-400' : 'bg-green-500';
              return (
                <div key={key} className="flex items-center text-xs">
                  <span className={`inline-block w-3 h-3 ${color} mr-1`}></span>
                  <span>{key}: {value} ({total > 0 ? Math.round(value / total * 100) : 0}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (!isLoaded || !user) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center border-b backdrop-blur-sm bg-white/80 sticky top-0 z-50 transition-all duration-300 print:hidden">
        <Link href="/" className="text-xl font-semibold transform transition-transform duration-300 hover:scale-105">
          AidX
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
            onClick={handleSignOut}
            className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-12 text-center print:mb-8">
          End of day
        </h1>
        
        <div className="w-full">
          {/* Date Selection */}
          <div className="mb-8 print:hidden">
            <label htmlFor="report-date" className="block text-lg font-medium mb-2">Confirm today's date</label>
            <div className="flex gap-2">
              <input
                type="date"
                id="report-date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
              <button
                onClick={() => loadRecordsForDate(reportDate)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                title="Refresh data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Report Content for Printing */}
          <div ref={printRef} className="border border-gray-200 rounded-lg p-6 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">End of Day Report</h2>
              <p className="text-gray-600">Date: {reportDate}</p>
              {reportDate !== new Date().toISOString().split('T')[0] && (
                <div className="mt-2 inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                  Sample Data
                </div>
              )}
            </div>
            
            {/* Daily patient visits */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">Today's Patient Visits ({todaysRecords.length})</h3>
              
              {todaysRecords.length > 0 ? (
                <div>
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Patient
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Record Type
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Diagnosis
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Medication
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {todaysRecords.map((record, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                            {record.patientName || 'Unknown Patient'}
                            {record.isPatientCreated && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Self-reported
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border-r">
                            {record.recordType || 'N/A'}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border-r">
                            {record.diagnosis || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {record.medication || 'None prescribed'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4 text-gray-600">No patient records found for {reportDate}</p>
                </div>
              )}
            </div>
            
            {/* Overall Statistics */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">Overall Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Total Patients Seen:</p>
                    <p className="text-2xl font-bold">{reportStats.totalPatients}</p>
                  </div>
                  
                  {/* Record Types Chart */}
                  <SimpleBarChart 
                    data={reportStats.recordTypes} 
                    title="Record Types"
                  />
                  
                  {/* Common Diagnoses Chart */}
                  <SimpleBarChart 
                    data={reportStats.diagnoses} 
                    title="Common Diagnoses"
                  />
                </div>
                
                {/* Right column */}
                <div>
                  {/* Gender Distribution */}
                  <DonutChart 
                    data={reportStats.patientGender} 
                    title="Patient Gender Distribution"
                  />
                  
                  {/* Age Group Distribution */}
                  <SimpleBarChart 
                    data={reportStats.patientAgeGroups} 
                    title="Patient Age Groups"
                  />
                  
                  {/* Common Medications */}
                  <SimpleBarChart 
                    data={reportStats.medications} 
                    title="Common Medications"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Report Generated By:</span> Dr. {user?.firstName || ''} {user?.lastName || ''}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Generated On:</span> {new Date().toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-2">This report summarizes patient visits and overall statistics. For detailed patient records, please refer to the patient management system.</p>
            </div>
          </div>
          
          <div className="print:hidden flex justify-center mt-8">
            <button
              onClick={handlePrint}
              className="flex justify-center items-center px-6 py-3 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print Report
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-gray-50 print:bg-white print:pt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">AidX Copyrights reserved 2025</p>
          <div className="flex justify-center gap-6 mt-4 print:hidden">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">Facebook</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">LinkedIn</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">YouTube</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">Instagram</a>
          </div>
          
          <div className="hidden print:flex justify-center mt-4 gap-4">
            <span className="inline-block h-6 w-6 text-gray-500">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </span>
            <span className="inline-block h-6 w-6 text-gray-500">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </span>
            <span className="inline-block h-6 w-6 text-gray-500">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </span>
            <span className="inline-block h-6 w-6 text-gray-500">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </span>
          </div>
        </div>
      </footer>
      
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 12pt;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          .print\\:bg-white {
            background-color: white !important;
          }
          
          .print\\:pt-16 {
            padding-top: 4rem !important;
          }
          
          .print\\:mb-8 {
            margin-bottom: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
} 