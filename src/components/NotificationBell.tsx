'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  message: string;
  appointmentId?: string;
  alertId?: string;
  date: string;
  read: boolean;
}

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNotificationClick = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('patientNotifications', JSON.stringify(updatedNotifications));
  };
  
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem('patientNotifications', JSON.stringify(updatedNotifications));
  };
  
  useEffect(() => {
    const loadNotifications = () => {
      const notificationsJSON = localStorage.getItem('patientNotifications');
      if (notificationsJSON) {
        try {
          const parsedNotifications = JSON.parse(notificationsJSON);
          setNotifications(parsedNotifications);
        } catch (error) {
          console.error('Error parsing notifications:', error);
        }
      }
    };
    
    // Load notifications on mount
    loadNotifications();
    
    // Check for new notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-black transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 overflow-hidden">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">
                No notifications
              </div>
            ) : (
              notifications
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start">
                      <div 
                        className={`w-2 h-2 mt-1.5 mr-2 rounded-full flex-shrink-0
                          ${notification.type === 'appointment_confirmed' ? 'bg-green-500' : ''}
                          ${notification.type === 'appointment_completed' ? 'bg-blue-500' : ''}
                          ${notification.type === 'appointment_cancelled' ? 'bg-red-500' : ''}
                          ${notification.type === 'appointment_notes' ? 'bg-purple-500' : ''}
                          ${notification.type === 'emergency_response' ? 'bg-red-600' : ''}
                          ${notification.type === 'adr_alert' ? 'bg-orange-500' : ''}
                          ${notification.type === 'medication_reminder' ? 'bg-amber-500' : ''}
                        `}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.date).toLocaleString()}
                        </p>
                        {notification.type === 'adr_alert' && notification.alertId && (
                          <div className="mt-2">
                            <Link
                              href={`/patient/adr/${notification.alertId}`}
                              className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View details
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
          
          <div className="p-2 text-center">
            <Link 
              href="/patient/notifications"
              className="block w-full py-2 text-sm text-blue-500 hover:text-blue-700 hover:bg-gray-50 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 