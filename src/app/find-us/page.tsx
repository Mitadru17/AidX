'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function FindUs() {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          {user ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8 animate-fadeIn">
          <h1 className="text-4xl font-bold transform transition-all duration-500 translate-y-0 opacity-100">
            Find Us
          </h1>
          
          {/* Location Details */}
          <div className="space-y-6 transform opacity-0 animate-slideIn" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
              <h2 className="text-2xl font-semibold mb-4">Our Location</h2>
              <p className="text-gray-600 mb-2">123 Healthcare Avenue</p>
              <p className="text-gray-600 mb-2">Medical District</p>
              <p className="text-gray-600 mb-2">City, State 12345</p>
              <p className="text-gray-600">Contact: (555) 123-4567</p>
            </div>

            {/* Map Integration */}
            <div className="h-[400px] rounded-lg overflow-hidden shadow-lg transform opacity-0 animate-slideIn" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0401344055744!2d77.49434087473935!3d12.899797987389507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3f3c1d32c3c3%3A0x3c3c3c3c3c3c3c3c!2sAidX%20Community%20Hospital!5e0!3m2!1sen!2sin!4v1709561234567!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>

            {/* Operating Hours */}
            <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl transform opacity-0 animate-slideIn" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <h2 className="text-2xl font-semibold mb-4">Operating Hours</h2>
              <div className="space-y-2">
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-600">Saturday: 9:00 AM - 2:00 PM</p>
                <p className="text-gray-600">Sunday: Closed</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl transform opacity-0 animate-slideIn" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <h2 className="text-2xl font-semibold mb-4 text-red-600">Emergency Contact</h2>
              <p className="text-red-600 font-semibold text-lg">24/7 Emergency: (555) 911-0000</p>
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