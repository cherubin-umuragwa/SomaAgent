import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SCHOOL_CONTEXT = "Gayaza High School, Uganda. Motto: 'Never Give Up'.";

export async function POST(request: NextRequest) {
  try {
    const { topic, resourceContent } = await request.json();

    if (!topic || !resourceContent) {
      return NextResponse.json(
        { error: 'Topic and resource content are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a short, interactive 3-question quiz for the topic "${topic}" using the following specific material: "${resourceContent}". 
      
      FORMATTING:
      - Use bold for the questions.
      - Use numbered lists.
      - Provide a section at the bottom called "### Mastery Key" for the answers.`,
      config: {
        systemInstruction: `You are an Academic Director at ${SCHOOL_CONTEXT}. 
        Ensure all questions are strictly aligned with the provided lesson notes and formatted for high readability.`,
      },
    });

    const challenge = response.text;

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('[SOMA-AI] Challenge Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    );
  }
}
