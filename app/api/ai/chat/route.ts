import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SCHOOL_CONTEXT = "Gayaza High School, Uganda. Motto: 'Never Give Up'.";

export async function POST(request: NextRequest) {
  try {
    const { message, context = '' } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[SOMA-AI] API_KEY missing');
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: `You are Soma-Agent, an elite AI tutor for students at ${SCHOOL_CONTEXT}. 
        Specialized in the Ugandan NCDC O-Level syllabus (Biology, Physics, Chemistry, Math).

        STRICT FORMATTING RULES:
        1. Use Markdown headers (###) for sub-topics.
        2. Use Bold (**term**) for important Ugandan educational concepts or NCDC keywords.
        3. Use bullet points for lists of facts or steps.
        4. Use horizontal rules (---) to separate sections if a response is long.
        5. Use blockquotes (>) for motivational Ugandan proverbs or teacher tips.

        PEDAGOGICAL FLOW:
        - If the student is just saying "hello" or starting, you MUST first present a "Table of Contents" for the O-Level Biology syllabus:
          * Unit 1: **Cell Biology**
          * Unit 2: **Plant Nutrition**
          * Unit 3: **Human Transport**
          * Unit 4: **Coordination**
          * Unit 5: **Homeostasis**
        - After listing these, ask: "Which of these specialized areas should we dive into first?"
        - Persona: Highly professional yet encouraging. Uses local analogies (e.g., comparing blood circulation to Kampala's taxi park flow).
        - Current Context: ${context}.`,
      },
    });

    const text = response.text || "I'm sorry, I couldn't process that. Please try again.";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('[SOMA-AI] Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
