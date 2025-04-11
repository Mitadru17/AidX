'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
}

export default function Chatbot({ isOpen, onClose, apiKey = '' }: ChatbotProps) {
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
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      let botResponse: Message;
      
      if (apiKey) {
        // Use Gemini API when key is provided
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are AidX, a healthcare assistant. Answer the following question: ${input}`,
                  },
                ],
              },
            ],
          }),
        });

        const data = await response.json();
        const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      "I'm sorry, I couldn't process your request at the moment. Please try again later.";

        botResponse = {
          id: (Date.now() + 1).toString(),
          text: botText,
          sender: 'bot',
          timestamp: new Date(),
        };
      } else {
        // Fallback responses when no API key is provided
        const fallbackResponses = [
          "I'm here to help with your healthcare questions. Can you provide more details?",
          "That's an interesting question about your health. Let me help you find more information.",
          "I understand your concern. Have you discussed this with your doctor?",
          "I recommend consulting with your healthcare provider for personalized advice on this matter.",
          "Your health is important. Let me guide you to the relevant resources.",
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: 'bot',
          timestamp: new Date(),
        };
      }

      // Simulate network delay for better UX even with fallback responses
      setTimeout(() => {
        setMessages((prev) => [...prev, botResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching response:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorResponse]);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700 z-50 animate-slideUp">
      {/* Chat Header */}
      <div className="p-4 bg-black text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src="/logo.png"
              alt="AidX Assistant"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <span className="font-medium">AidX Assistant</span>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
          aria-label="Close chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 max-w-[80%] ${
              message.sender === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-black text-white rounded-tr-none'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-tl-none'
              }`}
            >
              {message.text}
            </div>
            <div
              className={`text-xs mt-1 text-gray-500 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 max-w-[80%] mr-auto">
            <div className="p-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-tl-none flex items-center">
              <div className="dot-flashing"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-black text-white py-2 px-4 rounded-r-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            disabled={isLoading || !input.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
} 