'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiCalendar, FiClock, FiUser, FiUsers, FiFilter, 
  FiSearch, FiCheck, FiX, FiClipboard, FiMessageSquare, 
  FiArrowLeft, FiChevronDown, FiChevronUp, FiEdit, 
  FiTrash2, FiMoreVertical, FiPlusCircle, FiFileText,
  FiBell, FiPhone, FiMail
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import EmergencyAlert from '@/components/EmergencyAlert';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  profileImage: string;
  contactNumber?: string;
  email?: string;
}

interface Appointment {
  id: string;
  patient: Patient;
  date: string;
  time: string;
  endTime: string;
  alternateTime?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  type: 'regular' | 'followup' | 'urgent' | 'consultation' | 'checkup';
  notes?: string;
  hasAttachments?: boolean;
  isNew?: boolean;
  reason?: string;
  location?: string;
}

interface Message {
  id: string;
  patientId: string;
  doctorId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

// Helper function to format date for display
const formatDate = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
};

// Helper function to format time
const formatTime = (timeStr: string | undefined) => {
  // Check if timeStr is undefined or empty
  if (!timeStr) {
    return ''; // Return empty string or some default value
  }
  
  // Parse the time (assuming format "HH:MM")
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export default function DoctorAppointments() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [openAppointmentId, setOpenAppointmentId] = useState<string | null>(null);
  const [isAddingNotes, setIsAddingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messagePatient, setMessagePatient] = useState<Patient | null>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

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
          patient: {
            id: 'p1',
            name: 'John Smith',
            age: 42,
            gender: 'Male',
            profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
            contactNumber: '+1 (555) 123-4567',
            email: 'john.smith@example.com'
          },
          date: '2023-07-25',
          time: '09:30',
          endTime: '10:00',
          status: 'confirmed',
          type: 'followup',
          notes: 'Follow-up appointment for hypertension treatment',
          location: 'Room 203'
        },
        {
          id: '2',
          patient: {
            id: 'p2',
            name: 'Emily Johnson',
            age: 35,
            gender: 'Female',
            profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
            contactNumber: '+1 (555) 987-6543',
            email: 'emily.j@example.com'
          },
          date: '2023-07-25',
          time: '11:00',
          endTime: '11:30',
          alternateTime: '14:30',
          status: 'pending',
          type: 'regular',
          notes: 'New patient consultation',
          isNew: true,
          reason: 'Persistent headaches and dizziness',
          location: 'Room 101'
        },
        {
          id: '3',
          patient: {
            id: 'p3',
            name: 'Michael Brown',
            age: 56,
            gender: 'Male',
            profileImage: 'https://randomuser.me/api/portraits/men/59.jpg',
            contactNumber: '+1 (555) 345-6789',
            email: 'michael.brown@example.com'
          },
          date: '2023-07-26',
          time: '13:15',
          endTime: '14:00',
          status: 'confirmed',
          type: 'checkup',
          location: 'Room 305'
        },
        {
          id: '4',
          patient: {
            id: 'p4',
            name: 'Sarah Wilson',
            age: 28,
            gender: 'Female',
            profileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
            contactNumber: '+1 (555) 234-5678',
            email: 'sarah.w@example.com'
          },
          date: '2023-07-24',
          time: '15:45',
          endTime: '16:15',
          status: 'completed',
          type: 'consultation',
          notes: 'Medication review for anxiety treatment',
          hasAttachments: true,
          location: 'Room 203'
        },
        {
          id: '5',
          patient: {
            id: 'p5',
            name: 'Robert Williams',
            age: 68,
            gender: 'Male',
            profileImage: 'https://randomuser.me/api/portraits/men/79.jpg',
            contactNumber: '+1 (555) 876-5432',
            email: 'robert.w@example.com'
          },
          date: '2023-07-24',
          time: '10:30',
          endTime: '11:00',
          status: 'cancelled',
          type: 'regular',
          notes: 'Patient requested cancellation due to personal reasons',
          location: 'Room 101'
        },
        {
          id: '6',
          patient: {
            id: 'p6',
            name: 'Jessica Taylor',
            age: 32,
            gender: 'Female',
            profileImage: 'https://randomuser.me/api/portraits/women/54.jpg',
            contactNumber: '+1 (555) 765-4321',
            email: 'jessica.t@example.com'
          },
          date: '2023-07-26',
          time: '16:00',
          endTime: '16:30',
          status: 'confirmed',
          type: 'urgent',
          notes: 'Patient reported severe abdominal pain',
          location: 'Room 305'
        },
        {
          id: '7',
          patient: {
            id: 'p7',
            name: 'David Anderson',
            age: 47,
            gender: 'Male',
            profileImage: 'https://randomuser.me/api/portraits/men/40.jpg',
            contactNumber: '+1 (555) 432-1098',
            email: 'david.a@example.com'
          },
          date: new Date().toISOString().split('T')[0], // Today's date
          time: '14:00',
          endTime: '14:30',
          status: 'confirmed',
          type: 'regular',
          location: 'Room 203'
        }
      ];
      
      // Fetch from localStorage if available
      const storedAppointments = localStorage.getItem('appointments');
      if (storedAppointments) {
        try {
          const parsedAppointments = JSON.parse(storedAppointments);
          // Logic to merge and deduplicate appointments would go here
          setAppointments([...mockAppointments, ...parsedAppointments.filter((a: Appointment) => 
            !mockAppointments.some(m => m.id === a.id)
          )]);
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
  
  const handleStatusChange = (id: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled') => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === id ? { ...appointment, status: newStatus } : appointment
    );
    setAppointments(updatedAppointments);
    
    // Save updated appointments to localStorage
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    // Find the appointment that was updated
    const appointment = appointments.find(app => app.id === id);
    if (appointment) {
      let notificationType: string;
      let notificationMessage: string;
      let toastMessage: string;
      
      // Create different notification messages based on status
      if (newStatus === 'confirmed') {
        notificationType = 'appointment_confirmed';
        notificationMessage = `Appointment with ${appointment.patient.name} on ${new Date(appointment.date).toLocaleDateString()} at ${formatTime(appointment.time)} has been confirmed.`;
        toastMessage = "Appointment confirmed successfully";
      } else if (newStatus === 'completed') {
        notificationType = 'appointment_completed';
        notificationMessage = `Appointment with ${appointment.patient.name} on ${new Date(appointment.date).toLocaleDateString()} at ${formatTime(appointment.time)} has been marked as completed.`;
        toastMessage = "Appointment marked as completed";
      } else if (newStatus === 'cancelled') {
        notificationType = 'appointment_cancelled';
        notificationMessage = `Appointment with ${appointment.patient.name} on ${new Date(appointment.date).toLocaleDateString()} at ${formatTime(appointment.time)} has been cancelled.`;
        toastMessage = "Appointment cancelled";
      } else if (newStatus === 'rescheduled') {
        notificationType = 'appointment_rescheduled';
        notificationMessage = `Appointment with ${appointment.patient.name} has been rescheduled.`;
        toastMessage = "Appointment rescheduled";
      } else {
        notificationType = 'appointment_status_change';
        notificationMessage = `Status of appointment with ${appointment.patient.name} has been updated to ${newStatus}.`;
        toastMessage = `Appointment status changed to ${newStatus}`;
      }
      
      // Show toast notification
      toast.success(toastMessage);
      
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
      
      // Show toast notification
      toast.success("Notes added successfully");
      
      // Create a notification for notes update
      const notification = {
        id: Date.now().toString(),
        type: 'appointment_notes',
        message: `New notes added to your appointment on ${new Date(appointment.date).toLocaleDateString()}: "${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}"`,
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
  
  // Toggle appointment details
  const toggleAppointmentDetails = (id: string) => {
    setOpenAppointmentId(openAppointmentId === id ? null : id);
    setIsAddingNotes(false);
  };
  
  // Open details modal for an appointment
  const openDetailsModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };
  
  // Close details modal
  const closeDetailsModal = () => {
    setSelectedAppointment(null);
    setIsDetailsModalOpen(false);
  };

  // Filter and search logic
  const getFilteredAppointments = () => {
    // First apply status filter
    let filtered = appointments;
    
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = appointments.filter(app => app.date === today);
    } else if (filter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      filtered = appointments.filter(app => app.date >= today && app.status !== 'completed' && app.status !== 'cancelled');
    } else if (filter !== 'all') {
      filtered = appointments.filter(app => app.status === filter);
    }
    
    // Then apply date selection if any
    if (selectedDate) {
      filtered = filtered.filter(app => app.date === selectedDate);
    }
    
    // Then apply search term if any
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.patient.name.toLowerCase().includes(term) ||
        app.type.toLowerCase().includes(term) ||
        (app.notes && app.notes.toLowerCase().includes(term)) ||
        (app.reason && app.reason.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };
  
  const filteredAppointments = getFilteredAppointments();

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

  // Get list of all unique dates from appointments for date filter
  const allAppointmentDates = Array.from(new Set(appointments.map(app => app.date))).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  // Get patient list for quick navigation
  const patientList = appointments
    .map(app => app.patient)
    .filter((patient, index, self) => 
      self.findIndex(p => p && patient && p.id && patient.id && p.id.toString() === patient.id.toString()) === index
    );

  // Getting counts for filters
  const getTodayCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(app => app.date === today).length;
  };
  
  const getUpcomingCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(app => app.date >= today && app.status !== 'completed' && app.status !== 'cancelled').length;
  };
  
  const getPendingCount = () => {
    return appointments.filter(app => app.status === 'pending').length;
  };
  
  const getConfirmedCount = () => {
    return appointments.filter(app => app.status === 'confirmed').length;
  };

  const openMessageModal = (patient: Patient) => {
    setMessagePatient(patient);
    setIsMessageModalOpen(true);
    setTimeout(() => messageRef.current?.focus(), 100);
  };

  const closeMessageModal = () => {
    setMessagePatient(null);
    setIsMessageModalOpen(false);
    setMessageText('');
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !messagePatient || !user) {
      toast.error("Please enter a message");
      return;
    }

    // Create a new message object
    const newMessage: Message = {
      id: Date.now().toString(),
      patientId: messagePatient.id,
      doctorId: user.id,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    // Get existing messages from localStorage or create empty array
    const existingMessagesJSON = localStorage.getItem('doctorMessages');
    const existingMessages: Message[] = existingMessagesJSON 
      ? JSON.parse(existingMessagesJSON) 
      : [];
    
    // Add new message
    localStorage.setItem('doctorMessages', JSON.stringify([...existingMessages, newMessage]));

    // Create a notification for the patient
    const notification = {
      id: Date.now().toString(),
      type: 'new_message',
      message: `Dr. ${user.fullName || 'Your Doctor'} sent you a message: "${messageText.substring(0, 30)}${messageText.length > 30 ? '...' : ''}"`,
      patientId: messagePatient.id,
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

    toast.success("Message sent successfully");
    closeMessageModal();
  };

  if (!isLoaded || !user) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Message Modal */}
      {isMessageModalOpen && messagePatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                  {messagePatient.profileImage ? (
                    <Image 
                      src={messagePatient.profileImage}
                      alt={messagePatient.name || 'Patient'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Message to {messagePatient.name}</h3>
                  <div className="text-xs text-gray-500">
                    {messagePatient.age} yrs • {messagePatient.gender}
                  </div>
                </div>
              </div>
              <button 
                onClick={closeMessageModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-4">
              <textarea
                ref={messageRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows={6}
                placeholder="Type your message here..."
              ></textarea>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={closeMessageModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center ${
                    messageText.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'
                  }`}
                >
                  <FiMessageSquare className="mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/doctor/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
              <FiArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Appointment Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors"
              onClick={() => router.push('/doctor/appointment/new')}
            >
              <FiPlusCircle size={18} className="mr-2" />
              New Appointment
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiUser size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tool Bar with Search, Filter, and View Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2 w-full md:w-auto">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === 'all' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Appointments
              </button>
              <button 
                onClick={() => setFilter('today')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === 'today' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today ({getTodayCount()})
              </button>
              <button 
                onClick={() => setFilter('upcoming')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === 'upcoming' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming ({getUpcomingCount()})
              </button>
              <button 
                onClick={() => setFilter('pending')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === 'pending' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({getPendingCount()})
              </button>
              <button 
                onClick={() => setFilter('confirmed')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === 'confirmed' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmed ({getConfirmedCount()})
              </button>
            </div>
            
            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 flex items-center ${
                  viewMode === 'list' 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiUsers className="mr-2" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 flex items-center ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiCalendar className="mr-2" />
                Calendar
              </button>
            </div>
          </div>
          
          {/* Date Filter Bar - Only shown if there are appointments */}
          {allAppointmentDates.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Filter by date</h3>
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate(null)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {allAppointmentDates.map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date === selectedDate ? null : date)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors flex flex-col items-center min-w-[100px] ${
                      date === selectedDate 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs mb-1 opacity-80">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="font-medium">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs mt-1 opacity-80">
                      {groupedAppointments[date]?.length || 0} appt{(groupedAppointments[date]?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="flex justify-center mb-4">
                  <FiCalendar className="w-16 h-16 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {filter !== 'all' || selectedDate
                    ? "Try changing your filters or selecting a different date."
                    : "You don't have any appointments scheduled."}
                </p>
                <button 
                  onClick={() => {
                    setFilter('all');
                    setSelectedDate(null);
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center"
                >
                  <FiFilter className="mr-2" />
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {sortedDates.map(date => (
                  <div key={date} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <h2 className="text-lg font-medium text-gray-900">
                        {formatDate(date)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {groupedAppointments[date].length} appointment{groupedAppointments[date].length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div>
                      {groupedAppointments[date]
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map(appointment => (
                          <div key={appointment.id} className="border-b last:border-b-0">
                            {/* Appointment Card */}
                            <div 
                              className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() => toggleAppointmentDetails(appointment.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {/* Time */}
                                  <div className="flex-shrink-0 w-20 text-center">
                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                      {formatTime(appointment.time)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {formatTime(appointment.endTime)}
                                    </div>
                                  </div>
                                  
                                  {/* Status Indicator */}
                                  <div className="mx-4">
                                    <span 
                                      className={`inline-block w-3 h-3 rounded-full ${
                                        appointment.status === 'confirmed' ? 'bg-green-500' :
                                        appointment.status === 'pending' ? 'bg-yellow-500' :
                                        appointment.status === 'completed' ? 'bg-blue-500' :
                                        appointment.status === 'cancelled' ? 'bg-red-500' :
                                        appointment.status === 'rescheduled' ? 'bg-purple-500' : 'bg-gray-500'
                                      }`}
                                    ></span>
                                  </div>
                                  
                                  {/* Patient Info */}
                                  <div className="flex items-center">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                                      {appointment.patient && appointment.patient.profileImage ? (
                                        <Image 
                                          src={appointment.patient.profileImage}
                                          alt={appointment.patient.name || 'Patient'}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                          <FiUser className="text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 flex items-center">
                                        {appointment.patient?.name || 'Unknown Patient'}
                                        {appointment.isNew && (
                                          <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">New</span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 flex items-center">
                                        <span>{appointment.patient?.age || '--'} yrs</span>
                                        <span className="mx-1">•</span>
                                        <span>{appointment.patient?.gender || '--'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center">
                                  {/* Appointment Type */}
                                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full mr-4 ${
                                    appointment.type === 'regular' ? 'bg-gray-100 text-gray-800' :
                                    appointment.type === 'followup' ? 'bg-blue-100 text-blue-800' :
                                    appointment.type === 'urgent' ? 'bg-red-100 text-red-800' :
                                    appointment.type === 'consultation' ? 'bg-purple-100 text-purple-800' :
                                    appointment.type === 'checkup' ? 'bg-green-100 text-green-800' : ''
                                  }`}>
                                    {appointment.type ? appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1) : 'Unknown'}
                                  </span>
                                  
                                  {/* Status */}
                                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    appointment.status === 'rescheduled' ? 'bg-purple-100 text-purple-800' : ''
                                  }`}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </span>
                                  
                                  {/* Expand Arrow */}
                                  <button className="p-2 ml-4 text-gray-400 hover:text-gray-700">
                                    {openAppointmentId === appointment.id ? <FiChevronUp /> : <FiChevronDown />}
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Expanded Details */}
                            {openAppointmentId === appointment.id && (
                              <div className="px-6 py-4 bg-gray-50 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Appointment Details</h3>
                                    <div className="space-y-2">
                                      {appointment.location && (
                                        <div className="text-sm text-gray-600 flex items-start">
                                          <span className="font-medium mr-2">Location:</span>
                                          <span>{appointment.location}</span>
                                        </div>
                                      )}
                                      {appointment.reason && (
                                        <div className="text-sm text-gray-600 flex items-start">
                                          <span className="font-medium mr-2">Reason:</span>
                                          <span>{appointment.reason}</span>
                                        </div>
                                      )}
                                      {appointment.alternateTime && (
                                        <div className="text-sm text-gray-600 flex items-start">
                                          <span className="font-medium mr-2">Alternate Time:</span>
                                          <span>{formatTime(appointment.alternateTime)}</span>
                                        </div>
                                      )}
                                      <div className="text-sm text-gray-600 flex items-start">
                                        <span className="font-medium mr-2">Notes:</span>
                                        {isAddingNotes && openAppointmentId === appointment.id ? (
                                          <div className="flex-1">
                                            <textarea
                                              ref={notesRef}
                                              value={newNote}
                                              onChange={(e) => setNewNote(e.target.value)}
                                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                              rows={3}
                                              placeholder="Add notes about the appointment..."
                                            ></textarea>
                                            <div className="flex justify-end space-x-2 mt-2">
                                              <button
                                                onClick={() => {
                                                  setIsAddingNotes(false);
                                                  setNewNote('');
                                                }}
                                                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                onClick={() => {
                                                  handleAddNotes(appointment.id, newNote);
                                                  setIsAddingNotes(false);
                                                  setNewNote('');
                                                }}
                                                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                              >
                                                Save
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex-1">
                                            <span className={appointment.notes ? "text-gray-600" : "text-gray-400 italic"}>
                                              {appointment.notes || "No notes added yet"}
                                            </span>
                                            <button
                                              onClick={() => {
                                                setIsAddingNotes(true);
                                                setOpenAppointmentId(appointment.id);
                                                setNewNote(appointment.notes || '');
                                                setTimeout(() => notesRef.current?.focus(), 0);
                                              }}
                                              className="ml-2 text-blue-600 text-xs hover:text-blue-800"
                                            >
                                              {appointment.notes ? "Edit" : "Add"}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Patient Contact</h3>
                                    <div className="space-y-2">
                                      {appointment.patient.contactNumber && (
                                        <div className="text-sm text-gray-600 flex items-center">
                                          <FiPhone className="mr-2 text-gray-400" size={14} />
                                          <span>{appointment.patient.contactNumber}</span>
                                        </div>
                                      )}
                                      {appointment.patient.email && (
                                        <div className="text-sm text-gray-600 flex items-center">
                                          <FiMail className="mr-2 text-gray-400" size={14} />
                                          <span>{appointment.patient.email}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
                                  {appointment.status === 'pending' && (
                                    <button
                                      onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                      className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center"
                                    >
                                      <FiCheck className="mr-1" size={14} />
                                      Confirm
                                    </button>
                                  )}
                                  
                                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                    <button
                                      onClick={() => handleStatusChange(appointment.id, 'completed')}
                                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                                    >
                                      <FiCheck className="mr-1" size={14} />
                                      Mark Completed
                                    </button>
                                  )}
                                  
                                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                    <button
                                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                      className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
                                    >
                                      <FiX className="mr-1" size={14} />
                                      Cancel
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => router.push(`/doctor/previous-records?patient=${appointment.patient.id}`)}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
                                  >
                                    <FiFileText className="mr-1" size={14} />
                                    View Records
                                  </button>
                                  
                                  <button
                                    onClick={() => openMessageModal(appointment.patient)}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
                                  >
                                    <FiMessageSquare className="mr-1" size={14} />
                                    Message
                                  </button>
                                </div>
                              </div>
                            )}
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
      <Toaster position="top-right" />
    </div>
  );
} 