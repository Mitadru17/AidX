'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiSearch, FiFilter, FiArrowLeft, FiEdit, FiTrash2, FiPlus, FiCalendar, FiMessageSquare, FiPhone, FiMail, FiFileText, FiChevronRight, FiHeart, FiActivity, FiClock, FiAlertCircle } from 'react-icons/fi';

// Mock data for patients
const MOCK_PATIENTS = [
  {
    id: 1,
    name: 'John Smith',
    age: 42,
    gender: 'Male',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@example.com',
    lastVisit: '2023-03-15',
    nextAppointment: '2023-04-20',
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    status: 'Stable',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    bloodGroup: 'O+',
    vitals: { bp: '120/80', temp: '98.6°F', pulse: '72 bpm', respRate: '16 rpm' }
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    age: 35,
    gender: 'Female',
    phone: '+1 (555) 987-6543',
    email: 'sarah.j@example.com',
    lastVisit: '2023-03-22',
    nextAppointment: '2023-04-05',
    conditions: ['Asthma', 'Allergies'],
    status: 'Follow-up Required',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    bloodGroup: 'A+',
    vitals: { bp: '118/75', temp: '98.2°F', pulse: '68 bpm', respRate: '14 rpm' }
  },
  {
    id: 3,
    name: 'Michael Chen',
    age: 56,
    gender: 'Male',
    phone: '+1 (555) 345-6789',
    email: 'mchen@example.com',
    lastVisit: '2023-02-10',
    nextAppointment: '2023-05-12',
    conditions: ['Coronary Artery Disease', 'Hyperlipidemia'],
    status: 'Stable',
    profileImage: 'https://randomuser.me/api/portraits/men/59.jpg',
    bloodGroup: 'B+',
    vitals: { bp: '130/85', temp: '98.4°F', pulse: '75 bpm', respRate: '17 rpm' }
  },
  {
    id: 4,
    name: 'Emily Rodriguez',
    age: 28,
    gender: 'Female',
    phone: '+1 (555) 234-5678',
    email: 'emily.r@example.com',
    lastVisit: '2023-03-30',
    nextAppointment: '2023-04-30',
    conditions: ['Anxiety', 'Migraines'],
    status: 'Stable',
    profileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    bloodGroup: 'AB-',
    vitals: { bp: '115/70', temp: '98.5°F', pulse: '65 bpm', respRate: '15 rpm' }
  },
  {
    id: 5,
    name: 'Robert Williams',
    age: 68,
    gender: 'Male',
    phone: '+1 (555) 876-5432',
    email: 'rwilliams@example.com',
    lastVisit: '2023-03-05',
    nextAppointment: '2023-04-15',
    conditions: ['COPD', 'Arthritis', 'Hypertension'],
    status: 'Needs Attention',
    profileImage: 'https://randomuser.me/api/portraits/men/79.jpg',
    bloodGroup: 'O-',
    vitals: { bp: '145/90', temp: '99.1°F', pulse: '88 bpm', respRate: '21 rpm' }
  }
];

