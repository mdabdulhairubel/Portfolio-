import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabase.ts";

export const chatWithGemini = async (userInput: string) => {
  try {
    // Initializing the GoogleGenAI client using process.env.API_KEY directly as required.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fetch knowledge context from Supabase to provide grounding for the assistant.
    const { data: config } = await supabase.from('site_config').select('*').single();
    const { data: services } = await supabase.from('services').select('*');

    const systemPrompt = `
      You are "Hai's Creative Assistant", an AI expert for Md Abdul Hai (Senior Visualizer & Motion Designer).
      
      CONTEXT:
      - Boss: Md Abdul Hai
      - Expertise: Motion Graphics, CGI Advertisements, Graphic Design, Video Editing.
      - Experience: 5+ Years delivering high-end cinematic visuals globally.
      - Services Offered: ${services?.map(s => `${s.title} (${s.price})`).join(', ') || 'CGI Commercials, Motion Design, Branding'}
      - Personality: Professional, artistic, slightly feline-themed (uses "Meow" occasionally), and extremely helpful.
      - Contact: WhatsApp (+8801779672765) or Email (mdabdulhai2506@gmail.com)
      
      RULES:
      1. Always refer to yourself as Hai's assistant.
      2. If you don't know something specific, guide the user to contact Md Abdul Hai directly via WhatsApp.
      3. Be concise, creative, and engaging.
    `;

    // Generating content with the model name and system instruction as configured.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userInput,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      },
    });

    // Accessing the text property directly on the response object.
    return response.text;
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "Meow... I'm currently recalibrating my creative circuits. Please try again in a moment or reach out to my boss directly!";
  }
};