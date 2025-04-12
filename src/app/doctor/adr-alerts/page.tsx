'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import GeminiSetupInfo from './GeminiSetupInfo';

// Define ADR risk rules (these will serve as fallback if Gemini AI fails)
const ADR_RULES = [
  {
    id: 'rule1',
    name: 'Antibiotic-Fever Risk',
    symptoms: ['fever', 'rash', 'itching'],
    medications: ['amoxicillin', 'penicillin', 'cephalexin', 'azithromycin'],
    warningLevel: 'high',
    warningMessage: 'Possible allergic reaction to antibiotic. Consider alternative treatment and monitor closely.'
  },
  {
    id: 'rule2',
    name: 'NSAID-Gastric Risk',
    symptoms: ['stomach pain', 'nausea', 'vomiting', 'heartburn'],
    medications: ['ibuprofen', 'naproxen', 'aspirin', 'diclofenac'],
    warningLevel: 'medium',
    warningMessage: 'Potential NSAID-induced gastric irritation. Consider GI protection or alternative pain relief.'
  },
  {
    id: 'rule3',
    name: 'ACE Inhibitor Cough',
    symptoms: ['cough', 'dry cough', 'persistent cough'],
    medications: ['lisinopril', 'enalapril', 'ramipril', 'benazepril'],
    warningLevel: 'medium',
    warningMessage: 'ACE inhibitor-induced cough detected. Consider switching to ARB.'
  },
  {
    id: 'rule4',
    name: 'Statin Myopathy',
    symptoms: ['muscle pain', 'muscle weakness', 'fatigue'],
    medications: ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin'],
    warningLevel: 'medium',
    warningMessage: 'Possible statin-induced myopathy. Consider dose reduction or alternative.'
  },
  {
    id: 'rule5',
    name: 'Opioid Respiratory',
    symptoms: ['drowsiness', 'shallow breathing', 'confusion'],
    medications: ['oxycodone', 'hydrocodone', 'morphine', 'fentanyl'],
    warningLevel: 'high',
    warningMessage: 'Risk of opioid-induced respiratory depression. Monitor respiratory rate closely.'
  },
  {
    id: 'rule6',
    name: 'Antihistamine Sedation',
    symptoms: ['drowsiness', 'dizziness', 'fatigue'],
    medications: ['diphenhydramine', 'chlorpheniramine', 'hydroxyzine'],
    warningLevel: 'low',
    warningMessage: 'Antihistamine causing sedation. Advise patient against driving or operating machinery.'
  },
  {
    id: 'rule7',
    name: 'Corticosteroid Effects',
    symptoms: ['weight gain', 'moon face', 'mood swings', 'insomnia'],
    medications: ['prednisone', 'dexamethasone', 'methylprednisolone'],
    warningLevel: 'medium',
    warningMessage: 'Corticosteroid side effects detected. Consider dose adjustment or tapering plan.'
  },
  {
    id: 'rule8',
    name: 'Antidepressant Serotonin Syndrome',
    symptoms: ['confusion', 'agitation', 'headache', 'shivering', 'sweating'],
    medications: ['fluoxetine', 'sertraline', 'paroxetine', 'citalopram', 'escitalopram'],
    warningLevel: 'high',
    warningMessage: 'Potential serotonin syndrome. Urgent evaluation needed and consider medication adjustment.'
  }
];

interface PatientRecord {
  id: string;
  patientId?: string;
  patientName: string;
  date: string;
  recordType: string;
  symptoms?: string;
  diagnosis?: string;
  medication?: string;
  notes?: string;
  vitals?: {
    temperature?: string;
    bloodPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
  };
}

// Standard ADR Alert interface (from rule-based system)
interface ADRAlert {
  id: string;
  patientName: string;
  patientId?: string;
  date: string;
  ruleName: string;
  matchedSymptoms: string[];
  matchedMedications: string[];
  warningLevel: string;
  warningMessage: string;
  record: PatientRecord;
  acknowledged?: boolean;
}

