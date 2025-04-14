'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function PatientChatbot() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you with your healthcare questions today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestedQuestions] = useState([
    "What should I do about a fever?",
    "How can I manage my headache?",
    "What are common cold remedies?",
    "Tips for reducing anxiety?",
    "How much exercise is recommended daily?"
  ]);
  
  // Use the provided Gemini API key
  const GEMINI_API_KEY = 'AIzaSyC-KcSv3Ibp9NCkwubA7UMmAFSeH-2EvIA';
  
  // Health FAQ responses for fallback
  const healthFAQ = {
    "fever": "If you have a fever, it's recommended to rest, stay hydrated, and take over-the-counter fever reducers like acetaminophen if your temperature is above 100.4°F (38°C). If your fever persists for more than three days, exceeds 103°F (39.4°C), or is accompanied by severe symptoms, please seek medical attention immediately.",
    "headache": "For headaches, try resting in a quiet, dark room, apply a cold compress to your forehead, and consider over-the-counter pain relievers like ibuprofen or acetaminophen. If you experience severe, sudden headaches, headaches with fever, stiff neck, confusion, seizures, or after a head injury, seek immediate medical attention.",
    "cold": "For common colds, get plenty of rest, stay hydrated, use a humidifier, and try over-the-counter cold medications for symptom relief. If symptoms worsen after a week or you develop high fever, severe sore throat, or difficulty breathing, consult a healthcare provider.",
    "cough": "For a cough, stay hydrated, use honey (if over 1 year old), try cough drops, use a humidifier, and avoid irritants. See a doctor if your cough lasts more than 3 weeks, brings up blood or thick mucus, or is accompanied by fever or difficulty breathing.",
    "covid": "If you suspect COVID-19, monitor your symptoms, isolate yourself, rest, stay hydrated, and take over-the-counter medications for fever. Seek emergency care if you experience difficulty breathing, persistent chest pain, confusion, or bluish lips or face.",
    "blood pressure": "To manage blood pressure, maintain a healthy diet low in sodium and rich in fruits and vegetables, exercise regularly, limit alcohol, avoid smoking, reduce stress, and take prescribed medications consistently. Regular monitoring is important.",
    "diabetes": "For diabetes management, monitor your blood sugar regularly, take medications as prescribed, eat a balanced diet with consistent carbohydrate intake, exercise regularly, and attend all follow-up appointments with your healthcare provider.",
    "allergy": "For allergies, identify and avoid triggers, take antihistamines or other prescribed medications, keep windows closed during high pollen seasons, use air purifiers, and shower after being outdoors. Consult an allergist for severe or persistent symptoms.",
    "pain": "For general pain, try rest, ice or heat therapy, over-the-counter pain relievers, and gentle stretching. If pain is severe, worsening, or accompanied by other concerning symptoms, please consult a healthcare provider.",
    "medication": "Always take medications as prescribed by your healthcare provider. Don't stop medications without consulting your doctor, even if you feel better. Keep a list of all medications you take, including over-the-counter drugs and supplements.",
    "stomach": "For stomach issues, stay hydrated, eat bland foods like bananas, rice, applesauce, and toast (BRAT diet), avoid spicy or fatty foods, and consider over-the-counter remedies. See a doctor if you experience severe pain, blood in stool, persistent vomiting, or symptoms lasting more than a few days.",
    "diarrhea": "For diarrhea, stay well-hydrated with water, clear broths, and electrolyte solutions. Avoid dairy, caffeine, and high-fiber foods. Try the BRAT diet (bananas, rice, applesauce, toast). If diarrhea persists more than 2 days, contains blood, or is accompanied by fever over 102°F (39°C), seek medical attention.",
    "rash": "For skin rashes, avoid scratching, use cool compresses, try over-the-counter hydrocortisone cream or antihistamines, and keep the area clean. See a doctor if the rash is painful, widespread, includes blisters, or is accompanied by fever or difficulty breathing.",
    "sleep": "To improve sleep, maintain a consistent sleep schedule, create a relaxing bedtime routine, limit screen time before bed, avoid caffeine and alcohol in the evening, ensure your bedroom is dark and cool, and consider relaxation techniques like deep breathing or meditation.",
    "stress": "To manage stress, try regular exercise, deep breathing, meditation, maintaining a balanced diet, limiting caffeine and alcohol, getting enough sleep, connecting with supportive people, and considering professional help if stress becomes overwhelming.",
    "anxiety": "For anxiety, practice deep breathing exercises, progressive muscle relaxation, mindfulness meditation, regular physical activity, and maintaining a healthy diet and sleep schedule. If anxiety interferes with daily life, consider talking to a mental health professional.",
    "depression": "If you're experiencing symptoms of depression, try to maintain regular physical activity, eat a balanced diet, establish regular sleep patterns, connect with supportive people, and set small achievable goals. Most importantly, please consider reaching out to a mental health professional for proper support and treatment.",
    "nutrition": "For good nutrition, aim for a balanced diet with plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit processed foods, sugary drinks, and excessive salt. Stay hydrated and consider your individual dietary needs based on age, gender, and activity level.",
    "exercise": "For exercise recommendations, aim for at least 150 minutes of moderate-intensity activity or 75 minutes of vigorous activity per week, plus muscle-strengthening activities twice weekly. Start slowly if you're new to exercise and choose activities you enjoy to help maintain consistency.",
    "heart": "For heart health, maintain a balanced diet low in saturated fats, trans fats, and sodium, exercise regularly, avoid smoking, limit alcohol, manage stress, and get regular check-ups to monitor blood pressure, cholesterol, and blood sugar levels.",
    "pregnancy": "During pregnancy, attend all prenatal appointments, take prenatal vitamins with folic acid, stay hydrated, eat a balanced diet, get regular gentle exercise as approved by your doctor, get adequate rest, and avoid alcohol, tobacco, and certain medications. Contact your healthcare provider with any concerns.",
    "vaccination": "Vaccinations are essential for preventing serious diseases. Stay up-to-date with recommended vaccines based on your age, health conditions, and lifestyle factors. If you're unsure about which vaccines you might need, consult with your healthcare provider for personalized recommendations.",
    "flu": "For the flu, rest, stay hydrated, take over-the-counter fever reducers like acetaminophen or ibuprofen, use a humidifier, and consider antiviral medications if prescribed early in your illness. Seek medical attention if you experience difficulty breathing, persistent chest pain, confusion, or severe weakness."
  };
  
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
    setMounted(true);
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Try the Gemini API first
      let botText = "";
      let useLocalFallback = false;
      
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { 
                    text: `You are AidX, an empathetic healthcare assistant who responds like a real doctor. Act as if you're conducting a medical consultation.

1. Listen carefully to the patient's symptoms or concerns
2. Ask specific follow-up questions to gather more information when needed
3. Express empathy for their situation
4. Provide detailed information about potential symptoms, causes, and treatments
5. Ask about important contextual factors like:
   - Duration and severity of symptoms
   - Any medications they're taking
   - Relevant medical history
   - Lifestyle factors that might be contributing

When analyzing their information, consider:
- Known medication side effects
- Potential food-drug interactions
- Whether symptoms warrant immediate medical attention

End your response with a clear next step or follow-up question. Always maintain a professional but caring tone.

User's message: ${input}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 800,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check for valid response structure
        if (data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0) {
          botText = data.candidates[0].content.parts[0].text;
        } else {
          // If response structure is unexpected, use fallback
          useLocalFallback = true;
        }
      } catch (error) {
        console.error('Gemini API error:', error);
        useLocalFallback = true;
      }
      
      // If the API failed or returned invalid response, use our local fallback system
      if (useLocalFallback) {
        const userQuery = input.toLowerCase();
        botText = "I understand you have a health concern. For specific medical advice, please consult with a healthcare professional. Remember that AidX offers telemedicine appointments that you can book through your dashboard.";
        let matched = false;
        
        // Check for greetings first
        if (userQuery.match(/^(hi|hello|hey|greetings)/i)) {
          botText = "Hello! I'm here to help with any health-related questions you might have. How can I assist you today?";
          matched = true;
        }
        // Check for thanks
        else if (userQuery.match(/^(thanks|thank you|thx)/i)) {
          botText = "You're welcome! If you have any other health questions, feel free to ask. Your health is our priority.";
          matched = true;
        }
        // Check for general queries about AidX
        else if (userQuery.includes("aidx") || userQuery.includes("service") || userQuery.includes("help")) {
          botText = "AidX provides healthcare services including consultations, prescriptions, and health monitoring. Our platform connects you with qualified healthcare professionals and provides resources to help you manage your health.";
          matched = true;
        }
        // Check for health topics
        else {
          for (const [keyword, response] of Object.entries(healthFAQ)) {
            if (userQuery.includes(keyword)) {
              botText = response;
              matched = true;
              break;
            }
          }
        }
        
        // If no specific match, provide a more helpful generic response
        if (!matched) {
          // Try to detect if it's a question about a symptom
          if (userQuery.includes("symptom") || userQuery.includes("feel") || userQuery.includes("hurt") || userQuery.includes("pain")) {
            botText = "It sounds like you're experiencing some symptoms. While I can provide general information, it's important to consult with a healthcare professional for personalized advice. If your symptoms are severe or concerning, please seek medical attention promptly.";
          }
          // General health question
          else if (userQuery.includes("health") || userQuery.includes("wellness") || userQuery.includes("doctor")) {
            botText = "Maintaining good health involves a balanced diet, regular exercise, adequate sleep, stress management, and regular check-ups with healthcare providers. Is there a specific aspect of health you'd like information about?";
          }
        }
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
      };

      // Simulate network delay for a better UX
      setTimeout(() => {
        setMessages((prev) => [...prev, botResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error in chat response:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize for the inconvenience. I'm having trouble processing your request. Please try asking about common health topics like fever, headache, cold, or allergies.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorResponse]);
      setIsLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center fixed w-full z-50 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md">
        <Link href="/patient/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="relative w-10 h-10">
            <Image
              src="/logo.png"
              alt="AidX Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">AidX Health</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/patient/dashboard" 
            className="text-gray-700 hover:text-blue-600 transition-colors hover:-translate-y-0.5 duration-200 transform"
          >
            Dashboard
          </Link>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-white text-red-600 border-2 border-red-500 rounded-lg hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 transform hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Chat Interface */}
      <div className="pt-24 flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 pb-6">
        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-8rem)] border border-gray-200">
          {/* Chat Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-2 shadow-md">
                <Image
                  src="/logo.png"
                  alt="AidX Assistant"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="font-semibold text-xl">Medical Assistant</h1>
                <div className="flex items-center">
                  <span className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  <p className="text-sm text-blue-100">Online | Powered by AI</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`animate-fadeIn ${
                    message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }`}
                  style={{ animationDuration: '0.3s' }}
                >
                  <div className={`max-w-[85%] ${
                    message.sender === 'user' ? 'order-1' : 'order-2'
                  }`}>
                    <div
                      className={`p-4 rounded-2xl shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-none'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      {message.text}
                    </div>
                    <div
                      className={`text-xs mt-1 text-gray-500 flex items-center ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.sender === 'user' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 overflow-hidden ${
                    message.sender === 'user' ? 'order-2 ml-2' : 'order-1 mr-2'
                  }`}>
                    {message.sender === 'user' ? (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="relative w-full h-full bg-white">
                        <Image
                          src="/logo.png"
                          alt="AidX Assistant"
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-fadeIn" style={{ animationDuration: '0.3s' }}>
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2">
                    <div className="relative w-full h-full bg-white">
                      <Image
                        src="/logo.png"
                        alt="AidX Assistant"
                        fill
                        sizes="32px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="max-w-[85%]">
                    <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-gray-200 shadow-sm text-gray-800">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Suggested Questions */}
          {messages.length < 3 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a health question..."
                className="flex-1 py-3 px-4 border-0 focus:outline-none focus:ring-0 text-gray-700"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 flex items-center"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <span className="mr-2">Send</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11h2v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">This AI assistant provides general information only. For medical emergencies, call your local emergency number.</p>
          </form>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 