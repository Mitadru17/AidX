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
  
  const activeEmergencies = emergencies.filter(e => !e.resolved);
  const resolvedEmergencies = emergencies.filter(e => e.resolved);
  const displayedEmergencies = viewArchived ? emergencies : activeEmergencies;
  
  const unreadCount = activeEmergencies.filter(e => !e.read).length;
  
  if (emergencies.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Emergency Alert Badge */}
      <button
        onClick={() => setShowEmergencies(!showEmergencies)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white font-medium ${
          unreadCount > 0 && emergencies.some(e => e.severity === 'high' && !e.read) 
            ? 'bg-red-600 animate-pulse' 
            : unreadCount > 0 
              ? 'bg-orange-500' 
              : 'bg-gray-700'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>
          {unreadCount > 0 
            ? `${unreadCount} ${emergencies.some(e => e.severity === 'high' && !e.read) ? 'Urgent Alerts!' : 'Alerts'}`
            : 'Emergencies'
          }
        </span>
      </button>
      
      {/* Emergencies Panel */}
      {showEmergencies && (
        <div className="mt-4 w-[450px] max-w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-red-600 text-white flex justify-between items-center">
            <h3 className="font-bold">Emergency Alerts</h3>
            <div className="flex gap-2 items-center">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-sm underline hover:text-red-100"
                >
                  Mark all as read
                </button>
              )}
              <button 
                onClick={() => setViewArchived(!viewArchived)}
                className="text-sm underline hover:text-red-100 ml-3"
              >
                {viewArchived ? 'Hide Resolved' : 'Show All'}
              </button>
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {displayedEmergencies.length === 0 ? (
              <div className="p-4 text-center text-gray-600">
                No emergency alerts
              </div>
            ) : (
              displayedEmergencies
                .sort((a, b) => {
                  // Sort by resolved status first (unresolved first)
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
                    className={`p-4 border-b ${
                      emergency.resolved ? 'bg-gray-50' : !emergency.read ? 'bg-red-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg flex items-center">
                        {!emergency.read && !emergency.resolved && (
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            emergency.severity === 'high' ? 'bg-red-600 animate-ping' :
                            emergency.severity === 'medium' ? 'bg-orange-500' : 
                            'bg-yellow-500'
                          }`}></span>
                        )}
                        {emergency.resolved && (
                          <span className="w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                        )}
                        {emergency.patientName}
                        {emergency.resolved && (
                          <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            Resolved
                          </span>
                        )}
                      </h4>
                      <button
                        onClick={() => handleClear(emergency.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-700 mb-2 font-medium">{emergency.message}</p>
                    {emergency.details && (
                      <p className="text-gray-600 mb-2 text-sm">{emergency.details}</p>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {new Date(emergency.date).toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        {!emergency.read && !emergency.resolved && (
                          <button
                            onClick={() => handleMarkAsRead(emergency.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Mark as read
                          </button>
                        )}
                        {!emergency.resolved && (
                          <button
                            onClick={() => handleResolveEmergency(emergency.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Doctor's response history */}
                    {emergency.doctorResponses && emergency.doctorResponses.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h5 className="font-medium text-sm text-gray-700 mb-2">Your responses:</h5>
                        <div className="space-y-2">
                          {emergency.doctorResponses.map(response => (
                            <div key={response.id} className="bg-blue-50 p-2 rounded text-sm">
                              <p className="text-gray-800">{response.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(response.date).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Response message input */}
                    {!emergency.resolved && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type a response to the patient..."
                            value={responseMessage[emergency.id] || ''}
                            onChange={(e) => setResponseMessage({
                              ...responseMessage, 
                              [emergency.id]: e.target.value
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendResponse(emergency.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleSendResponse(emergency.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
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
          
          {/* Statistics section */}
          <div className="p-3 bg-gray-50 border-t flex justify-between text-xs text-gray-500">
            <span>{activeEmergencies.length} active emergencies</span>
            <span>{resolvedEmergencies.length} resolved</span>
            <span>{emergencies.length} total</span>
          </div>
        </div>
      )}
    </div>
  );
} 