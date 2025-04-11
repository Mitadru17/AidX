'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import EmergencyAlert from '@/components/EmergencyAlert';

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  alternateTime?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export default function DoctorAppointments() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
    
    // Simulate fetching appointments from API
    setTimeout(() => {
      // This would be an API call in a real app
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patientName: 'John Smith',
          date: '2023-07-25',
          time: '09:30',
          status: 'confirmed',
          notes: 'Follow-up appointment'
        },
        {
          id: '2',
          patientName: 'Emily Johnson',
          date: '2023-07-25',
          time: '11:00',
          alternateTime: '14:30',
          status: 'pending',
          notes: 'New patient consultation'
        },
        {
          id: '3',
          patientName: 'Michael Brown',
          date: '2023-07-26',
          time: '13:15',
          status: 'confirmed',
        },
        {
          id: '4',
          patientName: 'Sarah Wilson',
          date: '2023-07-24',
          time: '15:45',
          status: 'completed',
          notes: 'Medication review'
        }
      ];
      
      // Fetch from localStorage if available
      const storedAppointments = localStorage.getItem('appointments');
      if (storedAppointments) {
        try {
          const parsedAppointments = JSON.parse(storedAppointments);
          setAppointments([...mockAppointments, ...parsedAppointments]);
        } catch (error) {
          console.error('Error parsing appointments from localStorage:', error);
          setAppointments(mockAppointments);
        }
      } else {
        setAppointments(mockAppointments);
      }
      
      setIsLoading(false);
    }, 1000);
  }, [isLoaded, user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };
  
  const handleStatusChange = (id: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === id ? { ...appointment, status: newStatus } : appointment
    );
    setAppointments(updatedAppointments);
    
    // Save updated appointments to localStorage
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    const appointment = appointments.find(app => app.id === id);
    if (appointment) {
      let notificationType: string;
      let notificationMessage: string;
      
      // Create different notification messages based on status
      if (newStatus === 'confirmed') {
        notificationType = 'appointment_confirmed';
        notificationMessage = `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been confirmed.`;
      } else if (newStatus === 'completed') {
        notificationType = 'appointment_completed';
        notificationMessage = `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been marked as completed.`;
      } else if (newStatus === 'cancelled') {
        notificationType = 'appointment_cancelled';
        notificationMessage = `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been cancelled.`;
      } else {
        return; // No notification for other status changes
      }
      
      // Create a notification object
      const notification = {
        id: Date.now().toString(),
        type: notificationType,
        message: notificationMessage,
        appointmentId: id,
        date: new Date().toISOString(),
        read: false
      };
      
      // Get existing notifications or create empty array
      const existingNotificationsJSON = localStorage.getItem('patientNotifications');
      const existingNotifications = existingNotificationsJSON 
        ? JSON.parse(existingNotificationsJSON) 
        : [];
      
      // Add new notification
      localStorage.setItem('patientNotifications', JSON.stringify([...existingNotifications, notification]));
    }
  };
  
  const handleAddNotes = (id: string, notes: string) => {
    // Only update and send notification if notes actually changed
    const appointment = appointments.find(app => app.id === id);
    if (appointment && appointment.notes !== notes && notes.trim() !== '') {
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === id ? { ...appointment, notes } : appointment
      );
      setAppointments(updatedAppointments);
      
      // Save updated appointments to localStorage
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      
      // Create a notification for notes update
      const notification = {
        id: Date.now().toString(),
        type: 'appointment_notes',
        message: `New notes added to your appointment on ${new Date(appointment.date).toLocaleDateString()}: "${notes}"`,
        appointmentId: id,
        date: new Date().toISOString(),
        read: false
      };
      
      // Get existing notifications or create empty array
      const existingNotificationsJSON = localStorage.getItem('patientNotifications');
      const existingNotifications = existingNotificationsJSON 
        ? JSON.parse(existingNotificationsJSON) 
        : [];
      
      // Add new notification
      localStorage.setItem('patientNotifications', JSON.stringify([...existingNotifications, notification]));
    }
  };
  
  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(appointment => appointment.status === filter);

  // Group appointments by date for better organization
  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const date = appointment.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  // Sort dates in ascending order
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  if (!isLoaded || !user) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center border-b backdrop-blur-sm bg-white/80 sticky top-0 z-50 transition-all duration-300">
        <Link href="/doctor/dashboard" className="text-xl font-semibold transform transition-transform duration-300 hover:scale-105">
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

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Patient Appointments</h1>
        
        {/* Filter status indicator */}
        {filter !== 'all' && (
          <div className={`mb-4 inline-flex items-center rounded-md px-3 py-1 text-sm
            ${filter === 'pending' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : ''}
            ${filter === 'confirmed' ? 'bg-green-50 text-green-800 border border-green-200' : ''}
            ${filter === 'completed' ? 'bg-blue-50 text-blue-800 border border-blue-200' : ''}
            ${filter === 'cancelled' ? 'bg-red-50 text-red-800 border border-red-200' : ''}
          `}>
            <span>Viewing</span>
            <span className="font-medium ml-1">{filter}</span>
            <span className="ml-1">appointments</span>
          </div>
        )}
        
        {/* Filters */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex bg-gray-100 p-1.5 rounded-lg inline-flex min-w-max">
            <button 
              onClick={() => setFilter('all')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-white shadow-sm text-black' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${filter === 'pending' ? 'bg-white shadow-sm text-black' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('confirmed')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${filter === 'confirmed' ? 'bg-white shadow-sm text-black' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Confirmed
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${filter === 'completed' ? 'bg-blue-500 shadow-sm text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Completed
            </button>
            <button 
              onClick={() => setFilter('cancelled')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${filter === 'cancelled' ? 'bg-white shadow-sm text-black' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Cancelled
            </button>
          </div>
        </div>
        
        {/* Appointment count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'appointment' : 'appointments'} found
          </p>
        </div>
        
        {/* Appointments */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            {filteredAppointments.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No {filter !== 'all' ? filter : ''} appointments found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {sortedDates.map(date => (
                  <div key={date} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="grid gap-4">
                      {groupedAppointments[date]
                        .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
                        .map((appointment) => (
                        <div key={appointment.id} className={`
                          bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow
                          ${appointment.status === 'pending' ? 'border-l-4 border-l-yellow-400' : ''}
                          ${appointment.status === 'confirmed' ? 'border-l-4 border-l-green-400' : ''}
                          ${appointment.status === 'completed' ? 'border-l-4 border-l-blue-400' : ''}
                          ${appointment.status === 'cancelled' ? 'border-l-4 border-l-red-400' : ''}
                        `}>
                          <div className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-semibold mb-2">{appointment.patientName}</h3>
                                <p className="text-gray-600 mb-1">
                                  <span className="font-medium">Time:</span> {appointment.time}
                                  {appointment.alternateTime && ` (Alternate: ${appointment.alternateTime})`}
                                </p>
                                {appointment.notes && (
                                  <p className="text-gray-600 mb-1">
                                    <span className="font-medium">Notes:</span> {appointment.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end">
                                <span 
                                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2
                                    ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                    ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                                    ${appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                                    ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                                  `}
                                >
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                                <div className="flex gap-2">
                                  {appointment.status === 'pending' && (
                                    <button
                                      onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                                    >
                                      Confirm
                                    </button>
                                  )}
                                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                    <button
                                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                  {appointment.status === 'confirmed' && (
                                    <button
                                      onClick={() => handleStatusChange(appointment.id, 'completed')}
                                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                    >
                                      Complete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Notes input */}
                            <div className="mt-4">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add notes..."
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                                  defaultValue={appointment.notes || ''}
                                  onBlur={(e) => handleAddNotes(appointment.id, e.target.value)}
                                />
                                <button
                                  className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
                                  onClick={() => {
                                    const inputs = document.querySelectorAll('input[placeholder="Add notes..."]') as NodeListOf<HTMLInputElement>;
                                    const input = Array.from(inputs).find(input => 
                                      input.closest('div[key]')?.getAttribute('key') === appointment.id
                                    );
                                    if (input) {
                                      handleAddNotes(appointment.id, input.value);
                                    }
                                  }}
                                >
                                  Save Notes
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

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
      
      {/* Emergency Alert Component */}
      <EmergencyAlert />
    </div>
  );
} 