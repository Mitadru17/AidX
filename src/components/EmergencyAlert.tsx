'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Emergency {
  id: string;
  patientName: string;
  patientId?: string;
  message: string;
  details?: string;
  date: string;
  read: boolean;
  severity?: 'low' | 'medium' | 'high';
  resolved?: boolean;
  doctorResponses?: DoctorResponse[];
}

interface DoctorResponse {
  id: string;
  message: string;
  date: string;
}

export default function EmergencyAlert() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [showEmergencies, setShowEmergencies] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{[key: string]: string}>({});
  const [viewArchived, setViewArchived] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Function to load emergencies
    const loadEmergencies = () => {
      const emergenciesJSON = localStorage.getItem('doctorEmergencies');
      if (emergenciesJSON) {
        try {
          const parsedEmergencies = JSON.parse(emergenciesJSON);
          setEmergencies(parsedEmergencies);
          
          // Auto-show if there are unread high severity emergencies
          const hasUnreadUrgent = parsedEmergencies.some(
            (e: Emergency) => !e.read && e.severity === 'high' && !e.resolved
          );
          
          if (hasUnreadUrgent) {
            setShowEmergencies(true);
            
            // Play alert sound for new emergencies
            try {
              const audio = new Audio('/alert.mp3');
              audio.play().catch(e => console.error('Could not play alert sound:', e));
              
              // Also show a browser notification if supported
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Emergency Medical Alert', {
                  body: 'A patient needs urgent assistance',
                  icon: '/icon.png'
                });
              } else if ('Notification' in window && Notification.permission !== 'denied') {
                Notification.requestPermission();
              }
            } catch (error) {
              console.error('Error playing alert:', error);
            }
          }
        } catch (error) {
          console.error('Error parsing emergencies:', error);
        }
      }
    };
    
    // Load emergencies on mount
    loadEmergencies();
    
    // Check for new emergencies every 5 seconds
    const interval = setInterval(loadEmergencies, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleMarkAsRead = (id: string) => {
    const updatedEmergencies = emergencies.map(emergency => 
      emergency.id === id ? { ...emergency, read: true } : emergency
    );
    
    setEmergencies(updatedEmergencies);
    localStorage.setItem('doctorEmergencies', JSON.stringify(updatedEmergencies));
  };
  
  const handleMarkAllAsRead = () => {
    const updatedEmergencies = emergencies.map(emergency => ({
      ...emergency,
      read: true
    }));
    
    setEmergencies(updatedEmergencies);
    localStorage.setItem('doctorEmergencies', JSON.stringify(updatedEmergencies));
  };
  
  const handleResolveEmergency = (id: string) => {
    const updatedEmergencies = emergencies.map(emergency => 
      emergency.id === id ? { ...emergency, resolved: true, read: true } : emergency
    );
    
    setEmergencies(updatedEmergencies);
    localStorage.setItem('doctorEmergencies', JSON.stringify(updatedEmergencies));
  };
  
  const handleSendResponse = (id: string) => {
    if (!responseMessage[id] || responseMessage[id].trim() === '') return;
    
    const response: DoctorResponse = {
      id: Date.now().toString(),
      message: responseMessage[id],
      date: new Date().toISOString()
    };
    
    const updatedEmergencies = emergencies.map(emergency => {
      if (emergency.id === id) {
        const doctorResponses = emergency.doctorResponses || [];
        return { 
          ...emergency, 
          doctorResponses: [...doctorResponses, response],
          read: true 
        };
      }
      return emergency;
    });
    
    setEmergencies(updatedEmergencies);
    localStorage.setItem('doctorEmergencies', JSON.stringify(updatedEmergencies));
    
    // Clear the response message
    setResponseMessage({...responseMessage, [id]: ''});
    
    // Also create a notification for the patient
    const emergency = emergencies.find(e => e.id === id);
    if (emergency) {
      const notification = {
        id: Date.now().toString(),
        type: 'emergency_response',
        message: `Doctor's response to your emergency: "${response.message}"`,
        appointmentId: id,
        date: new Date().toISOString(),
        read: false
      };
      
      // Get existing notifications or create empty array
      const existingNotificationsJSON = localStorage.getItem('patientNotifications');
      const existingNotifications = existingNotificationsJSON 
        ? JSON.parse(existingNotificationsJSON) 
        : [];
      
      // Add new notification
      localStorage.setItem('patientNotifications', JSON.stringify([...existingNotifications, notification]));
    }
  };
  
  const handleClear = (id: string) => {
    const updatedEmergencies = emergencies.filter(emergency => emergency.id !== id);
    setEmergencies(updatedEmergencies);
    localStorage.setItem('doctorEmergencies', JSON.stringify(updatedEmergencies));
  };
  
  const viewAllEmergencies = () => {
    router.push('/doctor/emergencies');
    setShowEmergencies(false);
  };
  
  const activeEmergencies = emergencies.filter(e => !e.resolved);
  const resolvedEmergencies = emergencies.filter(e => e.resolved);
  const displayedEmergencies = viewArchived ? emergencies : activeEmergencies;
  
  const unreadCount = activeEmergencies.filter(e => !e.read).length;
  const highPriorityCount = activeEmergencies.filter(e => e.severity === 'high' && !e.resolved).length;
  
  if (emergencies.length === 0) {
    return null;
  }
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Emergency Alert Badge */}
      <button
        onClick={() => setShowEmergencies(!showEmergencies)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white font-medium transition-all duration-300 ${
          unreadCount > 0 && emergencies.some(e => e.severity === 'high' && !e.read) 
            ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse shadow-red-200 shadow-lg' 
            : unreadCount > 0 
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-200 shadow-lg' 
              : 'bg-gradient-to-r from-gray-600 to-gray-700'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>
          {unreadCount > 0 
            ? `${unreadCount} ${emergencies.some(e => e.severity === 'high' && !e.read) ? 'Urgent Alert' + (unreadCount > 1 ? 's' : '') + '!' : 'Alert' + (unreadCount > 1 ? 's' : '')}`
            : 'Emergencies'
          }
        </span>
        {unreadCount > 0 && (
          <span className="flex h-3 w-3 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        )}
      </button>
      
      {/* Emergencies Panel */}
      {showEmergencies && (
        <div className="mt-4 w-[450px] max-w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 transform animate-slideIn">
          <div className={`p-4 text-white flex justify-between items-center ${
            highPriorityCount > 0 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : unreadCount > 0 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                : 'bg-gradient-to-r from-gray-700 to-gray-800'
          }`}>
            <div>
              <h3 className="font-bold flex items-center text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Emergency Alerts
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs opacity-90 mt-1">You have {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium px-2 py-1 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-all"
                >
                  Mark all read
                </button>
              )}
              <button 
                onClick={() => setViewArchived(!viewArchived)}
                className="text-xs font-medium px-2 py-1 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-all"
              >
                {viewArchived ? 'Hide Resolved' : 'Show All'}
              </button>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between text-xs text-gray-600">
            <div className="flex space-x-3">
              <span>{activeEmergencies.length} active</span>
              <span>{highPriorityCount} high priority</span>
              <span>{resolvedEmergencies.length} resolved</span>
            </div>
            <button
              onClick={viewAllEmergencies}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto">
            {displayedEmergencies.length === 0 ? (
              <div className="p-8 text-center">
                <div className="bg-gray-100 rounded-full p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-800">No emergency alerts</h4>
                <p className="text-gray-500 text-sm mt-1">All caught up! No active emergencies to review.</p>
              </div>
            ) : (
              displayedEmergencies
                .sort((a, b) => {
                  // Sort by severity first (high → medium → low)
                  const severityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
                  const severityA = a.severity || 'undefined';
                  const severityB = b.severity || 'undefined';
                  
                  if (severityOrder[severityA] !== severityOrder[severityB]) {
                    return severityOrder[severityA] - severityOrder[severityB];
                  }
                  
                  // Then by resolved status (unresolved first)
                  if (a.resolved !== b.resolved) {
                    return a.resolved ? 1 : -1;
                  }
                  // Then by read status (unread first)
                  if (a.read !== b.read) {
                    return a.read ? 1 : -1;
                  }
                  // Then by date (newest first)
                  return new Date(b.date).getTime() - new Date(a.date).getTime();
                })
                .map(emergency => (
                  <div 
                    key={emergency.id} 
                    className={`p-4 border-b transition-all duration-200 hover:bg-gray-50 ${
                      emergency.resolved ? 'bg-gray-50' : !emergency.read ? 
                        emergency.severity === 'high' ? 'bg-red-50' : 
                        emergency.severity === 'medium' ? 'bg-orange-50' : 
                        'bg-blue-50' : ''
                    } ${selectedEmergency === emergency.id ? 'border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 
                        className="font-semibold text-lg flex items-center cursor-pointer"
                        onClick={() => setSelectedEmergency(selectedEmergency === emergency.id ? null : emergency.id)}
                      >
                        {!emergency.read && !emergency.resolved && (
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            emergency.severity === 'high' ? 'bg-red-600 animate-pulse' :
                            emergency.severity === 'medium' ? 'bg-orange-500' : 
                            'bg-blue-500'
                          }`}></span>
                        )}
                        {emergency.resolved && (
                          <span className="w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                        )}
                        <span className="mr-2">{emergency.patientName}</span>
                        <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                          emergency.severity === 'high' ? 'bg-red-100 text-red-800' :
                          emergency.severity === 'medium' ? 'bg-orange-100 text-orange-800' : 
                          emergency.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {emergency.severity || 'Normal'}
                        </span>
                        {emergency.resolved && (
                          <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            Resolved
                          </span>
                        )}
                      </h4>
                      <button
                        onClick={() => handleClear(emergency.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className={`${selectedEmergency === emergency.id ? 'block' : 'hidden'}`}>
                      <p className="text-gray-700 mb-2 font-medium">{emergency.message}</p>
                      {emergency.details && (
                        <p className="text-gray-600 mb-2 text-sm bg-gray-50 p-2 rounded">{emergency.details}</p>
                      )}
                    </div>
                    
                    <div className={`flex justify-between items-center text-sm ${selectedEmergency !== emergency.id ? 'mt-2' : 'mt-4'}`}>
                      <span className="text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(emergency.date)}
                      </span>
                      <div className="flex gap-2">
                        {!emergency.read && !emergency.resolved && (
                          <button
                            onClick={() => handleMarkAsRead(emergency.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Mark read
                          </button>
                        )}
                        {!emergency.resolved && (
                          <button
                            onClick={() => handleResolveEmergency(emergency.id)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Doctor's response history */}
                    {selectedEmergency === emergency.id && emergency.doctorResponses && emergency.doctorResponses.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Your responses:
                        </h5>
                        <div className="space-y-2">
                          {emergency.doctorResponses.map(response => (
                            <div key={response.id} className="bg-blue-50 p-3 rounded-lg text-sm">
                              <p className="text-gray-800">{response.message}</p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(response.date).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Response message input - only shown when expanded */}
                    {selectedEmergency === emergency.id && !emergency.resolved && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type a response to the patient..."
                            value={responseMessage[emergency.id] || ''}
                            onChange={(e) => setResponseMessage({
                              ...responseMessage, 
                              [emergency.id]: e.target.value
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendResponse(emergency.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleSendResponse(emergency.id)}
                            className={`px-3 py-1 text-white text-sm rounded-lg transition-colors ${
                              !responseMessage[emergency.id] || responseMessage[emergency.id].trim() === '' 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            disabled={!responseMessage[emergency.id] || responseMessage[emergency.id].trim() === ''}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
          
          {/* Action bar */}
          <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
            <button
              onClick={viewAllEmergencies}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              View All Emergencies
            </button>
          </div>
        </div>
      )}
      
      {/* Add a global style for the animation */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
} 