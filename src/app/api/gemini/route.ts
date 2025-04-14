import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Gemini API with your API key
// In production, you should use environment variables
const API_KEY = process.env.GEMINI_API_KEY;

// Log for debugging - remove this in production
console.log("API Key available:", API_KEY ? "Yes" : "No");

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please set the GEMINI_API_KEY environment variable." },
        { status: 500 }
      );
    }
    
    const { patientData } = await req.json();
    
    if (!patientData) {
      return NextResponse.json({ error: "Patient data is required" }, { status: 400 });
    }
    
    // Create a prompt for Gemini to analyze potential ADRs
    const prompt = createADRAnalysisPrompt(patientData);
    
    // Get the Gemini model - using gemini-pro instead of gemini-1.0-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro"
    });
    
    // Generate a response from Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the response to extract structured ADR alerts
    const alerts = parseGeminiResponse(text);
    
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error processing Gemini AI request:", error);
    return NextResponse.json(
      { error: "Failed to analyze patient data", details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}

// Create a detailed prompt for Gemini to analyze patient data for ADRs
function createADRAnalysisPrompt(patientData: any) {
  return `
You are an advanced medical AI assistant specialized in detecting potential Adverse Drug Reactions (ADRs).
Analyze the following patient data to identify any potential adverse drug reactions or medication interactions.

PATIENT DATA:
${JSON.stringify(patientData, null, 2)}

Task: Analyze the patient's symptoms, medications, and medical history to identify potential adverse drug reactions.

For each potential ADR you identify, provide the following information in JSON format:
1. "alertId": A unique identifier for this alert
2. "severity": The severity level of the potential ADR ("high", "medium", "low")
3. "title": A concise title for the ADR
4. "description": A detailed explanation of the potential ADR
5. "medications": Array of medications involved
6. "symptoms": Array of symptoms that indicate this potential ADR
7. "recommendation": Clinical recommendation for addressing this potential ADR

Format your response as a JSON array of alerts. If no potential ADRs are detected, return an empty array.
Example format:
[
  {
    "alertId": "adr_1",
    "severity": "high",
    "title": "Potential Antibiotic-Induced Rash",
    "description": "Patient is taking amoxicillin and has developed a rash, which may indicate an allergic reaction.",
    "medications": ["amoxicillin"],
    "symptoms": ["rash", "itching"],
    "recommendation": "Consider discontinuing amoxicillin and switching to a non-beta-lactam antibiotic."
  }
]

Only include alerts that have strong evidence in the patient data.
`;
}

// Parse the Gemini response to extract structured ADR alerts
function parseGeminiResponse(response: string): any[] {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    
    const jsonStr = jsonMatch[0];
    const alerts = JSON.parse(jsonStr);
    
    // Validate and sanitize each alert
    return alerts.map((alert: any) => ({
      id: alert.alertId || `adr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      severity: alert.severity || "medium",
      title: alert.title || "Potential Adverse Drug Reaction",
      description: alert.description || "",
      medications: Array.isArray(alert.medications) ? alert.medications : [],
      symptoms: Array.isArray(alert.symptoms) ? alert.symptoms : [],
      recommendation: alert.recommendation || ""
    }));
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return [];
  }
} 