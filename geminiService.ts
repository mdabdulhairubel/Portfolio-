import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabase.ts";

export const chatWithGemini = async (userInput: string) => {
  try {
    // 1. Initialize Gemini with the required security pattern
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 2. Fetch comprehensive data for grounding
    const [
      { data: config },
      { data: services },
      { data: pricing },
      { data: projects },
      { data: testimonials }
    ] = await Promise.all([
      supabase.from('site_config').select('*').single(),
      supabase.from('services').select('*'),
      supabase.from('pricing_plans').select('*'),
      supabase.from('projects').select('*').eq('is_featured', true),
      supabase.from('testimonials').select('*')
    ]);

    // 3. Construct a rich knowledge base for the system instruction
    const serviceDetails = services?.map(s => `- ${s.title}: ${s.description} (Starting at ${s.price}). Features: ${s.features?.join(', ')}`).join('\n') || 'CGI Ads, Motion Graphics, Video Editing';
    const pricingDetails = pricing?.map(p => `- ${p.title} Package: ${p.price}. Description: ${p.description}. Features: ${p.features?.join(', ')}`).join('\n') || 'Custom pricing available upon request.';
    const projectSummary = projects?.map(p => `- ${p.title} (${p.category}): A high-end ${p.type} project.`).join('\n') || 'Various high-end CGI and motion design works.';
    const testimonialSummary = testimonials?.map(t => `- ${t.name} (${t.role}): "${t.feedback}"`).join('\n') || '';

    const systemPrompt = `
      You are "Visualizer AI", the elite creative assistant for Md Abdul Hai. 
      Your goal is to represent Md Abdul Hai (Hai) perfectly to potential clients.

      ABOUT MD ABDUL HAI:
      - Role: ${config?.hero_role || 'Senior Visualizer & Motion Storyteller'}
      - Experience: ${config?.experience_years || '5+'} Years
      - Bio: ${config?.bio || 'Cinematic visual storyteller specializing in high-end CGI.'}
      - Location: Dhaka, Bangladesh (Works Globally)
      - Skills: ${config?.skills?.map((s: any) => s.name).join(', ') || 'After Effects, Blender, Cinema 4D, Premiere Pro'}
      
      SERVICES OFFERED:
      ${serviceDetails}

      PRICING PACKAGES:
      ${pricingDetails}

      FEATURED PROJECTS:
      ${projectSummary}

      CLIENT FEEDBACK:
      ${testimonialSummary}

      CUSTOM KNOWLEDGE / INSTRUCTIONS:
      ${config?.chatbot_knowledge || 'Be helpful, professional, and slightly artistic.'}

      CONTACT INFO:
      - Email: ${config?.email || 'mdabdulhai2506@gmail.com'}
      - WhatsApp: ${config?.whatsapp || '+8801779672765'}

      CONVERSATION RULES:
      1. You are Hai's assistant, not Hai himself. Use "Hai" or "He" when referring to him.
      2. Be concise but extremely professional and creative.
      3. If asked about pricing, quote the specific packages mentioned above.
      4. If asked about experience, mention the ${config?.experience_years || '5+'} years of global impact.
      5. For specific project details or hiring, encourage users to contact via WhatsApp: ${config?.whatsapp}.
      6. Use a slightly cinematic and high-end tone.
    `;

    // 4. Query Gemini 3 Flash for fast, intelligent responses
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userInput,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    // 5. Return the generated text property
    return response.text;
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "I'm having a brief moment of creative recalibration. Please try again, or contact Md Abdul Hai directly on WhatsApp at +8801779672765 for an immediate response! Meow.";
  }
};