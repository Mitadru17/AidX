'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-white text-red-600 border-2 border-red-500 rounded-lg hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 transform"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="pt-28 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-gray-50 to-sky-50 p-8 rounded-2xl shadow-sm mb-12 animate-fadeIn" style={{ animationDuration: '1s' }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <span className="inline-block px-3 py-1 mb-4 text-blue-600 bg-blue-50 rounded-full text-sm font-medium">Doctor Dashboard</span>
              <h1 className="text-4xl font-bold mb-2">
                Welcome, <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Dr. {user.firstName}</span>
              </h1>
              <p className="text-gray-600">Manage your patients and appointments efficiently</p>
            </div>
            
            {unreadEmergencies > 0 && (
              <Link href="/doctor/emergencies" className="mt-6 md:mt-0 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 flex items-center gap-4 animate-slideInRight" style={{ animationDuration: '1s', animationDelay: '0.2s', animationFillMode: 'both' }}>
                <div className="relative p-3 bg-red-500 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm animate-pulse">
                    {unreadEmergencies}
                  </span>
                </div>
                <div>
                  <p className="text-red-800 font-bold">Emergency Alerts</p>
                  <p className="text-red-700 text-sm">Patient requires urgent attention</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Records */}
          <Link href="/doctor/previous-records" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform flex flex-col items-center animate-slideInUp" style={{ animationDuration: '0.8s', animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="w-16 h-16 p-4 bg-blue-50 rounded-full mb-4 flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-1">Patient Records</h3>
            <p className="text-gray-600 text-center text-sm">View previous patient records and history</p>
          </Link>

          {/* Patient Checkup */}
          <Link href="/doctor/patient-checkup" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform flex flex-col items-center animate-slideInUp" style={{ animationDuration: '0.8s', animationDelay: '0.2s', animationFillMode: 'both' }}>
            <div className="w-16 h-16 p-4 bg-green-50 rounded-full mb-4 flex items-center justify-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-1">Patient Checkup</h3>
            <p className="text-gray-600 text-center text-sm">Enter symptoms and details during consultation</p>
          </Link>
          
          {/* ADR Alerts */}
          <Link href="/doctor/adr-alerts" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform flex flex-col items-center animate-slideInUp" style={{ animationDuration: '0.8s', animationDelay: '0.3s', animationFillMode: 'both' }}>
            <div className="w-16 h-16 p-4 bg-yellow-50 rounded-full mb-4 flex items-center justify-center text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-1">ADR Alerts</h3>
            <p className="text-gray-600 text-center text-sm">View adverse drug reaction alerts</p>
          </Link>

          {/* Appointments Management */}
          <Link href="/doctor/appointments" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform flex flex-col items-center animate-slideInUp" style={{ animationDuration: '0.8s', animationDelay: '0.4s', animationFillMode: 'both' }}>
            <div className="w-16 h-16 p-4 bg-indigo-50 rounded-full mb-4 flex items-center justify-center text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-1">Appointments</h3>
            <p className="text-gray-600 text-center text-sm">Manage your patient appointments</p>
          </Link>

          {/* Patient Management */}
          <Link href="/doctor/patient-management" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 hover:-translate-y-1 transform flex flex-col items-center animate-slideInUp" style={{ animationDuration: '0.8s', animationDelay: '0.5s', animationFillMode: 'both' }}>
            <div className="w-16 h-16 p-4 bg-purple-50 rounded-full mb-4 flex items-center justify-center text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-1">Patient Management</h3>
            <p className="text-gray-600 text-center text-sm">Manage patient profiles and details</p>
          </Link>

          {/* Emergency Alerts */}
          <Link href="/doctor/emergencies" className="relative bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-md hover:shadow-lg border-2 border-red-300 transition-all duration-300 hover:-translate-y-1 transform flex flex-col items-center animate-slideInUp group overflow-hidden" style={{ animationDuration: '0.8s', animationDelay: '0.6s', animationFillMode: 'both' }}>
            {unreadEmergencies > 0 && (
              <div className="absolute -top-1 -right-1 w-20 h-20">
                <div className="absolute transform rotate-45 bg-yellow-500 text-white font-bold py-1 right-[-35px] top-[32px] w-[170px] text-center text-xs">
                  URGENT
                </div>
              </div>
            )}
            <div className="w-16 h-16 p-3 bg-white rounded-full mb-4 flex items-center justify-center text-red-600 shadow-md transform transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-1 text-white">Emergency Alerts</h3>
            <p className="text-white/90 text-center text-sm">View and respond to patient emergencies</p>
            {unreadEmergencies > 0 && (
              <div className="mt-3 flex items-center justify-center">
                <div className="relative">
                  <span className="px-3 py-1 bg-white text-red-700 text-sm font-medium rounded-full shadow-sm flex items-center">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-yellow-400 opacity-75 mr-2"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 mr-2"></span>
                    {unreadEmergencies} new alert{unreadEmergencies !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
            {!unreadEmergencies && (
              <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                All clear
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10"></div>
          </Link>
        </div>
        
        {/* End of Day Report - Full Width */}
        <div className="mt-10">
          <Link href="/doctor/end-of-day" className="block bg-blue-600 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform animate-slideInUp" style={{ animationDuration: '0.8s', animationDelay: '0.7s', animationFillMode: 'both' }}>
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 p-4 bg-white rounded-full mb-4 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center text-white mb-2">Generate End of Day Report</h3>
              <p className="text-white/80 text-center">Generate and print daily summary report</p>
            </div>
          </Link>
        </div>
        
        {/* Stats Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Today's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upcoming Appointments
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">You have no upcoming appointments today.</p>
                <Link href="/doctor/appointments" className="mt-3 text-blue-600 font-medium text-sm flex items-center">
                  View schedule
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Patient Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-700">Patients seen today</span>
                  <span className="text-gray-500 text-sm">0</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-700">Week's total patients</span>
                  <span className="text-gray-500 text-sm">0</span>
                </div>
              </div>
            </div>
          </div>
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