// Gemini-generated AI Alert interface
interface GeminiAlert {
  id: string;
  severity: string; 
  title: string;
  description: string;
  medications: string[];
  symptoms: string[];
  recommendation: string;
  acknowledged?: boolean;
}

// Combined alert type for the application
type Alert = ADRAlert | GeminiAlert;

export default function ADRAlerts() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<ADRAlert[]>([]);
  const [geminiAlerts, setGeminiAlerts] = useState<GeminiAlert[]>([]);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');
  const [customRuleOpen, setCustomRuleOpen] = useState(false);
  const [useGeminiAI, setUseGeminiAI] = useState(true); // Toggle for AI analysis
  const [aiAnalysisInProgress, setAiAnalysisInProgress] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    symptoms: '',
    medications: '',
    warningLevel: 'medium',
    warningMessage: ''
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
    
    // Load patient records from localStorage
    const loadRecords = () => {
      try {
        // Get doctor patient records
        const doctorRecordsJSON = localStorage.getItem('doctorPatientRecords');
        let doctorRecords = doctorRecordsJSON ? JSON.parse(doctorRecordsJSON) : [];
        
        // Get patient created records
        const patientRecordsJSON = localStorage.getItem('patientRecords');
        let patientRecords = patientRecordsJSON ? JSON.parse(patientRecordsJSON) : [];
        
        // Get daily logs
        const dailyLogsJSON = localStorage.getItem('patientDailyLogs');
        let dailyLogs = dailyLogsJSON ? JSON.parse(dailyLogsJSON) : [];
        
        // Format daily logs as records
        const logsAsRecords = dailyLogs.map((log: any) => ({
          id: `log_${log.id}`,
          patientId: log.patientId || log.userId,
          patientName: log.patientName || 'Unknown Patient',
          date: log.date,
          recordType: 'Daily Health Log',
          symptoms: log.symptoms || '',
          medication: log.medicationTaken ? log.medicationTaken.join(', ') : '',
          notes: log.notes || ''
        }));
        
        // Combine all records
        const allRecords = [...doctorRecords, ...patientRecords, ...logsAsRecords];
        
        // Set the records
        setRecords(allRecords);
        
        // Analyze records for ADR risks using rules
        analyzeRecordsForADR(allRecords);
        
        // If Gemini AI is enabled, also analyze with AI
        if (useGeminiAI) {
          analyzeRecordsWithGeminiAI(allRecords);
        }
      } catch (error) {
        console.error('Error loading records:', error);
        toast.error('Failed to load patient records');
      } finally {
        setLoading(false);
      }
    };
    
    loadRecords();
    
    // Setup real-time monitoring (simulated for demo)
    const interval = setInterval(() => {
      loadRecords();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [isLoaded, user, router, useGeminiAI]);

  // Function to analyze records for ADR risks
  const analyzeRecordsForADR = (records: PatientRecord[]) => {
    const adrAlerts: ADRAlert[] = [];
    
    // Get existing acknowledged alerts
    const acknowledgedAlertsJSON = localStorage.getItem('adrAcknowledgedAlerts');
    const acknowledgedAlerts = acknowledgedAlertsJSON ? JSON.parse(acknowledgedAlertsJSON) : {};
    
    records.forEach(record => {
      // Skip records without symptoms or medications
      if (!record.symptoms || !record.medication) return;
      
      const recordSymptoms = record.symptoms.toLowerCase();
      const recordMedications = record.medication.toLowerCase();
      
      // Check against each ADR rule
      ADR_RULES.forEach(rule => {
        const matchedSymptoms: string[] = [];
        const matchedMedications: string[] = [];
        
        // Check symptoms
        rule.symptoms.forEach(symptom => {
          if (recordSymptoms.includes(symptom.toLowerCase())) {
            matchedSymptoms.push(symptom);
          }
        });
        
        // Check medications
        rule.medications.forEach(medication => {
          if (recordMedications.includes(medication.toLowerCase())) {
            matchedMedications.push(medication);
          }
        });
        
        // If both symptoms and medications match, create an alert
        if (matchedSymptoms.length > 0 && matchedMedications.length > 0) {
          const alertId = `alert_${record.id}_${rule.id}`;
          
          // Check if this alert has been acknowledged
          const isAcknowledged = acknowledgedAlerts[alertId] === true;
          
          adrAlerts.push({
            id: alertId,
            patientName: record.patientName,
            patientId: record.patientId,
            date: record.date,
            ruleName: rule.name,
            matchedSymptoms,
            matchedMedications,
            warningLevel: rule.warningLevel,
            warningMessage: rule.warningMessage,
            record,
            acknowledged: isAcknowledged
          });
        }
      });
    });
    
    setAlerts(adrAlerts);
  };

  // Function to analyze records with Gemini AI
  const analyzeRecordsWithGeminiAI = async (records: PatientRecord[]) => {
    try {
      setAiAnalysisInProgress(true);
      
      // Get existing acknowledged alerts
      const acknowledgedAlertsJSON = localStorage.getItem('adrAcknowledgedAlerts');
      const acknowledgedAlerts = acknowledgedAlertsJSON ? JSON.parse(acknowledgedAlertsJSON) : {};
      
      // Prepare patient data for Gemini analysis
      const patientData = preparePatientDataForGemini(records);
      
      // Call the Gemini API endpoint
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze with Gemini AI');
      }
      
      const result = await response.json();
      
      // Process and save the Gemini alerts
      const aiAlerts = result.alerts.map((alert: any) => ({
        ...alert,
        acknowledged: acknowledgedAlerts[alert.id] === true
      }));
      
      setGeminiAlerts(aiAlerts);
      toast.success(`AI analysis completed: ${aiAlerts.length} potential issues identified`);
    } catch (error) {
      console.error('Error analyzing with Gemini AI:', error);
      toast.error('AI analysis failed. Using rule-based analysis instead.');
      setUseGeminiAI(false);
    } finally {
      setAiAnalysisInProgress(false);
    }
  };
  
  // Function to prepare patient data for Gemini analysis
  const preparePatientDataForGemini = (records: PatientRecord[]) => {
    // Group records by patient
    const patientRecords: Record<string, any> = {};
    
    records.forEach(record => {
      const patientId = record.patientId || 'unknown';
      const patientName = record.patientName;
      
      if (!patientRecords[patientId]) {
        patientRecords[patientId] = {
          patientId,
          patientName,
          records: []
        };
      }
      
      patientRecords[patientId].records.push({
        date: record.date,
        recordType: record.recordType,
        symptoms: record.symptoms,
        diagnosis: record.diagnosis,
        medication: record.medication,
        notes: record.notes,
        vitals: record.vitals
      });
    });
    
    return Object.values(patientRecords);
  };

  const acknowledgeAlert = (alertId: string, isGeminiAlert: boolean = false) => {
    // Get existing acknowledged alerts
    const acknowledgedAlertsJSON = localStorage.getItem('adrAcknowledgedAlerts');
    const acknowledgedAlerts = acknowledgedAlertsJSON ? JSON.parse(acknowledgedAlertsJSON) : {};
    
    // Mark this alert as acknowledged
    acknowledgedAlerts[alertId] = true;
    
    // Save back to localStorage
    localStorage.setItem('adrAcknowledgedAlerts', JSON.stringify(acknowledgedAlerts));
    
    // Update the state based on alert type
    if (isGeminiAlert) {
      setGeminiAlerts(prev => prev.map(alert => 
        alert.id === alertId ? {...alert, acknowledged: true} : alert
      ));
    } else {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? {...alert, acknowledged: true} : alert
      ));
    }
    
    toast.success('Alert acknowledged');
  };

  // Manually trigger AI analysis for all records
  const triggerAIAnalysis = () => {
    if (records.length === 0) {
      toast.error('No patient data available for analysis');
      return;
    }
    
    analyzeRecordsWithGeminiAI(records);
  };

  // Filter alerts based on selected level
  const filteredRuleAlerts = filterLevel === 'all' 
    ? alerts.filter(alert => !alert.acknowledged)
    : alerts.filter(alert => alert.warningLevel === filterLevel && !alert.acknowledged);
    
  // Filter Gemini alerts based on selected level
  const filteredGeminiAlerts = filterLevel === 'all'
    ? geminiAlerts.filter(alert => !alert.acknowledged)
    : geminiAlerts.filter(alert => alert.severity === filterLevel && !alert.acknowledged);
    
  // Combined alerts count  
  const totalAlertCount = filteredRuleAlerts.length + filteredGeminiAlerts.length;

  const handleAddCustomRule = () => {
    if (!newRule.name || !newRule.symptoms || !newRule.medications || !newRule.warningMessage) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Get existing custom rules
    const customRulesJSON = localStorage.getItem('adrCustomRules');
    const customRules = customRulesJSON ? JSON.parse(customRulesJSON) : [];
    
    // Add new rule
    const rule = {
      id: `custom_${Date.now()}`,
      name: newRule.name,
      symptoms: newRule.symptoms.split(',').map((s: string) => s.trim().toLowerCase()),
      medications: newRule.medications.split(',').map((m: string) => m.trim().toLowerCase()),
      warningLevel: newRule.warningLevel,
      warningMessage: newRule.warningMessage
    };
    
    customRules.push(rule);
    
    // Save back to localStorage
    localStorage.setItem('adrCustomRules', JSON.stringify(customRules));
    
    // Add to rules list
    ADR_RULES.push(rule);
    
    // Reset form
    setNewRule({
      name: '',
      symptoms: '',
      medications: '',
      warningLevel: 'medium',
      warningMessage: ''
    });
    
    // Close custom rule panel
    setCustomRuleOpen(false);
    
    // Re-analyze records
    analyzeRecordsForADR(records);
    
    toast.success('Custom rule added');
  };

  if (!isLoaded || !user) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center border-b backdrop-blur-sm bg-white/80 sticky top-0 z-50 transition-all duration-300">
        <Link href="/" className="text-xl font-semibold transform transition-transform duration-300 hover:scale-105">
          AidX
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/doctor/dashboard" 
            className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1"
          >
            Dashboard
          </Link>
          <button
            onClick={() => router.push('/doctor/dashboard')}
            className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-red-500 p-4 inline-block mr-4 rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Gemini-powered ADR Alerts</h1>
              <p className="text-gray-600">AI-driven Adverse Drug Reaction monitoring system</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Alerts</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setUseGeminiAI(!useGeminiAI)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${
                  useGeminiAI 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className={`w-4 h-4 mr-2 rounded-full ${useGeminiAI ? 'bg-white' : 'bg-gray-400'}`}></span>
                Gemini AI
              </button>
              
              <button 
                onClick={triggerAIAnalysis}
                disabled={aiAnalysisInProgress || !useGeminiAI}
                className={`px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg ${
                  (aiAnalysisInProgress || !useGeminiAI) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {aiAnalysisInProgress ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : "Run AI Analysis"} 
              </button>
              
              <button 
                onClick={() => setCustomRuleOpen(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg transition-all duration-300 hover:bg-gray-700 hover:shadow-lg"
              >
                Add Custom Rule
              </button>
            </div>
          </div>
        </div>
        
        {/* Add Gemini Setup Information */}
        <GeminiSetupInfo />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            {totalAlertCount === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-medium text-gray-600 mb-2">No Active ADR Alerts</h2>
                <p className="text-gray-500">All patient data has been analyzed and no potential adverse drug reactions were detected.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Gemini AI Alerts Section */}
                {useGeminiAI && filteredGeminiAlerts.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-500 p-2 rounded-lg mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold">Gemini AI Alerts</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {filteredGeminiAlerts.map(alert => (
                        <div key={alert.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md ${
                          alert.severity === 'high' ? 'border-l-4 border-l-red-500' :
                          alert.severity === 'medium' ? 'border-l-4 border-l-amber-500' :
                          'border-l-4 border-l-blue-500'
                        }`}>
                          <div className="flex justify-between items-start p-6">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                                  alert.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Priority
                                </span>
                                <span className="ml-3 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">AI Generated</span>
                              </div>
                              
                              <h3 className="text-lg font-semibold mb-1">{alert.title}</h3>
                              <p className="text-gray-700 mb-3">{alert.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Symptoms: </span>
                                  {alert.symptoms.map((symptom, i) => (
                                    <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1">{symptom}</span>
                                  ))}
                                </div>
                                <div className="ml-4">
                                  <span className="text-sm font-medium text-gray-700">Medications: </span>
                                  {alert.medications.map((med, i) => (
                                    <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1">{med}</span>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 p-3 rounded-lg mb-2">
                                <h4 className="text-sm font-medium text-blue-800 mb-1">AI Recommendation:</h4>
                                <p className="text-sm text-blue-700">{alert.recommendation}</p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => acknowledgeAlert(alert.id, true)}
                              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                            >
                              Acknowledge
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Rule-based Alerts Section */}
                {filteredRuleAlerts.length > 0 && (
                  <div>
                    {useGeminiAI && filteredGeminiAlerts.length > 0 && (
                      <div className="flex items-center mb-4">
                        <div className="bg-gray-500 p-2 rounded-lg mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold">Rule-based Alerts</h2>
                      </div>
                    )}
                  
                    <div className="space-y-4">
                      {filteredRuleAlerts.map(alert => (
                        <div key={alert.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md ${
                          alert.warningLevel === 'high' ? 'border-l-4 border-l-red-500' :
                          alert.warningLevel === 'medium' ? 'border-l-4 border-l-amber-500' :
                          'border-l-4 border-l-blue-500'
                        }`}>
                          <div className="flex justify-between items-start p-6">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  alert.warningLevel === 'high' ? 'bg-red-100 text-red-800' :
                                  alert.warningLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {alert.warningLevel.charAt(0).toUpperCase() + alert.warningLevel.slice(1)} Priority
                                </span>
                                <span className="ml-3 text-sm text-gray-500">{new Date(alert.date).toLocaleDateString()}</span>
                              </div>
                              
                              <h3 className="text-lg font-semibold mb-1">{alert.ruleName}</h3>
                              <p className="text-md font-medium mb-1">Patient: {alert.patientName}</p>
                              <p className="text-gray-700 mb-3">{alert.warningMessage}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Symptoms: </span>
                                  {alert.matchedSymptoms.map((symptom, i) => (
                                    <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1">{symptom}</span>
                                  ))}
                                </div>
                                <div className="ml-4">
                                  <span className="text-sm font-medium text-gray-700">Medications: </span>
                                  {alert.matchedMedications.map((med, i) => (
                                    <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1">{med}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                            >
                              Acknowledge
                            </button>
                          </div>
                          
                          <div className="bg-gray-50 px-6 py-4">
                            <div className="flex justify-between">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Record Type: </span>
                                <span className="text-sm text-gray-600">{alert.record.recordType}</span>
                              </div>
                              <button
                                onClick={() => router.push(`/doctor/previous-records?patient=${alert.patientId || ''}`)}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                View Patient History →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Add Custom Rule Modal */}
        {customRuleOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Add Custom ADR Rule</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Beta Blocker-Asthma Interaction"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newRule.symptoms}
                    onChange={(e) => setNewRule({...newRule, symptoms: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., wheezing, shortness of breath, chest tightness"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medications (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newRule.medications}
                    onChange={(e) => setNewRule({...newRule, medications: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., propranolol, metoprolol, atenolol"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warning Level</label>
                  <select
                    value={newRule.warningLevel}
                    onChange={(e) => setNewRule({...newRule, warningLevel: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warning Message</label>
                  <textarea
                    value={newRule.warningMessage}
                    onChange={(e) => setNewRule({...newRule, warningMessage: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="e.g., Beta blockers may exacerbate asthma symptoms. Consider cardioselective alternatives or different class."
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setCustomRuleOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomRule}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Add Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 