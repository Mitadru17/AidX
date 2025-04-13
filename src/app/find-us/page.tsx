'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export default function FindUs() {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className={`py-4 px-6 flex justify-between items-center fixed w-full z-50 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md`}>
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
          {user ? (
            <Link
              href="/select-role"
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-lg rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 transform"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="px-6 py-2 text-lg rounded-lg hover:shadow-md transition-all duration-300 bg-white text-blue-700 border-2 border-blue-600 hover:-translate-y-0.5 transform"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="space-y-12 animate-fadeIn" style={{ animationDuration: '1s' }}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-3 py-1 mb-4 text-blue-600 bg-blue-50 rounded-full text-sm font-medium">Visit Us</span>
            <h1 className="text-4xl font-bold mb-6">
              Find <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-gray-600 text-lg">We're conveniently located to serve you. Come visit our clinic for personalized care.</p>
          </div>
          
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {/* Location Details */}
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 animate-slideInLeft" style={{ animationDuration: '1s', animationDelay: '0.2s', animationFillMode: 'both' }}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold">Our Location</h2>
                </div>
                <div className="pl-16 space-y-2 text-gray-600">
                  <p>123 Healthcare Avenue</p>
                  <p>Medical District</p>
                  <p>City, State 12345</p>
                  <p className="font-medium pt-2">Phone: (555) 123-4567</p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 animate-slideInLeft" style={{ animationDuration: '1s', animationDelay: '0.4s', animationFillMode: 'both' }}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold">Operating Hours</h2>
                </div>
                <div className="pl-16 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 rounded-xl shadow-md text-white animate-slideInLeft" style={{ animationDuration: '1s', animationDelay: '0.6s', animationFillMode: 'both' }}>
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h2 className="text-2xl font-bold">Emergency Contact</h2>
                </div>
                <div className="pl-11">
                  <p className="text-white/80 mb-2">Available 24/7 for emergencies</p>
                  <p className="text-xl font-bold">(555) 911-0000</p>
                </div>
              </div>
            </div>

            {/* Map Integration */}
            <div className="animate-slideInRight" style={{ animationDuration: '1s', animationDelay: '0.3s', animationFillMode: 'both' }}>
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
                <h2 className="text-2xl font-semibold mb-4">Our Location</h2>
                <div className="h-[500px] rounded-lg overflow-hidden">
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
                <div className="mt-4 text-gray-600">
                  <p className="italic">Get directions to our main clinic facility</p>
                </div>
        </div>
          </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="relative w-10 h-10">
                  <Image
                    src="/logo.png"
                    alt="AidX Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">AidX Health</span>
              </div>
              <p className="text-gray-600 mb-6">Providing exceptional healthcare with compassion and expertise.</p>
              <div className="flex gap-4">
                <a href="#" className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li><Link href="/about-us" className="text-gray-600 hover:text-blue-600 transition-colors">About Us</Link></li>
                <li><Link href="/find-us" className="text-gray-600 hover:text-blue-600 transition-colors">Find Us</Link></li>
                <li><Link href="/about-us#services" className="text-gray-600 hover:text-blue-600 transition-colors">Services</Link></li>
                <li><Link href="/about-us#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Services</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Primary Care</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Telemedicine</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Family Medicine</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Chronic Care</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">123 Healthcare St, Medical District, City</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">(123) 456-7890</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">contact@aidxhealth.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-600">© {new Date().getFullYear()} AidX Health. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 1s forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 1s forwards;
        }
        
        .animate-slideInUp {
          animation: slideInUp 1s forwards;
        }
      `}</style>
    </div>
  );
} 