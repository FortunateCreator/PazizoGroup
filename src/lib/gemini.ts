import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getConciergeResponse(prompt: string, context?: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are the Pazizo Concierge, a high-integrity logistics strategist for Pazizo Energy. 
        Your goal is to help customers with diesel delivery in Nigeria.
        
        Business Rules:
        - MOQ for Abuja and Owerri: 100 Liters.
        - MOQ for all other states: 1,000 Liters.
        - Brand: Pazizo Energy.
        - Tone: Professional, authoritative, reliable.
        
        If a user asks about an address, verify if it's in Abuja or Owerri to apply the correct MOQ.
        If they are below MOQ, explain the policy firmly but politely.
        Always emphasize "Absolute Convenience, Trust, and Integrity".`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Concierge Error:", error);
    return "I'm sorry, I'm having trouble connecting to the logistics network. Please try again or contact our support directly.";
  }
}
