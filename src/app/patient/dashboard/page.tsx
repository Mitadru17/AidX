'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NotificationBell from '@/components/NotificationBell';

export default function PatientDashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
  }, [isLoaded, user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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
          <NotificationBell />
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-start mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold transform transition-all duration-500 translate-y-0 opacity-100">
            Welcome {user.firstName},
          </h1>
          
          <div className="bg-yellow-50 p-4 rounded-lg shadow-md border border-yellow-100 transform opacity-0 animate-slideIn" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <p className="text-amber-800 font-medium mb-2">Medication Reminder</p>
            <button 
              onClick={() => {
                // Create a medication reminder notification
                const notification = {
                  id: Date.now().toString(),
                  type: 'medication_reminder',
                  message: `Reminder: Take your daily medication`,
                  date: new Date().toISOString(),
                  read: false
                };
                
                // Save to localStorage
                const existingNotifications = localStorage.getItem('patientNotifications') || '[]';
                const parsedNotifications = JSON.parse(existingNotifications);
                parsedNotifications.push(notification);
                localStorage.setItem('patientNotifications', JSON.stringify(parsedNotifications));
                
                // Show confirmation and redirect to notifications
                alert('Medication reminder activated! Check your notifications.');
                router.push('/patient/notifications');
              }}
              className="px-8 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-all duration-300 font-medium"
            >
              Yes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Previous Records */}
          <Link href="/patient/previous-records" className="flex flex-col items-center p-6 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Access your previous records
          </Link>

          {/* Chat Bot */}
          <Link 
            href="/patient/chatbot"
            className="flex flex-col items-center p-6 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" 
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            <div className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            Chat with our bot for your queries
          </Link>
          
          {/* Emergency Help Button */}
          <button 
            onClick={() => {
              // Show confirmation dialog
              if (window.confirm("Are you sure you need urgent medical assistance? This will alert your doctor immediately.")) {
                // Create emergency notification with more details
                const emergency = {
                  id: Date.now().toString(),
                  patientName: user?.fullName || `${user?.firstName} ${user?.lastName}`,
                  patientId: user?.id,
                  message: "Patient needs urgent assistance",
                  details: "Patient has requested immediate medical assistance from their dashboard.",
                  date: new Date().toISOString(),
                  read: false,
                  severity: "high"
                };
                
                // Get existing emergencies or create empty array
                const existingEmergenciesJSON = localStorage.getItem('doctorEmergencies');
                const existingEmergencies = existingEmergenciesJSON 
                  ? JSON.parse(existingEmergenciesJSON) 
                  : [];
                
                // Add new emergency
                localStorage.setItem('doctorEmergencies', JSON.stringify([...existingEmergencies, emergency]));
                
                // Show confirmation
                alert("Emergency alert sent to doctor. You will be contacted shortly. Please keep your phone accessible.");
              }
            }}
            className="flex flex-col items-center p-6 bg-red-600 text-white rounded-lg transition-all duration-300 hover:bg-red-700 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" 
            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          >
            <div className="w-12 h-12 mb-4 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="font-bold">I Need Urgent Help</span>
            <span className="text-xs mt-1 text-red-200">Doctor will respond directly</span>
          </button>

          {/* Notifications */}
          <Link 
            href="/patient/notifications"
            className="flex flex-col items-center p-6 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" 
            style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
          >
            <div className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            View all notifications
          </Link>

          {/* Daily Log */}
          <Link
            href="/patient/dailylog"
            className="flex flex-col items-center p-6 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" 
            style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
          >
            <div className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            Log your daily medication and symptoms
          </Link>

          {/* Book Appointment */}
          <Link 
            href="/patient/appointment"
            className="flex flex-col items-center p-6 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" 
            style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
          >
            <div className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            Book an appointment
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-gray-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center transform transition-all duration-500 translate-y-0 opacity-100">
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