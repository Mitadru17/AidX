'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function BookAppointment() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [alternateTime, setAlternateTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: '', isError: false });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time) {
      setSubmitMessage({ text: 'Please specify both date and preferred time', isError: true });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ text: '', isError: false });
    
    try {
      // Create appointment object
      const newAppointment = {
        id: Date.now().toString(),
        patientName: user?.fullName || `${user?.firstName} ${user?.lastName}`,
        date,
        time,
        alternateTime: alternateTime || undefined,
        status: 'pending',
        notes: ''
      };
      
      // Get existing appointments from localStorage or initialize empty array
      const existingAppointmentsJSON = localStorage.getItem('appointments');
      const existingAppointments = existingAppointmentsJSON 
        ? JSON.parse(existingAppointmentsJSON) 
        : [];
      
      // Add new appointment to the array
      const updatedAppointments = [...existingAppointments, newAppointment];
      
      // Save back to localStorage
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitMessage({ 
        text: 'Appointment request submitted successfully! We will confirm your appointment shortly.',
        isError: false 
      });
      
      // Reset form
      setDate('');
      setTime('');
      setAlternateTime('');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      setSubmitMessage({ 
        text: 'There was an error submitting your appointment request. Please try again.',
        isError: true 
      });
    } finally {
      setIsSubmitting(false);
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
            href="/find-us" 
            className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1"
          >
            Find us
          </Link>
          <Link 
            href="/patient/dashboard" 
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

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-10 text-center">Book Appointment</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="date" className="block font-medium">Specify Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="time" className="block font-medium">Specify Time</label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="alternateTime" className="block font-medium">Specify Alternate Time</label>
            <input
              type="time"
              id="alternateTime"
              value={alternateTime}
              onChange={(e) => setAlternateTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-sm text-gray-500">Optional: Provide an alternate time in case your preferred time is unavailable.</p>
          </div>
          
          {submitMessage.text && (
            <div className={`p-4 rounded-md ${submitMessage.isError ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
              {submitMessage.text}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Book Appointment'}
          </button>
        </form>
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