'use client';

import { SignInButton, SignUpButton, useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll position for navbar styling
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const reviews = [
    {
      text: "Dr. Neha provided excellent care for my chronic condition. Her attentive approach made a significant difference in my health journey.",
      author: "James Wilson",
      role: "Patient",
      rating: 5,
      image: "/reviewers/jamal.jpeg"
    },
    {
      text: "The medication management system here is outstanding. My prescriptions are always accurate and the follow-up is phenomenal.",
      author: "Sarah Thompson",
      role: "Patient",
      rating: 5,
      image: "/reviewers/leila.jpeg"
    },
    {
      text: "As someone with complex medical needs, I've never felt more supported. Dr. Neha takes time to understand each patient's unique situation.",
      author: "Rajiv Kumar",
      role: "Patient",
      rating: 5,
      image: "/reviewers/karan.jpeg"
    }
  ];

  const services = [
    {
      title: "Primary Care",
      description: "Comprehensive healthcare for you and your family",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      )
    },
    {
      title: "Chronic Disease Management",
      description: "Specialized care for ongoing health conditions",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )
    },
    {
      title: "Telemedicine",
      description: "Virtual consultations from your home",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      )
    }
  ];

  return (
    <div className={`min-h-screen bg-white transition-opacity ${mounted ? 'opacity-100' : 'opacity-0'} duration-500`}>
      {/* Navigation */}
      <nav className={`py-4 px-6 flex justify-between items-center fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-sm shadow-md py-3' : 'bg-white'
      }`}>
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
        <div className="hidden md:flex items-center gap-8">
          <Link href="/find-us" className="text-gray-700 hover:text-blue-600 transition-colors text-lg font-medium hover:-translate-y-0.5 duration-200 transform">
            Find us
          </Link>
          <Link href="/about-us" className="text-gray-700 hover:text-blue-600 transition-colors text-lg font-medium hover:-translate-y-0.5 duration-200 transform">
            About us
          </Link>
          <div className="flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <SignInButton afterSignInUrl="/select-role">
                  <button className="px-6 py-2 text-lg rounded-lg hover:shadow-md transition-all duration-300 bg-white text-blue-700 border-2 border-blue-600 hover:-translate-y-0.5 transform">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton afterSignUpUrl="/select-role">
                  <button className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-lg rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 transform">
                    Sign-up
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/select-role')}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-lg rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 transform"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => signOut()}
                  className="px-6 py-2 bg-white text-red-600 border-2 border-red-500 rounded-lg hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 transform"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button className="md:hidden flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-sky-50 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl animate-fadeIn" style={{ animationDuration: '1s' }}>
              <span className="inline-block px-3 py-1 mb-4 text-blue-600 bg-blue-50 rounded-full text-sm font-medium">Advanced Healthcare</span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Your Health, Our <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Priority</span>
              </h1>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Dr. Neha Sharma brings 15+ years of medical expertise to provide personalized, patient-centered care. 
                Experience healthcare that puts you first with our comprehensive services and state-of-the-art technology.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/about-us#contact"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform flex items-center text-lg"
                >
                  <span>Contact us</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                {!isSignedIn && (
                  <SignUpButton afterSignUpUrl="/select-role">
                    <button className="px-6 py-3 bg-white text-blue-700 border-2 border-blue-600 rounded-lg hover:shadow-md transition-all duration-300 hover:-translate-y-1 transform text-lg">
                      Get Started
            </button>
                  </SignUpButton>
                )}
              </div>
              
              <div className="mt-12 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative">
                      <Image
                        src={`https://i.pravatar.cc/80?img=${i + 10}`}
                        alt="Patient"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">From 500+ patient reviews</p>
                </div>
              </div>
          </div>
            
            <div className="relative h-[500px] animate-slideInRight" style={{ animationDuration: '1s', animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-700/20 rounded-xl -rotate-3 transform"></div>
              <div className="absolute inset-0 rounded-xl overflow-hidden rotate-3 shadow-xl transform transition-all hover:rotate-0 duration-500">
            <Image
              src="/doctor-image.jpg"
                  alt="Dr. Neha Sharma"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-xl"
                  priority
                />
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg animate-fadeIn flex items-center" style={{ animationDuration: '1s', animationDelay: '0.8s', animationFillMode: 'both' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Board Certified</h3>
                  <p className="text-xs text-gray-600">Excellence in patient care</p>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg animate-fadeIn" style={{ animationDuration: '1s', animationDelay: '1s', animationFillMode: 'both' }}>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold">24/7 Support</h3>
                    <p className="text-xs text-gray-600">Always here for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-blue-600 bg-blue-50 rounded-full text-sm font-medium">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Comprehensive Healthcare Services</h2>
            <p className="text-gray-600 text-lg">We provide a wide range of medical services to meet your healthcare needs with personalized attention and care.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="p-8 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform animate-slideInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6 text-white">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Learn more
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
              <p className="text-blue-100">Years Experience</p>
            </div>
            <div className="p-6 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl md:text-5xl font-bold mb-2">5000+</div>
              <p className="text-blue-100">Patients Treated</p>
            </div>
            <div className="p-6 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <div className="text-4xl md:text-5xl font-bold mb-2">99%</div>
              <p className="text-blue-100">Patient Satisfaction</p>
            </div>
            <div className="p-6 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <p className="text-blue-100">Patient Support</p>
            </div>
          </div>
          </div>
        </div>

        {/* Reviews Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-blue-600 bg-blue-50 rounded-full text-sm font-medium">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">What Our Patients Say</h2>
            <p className="text-gray-600 text-lg">Discover why patients trust us with their healthcare needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div 
                key={index} 
                className="p-8 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform animate-slideInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 border-2 border-blue-600 rounded-full p-0.5">
                    <Image
                      src={`https://i.pravatar.cc/96?img=${index + 20}`}
                      alt={`${review.author}'s photo`}
                      fill
                      className="rounded-full object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.author}</p>
                    <p className="text-sm text-blue-600">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl overflow-hidden shadow-xl animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-10 md:p-16 flex flex-col justify-center animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight">Ready to experience better healthcare?</h2>
                <p className="text-blue-100 text-lg mb-8">Book an appointment today and take the first step towards improving your health with personalized care from our expert team.</p>
                <div className="flex flex-wrap gap-4">
                  {!isSignedIn ? (
                    <>
                      <SignInButton afterSignInUrl="/select-role">
                        <button className="px-6 py-3 bg-white text-blue-700 text-lg font-medium rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Login
                        </button>
                      </SignInButton>
                      <SignUpButton afterSignUpUrl="/select-role">
                        <button className="px-6 py-3 bg-transparent text-white text-lg font-medium border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 transform flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Sign-up
                        </button>
                      </SignUpButton>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push('/select-role')}
                        className="px-6 py-3 bg-white text-blue-700 text-lg font-medium rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Go to Dashboard
                      </button>
                      <button
                        onClick={() => signOut()}
                        className="px-6 py-3 bg-transparent text-white text-lg font-medium border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 transform flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="relative h-[400px] md:h-auto animate-slideInRight" style={{ animationDelay: '0.4s' }}>
                <Image
                  src="/doctor-patient-consultation.jpg"
                  alt="Doctor consultation"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent mix-blend-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <a href="#" className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
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

      {/* Add animations for this page */}
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