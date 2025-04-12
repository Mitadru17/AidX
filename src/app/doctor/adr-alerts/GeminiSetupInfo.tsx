'use client';

import { useState } from 'react';

export default function GeminiSetupInfo() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors w-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {isOpen ? 'Hide Gemini API Setup Instructions' : 'Show Gemini API Setup Instructions'}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`ml-auto h-5 w-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Setting up Gemini AI Integration</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Get a Gemini API Key</h4>
              <ol className="list-decimal ml-5 space-y-2">
                <li>Go to <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Navigate to the API keys section</li>
                <li>Create a new API key</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. Add the API Key to Your Project</h4>
              <ol className="list-decimal ml-5 space-y-2">
                <li>Create or edit the <code className="bg-gray-200 px-1 py-0.5 rounded">.env.local</code> file in your project root</li>
                <li>Add the following line, replacing <code className="bg-gray-200 px-1 py-0.5 rounded">YOUR_API_KEY_HERE</code> with your actual API key:</li>
                <div className="bg-gray-800 text-white p-3 rounded mt-2 font-mono text-sm">
                  GEMINI_API_KEY=YOUR_API_KEY_HERE
                </div>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">3. Restart Your Development Server</h4>
              <ol className="list-decimal ml-5">
                <li>Stop your current Next.js development server (if running)</li>
                <li>Restart it with <code className="bg-gray-200 px-1 py-0.5 rounded">npm run dev</code></li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
              <ul className="list-disc ml-5 text-yellow-700">
                <li>Never commit your API key to version control</li>
                <li>The free tier of Gemini API has rate limits, which may affect performance during heavy usage</li>
                <li>For production use, consider implementing proper API key rotation and management</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 