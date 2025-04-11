"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiAlertCircle, FiCheck, FiChevronLeft, FiRefreshCw } from "react-icons/fi";
import Link from "next/link";
import axios from "axios";

interface Emergency {
  id: string;
  patientId: string;
  patientName: string;
  message: string;
  details?: string;
  status: "pending" | "resolved";
  createdAt: string;
  severity: "high" | "medium" | "low";
  date?: string;
  read: boolean;
}

const DoctorEmergencies = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "resolved">("all");

  // Sample data - in a real app, this would come from an API
  const sampleEmergencies: Emergency[] = [
    {
      id: "1",
      patientId: "pat_1",
      patientName: "John Doe",
      message: "Experiencing severe chest pain and shortness of breath",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      severity: "high",
      read: false
    },
    {
      id: "2",
      patientId: "pat_2",
      patientName: "Alice Smith",
      message: "Blood sugar levels critically low, experiencing dizziness",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      severity: "high",
      read: false
    },
    {
      id: "3",
      patientId: "pat_3",
      patientName: "Robert Johnson",
      message: "Medication side effects - mild rash and itching",
      status: "resolved",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      severity: "medium",
      read: true
    },
    {
      id: "4",
      patientId: "pat_4",
      patientName: "Emily Williams",
      message: "Increased blood pressure readings for the past 2 days",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      severity: "medium",
      read: false
    },
    {
      id: "5",
      patientId: "pat_5",
      patientName: "Michael Brown",
      message: "Persistent headache not responding to prescribed medication",
      status: "resolved",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      severity: "low",
      read: true
    },
  ];

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    // In a real app, fetch emergencies from API
    const fetchEmergencies = async () => {
      setLoading(true);
      try {
        // Check localStorage for emergency alerts from patients
        const localEmergencies = localStorage.getItem('doctorEmergencies');
        
        if (localEmergencies) {
          const parsedEmergencies = JSON.parse(localEmergencies);
          // Convert to our Emergency format with proper typing
          const formattedEmergencies: Emergency[] = parsedEmergencies.map((e: any) => ({
            id: e.id || String(Date.now()),
            patientId: e.patientId || '',
            patientName: e.patientName || 'Unknown Patient',
            message: e.message || "Patient needs urgent assistance",
            details: e.details,
            status: (e.resolved || e.status === "resolved") ? ("resolved" as const) : ("pending" as const),
            createdAt: e.createdAt || e.date || new Date().toISOString(),
            severity: (e.severity === "high" || e.severity === "medium" || e.severity === "low") 
              ? e.severity 
              : "high" as const,
            read: Boolean(e.read)
          }));
          
          // Mark all as read
          const updatedEmergencies = formattedEmergencies.map((e) => ({
            ...e,
            read: true
          }));
          
          // Update localStorage with read status
          localStorage.setItem('doctorEmergencies', JSON.stringify(updatedEmergencies));
          
          setEmergencies(updatedEmergencies);
          setLoading(false);
        } else {
          // Fallback to sample data if no localStorage data
          setTimeout(() => {
            setEmergencies(sampleEmergencies);
            setLoading(false);
          }, 1000);
        }
      } catch (error) {
        console.error("Error fetching emergencies:", error);
        toast.error("Failed to load emergency alerts");
        setLoading(false);
      }
    };

    fetchEmergencies();
  }, [user, isLoaded, router]);

  const handleResolveEmergency = async (id: string) => {
    try {
      // Update local state with proper typing
      const updatedEmergencies: Emergency[] = emergencies.map((emergency) =>
        emergency.id === id ? { ...emergency, status: "resolved" as const } : emergency
      );
      
      setEmergencies(updatedEmergencies);
      
      // Update localStorage
      localStorage.setItem('doctorEmergencies', JSON.stringify(updatedEmergencies));
      
      toast.success("Emergency marked as resolved");
    } catch (error) {
      console.error("Error resolving emergency:", error);
      toast.error("Failed to update emergency status");
    }
  };

  const refreshEmergencies = () => {
    setLoading(true);
    
    // Check localStorage for updated emergency alerts
    const localEmergencies = localStorage.getItem('doctorEmergencies');
    
    if (localEmergencies) {
      try {
        const parsedEmergencies = JSON.parse(localEmergencies);
        // Ensure proper typing of parsed data
        const typedEmergencies: Emergency[] = parsedEmergencies.map((e: any) => ({
          id: e.id,
          patientId: e.patientId || '',
          patientName: e.patientName || 'Unknown Patient',
          message: e.message || "Patient needs urgent assistance",
          details: e.details,
          status: e.status === "resolved" ? "resolved" as const : "pending" as const,
          createdAt: e.createdAt || e.date || new Date().toISOString(),
          severity: (e.severity === "high" || e.severity === "medium" || e.severity === "low") 
            ? e.severity 
            : "high" as const,
          read: Boolean(e.read)
        }));
        
        setEmergencies(typedEmergencies);
        setLoading(false);
        toast.success("Emergency alerts refreshed");
      } catch (error) {
        console.error("Error refreshing emergencies:", error);
        setLoading(false);
      }
    } else {
      // Fallback to sample data
      setTimeout(() => {
        setEmergencies(sampleEmergencies);
        setLoading(false);
        toast.success("Emergency alerts refreshed");
      }, 1000);
    }
  };

  const filteredEmergencies = emergencies.filter((emergency) => {
    if (filterStatus === "all") return true;
    return emergency.status === filterStatus;
  });

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

  const getSeverityClass = (severity: Emergency['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              href="/doctor/dashboard"
              className="flex items-center mr-4 text-gray-600 hover:text-black transition-colors"
            >
              <FiChevronLeft className="mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Patient Emergency Alerts</h1>
          </div>
          <button
            onClick={refreshEmergencies}
            className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "all"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "pending"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("resolved")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "resolved"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Resolved
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {filteredEmergencies.length} emergency alert{filteredEmergencies.length !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : filteredEmergencies.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-10 text-center">
            <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No emergency alerts</h3>
            <p className="mt-1 text-gray-500">
              {filterStatus === "all"
                ? "You don't have any emergency alerts at the moment."
                : filterStatus === "pending"
                ? "You don't have any pending emergency alerts."
                : "You don't have any resolved emergency alerts."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEmergencies.map((emergency) => (
              <div
                key={emergency.id}
                className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                  emergency.status === "resolved" ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{emergency.patientName}</h3>
                      <p className="text-gray-500 text-sm">{formatTime(emergency.createdAt)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSeverityClass(
                        emergency.severity
                      )}`}
                    >
                      {emergency.severity === "high"
                        ? "High Priority"
                        : emergency.severity === "medium"
                        ? "Medium Priority"
                        : "Low Priority"}
                    </span>
                  </div>
                  <p className="mt-4 text-gray-700">{emergency.message}</p>
                  {emergency.details && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="text-gray-600 text-sm">{emergency.details}</p>
                    </div>
                  )}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          emergency.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {emergency.status === "pending" ? "Pending" : "Resolved"}
                      </span>
                    </div>
                    {emergency.status === "pending" && (
                      <button
                        onClick={() => handleResolveEmergency(emergency.id)}
                        className="flex items-center px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <FiCheck className="mr-2" />
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorEmergencies; 