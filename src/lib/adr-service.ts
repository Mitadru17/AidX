import { ADRAlert } from '@/components/ADRAlert';

// Storage key for ADR alerts
const ADR_ALERTS_KEY = 'adrAlerts';

// Get all ADR alerts from localStorage
export const getADRAlerts = (): ADRAlert[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const alerts = localStorage.getItem(ADR_ALERTS_KEY);
    return alerts ? JSON.parse(alerts) : [];
  } catch (error) {
    console.error('Error getting ADR alerts:', error);
    return [];
  }
};

// Get ADR alerts for a specific patient
export const getPatientADRAlerts = (patientId: string): ADRAlert[] => {
  const alerts = getADRAlerts();
  return alerts.filter(alert => alert.patientId === patientId);
};

// Add a new ADR alert
export const addADRAlert = (alertData: Omit<ADRAlert, 'id' | 'dateReported' | 'acknowledged'>): ADRAlert => {
  const alerts = getADRAlerts();
  
  const newAlert: ADRAlert = {
    ...alertData,
    id: Date.now().toString(),
    dateReported: new Date().toISOString(),
    acknowledged: false
  };
  
  alerts.push(newAlert);
  localStorage.setItem(ADR_ALERTS_KEY, JSON.stringify(alerts));
  
  // Create notification for the alert
  createADRNotification(newAlert);
  
  return newAlert;
};

// Mark an ADR alert as acknowledged
export const acknowledgeADRAlert = (alertId: string): boolean => {
  const alerts = getADRAlerts();
  const updatedAlerts = alerts.map(alert => 
    alert.id === alertId ? { ...alert, acknowledged: true } : alert
  );
  
  localStorage.setItem(ADR_ALERTS_KEY, JSON.stringify(updatedAlerts));
  return updatedAlerts.some(alert => alert.id === alertId);
};

// Create a notification for an ADR alert
export const createADRNotification = (alert: ADRAlert): void => {
  const notification = {
    id: Date.now().toString(),
    type: 'adr_alert',
    message: `ADR Alert: ${alert.medicationName} - ${alert.severity} severity`,
    date: new Date().toISOString(),
    read: false,
    alertId: alert.id
  };
  
  const notificationsJSON = localStorage.getItem('patientNotifications') || '[]';
  const notifications = JSON.parse(notificationsJSON);
  notifications.push(notification);
  localStorage.setItem('patientNotifications', JSON.stringify(notifications));
};

// Get unacknowledged ADR alerts for a patient
export const getUnacknowledgedADRAlerts = (patientId: string): ADRAlert[] => {
  const alerts = getPatientADRAlerts(patientId);
  return alerts.filter(alert => !alert.acknowledged);
};

// Mock function to get common medications for dropdown
export const getCommonMedications = (): string[] => {
  return [
    'Acetaminophen',
    'Ibuprofen',
    'Aspirin',
    'Amoxicillin',
    'Lisinopril',
    'Atorvastatin',
    'Metformin',
    'Levothyroxine',
    'Simvastatin',
    'Omeprazole'
  ];
};

// Mock function to get common ADR symptoms for suggestions
export const getCommonADRSymptoms = (): string[] => {
  return [
    'Nausea',
    'Headache',
    'Dizziness',
    'Rash',
    'Itching',
    'Swelling',
    'Fatigue',
    'Diarrhea',
    'Vomiting',
    'Shortness of breath',
    'Chest pain',
    'Palpitations'
  ];
}; 