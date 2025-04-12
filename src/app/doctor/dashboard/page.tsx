'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DoctorDashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [unreadEmergencies, setUnreadEmergencies] = useState(0);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
    
    // Check for unread emergencies
    const checkEmergencies = () => {
      const emergenciesJSON = localStorage.getItem('doctorEmergencies');
      if (emergenciesJSON) {
        try {
          const emergencies = JSON.parse(emergenciesJSON);
          const unread = emergencies.filter((e: { read: boolean, resolved?: boolean }) => !e.read && !e.resolved).length;
          setUnreadEmergencies(unread);
        } catch (error) {
          console.error('Error checking emergencies:', error);
        }
      }
    };
    
    // Check initially and then every 5 seconds
    checkEmergencies();
    const interval = setInterval(checkEmergencies, 5000);
    
    return () => clearInterval(interval);
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
            Welcome doctor,
          </h1>
          <Link
            href="/doctor/emergencies"
            className="px-6 py-2 bg-red-500 text-white rounded-lg transition-all duration-300 hover:bg-red-600 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 animate-pulse relative"
          >
            Emergency Alert
            {unreadEmergencies > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full h-7 w-7 flex items-center justify-center font-bold text-sm animate-pulse">
                {unreadEmergencies}
              </span>
            )}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Previous Records */}
          <Link
            href="/doctor/previous-records"
            className="flex flex-col items-center p-8 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" 
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            <div className="w-16 h-16 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl text-center">Access your previous records of patients</span>
          </Link>

          {/* Patient Details Entry - Update this button to link to the patient-checkup page */}
          <Link
            href="/doctor/patient-checkup"
            className="flex flex-col items-center p-8 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" 
            style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
          >
            <div className="w-16 h-16 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-xl text-center">Enter patient details and symptoms during checkup</span>
          </Link>

          {/* Patient Vitals */}
          <button className="flex flex-col items-center p-8 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <div className="w-16 h-16 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-xl text-center">Enter patient vitals/symptoms for rounds</span>
          </button>

          {/* Appointments & Patient Management */}
          <Link 
            href="/doctor/appointments"
            className="flex flex-col items-center p-6 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" 
            style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
          >
            <div className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <span className="block text-lg">Appointments & Patient Management</span>
              <span className="text-sm opacity-90">Check patient appointments</span>
            </div>
          </Link>

          {/* End of Day Report */}
          <Link
            href="/doctor/end-of-day"
            className="flex flex-col items-center p-8 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn col-span-2" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
          >
            <div className="w-16 h-16 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl text-center">End of day report(print)</span>
          </Link>
        </div>
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