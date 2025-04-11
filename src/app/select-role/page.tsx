'use client';

import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SelectRole() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  const handleRoleSelect = async (role: 'doctor' | 'patient') => {
    // Here you would typically save the role to your database
    // For now, we'll just redirect to the appropriate dashboard
    if (role === 'doctor') {
      router.push('/doctor/dashboard');
    } else {
      router.push('/patient/dashboard');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center border-b">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="AidX Logo"
            width={32}
            height={32}
          />
          <span className="text-xl font-semibold">AidX</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/find-us" className="text-gray-600 hover:text-gray-900">
            Find us
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Main page
          </Link>
        </div>
      </nav>

      {/* Role Selection Section */}
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Select Your Role
            </h2>
            <p className="text-lg text-gray-600">
              Choose how you want to use AidX
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('doctor')}
              className="w-full py-4 bg-black text-white text-xl rounded-lg hover:bg-gray-800 transition-colors"
            >
              For Doctors
            </button>
            <button
              onClick={() => handleRoleSelect('patient')}
              className="w-full py-4 bg-white text-black text-xl border-2 border-black rounded-lg hover:bg-gray-50 transition-colors"
            >
              For Patients
            </button>
            <button
              onClick={handleSignOut}
              className="w-full py-4 bg-black text-white text-xl rounded-lg hover:bg-gray-800 transition-colors mt-8"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">AidX Copyrights reserved 2025</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">Facebook</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">LinkedIn</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">YouTube</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 