// Status tag component
const StatusTag = ({ status }: { status: string }) => {
  let bgColor = 'bg-green-100 text-green-800';
  let icon = <FiHeart className="mr-1" />;
  
  if (status === 'Follow-up Required') {
    bgColor = 'bg-yellow-100 text-yellow-800';
    icon = <FiClock className="mr-1" />;
  } else if (status === 'Needs Attention') {
    bgColor = 'bg-red-100 text-red-800';
    icon = <FiAlertCircle className="mr-1" />;
  }
  
  return (
    <span className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${bgColor}`}>
      {icon} {status}
    </span>
  );
};

// Patient card component
const PatientCard = ({ patient, isSelected, onClick }: { patient: any, isSelected: boolean, onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className={`p-4 border rounded-lg mb-3 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-center">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
          <Image 
            src={patient.profileImage} 
            alt={patient.name} 
            fill 
            className="object-cover"
          />
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900">{patient.name}</h3>
            <StatusTag status={patient.status} />
          </div>
          <div className="flex text-sm text-gray-500 mt-1">
            <span className="mr-3">{patient.age} yrs</span>
            <span className="mr-3">{patient.gender}</span>
            <span>{patient.bloodGroup}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <FiCalendar className="mr-1" size={12} />
          <span>Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center">
          <FiActivity className="mr-1" size={12} />
          <span>{patient.conditions[0]}{patient.conditions.length > 1 ? '...' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default function PatientManagement() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [filteredPatients, setFilteredPatients] = useState(MOCK_PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
  }, [isLoaded, user, router]);

  useEffect(() => {
    const results = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.conditions.some((c: string) => c.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPatients(results);
  }, [searchTerm, patients]);

  useEffect(() => {
    let filtered = [...patients];
    
    if (activeFilter === 'stable') {
      filtered = patients.filter(p => p.status === 'Stable');
    } else if (activeFilter === 'follow-up') {
      filtered = patients.filter(p => p.status === 'Follow-up Required');
    } else if (activeFilter === 'attention') {
      filtered = patients.filter(p => p.status === 'Needs Attention');
    }
    
    setFilteredPatients(filtered);
  }, [activeFilter, patients]);

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/doctor/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
              <FiArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Patient Management</h1>
          </div>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <FiPlus size={20} className="mr-2" />
            Add New Patient
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Patient List */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex mb-4 overflow-x-auto pb-2">
                <button 
                  className={`mr-2 px-3 py-1 text-sm rounded-full whitespace-nowrap ${activeFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All Patients
                </button>
                <button 
                  className={`mr-2 px-3 py-1 text-sm rounded-full whitespace-nowrap ${activeFilter === 'stable' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => setActiveFilter('stable')}
                >
                  Stable
                </button>
                <button 
                  className={`mr-2 px-3 py-1 text-sm rounded-full whitespace-nowrap ${activeFilter === 'follow-up' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => setActiveFilter('follow-up')}
                >
                  Follow-up
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${activeFilter === 'attention' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => setActiveFilter('attention')}
                >
                  Needs Attention
                </button>
              </div>
              
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <PatientCard 
                      key={patient.id}
                      patient={patient}
                      isSelected={selectedPatient?.id === patient.id}
                      onClick={() => handlePatientSelect(patient)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiUser size={40} className="mx-auto mb-2 opacity-40" />
                    <p>No patients match your search</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content - Patient Details */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            {selectedPatient ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Patient Profile Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white/30">
                      <Image 
                        src={selectedPatient.profileImage} 
                        alt={selectedPatient.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-6">
                      <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                      <div className="flex items-center mt-1 text-blue-100">
                        <span className="mr-3">{selectedPatient.age} years</span>
                        <span className="mr-3">•</span>
                        <span className="mr-3">{selectedPatient.gender}</span>
                        <span className="mr-3">•</span>
                        <span>Blood Type: {selectedPatient.bloodGroup}</span>
                      </div>
                    </div>
                    <div className="ml-auto flex space-x-2">
                      <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <FiEdit size={18} />
                      </button>
                      <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-3 border-b">
                  <Link href={`/doctor/appointments?patient=${selectedPatient.id}`} className="flex flex-col items-center justify-center p-4 text-center border-r hover:bg-gray-50 transition-colors">
                    <FiCalendar size={24} className="text-blue-600 mb-2" />
                    <span className="text-sm font-medium">Schedule Appointment</span>
                  </Link>
                  <Link href={`/doctor/patient-checkup?patient=${selectedPatient.id}`} className="flex flex-col items-center justify-center p-4 text-center border-r hover:bg-gray-50 transition-colors">
                    <FiFileText size={24} className="text-blue-600 mb-2" />
                    <span className="text-sm font-medium">Medical Records</span>
                  </Link>
                  <Link href={`/doctor/message?patient=${selectedPatient.id}`} className="flex flex-col items-center justify-center p-4 text-center hover:bg-gray-50 transition-colors">
                    <FiMessageSquare size={24} className="text-blue-600 mb-2" />
                    <span className="text-sm font-medium">Send Message</span>
                  </Link>
                </div>
                
                {/* Patient Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <FiPhone className="w-5 h-5 text-gray-400 mr-3" />
                        <span>{selectedPatient.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FiMail className="w-5 h-5 text-gray-400 mr-3" />
                        <span>{selectedPatient.email}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Appointments</h3>
                    <div>
                      <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                        <span>Last Visit</span>
                        <span>{new Date(selectedPatient.lastVisit).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Next Appointment</span>
                        <span className="font-medium text-blue-600">{new Date(selectedPatient.nextAppointment).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Medical Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                    
                    <div className="mb-4">
                      <h4 className="text-sm text-gray-500 mb-2">Medical Conditions</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.conditions.map((condition: string, idx: number) => (
                          <span key={idx} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-gray-500 mb-2">Latest Vitals</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 block">Blood Pressure</span>
                          <span className="text-lg font-medium text-gray-900">{selectedPatient.vitals.bp}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 block">Temperature</span>
                          <span className="text-lg font-medium text-gray-900">{selectedPatient.vitals.temp}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 block">Pulse Rate</span>
                          <span className="text-lg font-medium text-gray-900">{selectedPatient.vitals.pulse}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 block">Respiratory Rate</span>
                          <span className="text-lg font-medium text-gray-900">{selectedPatient.vitals.respRate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Records */}
                <div className="border-t p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Recent Medical Records</h3>
                    <Link href={`/doctor/previous-records?patient=${selectedPatient.id}`} className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800">
                      View All Records
                      <FiChevronRight size={16} className="ml-1" />
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">General Checkup</div>
                        <div className="text-sm text-gray-500">March 15, 2023</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Patient presented with mild hypertension. Medication adjusted and lifestyle changes recommended.
                      </p>
                      <div className="text-sm">
                        <span className="text-blue-600 font-medium">Dr. {user.firstName} {user.lastName}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">Lab Results Review</div>
                        <div className="text-sm text-gray-500">February 28, 2023</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Cholesterol levels elevated. HbA1c within normal range. Recommended dietary adjustments.
                      </p>
                      <div className="text-sm">
                        <span className="text-blue-600 font-medium">Dr. Johnson</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-blue-50 p-6 rounded-full mb-4">
                  <FiUser size={48} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Patient</h3>
                <p className="text-gray-500 max-w-md">
                  Choose a patient from the list to view their complete profile, medical history, and manage their care plan.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 