'use client';

import { SignInButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AboutUs() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0">
              Login
            </button>
          </SignInButton>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Doctor Info Section */}
        <div className="mb-16 transform opacity-0 animate-slideIn" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">Dr.Neha Sharma, MBBS</h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Junior Doctor Neha has been a dedicated member of The Community College health services for the past five years. Highly regarded by her patients, she routinely attends to over 30 individuals daily and is a well-known and trusted figure within the local community.
              </p>
            </div>
            <div className="w-full md:w-1/3 transition-transform duration-300 hover:scale-105">
              <Image
                src="/doctor-image.jpg"
                alt="Dr. Neha Sharma"
                width={400}
                height={500}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div id="contact" className="max-w-2xl mx-auto transform opacity-0 animate-slideIn" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <h2 className="text-3xl font-bold mb-8 text-center">Contact us</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black transition-all duration-300"
                  placeholder="Name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black transition-all duration-300"
                  placeholder="Name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black transition-all duration-300"
                placeholder="Name@mail.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Your message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black transition-all duration-300"
                placeholder="Enter your question or message"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-black text-white py-3 px-4 rounded-md transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 bg-gray-50 transition-all duration-300">
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