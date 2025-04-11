'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
          <div className="bg-yellow-100 p-4 rounded-lg shadow-md transform opacity-0 animate-slideIn" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <p className="text-yellow-800">Medication Reminder</p>
            <button className="mt-2 px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all duration-300">
              Yes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Previous Records */}
          <button className="flex flex-col items-center p-6 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Access your previous records
          </button>

          {/* Chat Bot */}
          <button className="flex flex-col items-center p-6 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <div className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            Chat with our bot for your queries
          </button>

          {/* Daily Log */}
          <button className="flex flex-col items-center p-6 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <div className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            Log your daily medication and symptoms
          </button>

          {/* Book Appointment */}
          <button className="flex flex-col items-center p-6 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-0 animate-slideIn" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            <div className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            Book an appointment
          </button>
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