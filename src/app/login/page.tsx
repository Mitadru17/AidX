'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, LoginCredentials } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, loginWithGoogle, loginWithApple, loginWithPhone, confirmPhoneCode, setupRecaptcha } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    role: 'patient',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Setup recaptcha when component mounts
    if (typeof window !== 'undefined') {
      setupRecaptcha('recaptcha-container');
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isPhoneLogin && showVerificationInput) {
        await confirmPhoneCode(verificationCode);
      } else if (isPhoneLogin) {
        const recaptchaVerifier = setupRecaptcha('recaptcha-container');
        await loginWithPhone(phoneNumber, recaptchaVerifier);
        setShowVerificationInput(true);
        setLoading(false);
        return;
      } else if (isSignUp) {
        await signup(credentials.email, credentials.password);
      } else {
        await login(credentials.email, credentials.password);
      }
      router.push(`/${credentials.role}`);
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError('');
    setLoading(true);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithApple();
      }
      router.push(`/${credentials.role}`);
    } catch (error: any) {
      setError(error.message || `Error signing in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials((prev: LoginCredentials) => ({
      ...prev,
      [name]: name === 'role' ? value as UserRole : value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to AidX
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? 'Create a new account' : 'Please sign in to your account'}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.55-2.09-.56-3.24 0-1.44.71-2.23.51-3.08-.35-4.64-4.75-4.13-11.59 1.06-11.81 1.39.06 2.39.92 3.24.92.85 0 2.44-1.13 3.71-.96.63.03 2.39.25 3.52 1.88-3.89 2.3-3.26 8.31.87 9.97zm-4.24-18.05c-2.19.21-4.05 2.48-3.77 4.4 2.02.14 4.11-2.3 3.77-4.4z"
                />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Select Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={credentials.role}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsPhoneLogin(false);
                    setShowVerificationInput(false);
                  }}
                  className={`flex-1 text-center py-2 px-4 rounded-md ${!isPhoneLogin ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPhoneLogin(true);
                    setShowVerificationInput(false);
                  }}
                  className={`flex-1 text-center py-2 px-4 rounded-md ${isPhoneLogin ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Phone
                </button>
              </div>

              {isPhoneLogin ? (
                showVerificationInput ? (
                  <div>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    <input
                      id="verificationCode"
                      name="verificationCode"
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter verification code"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="+1234567890"
                    />
                  </div>
                )
              ) : (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={credentials.email}
                      onChange={handleChange}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                      value={credentials.password}
                      onChange={handleChange}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your password"
                    />
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (
                  isPhoneLogin ? (
                    showVerificationInput ? 'Verify Code' : 'Send Code'
                  ) : (
                    isSignUp ? 'Sign up' : 'Sign in'
                  )
                )}
              </button>
            </div>

            {!isPhoneLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
} 