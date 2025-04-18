'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FaSmile, FaMeh, FaFrown, FaSadTear, FaAngry, FaPills, FaLungs, FaHeadSideCough, FaThermometerHalf, FaSyringe } from 'react-icons/fa';
import { BiBody, BiBrain } from 'react-icons/bi';
import { GiStomach } from 'react-icons/gi';
import { GiNoseFront } from 'react-icons/gi';

type MedicationSuggestion = {
  morning: string[];
  afternoon: string[];
  night: string[];
  advice: string;
};

type TimeOfDay = 'morning' | 'afternoon' | 'night';
type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible';
type SymptomCategory = 'head' | 'respiratory' | 'digestive' | 'body' | 'other';

export default function DailyLog() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [date, setDate] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<MedicationSuggestion | null>(null);
  const [suggestedMedicines, setSuggestedMedicines] = useState<string[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [customMedicine, setCustomMedicine] = useState('');
  const [saveToMedicineLogs, setSaveToMedicineLogs] = useState(true);
  
  // New UI state variables
  const [mood, setMood] = useState<MoodType>('okay');
  const [painLevel, setPainLevel] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory>('other');
  const [commonSymptoms, setCommonSymptoms] = useState<{[key in SymptomCategory]: string[]}>({
    head: ['Headache', 'Migraine', 'Dizziness', 'Ear pain'],
    respiratory: ['Cough', 'Shortness of breath', 'Sore throat', 'Runny nose', 'Congestion'],
    digestive: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Stomach ache'],
    body: ['Fever', 'Body ache', 'Fatigue', 'Joint pain', 'Muscle pain'],
    other: ['Rash', 'Itching', 'Swelling', 'Bleeding', 'Insomnia']
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showSymptomSelector, setShowSymptomSelector] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
  console.log("API Key available:", !!apiKey); // Debug log without revealing the key
  
  let generateAI: any;
  try {
    if (!apiKey) {
      console.error('NEXT_PUBLIC_GEMINI_API_KEY is not defined or empty');
    } else {
      generateAI = new GoogleGenerativeAI(apiKey);
    }
  } catch (error) {
    console.error('Error initializing Gemini:', error);
  }

  // Handle selecting a symptom from the symptom selector
  const handleSymptomSelect = (symptom: string) => {
    setSelectedSymptoms(prev => {
      // Toggle the symptom
      const newSelection = prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom];
      
      // Update the symptoms text area with the selected symptoms
      updateSymptomsText(newSelection);
      
      return newSelection;
    });
  };
  
  // Update the symptoms text area based on selected symptoms
  const updateSymptomsText = (selectedSymptomsList: string[]) => {
    if (selectedSymptomsList.length === 0) {
      setSymptoms('');
      return;
    }
    
    // Create detailed symptoms text with pain level and mood
    const moodText = mood ? `I'm feeling ${mood} overall. ` : '';
    const painText = painLevel > 0 ? `Pain level is ${painLevel}/10. ` : '';
    const symptomsText = selectedSymptomsList.length > 0 
      ? `I'm experiencing the following symptoms: ${selectedSymptomsList.join(', ')}. `
      : '';
    
    setSymptoms(`${moodText}${painText}${symptomsText}`);
  };
  
  // Go to next step in the form
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Go to previous step in the form
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Mock responses for testing - remove in production
  const mockResponses: Record<string, MedicationSuggestion> = {
    headache: {
      morning: ['Paracetamol 500mg', 'Water (minimum 2 glasses)'],
      afternoon: ['Ibuprofen 400mg with food'],
      night: ['Paracetamol 500mg'],
      advice: "Possible conditions: Tension headache, Migraine.\n\nStay hydrated, rest in a quiet environment, and apply a cold compress to your forehead."
    },
    cold: {
      morning: ['Paracetamol 500mg', 'Vitamin C 1000mg'],
      afternoon: ['Decongestant or nasal spray if needed'],
      night: ['Paracetamol 500mg', 'Honey with warm water'],
      advice: "Possible conditions: Common cold, Influenza.\n\nRest, stay hydrated, and get plenty of sleep. Consider using a humidifier."
    },
    stomach: {
      morning: ['Probiotics with breakfast'],
      afternoon: ['Oral rehydration solution'],
      night: ['Ginger tea'],
      advice: "Possible conditions: Indigestion, Gastritis, Food poisoning.\n\nStick to bland foods, stay hydrated with small sips, and avoid dairy and spicy foods."
    },
    allergy: {
      morning: ['Cetirizine 10mg'],
      afternoon: ['Stay hydrated, avoid allergens'],
      night: ['Benadryl if needed for sleep'],
      advice: "Possible conditions: Seasonal allergies, Allergic rhinitis.\n\nAvoid known allergens, use air purifiers, and consider keeping windows closed during high pollen seasons."
    },
    sore_throat: {
      morning: ['Warm salt water gargle', 'Honey lemon tea'],
      afternoon: ['Throat lozenges containing benzocaine'],
      night: ['Paracetamol 500mg if painful'],
      advice: "Possible conditions: Pharyngitis, Tonsillitis, Viral infection.\n\nRest your voice, stay hydrated, and avoid irritants like smoking."
    },
    cough: {
      morning: ['Expectorant syrup', 'Steam inhalation'],
      afternoon: ['Keep hydrated with warm fluids'],
      night: ['Honey with warm milk', 'Cough suppressant if needed'],
      advice: "Possible conditions: Bronchitis, Post-nasal drip, Common cold.\n\nStay upright when possible, use humidifiers, and avoid irritants."
    },
    diarrhea: {
      morning: ['Oral rehydration solution', 'Plain toast'],
      afternoon: ['Rice water', 'Avoid dairy and spicy foods'],
      night: ['Loperamide if persistent'],
      advice: "Possible conditions: Gastroenteritis, Food poisoning, IBS flare-up.\n\nFocus on hydration, follow the BRAT diet (bananas, rice, applesauce, toast), and gradually reintroduce normal foods."
    },
    fever: {
      morning: ['Paracetamol 500mg', 'Lukewarm bath if temperature >38.5°C'],
      afternoon: ['Ibuprofen 400mg if needed', 'Stay hydrated'],
      night: ['Paracetamol 500mg', 'Light cotton clothing'],
      advice: "Possible conditions: Viral infection, Bacterial infection, COVID-19.\n\nMonitor temperature regularly, stay hydrated, and seek medical attention if fever persists >3 days or exceeds 39.5°C."
    }
  };

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
    
    // Set today's date as default
    const today = new Date();
    setDate(today.toISOString().split('T')[0]);
  }, [isLoaded, user, router]);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast.error('Please enter your symptoms first');
      return;
    }

    setIsAnalyzing(true);

    try {
      // FOR TESTING: Use the mock response if symptoms contain any of the keywords
      // Comment this whole block for production use
      const symptomText = symptoms.toLowerCase();
      for (const [keyword, response] of Object.entries(mockResponses)) {
        if (symptomText.includes(keyword)) {
          setSuggestion(response);
          setIsAnalyzing(false);
          toast.success("AI analysis complete");
          return;
        }
      }
      
      // Check if API is available
      if (!generateAI) {
        throw new Error('Gemini API not initialized');
      }

      try {
        const model = generateAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `You are a medical assistant AI. Analyze these symptoms: "${symptoms}" 
        
        Return a JSON object with medication suggestions and advice in this EXACT format, no markdown:
        {
          "possibleConditions": ["condition1", "condition2"],
          "morning": ["medication1 with dosage", "medication2 with dosage"],
          "afternoon": ["medication1 with dosage", "medication2 with dosage"],
          "night": ["medication1 with dosage", "medication2 with dosage"],
          "advice": "detailed medical advice"
        }
        
        Your response must be UNIQUE and SPECIFIC to these symptoms. Include only OTC medications.`;

        console.log('Sending prompt to Gemini:', prompt); // Debug log
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        
        console.log('AI Response:', responseText); // Debug log
        
        let aiResponse;
        try {
          // Clean up the response if it contains non-JSON content
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : responseText;
          
          aiResponse = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.log('Raw Response:', responseText);
          throw new Error('Failed to parse AI response');
        }
        
        // Validate the response structure
        if (!aiResponse.possibleConditions || !aiResponse.morning || !aiResponse.afternoon || !aiResponse.night || !aiResponse.advice) {
          throw new Error('Invalid response structure from AI');
        }

        const aiSuggestion: MedicationSuggestion = {
          morning: aiResponse.morning,
          afternoon: aiResponse.afternoon,
          night: aiResponse.night,
          advice: `Possible conditions: ${aiResponse.possibleConditions.join(', ')}.\n\n${aiResponse.advice}`
        };
        
        setSuggestion(aiSuggestion);
        toast.success("AI analysis complete");
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Custom fallback based on symptoms - make it more dynamic
        const symptomText = symptoms.toLowerCase();
        
        // Generate a more dynamic fallback response based on symptom keywords
        const fallbackSuggestion = generateCustomFallback(symptomText);
        
        setSuggestion(fallbackSuggestion);
        toast.success("Showing suggestions based on your symptoms");
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Helper function to generate a more dynamic fallback response
  const generateCustomFallback = (symptomText: string): MedicationSuggestion => {
    let conditions: string[] = [];
    let morningMeds: string[] = [];
    let afternoonMeds: string[] = [];
    let nightMeds: string[] = [];
    let advicePoints: string[] = [];
    
    // Base advice
    advicePoints.push("Stay hydrated with plenty of water throughout the day.");
    
    // Headache related
    if (symptomText.includes('headache') || symptomText.includes('migraine')) {
      conditions.push("Tension headache", "Migraine");
      morningMeds.push("Paracetamol 500mg");
      afternoonMeds.push("Ibuprofen 400mg with food");
      nightMeds.push("Paracetamol 500mg if needed");
      advicePoints.push("Rest in a quiet, dark room and consider applying a cold compress to your forehead.");
      advicePoints.push("Track potential headache triggers like stress, certain foods, or lack of sleep.");
    }
    
    // Cold/flu related
    if (symptomText.includes('cold') || symptomText.includes('flu') || symptomText.includes('cough') || symptomText.includes('sneez')) {
      conditions.push("Common cold", "Seasonal flu");
      morningMeds.push("Vitamin C 1000mg");
      if (!morningMeds.includes("Paracetamol 500mg")) morningMeds.push("Paracetamol 500mg for fever");
      afternoonMeds.push("Decongestant nasal spray for congestion");
      nightMeds.push("Honey with warm lemon water");
      advicePoints.push("Use a humidifier to add moisture to the air and help ease congestion.");
      advicePoints.push("Get plenty of rest to help your immune system fight off the infection.");
    }
    
    // Fever specific
    if (symptomText.includes('fever') || symptomText.includes('temperature')) {
      conditions.push("Viral infection", "COVID-19");
      if (!morningMeds.includes("Paracetamol 500mg")) morningMeds.push("Paracetamol 500mg");
      if (!afternoonMeds.includes("Ibuprofen 400mg with food")) afternoonMeds.push("Ibuprofen 400mg with food");
      if (!nightMeds.includes("Paracetamol 500mg if needed")) nightMeds.push("Paracetamol 500mg if needed");
      advicePoints.push("Monitor your temperature regularly and seek medical attention if it persists for more than 3 days or exceeds 39.5°C.");
      advicePoints.push("Wear light clothing and keep room temperature comfortable, not too hot or cold.");
    }
    
    // Stomach issues
    if (symptomText.includes('stomach') || symptomText.includes('nausea') || symptomText.includes('vomit') || symptomText.includes('digest')) {
      conditions.push("Gastritis", "Indigestion", "Food poisoning");
      morningMeds.push("Probiotics with breakfast");
      afternoonMeds.push("Antacid tablet after meals");
      nightMeds.push("Ginger tea before bed");
      advicePoints.push("Eat smaller, more frequent meals and avoid spicy, fatty, and acidic foods.");
      advicePoints.push("Avoid lying down immediately after eating; wait at least 2-3 hours.");
    }
    
    // Diarrhea specific
    if (symptomText.includes('diarrhea') || symptomText.includes('loose stool')) {
      conditions.push("Gastroenteritis", "IBS flare-up");
      morningMeds.push("Oral rehydration solution");
      afternoonMeds.push("Bismuth subsalicylate (Pepto-Bismol)");
      nightMeds.push("Loperamide (Imodium) if persistent");
      advicePoints.push("Follow the BRAT diet (bananas, rice, applesauce, toast) until symptoms improve.");
      advicePoints.push("Replace lost fluids and electrolytes to prevent dehydration.");
    }
    
    // Allergy related
    if (symptomText.includes('allerg') || symptomText.includes('rash') || symptomText.includes('itch') || symptomText.includes('hives')) {
      conditions.push("Seasonal allergies", "Contact dermatitis");
      morningMeds.push("Cetirizine 10mg or similar non-drowsy antihistamine");
      afternoonMeds.push("Calamine lotion for itchy skin if needed");
      nightMeds.push("Diphenhydramine (Benadryl) if symptoms affect sleep");
      advicePoints.push("Avoid known allergens and keep a diary to identify potential triggers.");
      advicePoints.push("Use air purifiers and keep windows closed during high pollen seasons.");
    }
    
    // Sore throat specific
    if (symptomText.includes('throat') || symptomText.includes('sore') || symptomText.includes('swallow')) {
      conditions.push("Pharyngitis", "Tonsillitis");
      morningMeds.push("Warm salt water gargle");
      afternoonMeds.push("Throat lozenges containing benzocaine");
      nightMeds.push("Honey with warm water");
      advicePoints.push("Rest your voice and avoid irritants like smoking or alcohol.");
      advicePoints.push("Use a humidifier to keep the air moist, which can ease throat discomfort.");
    }
    
    // Joint/muscle pain
    if (symptomText.includes('joint') || symptomText.includes('muscle') || symptomText.includes('sprain') || symptomText.includes('arthritis')) {
      conditions.push("Muscle strain", "Osteoarthritis", "Rheumatoid arthritis");
      morningMeds.push("Ibuprofen 400mg with food");
      afternoonMeds.push("Topical analgesic cream (like diclofenac gel)");
      nightMeds.push("Paracetamol 500mg before bed");
      advicePoints.push("Apply alternating hot and cold packs to the affected area for 15-20 minutes at a time.");
      advicePoints.push("Rest the affected joints or muscles and avoid strenuous activities until pain subsides.");
    }
    
    // If nothing specific was identified
    if (conditions.length === 0) {
      conditions.push("Unspecified condition");
      morningMeds.push("Multivitamin with breakfast");
      afternoonMeds.push("Continue staying hydrated");
      nightMeds.push("Ensure adequate rest (7-8 hours)");
      advicePoints.push("Consider consulting with a healthcare provider for proper diagnosis if symptoms persist.");
    }
    
    // Convert advice array to string
    const advice = `Possible conditions: ${conditions.join(', ')}.\n\n${advicePoints.join(' ')}`;
    
    // Ensure we have at least one item in each category
    if (morningMeds.length === 0) morningMeds.push("Stay hydrated with water");
    if (afternoonMeds.length === 0) afternoonMeds.push("Continue hydration");
    if (nightMeds.length === 0) nightMeds.push("Ensure adequate rest");
    
    return {
      morning: morningMeds,
      afternoon: afternoonMeds,
      night: nightMeds,
      advice: advice
    };
  };

  const getMedicineSuggestions = async () => {
    try {
      setLoading(true);
      
      if (!generateAI) {
        throw new Error('Gemini API not initialized');
      }
      
      try {
        const model = generateAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Based on these symptoms: ${symptoms}, suggest 5 over-the-counter medicines that might help. Format the response as a JSON array of strings containing only medicine names.`;
        
        console.log('Sending medicine suggestion prompt to Gemini:', prompt);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        
        console.log('Medicine suggestions response:', responseText);
        
        let medicines;
        try {
          // Find and extract JSON array from the response
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          const jsonString = jsonMatch ? jsonMatch[0] : responseText;
          medicines = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('JSON Parse Error in medicines:', parseError);
          throw new Error('Failed to parse medicine suggestions');
        }
        
        setSuggestedMedicines(medicines);
      } catch (apiError) {
        console.error('API Error in medicine suggestions:', apiError);
        
        // Fallback medicine suggestions based on symptoms
        const symptomText = symptoms.toLowerCase();
        let fallbackMedicines = ["Paracetamol", "Ibuprofen", "Cetirizine", "Vitamin C", "Multivitamin"];
        
        if (symptomText.includes('headache') || symptomText.includes('pain')) {
          fallbackMedicines = ["Paracetamol", "Ibuprofen", "Aspirin", "Naproxen", "Diclofenac Gel"];
        } else if (symptomText.includes('cold') || symptomText.includes('flu') || symptomText.includes('fever')) {
          fallbackMedicines = ["Paracetamol", "Cold & Flu Relief", "Vitamin C", "Zinc Lozenges", "Decongestant Spray"];
        } else if (symptomText.includes('stomach') || symptomText.includes('nausea') || symptomText.includes('digest')) {
          fallbackMedicines = ["Antacid", "Probiotics", "Simethicone", "Loperamide", "Omeprazole"];
        } else if (symptomText.includes('allerg') || symptomText.includes('itch') || symptomText.includes('rash')) {
          fallbackMedicines = ["Cetirizine", "Loratadine", "Hydrocortisone Cream", "Calamine Lotion", "Benadryl"];
        }
        
        setSuggestedMedicines(fallbackMedicines);
        toast.success("Showing default medicine suggestions");
      }
    } catch (error) {
      console.error('Error generating medicine suggestions:', error);
      toast.error('Failed to generate medicine suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      toast.error('Please enter your symptoms first');
      return;
    }
    
    setLoading(true);
    
    try {
      // Log user info for debugging
      console.log('Current user:', {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        fullName: user?.fullName
      });
      
      // Make sure we have the patient name
      const patientName = user?.fullName || 
                         `${user?.firstName || ''} ${user?.lastName || ''}` || 
                         'Mitadru';
                         
      console.log('Using patient name:', patientName);
      
      // Get existing logs
      const existingLogsJSON = localStorage.getItem('patientDailyLogs') || '[]';
      const existingLogs = JSON.parse(existingLogsJSON);
      
      // Check for duplicate symptoms (case insensitive)
      const normalizedSymptoms = symptoms.toLowerCase().trim();
      const duplicateLog = existingLogs.find((log: any) => 
        log.symptoms.toLowerCase().trim() === normalizedSymptoms
      );
      
      if (duplicateLog) {
        // Update existing log instead of creating a new one
        const updatedLogs = existingLogs.map((log: any) => {
          if (log.symptoms.toLowerCase().trim() === normalizedSymptoms) {
            return {
              ...log,
              date, // Update date
              medicationTaken: selectedMedicines,
              aiSuggestion: suggestion,
              mood,
              painLevel,
              selectedSymptoms,
              lastUpdated: new Date().toISOString(),
              patientName: patientName, // Ensure name is updated
              userId: user?.id,
              patientId: user?.id
            };
          }
          return log;
        });
        
        localStorage.setItem('patientDailyLogs', JSON.stringify(updatedLogs));
        toast.success('Existing health log updated successfully');
      } else {
        // Create new log entry
        const logEntry = {
          id: Date.now().toString(),
          date,
          symptoms,
          medicationTaken: selectedMedicines,
          aiSuggestion: suggestion,
          mood,
          painLevel,
          selectedSymptoms,
          createdAt: new Date().toISOString(),
          userId: user?.id,
          patientName: patientName,
          patientId: user?.id
        };
        
        console.log('Creating new log entry with patient info:', {
          patientName: logEntry.patientName,
          patientId: logEntry.patientId,
          userId: logEntry.userId
        });
        
        // Save to localStorage
        existingLogs.push(logEntry);
        localStorage.setItem('patientDailyLogs', JSON.stringify(existingLogs));
        
        // Create a notification for the daily log
        const notification = {
          id: Date.now().toString(),
          type: 'daily_log',
          message: `Your daily health log for ${date} has been saved.`,
          date: new Date().toISOString(),
          read: false
        };
        
        const existingNotifications = localStorage.getItem('patientNotifications') || '[]';
        const parsedNotifications = JSON.parse(existingNotifications);
        parsedNotifications.push(notification);
        localStorage.setItem('patientNotifications', JSON.stringify(parsedNotifications));
        
        toast.success('New daily log submitted successfully');
      }
      
      // Save to medicine logs if option is selected
      if (saveToMedicineLogs && selectedMedicines.length > 0) {
        const existingMedicineLogsJSON = localStorage.getItem('patientMedicineLogs') || '[]';
        const existingMedicineLogs = JSON.parse(existingMedicineLogsJSON);
        
        // Create medicine log entries for each selected medicine
        const newMedicineLogs = selectedMedicines.map(medicine => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          medicine,
          date,
          reason: symptoms,
          createdAt: new Date().toISOString(),
          userId: user?.id,
          patientName: patientName,
          patientId: user?.id
        }));
        
        console.log('Creating new medicine logs with patient info:', {
          patientName: patientName,
          count: newMedicineLogs.length
        });
        
        // Save updated medicine logs
        localStorage.setItem('patientMedicineLogs', JSON.stringify([...existingMedicineLogs, ...newMedicineLogs]));
        toast.success(`Added ${selectedMedicines.length} medications to your medicine logs`);
      }
      
      // Reset form
      setSymptoms('');
      setSuggestion(null);
      setSuggestedMedicines([]);
      setSelectedMedicines([]);
      setSelectedSymptoms([]);
      setPainLevel(0);
      setMood('okay');
      setCurrentStep(1);
      
      // Set today's date again
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error saving daily log:', error);
      toast.error('Failed to save your daily log');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineSelect = (medicine: string) => {
    setSelectedMedicines(prev => 
      prev.includes(medicine) 
        ? prev.filter(m => m !== medicine)
        : [...prev, medicine]
    );
  };

  const redirectToPharmEasy = () => {
    if (selectedMedicines.length === 0) {
      toast.error('Please select at least one medicine');
      return;
    }
    const searchQuery = selectedMedicines.join('+');
    window.open(`https://pharmeasy.in/search/all?name=${searchQuery}`, '_blank');
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
            href="/find-us" 
            className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1"
          >
            Find us
          </Link>
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1"
          >
            Main page
          </Link>
          <button
            onClick={() => router.push('/patient/dashboard')}
            className="px-4 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 animate-fadeIn">
            Daily Health Log
          </h1>
          <p className="text-gray-600 mb-8">
            Track your symptoms and medication intake to help your doctor monitor your health.
          </p>
          
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div 
                  key={step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                  } text-sm transition-colors duration-300`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-black rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold mb-6">Step 1: Basic Information</h2>
                
                {/* Date Selection */}
                <div className="mb-6">
                  <label htmlFor="date" className="block text-lg font-medium mb-2">Date</label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                {/* Mood Selection */}
                <div className="mb-6">
                  <label className="block text-lg font-medium mb-3">How are you feeling today?</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: 'great', icon: <FaSmile size={28} />, label: 'Great', color: 'bg-green-100 text-green-600' },
                      { value: 'good', icon: <FaSmile size={28} />, label: 'Good', color: 'bg-green-50 text-green-500' },
                      { value: 'okay', icon: <FaMeh size={28} />, label: 'Okay', color: 'bg-yellow-50 text-yellow-600' },
                      { value: 'bad', icon: <FaFrown size={28} />, label: 'Bad', color: 'bg-orange-50 text-orange-600' },
                      { value: 'terrible', icon: <FaSadTear size={28} />, label: 'Terrible', color: 'bg-red-50 text-red-600' }
                    ].map((moodOption) => (
                      <div 
                        key={moodOption.value}
                        onClick={() => setMood(moodOption.value as MoodType)}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                          mood === moodOption.value 
                            ? 'border-black shadow-md' 
                            : 'border-transparent hover:border-gray-200'
                        } ${moodOption.color}`}
                      >
                        <div className="mb-2">{moodOption.icon}</div>
                        <span className="text-sm font-medium">{moodOption.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pain Level */}
                <div className="mb-6">
                  <label className="block text-lg font-medium mb-3">
                    Pain Level: <span className="text-blue-700">{painLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painLevel}
                    onChange={(e) => setPainLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>No Pain</span>
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                    <span>Extreme</span>
                  </div>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Symptom Selection */}
            {currentStep === 2 && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold mb-6">Step 2: Symptoms</h2>
                
                {/* Symptom Categories */}
                <div className="mb-6">
                  <label className="block text-lg font-medium mb-3">Select Symptom Category</label>
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    {[
                      { value: 'head', icon: <BiBrain size={24} />, label: 'Head & Neurological' },
                      { value: 'respiratory', icon: <FaLungs size={24} />, label: 'Respiratory' },
                      { value: 'digestive', icon: <GiStomach size={24} />, label: 'Digestive' },
                      { value: 'body', icon: <BiBody size={24} />, label: 'Body & General' },
                      { value: 'other', icon: <FaHeadSideCough size={24} />, label: 'Other' }
                    ].map((category) => (
                      <div 
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value as SymptomCategory)}
                        className={`flex flex-col items-center text-center p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                          selectedCategory === category.value 
                            ? 'border-black shadow-md bg-black/5' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="mb-2">{category.icon}</div>
                        <span className="text-sm font-medium">{category.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Common Symptoms */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-lg font-medium">Common Symptoms</label>
                    <span className="text-sm text-blue-700">
                      Selected: {selectedSymptoms.length}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {commonSymptoms[selectedCategory].map((symptom) => (
                      <div 
                        key={symptom}
                        onClick={() => handleSymptomSelect(symptom)}
                        className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                          selectedSymptoms.includes(symptom)
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 mr-3 rounded-full border flex items-center justify-center ${
                            selectedSymptoms.includes(symptom) ? 'border-blue-500' : 'border-gray-300'
                          }`}>
                            {selectedSymptoms.includes(symptom) && (
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                          <span>{symptom}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Custom Symptom Input */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Add Custom Symptom</label>
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Enter other symptoms..."
                        value={customMedicine} // Reusing the customMedicine state
                        onChange={(e) => setCustomMedicine(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customMedicine.trim()) {
                            handleSymptomSelect(customMedicine.trim());
                            setCustomMedicine('');
                          }
                        }}
                        className="bg-black text-white px-4 rounded-r-lg hover:bg-gray-800"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Symptom Text Area */}
                <div className="mb-6">
                  <label htmlFor="symptoms" className="block text-lg font-medium mb-2">Detailed Symptoms</label>
                  <textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms in detail..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all h-32"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This text will be updated automatically based on your selections, but you can also edit it manually.
                  </p>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg transition-all duration-300 hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <div className="flex space-x-3">
                    <button 
                      type="button" 
                      onClick={analyzeSymptoms}
                      disabled={isAnalyzing || !symptoms.trim()}
                      className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all ${isAnalyzing ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      {isAnalyzing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M13.066 7.564a1 1 0 01.176 1.4l-3.87 5a1 1 0 01-1.552.063l-2.329-2.75a1 1 0 111.518-1.304l1.58 1.866 3.12-4.027a1 1 0 011.357-.248z" clipRule="evenodd" />
                          </svg>
                          <span>Analyze</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Medication Selection */}
            {currentStep === 3 && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold mb-6">Step 3: Medications</h2>
                
                {/* AI Suggestions */}
                {suggestion ? (
                  <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Medication Suggestions</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* Morning Medications */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                          <FaSyringe className="mr-2" /> Morning
                        </h4>
                        <div className="space-y-2">
                          {suggestion.morning.map((med, i) => (
                            <div 
                              key={`morning-${i}`} 
                              onClick={() => handleMedicineSelect(med)}
                              className={`flex items-center p-3 rounded-md cursor-pointer transition-all ${
                                selectedMedicines.includes(med)
                                  ? 'bg-white border border-blue-300'
                                  : 'bg-blue-100 hover:bg-blue-200'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                selectedMedicines.includes(med) ? 'border-blue-500' : 'border-blue-300'
                              }`}>
                                {selectedMedicines.includes(med) && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                              </div>
                              <span className="text-blue-900">{med}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Afternoon Medications */}
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <h4 className="font-medium text-amber-800 mb-3 flex items-center">
                          <FaPills className="mr-2" /> Afternoon
                        </h4>
                        <div className="space-y-2">
                          {suggestion.afternoon.map((med, i) => (
                            <div 
                              key={`afternoon-${i}`} 
                              onClick={() => handleMedicineSelect(med)}
                              className={`flex items-center p-3 rounded-md cursor-pointer transition-all ${
                                selectedMedicines.includes(med)
                                  ? 'bg-white border border-amber-300'
                                  : 'bg-amber-100 hover:bg-amber-200'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                selectedMedicines.includes(med) ? 'border-amber-500' : 'border-amber-300'
                              }`}>
                                {selectedMedicines.includes(med) && <div className="w-3 h-3 rounded-full bg-amber-500"></div>}
                              </div>
                              <span className="text-amber-900">{med}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Night Medications */}
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h4 className="font-medium text-indigo-800 mb-3 flex items-center">
                          <FaThermometerHalf className="mr-2" /> Night
                        </h4>
                        <div className="space-y-2">
                          {suggestion.night.map((med, i) => (
                            <div 
                              key={`night-${i}`} 
                              onClick={() => handleMedicineSelect(med)}
                              className={`flex items-center p-3 rounded-md cursor-pointer transition-all ${
                                selectedMedicines.includes(med)
                                  ? 'bg-white border border-indigo-300'
                                  : 'bg-indigo-100 hover:bg-indigo-200'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                selectedMedicines.includes(med) ? 'border-indigo-500' : 'border-indigo-300'
                              }`}>
                                {selectedMedicines.includes(med) && <div className="w-3 h-3 rounded-full bg-indigo-500"></div>}
                              </div>
                              <span className="text-indigo-900">{med}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Medical Advice */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-2">Medical Advice</h4>
                      <p className="text-gray-700 text-sm whitespace-pre-line">{suggestion.advice}</p>
                    </div>
                    
                    {/* Selected Medications Summary */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-800">Selected Medications</h4>
                        <span className="text-sm bg-black text-white px-2 py-1 rounded-full">
                          {selectedMedicines.length} selected
                        </span>
                      </div>
                      
                      {selectedMedicines.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedMedicines.map((med, i) => (
                            <span key={i} className="bg-gray-100 text-gray-800 text-sm py-1 px-3 rounded-full border border-gray-300 flex items-center">
                              {med}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMedicineSelect(med);
                                }} 
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mb-4">No medications selected yet</p>
                      )}
                      
                      {/* Custom Medication */}
                      <div className="flex mb-4">
                        <input
                          type="text"
                          placeholder="Add your own medication..."
                          value={customMedicine}
                          onChange={(e) => setCustomMedicine(e.target.value)}
                          className="flex-1 p-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customMedicine.trim()) {
                              handleMedicineSelect(customMedicine.trim());
                              setCustomMedicine('');
                            }
                          }}
                          className="bg-black text-white px-3 py-2 text-sm rounded-r-md hover:bg-gray-800"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Save to Medicine Logs */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="saveToMedicineLogs"
                          checked={saveToMedicineLogs}
                          onChange={(e) => setSaveToMedicineLogs(e.target.checked)}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mr-2"
                        />
                        <label htmlFor="saveToMedicineLogs" className="text-sm text-gray-700">
                          Also save selected medications to my medicine logs
                        </label>
                      </div>
                    </div>
                    
                    {/* Disclaimer */}
                    <div className="mt-6 bg-yellow-50 p-3 rounded-md text-yellow-800 text-sm border border-yellow-200">
                      <p className="font-bold">Important Disclaimer:</p>
                      <p>These are general suggestions only. Always consult with your healthcare provider before starting new medications. AI suggestions are not a replacement for professional medical advice.</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-6 rounded-lg border border-gray-200 bg-gray-50 text-center">
                    <div className="text-gray-500 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No medication suggestions yet</p>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Go back to the previous step and click "Analyze" to get AI-generated medication suggestions based on your symptoms.
                    </p>
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-gray-800"
                    >
                      Back to Symptoms
                    </button>
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg transition-all duration-300 hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg transition-all duration-300 hover:bg-green-700 hover:shadow-lg disabled:bg-gray-400"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : 'Submit Health Log'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">AidX Copyrights reserved 2025</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">Facebook</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">LinkedIn</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">YouTube</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 