'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  nextAppointment: string;
  condition: string;
  status: 'stable' | 'critical' | 'improving';
}

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: 'checkup' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'in-progress' | 'completed';
}

export default function DoctorDashboard() {
  const router = useRouter();
  const { user } = useAuth(); // Removed logout since it doesn't exist in useAuth
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'appointments'>('overview');

  // Sample data - In a real app, this would come from an API
  const recentPatients: Patient[] = [
    {
      id: '1',
      name: 'John Doe',
      age: 45,
      lastVisit: '2024-03-10',
      nextAppointment: '2024-03-24',
      condition: 'Hypertension',
      status: 'stable'
    },
    {
      id: '2',
      name: 'Jane Smith',
      age: 32,
      lastVisit: '2024-03-12',
      nextAppointment: '2024-03-20',
      condition: 'Diabetes Type 2',
      status: 'improving'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      age: 58,
      lastVisit: '2024-03-15',
      nextAppointment: '2024-03-22',
      condition: 'Cardiac Issue',
      status: 'critical'
    }
  ];

  const todayAppointments: Appointment[] = [
    {
      id: '1',
      patientName: 'Sarah Wilson',
      time: '10:00 AM',
      type: 'checkup',
      status: 'scheduled'
    },
    {
      id: '2',
      patientName: 'Robert Brown',
      time: '11:30 AM',
      type: 'follow-up',
      status: 'in-progress'
    },
    {
      id: '3',
      patientName: 'Emily Davis',
      time: '2:00 PM',
      type: 'emergency',
      status: 'scheduled'
    }
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return null;
  }

  const getStatusColor = (status: Patient['status'] | Appointment['status']) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'improving':
        return 'text-green-600 bg-green-100';
      case 'stable':
        return 'text-blue-600 bg-blue-100';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-100';
      case 'in-progress':
        return 'text-purple-600 bg-purple-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showLoginButton={false} showLogoutButton={true} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Dr. {user.displayName || 'Doctor'},</h1>
          <p className="mt-2 text-gray-600">Here's your daily overview</p>
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
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'patients'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Patients
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'appointments'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Appointments
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Total Patients</h3>
                <p className="text-3xl font-bold text-black mt-2">156</p>
                <p className="text-sm text-gray-500 mt-1">+3 this week</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Today's Appointments</h3>
                <p className="text-3xl font-bold text-black mt-2">8</p>
                <p className="text-sm text-gray-500 mt-1">2 urgent cases</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Pending Reports</h3>
                <p className="text-3xl font-bold text-black mt-2">4</p>
                <p className="text-sm text-gray-500 mt-1">Due today</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Critical Cases</h3>
                <p className="text-3xl font-bold text-black mt-2">2</p>
                <p className="text-sm text-gray-500 mt-1">Requires attention</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Patients</h3>
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">{patient.condition}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Schedule</h3>
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patientName}</p>
                        <p className="text-sm text-gray-500">{appointment.time} - {appointment.type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Patient Records</h3>
              <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                Add New Patient
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Appointment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.age}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.lastVisit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.nextAppointment}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900">View</button>
                        {' | '}
                        <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Appointment Schedule</h3>
              <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                Schedule Appointment
              </button>
            </div>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.time} - {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <button className="text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 