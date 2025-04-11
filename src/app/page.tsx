'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function LandingPage() {
  const router = useRouter();

  const reviews = [
    {
      text: "Very good doctor",
      author: "Jamal",
      role: "Local guide"
    },
    {
      text: "Great medication",
      author: "Leila",
      role: "Cow glazer"
    },
    {
      text: "A genuinely glowing doctor",
      author: "Karan",
      role: "Rich investor"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dr.Neha, MBBS</h1>
            <p className="text-gray-600 mb-6">
              Dr.Neha has a degree in MBBS from ABC Institute of Medical sciences.
              Working in community clinic.
            </p>
            <button 
              onClick={() => router.push('/contact')}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Contact us
            </button>
          </div>
          <div className="relative h-[400px]">
            <Image
              src="/doctor-image.jpg"
              alt="Dr. Neha"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8">Public reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-lg">
                <p className="text-lg mb-4">{review.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-medium">{review.author}</p>
                    <p className="text-sm text-gray-600">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Book an appointment now!</h2>
          <div className="flex justify-center gap-4">
            <Link 
              href="/login"
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Login
            </Link>
            <Link 
              href="/signup"
              className="px-6 py-3 border border-black text-black rounded-md hover:bg-gray-50"
            >
              Sign-up
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">AidX Copyright preserved 1943-2025</p>
          <div className="flex justify-center gap-4 mt-4">
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