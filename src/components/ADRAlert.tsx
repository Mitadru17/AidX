'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface ADRAlert {
  id: string;
  patientId: string;
  medicationName: string;
  severity: 'low' | 'medium' | 'high';
  symptoms: string[];
  description: string;
  dateReported: string;
  acknowledged: boolean;
}

interface ADRAlertProps {
  alert?: ADRAlert;
  onClose: () => void;
  onReportADR?: (data: Omit<ADRAlert, 'id' | 'dateReported' | 'acknowledged'>) => void;
}

export default function ADRAlert({ alert, onClose, onReportADR }: ADRAlertProps) {
  const router = useRouter();
  const [isReporting, setIsReporting] = useState(!alert);
  const [formData, setFormData] = useState<Partial<ADRAlert>>({
    medicationName: '',
    severity: 'medium',
    symptoms: [],
    description: '',
    patientId: ''
  });
  const [symptomInput, setSymptomInput] = useState('');

  useEffect(() => {
    // If alert is provided, pre-fill the form data
    if (alert) {
      setFormData(alert);
      setIsReporting(false);
    } else {
      // For new reports, get patient ID from localStorage or context
      const patientId = localStorage.getItem('patientId') || '';
      setFormData(prev => ({ ...prev, patientId }));
      setIsReporting(true);
    }
  }, [alert]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSymptom = () => {
    if (symptomInput.trim() !== '' && !formData.symptoms?.includes(symptomInput.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...(prev.symptoms || []), symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms?.filter(s => s !== symptom) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isReporting && onReportADR && formData.medicationName && formData.symptoms?.length) {
      onReportADR({
        patientId: formData.patientId || '',
        medicationName: formData.medicationName,
        severity: formData.severity as 'low' | 'medium' | 'high',
        symptoms: formData.symptoms,
        description: formData.description || ''
      });
    }
    
    // Create a notification for this ADR
    const notification = {
      id: Date.now().toString(),
      type: 'adr_alert',
      message: `ADR Report: ${formData.medicationName} - ${formData.severity} severity`,
      date: new Date().toISOString(),
      read: false
    };
    
    // Save to localStorage
    const existingNotifications = localStorage.getItem('patientNotifications') || '[]';
    const parsedNotifications = JSON.parse(existingNotifications);
    parsedNotifications.push(notification);
    localStorage.setItem('patientNotifications', JSON.stringify(parsedNotifications));
    
    onClose();
    router.push('/patient/dashboard');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'medium': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className={`p-4 border-b ${isReporting ? 'bg-blue-50' : getSeverityColor(formData.severity || 'medium')}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {isReporting ? 'Report Adverse Drug Reaction' : 'ADR Alert'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
            <input
              type="text"
              name="medicationName"
              value={formData.medicationName}
              onChange={handleChange}
              disabled={!isReporting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              disabled={!isReporting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
            {isReporting ? (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter symptom"
                />
                <button
                  type="button"
                  onClick={addSymptom}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            ) : null}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.symptoms?.map((symptom, index) => (
                <div 
                  key={index} 
                  className={`
                    px-3 py-1 rounded-full text-sm flex items-center gap-1
                    ${getSeverityColor(formData.severity || 'medium')}
                  `}
                >
                  {symptom}
                  {isReporting && (
                    <button
                      type="button"
                      onClick={() => removeSymptom(symptom)}
                      className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isReporting}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isReporting ? (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Report
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Acknowledge
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 