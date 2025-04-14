'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getADRAlerts, acknowledgeADRAlert } from '@/lib/adr-service';
import type { ADRAlert } from '@/components/ADRAlert';

export default function ADRAlertDetail() {
  const params = useParams();
  const router = useRouter();
  const [alert, setAlert] = useState<ADRAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alertId = params.id as string;
    if (!alertId) {
      router.push('/patient/dashboard');
      return;
    }

    // Get the specific ADR alert
    const allAlerts = getADRAlerts();
    const foundAlert = allAlerts.find(a => a.id === alertId);
    
    if (foundAlert) {
      setAlert(foundAlert);
    } else {
      // Alert not found
      router.push('/patient/dashboard');
    }
    setLoading(false);
  }, [params.id, router]);

  const handleAcknowledge = () => {
    if (alert) {
      acknowledgeADRAlert(alert.id);
      
      // Update local state
      setAlert({
        ...alert,
        acknowledged: true
      });
      
      // Show confirmation
      window.alert('ADR alert has been acknowledged.');
    }
  };

  const getSeverityDisplay = (severity: string) => {
    switch (severity) {
      case 'low':
        return {
          label: 'Low',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'medium':
        return {
          label: 'Medium',
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'high':
        return {
          label: 'High',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: null
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">ADR Alert Not Found</h2>
        <p className="text-gray-500 mb-6 text-center">The adverse drug reaction alert you're looking for could not be found.</p>
        <Link href="/patient/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const severity = getSeverityDisplay(alert.severity);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/patient/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className={`p-6 border-b ${severity.color}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {severity.icon}
                <h1 className="text-2xl font-bold ml-2">ADR Alert Details</h1>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${severity.color}`}>
                {severity.label} Severity
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Medication Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Medication Name</label>
                    <div className="text-gray-800 font-medium">{alert.medicationName}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date Reported</label>
                    <div className="text-gray-800">
                      {new Date(alert.dateReported).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-4">Symptoms</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {alert.symptoms.length > 0 ? (
                      alert.symptoms.map((symptom, index) => (
                        <span 
                          key={index} 
                          className={`px-3 py-1 rounded-full text-sm ${severity.color}`}
                        >
                          {symptom}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No symptoms recorded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {alert.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-line">{alert.description}</p>
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <ul className="list-disc list-inside text-gray-800 space-y-2">
                  <li>Contact your healthcare provider as soon as possible</li>
                  <li>Do not stop taking the medication without consulting your doctor</li>
                  <li>If experiencing severe symptoms, seek immediate medical attention</li>
                  <li>Keep track of any changes in symptoms and report them to your doctor</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              {!alert.acknowledged ? (
                <button
                  onClick={handleAcknowledge}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Acknowledge Alert
                </button>
              ) : (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  Alert Acknowledged
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 