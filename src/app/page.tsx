'use client';

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();

  const reviews = [
    {
      text: "Very good doctor",
      author: "Jamal",
      role: "Local guide",
      image: "/reviewers/jamal.jpeg"
    },
    {
      text: "Great medication",
      author: "Laila",
      role: "Cow glazer",
      image: "/reviewers/leila.jpeg"
    },
    {
      text: "A genuinely glowing doctor",
      author: "Karan",
      role: "Rich investor",
      image: "/reviewers/karan.jpeg"
    }
  ];

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
          <Link href="/find-us" className="text-gray-600 hover:text-gray-900 text-lg">
            Find us
          </Link>
          <Link href="/about-us" className="text-gray-600 hover:text-gray-900 text-lg">
            About us
          </Link>
          <div className="flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <SignInButton afterSignInUrl="/select-role">
                  <button className="px-6 py-2 bg-black text-white text-lg rounded-lg hover:bg-gray-800 transition-colors">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton afterSignUpUrl="/select-role">
                  <button className="px-6 py-2 bg-white text-black text-lg border-2 border-black rounded-lg hover:bg-gray-50 transition-colors">
                    Sign-up
                  </button>
                </SignUpButton>
              </>
            ) : (
              <button
                onClick={() => router.push('/select-role')}
                className="px-6 py-2 bg-black text-white text-lg rounded-lg hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dr.Neha Sharma, MBBS</h1>
            <p className="text-gray-600 mb-6">
              Dr.Neha has a degree in MBBS from ABC Institute of Medical sciences.
              Working in community clinic.
            </p>
            <Link 
              href="/about-us#contact"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
            >
              Contact us
            </Link>
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
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8">Public reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div key={index} className="p-6 bg-gray-50 rounded-lg">
              <p className="text-lg mb-4">{review.text}</p>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Image
                    src={review.image}
                    alt={`${review.author}'s photo`}
                    fill
                    className="rounded-full object-cover"
                    sizes="40px"
                  />
                </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Book an appointment now!</h2>
        <div className="flex justify-center gap-4">
          {!isSignedIn ? (
            <>
              <SignInButton afterSignInUrl="/select-role">
                <button className="w-[154px] py-4 bg-black text-white text-xl rounded-lg hover:bg-gray-800 transition-colors">
                  Login
                </button>
              </SignInButton>
              <SignUpButton afterSignUpUrl="/select-role">
                <button className="w-[154px] py-4 bg-white text-black text-xl border-2 border-black rounded-lg hover:bg-gray-50 transition-colors">
                  Sign-up
                </button>
              </SignUpButton>
            </>
          ) : (
            <button
              onClick={() => router.push('/select-role')}
              className="w-[154px] py-4 bg-black text-white text-xl rounded-lg hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </button>
          )}
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