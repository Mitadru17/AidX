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
    // Sort entries by value in descending order and take the top maxBars
    const sortedEntries = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxBars);
    
    // Find the maximum value for scaling
    const maxValue = sortedEntries.length > 0 
      ? sortedEntries[0][1]
      : 0;
    
    return (
      <div className="w-full">
        {title && <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>}
        <div className="space-y-3">
          {sortedEntries.map(([key, value]) => {
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            
            // Color based on the key or position
            let barColor;
            if (key.toLowerCase().includes('emergency')) barColor = 'bg-red-500';
            else if (key.toLowerCase().includes('checkup')) barColor = 'bg-green-500';
            else if (key.toLowerCase().includes('follow')) barColor = 'bg-blue-500';
            else if (key.toLowerCase().includes('surgery')) barColor = 'bg-purple-500';
            else if (key.toLowerCase().includes('vaccination')) barColor = 'bg-yellow-500';
            else barColor = 'bg-blue-500';
            
            return (
              <div key={key} className="w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate" title={key}>
                    {key.length > 20 ? `${key.substring(0, 20)}...` : key}
                  </span>
                  <span className="text-sm text-gray-600 font-medium">{value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${barColor} h-2 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          
          {sortedEntries.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
    );
  };

  // Create simple donut chart for gender distribution
  const DonutChart = ({ data, title }: { data: { [key: string]: number }, title: string }) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    let startAngle = 0;

    const colors = {
      'Male': '#3B82F6', // blue
      'Female': '#EC4899', // pink
      'Other': '#10B981', // green
      // Default colors for other categories
      'default1': '#6366F1', // indigo
      'default2': '#F59E0B', // amber
      'default3': '#8B5CF6'  // purple
    };

    return (
      <div className="w-full">
        {title && <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>}
        <div className="flex items-center">
          <div className="relative w-28 h-28 print:w-20 print:h-20">
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
                
                // Get color from our colors object, or use a default
                const color = colors[key as keyof typeof colors] || colors[`default${(i % 3) + 1}` as keyof typeof colors];
                
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
              <circle cx="50" cy="50" r="20" fill="white" />
              {total > 0 && (
                <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" 
                      className="text-xs font-semibold" fill="#4B5563">
                  {total}
                </text>
              )}
            </svg>
          </div>
          <div className="ml-4 space-y-1.5">
            {Object.entries(data).map(([key, value], i) => {
              const color = colors[key as keyof typeof colors] || colors[`default${(i % 3) + 1}` as keyof typeof colors];
              return (
                <div key={key} className="flex items-center text-xs">
                  <span 
                    className="inline-block w-3 h-3 mr-2 rounded-sm" 
                    style={{ backgroundColor: color }}
                  ></span>
                  <span className="text-gray-700">{key}: </span>
                  <span className="ml-1 font-medium">{value}</span>
                  <span className="ml-1 text-gray-500">
                    ({total > 0 ? Math.round(value / total * 100) : 0}%)
                  </span>
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
    <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center border-b backdrop-blur-sm bg-white/90 sticky top-0 z-50 transition-all duration-300 shadow-sm print:hidden">
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
          <Link 
            href="/find-us" 
            className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1"
          >
            Find us
          </Link>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full bg-white rounded-xl shadow-md p-6 mb-6 print:shadow-none print:p-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 print:text-2xl">
              End of Day Report
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-3 print:hidden">
              {/* Date Selection */}
              <div className="relative">
                <input
                  type="date"
                  id="report-date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="p-2.5 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:w-auto"
                />
                <button
                  onClick={() => loadRecordsForDate(reportDate)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center bg-transparent text-gray-500 hover:text-blue-600"
                  title="Refresh data"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <button
                onClick={handlePrint}
                className="inline-flex justify-center items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print Report
              </button>
            </div>
          </div>
          
          {/* Report Content for Printing */}
          <div ref={printRef} className="space-y-8">
            <div className="print:flex print:justify-between print:items-center print:mb-4">
              <div className="hidden print:block">
                <h2 className="text-2xl font-bold text-gray-800">End of Day Report</h2>
              </div>
              <div className="flex items-center gap-2 mb-4 print:mb-0">
                <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full">
                  {reportDate === new Date().toISOString().split('T')[0] ? 'Today' : reportDate}
                </div>
                {reportDate !== new Date().toISOString().split('T')[0] && (
                  <div className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1.5 rounded-full">
                    Sample Data
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2 print:text-sm">
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900">{reportStats.totalPatients}</p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-500">Checkups</p>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900">{reportStats.recordTypes['Checkup'] || 0}</p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-500">Follow-ups</p>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900">{reportStats.recordTypes['Follow-up'] || 0}</p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-500">Emergency Visits</p>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900">{reportStats.recordTypes['Emergency'] || 0}</p>
                </div>
              </div>
            </div>
            
            {/* Daily patient visits */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden print:border">
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900">
                  Today's Patient Visits <span className="text-blue-600">({todaysRecords.length})</span>
                </h3>
              </div>
              
              {todaysRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Record Type
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diagnosis
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medication
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {todaysRecords.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                {record.patientName.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="font-medium text-gray-900">{record.patientName || 'Unknown Patient'}</div>
                                {record.isPatientCreated && (
                                  <div className="text-xs text-blue-600">Self-reported</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              record.recordType === 'Checkup' ? 'bg-green-100 text-green-800' :
                              record.recordType === 'Follow-up' ? 'bg-blue-100 text-blue-800' :
                              record.recordType === 'Emergency' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.recordType || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {record.diagnosis || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {record.medication || 'None prescribed'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-white text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4 text-gray-500 font-medium">No patient records found for {reportDate}</p>
                  <p className="mt-1 text-gray-400 text-sm">Try selecting a different date or adding new patient records</p>
                </div>
              )}
            </div>
            
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4">
              {/* Left column */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 print:p-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-5 print:text-base print:mb-3">Record Type Distribution</h3>
                <SimpleBarChart 
                  data={reportStats.recordTypes} 
                  title="Visit Types"
                  maxBars={6}
                />
                
                <div className="mt-8 print:mt-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 print:text-base print:mb-2">Common Diagnoses</h4>
                  <SimpleBarChart 
                    data={reportStats.diagnoses} 
                    title=""
                    maxBars={5}
                  />
                </div>
              </div>
              
              {/* Right column */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 print:p-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 print:text-base print:mb-2">Patient Demographics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <DonutChart 
                      data={reportStats.patientGender} 
                      title="Gender Distribution"
                    />
                  </div>
                  <div>
                    <SimpleBarChart 
                      data={reportStats.patientAgeGroups} 
                      title="Age Groups"
                    />
                  </div>
                </div>
                
                <div className="mt-6 print:mt-3">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 print:text-base print:mb-2">Common Medications</h4>
                  <SimpleBarChart 
                    data={reportStats.medications} 
                    title=""
                    maxBars={5}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-lg p-4 mt-6 print:border print:text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <p className="font-medium text-gray-900">Report Generated By: Dr. Neha Sharma</p>
                  <p className="text-sm text-gray-500 mt-1">AidX Healthcare Platform</p>
                </div>
                <div className="text-sm text-gray-500">
                  Generated: {new Date().toLocaleString()}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 print:mt-1">This report is automatically generated and provides a summary of patient visits and statistics. For detailed patient records, please refer to the patient management system.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-sm text-gray-500 print:hidden">
        &copy; {new Date().getFullYear()} AidX Healthcare Solutions. All rights reserved.
      </footer>
    </div>
  );
} 
