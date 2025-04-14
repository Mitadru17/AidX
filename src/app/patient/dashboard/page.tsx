'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NotificationBell from '@/components/NotificationBell';
import ADRAlert from '@/components/ADRAlert';
import { addADRAlert, getUnacknowledgedADRAlerts } from '@/lib/adr-service';
import type { ADRAlert as ADRAlertType } from '@/components/ADRAlert';

export default function PatientDashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showGlowEffect, setShowGlowEffect] = useState(false);
  const [showADRModal, setShowADRModal] = useState(false);
  const [currentADRAlert, setCurrentADRAlert] = useState<ADRAlertType | null>(null);
  const [pendingADRAlerts, setPendingADRAlerts] = useState<ADRAlertType[]>([]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
    
    // Create glow effect animation
    setTimeout(() => {
      setShowGlowEffect(true);
    }, 1000);

    // Load any unacknowledged ADR alerts for this patient
    if (user?.id) {
      const unacknowledgedAlerts = getUnacknowledgedADRAlerts(user.id);
      setPendingADRAlerts(unacknowledgedAlerts);
      
      // Set the first unacknowledged alert as current if any exist
      if (unacknowledgedAlerts.length > 0) {
        setCurrentADRAlert(unacknowledgedAlerts[0]);
        setShowADRModal(true);
      }
    }
  }, [isLoaded, user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) {
      return ''; // or handle the error as needed
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleReportADR = (data: Omit<ADRAlertType, 'id' | 'dateReported' | 'acknowledged'>) => {
    // Add the patient ID if not already present
    const completeData = {
      ...data,
      patientId: data.patientId || (user?.id || '')
    };
    
    // Add the ADR alert to storage
    const newAlert = addADRAlert(completeData);
    
    // Close the modal
    setShowADRModal(false);
    
    // Notify the user
    alert('Your ADR report has been submitted successfully.');
  };

  const handleADRAlertClose = () => {
    setShowADRModal(false);
    setCurrentADRAlert(null);
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
    <div className={`min-h-screen bg-white transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center fixed w-full z-50 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="relative w-10 h-10">
            <Image
              src="/logo.png"
              alt="AidX Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">AidX Health</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/find-us" 
            className="text-gray-700 hover:text-blue-600 transition-colors hover:-translate-y-0.5 duration-200 transform"
          >
            Find us
          </Link>
          <Link 
            href="/" 
            className="text-gray-700 hover:text-blue-600 transition-colors hover:-translate-y-0.5 duration-200 transform"
          >
            Main page
          </Link>
          <NotificationBell className="hover:scale-110 transition-transform" />
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-white text-red-600 border-2 border-red-500 rounded-lg hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 transform hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="pt-28 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-gray-50 to-sky-50 p-8 rounded-2xl shadow-sm mb-12 animate-fadeIn overflow-hidden relative" style={{ animationDuration: '1s' }}>
          {showGlowEffect && (
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          )}
          <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
            <div>
              <span className="inline-block px-3 py-1 mb-4 text-blue-600 bg-blue-50 rounded-full text-sm font-medium border border-blue-100">Patient Dashboard</span>
              <h1 className="text-4xl font-bold mb-2">
                Welcome, <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">{user.firstName}</span>
              </h1>
              <p className="text-gray-600">Manage your health information and appointments in one place</p>
            </div>
            
            <div className="mt-6 md:mt-0 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-sm border border-amber-200 flex items-center gap-4 animate-slideInRight hover:shadow-md transition-all duration-300 group" style={{ animationDuration: '1s', animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div className="p-3 bg-amber-200 rounded-full group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-amber-800 font-medium">Medication Reminder</p>
                <p className="text-amber-700 text-sm mb-2">Set a reminder for your daily medication</p>
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
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 transform text-sm font-medium flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Set Reminder
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Previous Records */}
          <Link href="/patient/previous-records" className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform flex flex-col items-center animate-slideInUp overflow-hidden relative" style={{ animationDuration: '0.8s', animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-16 h-16 p-4 bg-blue-50 rounded-full mb-4 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300 group-hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 group-hover:rotate-6 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-1 group-hover:text-blue-600 transition-colors">Medical Records</h3>
            <p className="text-gray-600 text-center text-sm">Access your complete health history</p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View details
              </span>
            </div>
          </Link>

          {/* Chat Bot */}
          <Link href="/patient/chatbot" className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform flex flex-col items-center animate-slideInUp overflow-hidden relative" style={{ animationDuration: '0.8s', animationDelay: '0.2s', animationFillMode: 'both' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 p-4 bg-purple-50 rounded-full mb-4 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300 group-hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 group-hover:rotate-6 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-500 justify-center items-center text-white text-xs">AI</span>
              </span>
            </div>
            <h3 className="text-lg font-semibold text-center mb-1 group-hover:text-purple-600 transition-colors">Medical Assistant</h3>
            <p className="text-gray-600 text-center text-sm">Chat with our AI for quick guidance</p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Start chatting
              </span>
            </div>
          </Link>
          
          {/* ADR Reporting */}
          <div 
            onClick={() => {
              setCurrentADRAlert(null);
              setShowADRModal(true);
            }}
            className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform flex flex-col items-center animate-slideInUp overflow-hidden relative cursor-pointer" 
            style={{ animationDuration: '0.8s', animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-16 h-16 p-4 bg-orange-50 rounded-full mb-4 flex items-center justify-center text-orange-600 group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300 group-hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 group-hover:rotate-6 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-1 group-hover:text-orange-600 transition-colors">Report ADR</h3>
            <p className="text-gray-600 text-center text-sm">Report adverse drug reactions</p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Report now
              </span>
            </div>
          </div>
          
          {/* Emergency Help Button */}
          <button onClick={() => {
              // Show confirmation dialog
              if (confirm('Are you sure you want to send an emergency alert? This will notify emergency services.')) {
                // Logic to handle emergency alert
                router.push('/patient/emergency');
              }
            }} 
            className="col-span-1 md:col-span-3 mt-4 group bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-xl shadow-md hover:shadow-lg border border-red-500 transition-all duration-300 transform animate-slideInUp overflow-hidden relative flex items-center justify-center gap-4" 
            style={{ animationDuration: '0.8s', animationDelay: '0.5s', animationFillMode: 'both' }}
          >
            <div className="w-12 h-12 p-2 bg-red-500 bg-opacity-30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-8 h-8 animate-pulse">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1">Emergency Help</h3>
              <p className="text-white text-opacity-80">Get immediate medical assistance</p>
            </div>
          </button>
        </div>
      </main>
      
      {/* ADR Alert Modal */}
      {showADRModal && (
        <ADRAlert 
          alert={currentADRAlert || undefined}
          onClose={handleADRAlertClose}
          onReportADR={handleReportADR}
        />
      )}
    </div>
  );
} 