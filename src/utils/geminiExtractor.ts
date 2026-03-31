import { GoogleGenAI } from "@google/genai";
import { SMSLog } from "../types";

export async function extractBusinessIntent(smsLogs: SMSLog[]): Promise<SMSLog[]> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found. Skipping AI extraction.");
    return smsLogs;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // We only process a sample to save tokens/time for the prototype
  const sampleLogs = smsLogs.slice(0, 10);
  const prompt = `
    Analyze the following SMS logs from a Kenyan side-hustle owner. 
    For each log, identify the 'category' (STOCK_PURCHASE, CUSTOMER_ORDER, UTILITY_CONFIRMATION, MPESA_REF, OTHER) 
    and a short 'intent' description (e.g., "Customer inquiring about stock").
    
    Return the result as a JSON array of objects with 'id', 'category', and 'intent'.
    
    Logs:
    ${JSON.stringify(sampleLogs.map(l => ({ id: l.id, message: l.message })))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const results = JSON.parse(response.text);
    return smsLogs.map(log => {
      const aiResult = results.find((r: any) => r.id === log.id);
      if (aiResult) {
        return { ...log, category: aiResult.category, intent: aiResult.intent };
      }
      return log;
    });
  } catch (error) {
    console.error("Gemini extraction failed:", error);
    return smsLogs;
  }
}
