'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

interface MedicalRecord {
  id: string;
  date: string;
  doctor: string;
  diagnosis: string;
  prescription: string;
  nextVisit: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface Appointment {
  id: string;
  doctor: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function PatientDashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'medications'>('overview');

  // Sample data - In a real app, this would come from an API
  const medicalRecords: MedicalRecord[] = [
    {
      id: '1',
      date: '2024-03-10',
      doctor: 'Dr. Neha',
      diagnosis: 'Common Cold',
      prescription: 'Paracetamol 500mg',
      nextVisit: '2024-03-24'
    },
    {
      id: '2',
      date: '2024-02-15',
      doctor: 'Dr. Neha',
      diagnosis: 'Annual Checkup',
      prescription: 'None',
      nextVisit: '2025-02-15'
    }
  ];

  const medications: Medication[] = [
    {
      id: '1',
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Twice daily',
      startDate: '2024-03-10',
      endDate: '2024-03-17',
      status: 'active'
    },
    {
      id: '2',
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Once daily',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active'
    }
  ];

  const appointments: Appointment[] = [
    {
      id: '1',
      doctor: 'Dr. Neha',
      date: '2024-03-24',
      time: '10:00 AM',
      type: 'Follow-up',
      status: 'scheduled'
    },
    {
      id: '2',
      doctor: 'Dr. Neha',
      date: '2024-02-15',
      time: '11:30 AM',
      type: 'Annual Checkup',
      status: 'completed'
    }
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'upcoming':
        return 'text-yellow-600 bg-yellow-100';
      case 'scheduled':
        return 'text-purple-600 bg-purple-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showLoginButton={false} showLogoutButton={true} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome {user.displayName || 'Patient'},</h1>
          <p className="mt-2 text-gray-600">Here's your health overview</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'overview'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'records'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Medical Records
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'medications'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Medications
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Next Appointment</h3>
                <p className="text-2xl font-bold text-black mt-2">Mar 24, 2024</p>
                <p className="text-sm text-gray-500 mt-1">Follow-up with Dr. Neha</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Active Medications</h3>
                <p className="text-2xl font-bold text-black mt-2">2</p>
                <p className="text-sm text-gray-500 mt-1">All on schedule</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Last Checkup</h3>
                <p className="text-2xl font-bold text-black mt-2">Feb 15, 2024</p>
                <p className="text-sm text-gray-500 mt-1">Annual health review</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Appointments</h3>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.type}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                  Book New Appointment
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Medications</h3>
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{medication.name}</p>
                        <p className="text-sm text-gray-500">
                          {medication.dosage} - {medication.frequency}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(medication.status)}`}>
                        {medication.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                  View All Medications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Medical History</h3>
              <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                Download Records
              </button>
            </div>
            <div className="space-y-4">
              {medicalRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium text-gray-900">{record.diagnosis}</p>
                      <p className="text-sm text-gray-500">Date: {record.date}</p>
                    </div>
                    <p className="text-sm text-gray-500">Doctor: {record.doctor}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Prescription:</span> {record.prescription}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Next Visit:</span> {record.nextVisit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Medication Schedule</h3>
              <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                Set Reminders
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dosage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medications.map((medication) => (
                    <tr key={medication.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{medication.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{medication.dosage}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{medication.frequency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {medication.startDate} - {medication.endDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(medication.status)}`}>
                          {medication.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">AidX Copyrights reserved 2025</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">Facebook</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">LinkedIn</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">YouTube</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 