'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  message: string;
  appointmentId?: string;
  recordId?: string;
  logId?: string;
  medicine?: string;
  date: string;
  read: boolean;
}

export default function PatientNotifications() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const notificationsPerPage = 10;

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
    
    // Load notifications from localStorage
    const notificationsJSON = localStorage.getItem('patientNotifications');
    if (notificationsJSON) {
      try {
        const parsedNotifications = JSON.parse(notificationsJSON);
        setNotifications(parsedNotifications);
        
        // Mark all as read when viewing the notifications page
        const updatedNotifications = parsedNotifications.map((notification: Notification) => ({
          ...notification,
          read: true
        }));
        localStorage.setItem('patientNotifications', JSON.stringify(updatedNotifications));

        // Show toast if there are unread notifications
        const unreadCount = parsedNotifications.filter((n: Notification) => !n.read).length;
        if (unreadCount > 0) {
          toast.success(`You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`);
        }
      } catch (error) {
        console.error('Error parsing notifications:', error);
      }
    }
  }, [isLoaded, user, router]);

  // Add handling for medication reminders
  useEffect(() => {
    // Function to check if any medication reminders need to be shown
    const checkMedicationReminders = () => {
      const remindersSettings = localStorage.getItem('medicationReminders');
      if (!remindersSettings) return;
      
      try {
        const remindersList = JSON.parse(remindersSettings);
        
        // Create notifications for active medication reminders
        Object.keys(remindersList).forEach(key => {
          if (remindersList[key]) {
            // Check if it's a medical record reminder
            if (!key.includes('_')) {
              const recordsJSON = localStorage.getItem('patientRecords');
              if (!recordsJSON) return;
              
              const records = JSON.parse(recordsJSON);
              const recordId = key;
              const record = records.find((r: any) => r.id === recordId);
              
              if (record && record.medication) {
                // Create a medication reminder notification for medical records
                const notification = {
                  id: `med_reminder_${Date.now()}_${recordId}`,
                  type: 'medication_reminder',
                  message: `Reminder: Take your medication - ${record.medication}`,
                  date: new Date().toISOString(),
                  read: false,
                  recordId: recordId
                };
                
                addNotificationIfNew(notification, recordId);
              }
            } 
            // Check if it's a daily log medication reminder (contains '_')
            else {
              const [logId, medicine] = key.split('_');
              if (!logId || !medicine) return;
              
              // Create a medication reminder notification for daily log medications
              const notification = {
                id: `med_reminder_${Date.now()}_${key}`,
                type: 'medication_reminder',
                message: `Reminder: Take your medication - ${medicine}`,
                date: new Date().toISOString(),
                read: false,
                logId: logId,
                medicine: medicine
              };
              
              addNotificationIfNew(notification, key);
            }
          }
        });
      } catch (error) {
        console.error('Error checking medication reminders:', error);
      }
    };
    
    // Helper function to add notification if not recently added
    const addNotificationIfNew = (notification: any, key: string) => {
      const notificationsJSON = localStorage.getItem('patientNotifications') || '[]';
      const existingNotifications = JSON.parse(notificationsJSON);
      
      // Check if we already have a similar notification in the last 8 hours
      const recentSimilarNotification = existingNotifications.some((n: any) => 
        n.type === 'medication_reminder' && 
        (
          (n.recordId && n.recordId === notification.recordId) ||
          (n.logId && n.logId === notification.logId && n.medicine === notification.medicine)
        ) &&
        (new Date().getTime() - new Date(n.date).getTime()) < 8 * 60 * 60 * 1000
      );
      
      if (!recentSimilarNotification) {
        existingNotifications.push(notification);
        localStorage.setItem('patientNotifications', JSON.stringify(existingNotifications));
        // Only update state if component is mounted
        if (mounted) {
          setNotifications([...existingNotifications]);
          toast.success(notification.message);
        }
      }
    };
    
    // Check reminders when component mounts
    checkMedicationReminders();
    
    // Set up interval to check reminders (every 4 hours)
    const reminderInterval = setInterval(checkMedicationReminders, 4 * 60 * 60 * 1000);
    
    // Listen for medication reminder set event
    const handleMedicationReminderSet = () => {
      checkMedicationReminders();
    };
    
    window.addEventListener('medicationReminderSet', handleMedicationReminderSet);
    
    return () => {
      clearInterval(reminderInterval);
      window.removeEventListener('medicationReminderSet', handleMedicationReminderSet);
    };
  }, [mounted]);

  const handleMarkAsRead = (id: string) => {
    const updatedNotifications = notifications.map((notification) => {
      if (notification.id === id) {
        return { ...notification, read: true };
      }
      return notification;
    });
    setNotifications(updatedNotifications);
    localStorage.setItem('patientNotifications', JSON.stringify(updatedNotifications));
    toast.success('Notification marked as read');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };
  
  const handleClearAll = () => {
    setNotifications([]);
    localStorage.setItem('patientNotifications', JSON.stringify([]));
    toast.success('All notifications cleared');
  };

  // Add helper function to count active medication reminders
  const countActiveMedicationReminders = () => {
    try {
      const remindersSettings = localStorage.getItem('medicationReminders');
      if (!remindersSettings) return 0;
      
      const remindersList = JSON.parse(remindersSettings);
      return Object.values(remindersList).filter(Boolean).length;
    } catch (error) {
      console.error('Error counting active medication reminders:', error);
      return 0;
    }
  };

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
            href="/patient/dashboard" 
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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <div className="flex items-center gap-3">
            {countActiveMedicationReminders() > 0 && (
              <Link
                href="/patient/previous-records?tab=medications"
                className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-2 rounded-lg border border-amber-200 transition-colors"
              >
                <span className="flex items-center justify-center bg-amber-500 text-white rounded-full w-6 h-6 text-xs font-bold">
                  {countActiveMedicationReminders()}
                </span>
                <span className="text-sm">View Active Reminders</span>
              </Link>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">You don't have any notifications.</p>
            <Link
              href="/patient/dashboard"
              className="mt-4 inline-block text-blue-500 hover:text-blue-700 transition-colors"
            >
              Return to dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(notification => (
                <div 
                  key={notification.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-800">{notification.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(notification.date).toLocaleString()}
                      </p>
                    </div>
                    {notification.type === 'appointment_confirmed' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Confirmed
                      </span>
                    )}
                    {notification.type === 'appointment_completed' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Completed
                      </span>
                    )}
                    {notification.type === 'appointment_cancelled' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Cancelled
                      </span>
                    )}
                    {notification.type === 'appointment_notes' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        Notes Added
                      </span>
                    )}
                    {notification.type === 'emergency_response' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Emergency Response
                      </span>
                    )}
                    {notification.type === 'medication_reminder' && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                        Medication
                      </span>
                    )}
                    {notification.type === 'daily_log' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Daily Log
                      </span>
                    )}
                  </div>
                  
                  {notification.appointmentId && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Link
                        href="/patient/appointment"
                        className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        View appointment details
                      </Link>
                    </div>
                  )}
                  
                  {notification.type === 'medication_reminder' && notification.recordId && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Link
                        href="/patient/previous-records"
                        className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        View medication details
                      </Link>
                    </div>
                  )}
                  
                  {notification.type === 'medication_reminder' && notification.logId && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Link
                        href={`/patient/previous-records?tab=medications&view=${notification.logId}`}
                        className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        View in daily health logs
                      </Link>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
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
    </div>
  );
} 