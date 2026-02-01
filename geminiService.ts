
import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabase";

export const chatWithGemini = async (userInput: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fetch knowledge base from site_config and services
    const { data: config } = await supabase.from('site_config').select('*').single();
    const { data: services } = await supabase.from('services').select('*');
    const { data: projects } = await supabase.from('projects').select('*').limit(5);

    const context = `
      You are an AI assistant for Md Abdul Hai, a Visualizer (Graphic Designer, Motion Graphics Designer, Video Editor).
      Website Content Knowledge:
      - Name: Md Abdul Hai
      - Experience: 5+ years
      - Services: ${services?.map(s => `${s.title}: ${s.description} at ${s.price}`).join(', ')}
      - Top Projects: ${projects?.map(p => p.title).join(', ')}
      - Bio: ${config?.bio || 'Professional creative expert'}
      - Contact: WhatsApp +8801779672765, Email mdabdulhai2506@gmail.com
      - Extra Context: ${config?.chatbot_knowledge || ''}

      STRICT RULES:
      1. ONLY answer based on the provided information. 
      2. If you don't know, suggest contacting Md Abdul Hai via WhatsApp.
      3. Tone: Friendly, professional, and helpful (Cat-style personality - cute but skilled).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userInput,
      config: {
        systemInstruction: context,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a little nap right now. Purr... please try again or contact my boss via WhatsApp!";
  }
};
