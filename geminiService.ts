
import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabase.ts";

export const chatWithGemini = async (userInput: string) => {
  try {
    const apiKey = process.env.API_KEY || "";
    if (!apiKey) {
      console.warn("Gemini API Key missing.");
      return "I'm offline right now, but you can contact Md Abdul Hai directly on WhatsApp!";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Fetch knowledge context from Supabase
    const { data: config } = await supabase.from('site_config').select('*').single();
    const { data: services } = await supabase.from('services').select('*');

    const systemPrompt = `
      You are "Hai's Creative Assistant", an AI expert for Md Abdul Hai (Visualizer & Motion Designer).
      
      CONTEXT:
      - Boss: Md Abdul Hai
      - Experience: 5+ Years in Motion Graphics, CGI Ads, and Graphic Design.
      - Services Offered: ${services?.map(s => `${s.title} (${s.price})`).join(', ') || 'CGI Commercials, Motion Design, Branding'}
      - Personality: Professional, creative, slightly feline-themed (uses "Meow" occasionally), and helpful.
      - Contact: WhatsApp (+8801779672765) or Email (mdabdulhai2506@gmail.com)
      
      RULES:
      1. Always refer to yourself as Hai's assistant.
      2. If you don't know something specifically, steer the conversation toward booking a consultation.
      3. Be concise and engaging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userInput,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Meow... I'm feeling a bit sleepy. Try again later or text my boss on WhatsApp!";
  }
};
