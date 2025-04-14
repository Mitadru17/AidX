'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getPatientADRAlerts, acknowledgeADRAlert } from '@/lib/adr-service';
import type { ADRAlert } from '@/components/ADRAlert';
import ADRAlertComponent from '@/components/ADRAlert';

export default function ADRAlerts() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [alerts, setAlerts] = useState<ADRAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<ADRAlert | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/');
      } else {
        loadAlerts();
      }
    }
  }, [isLoaded, user, router]);

  const loadAlerts = () => {
    if (user?.id) {
      const patientAlerts = getPatientADRAlerts(user.id);
      setAlerts(patientAlerts);
      setLoading(false);
    }
  };

  const handleAcknowledge = (id: string) => {
    acknowledgeADRAlert(id);
    // Update the local state
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const handleShowDetails = (alert: ADRAlert) => {
    setCurrentAlert(alert);
    setShowModal(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'medium': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityDot = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-500';
      case 'medium': return 'bg-orange-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleReportADR = (data: Omit<ADRAlert, 'id' | 'dateReported' | 'acknowledged'>) => {
    // This would be handled in the ADRAlert component
    setShowModal(false);
    loadAlerts(); // Refresh the alerts after reporting
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/patient/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold mt-2">Adverse Drug Reaction Alerts</h1>
          </div>
          <button 
            onClick={() => {
              setCurrentAlert(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report New ADR
          </button>
        </div>
        
        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No ADR Alerts</h2>
            <p className="text-gray-500 mb-6">You don't have any adverse drug reaction alerts.</p>
            <button 
              onClick={() => {
                setCurrentAlert(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Report an ADR
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medication
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symptoms
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Reported
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alerts
                    .sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime())
                    .map(alert => (
                      <tr key={alert.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${alert.acknowledged ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {alert.acknowledged ? 'Acknowledged' : 'New'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{alert.medicationName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`h-2.5 w-2.5 rounded-full mr-2 ${getSeverityDot(alert.severity)}`}></div>
                            <div className="text-sm text-gray-900">{alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {alert.symptoms.slice(0, 3).map((symptom, index) => (
                              <span 
                                key={index} 
                                className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}
                              >
                                {symptom}
                              </span>
                            ))}
                            {alert.symptoms.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                +{alert.symptoms.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(alert.dateReported).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleShowDetails(alert)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            {!alert.acknowledged && (
                              <button
                                onClick={() => handleAcknowledge(alert.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Acknowledge
                              </button>
                            )}
                            <Link
                              href={`/patient/adr/${alert.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* ADR Alert Modal */}
      {showModal && (
        <ADRAlertComponent 
          alert={currentAlert || undefined}
          onClose={() => setShowModal(false)}
          onReportADR={handleReportADR}
        />
      )}
    </div>
  );
} 