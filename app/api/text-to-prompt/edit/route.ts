import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { OpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { prompt, instruction } = await request.json();
    
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
      return NextResponse.json(
        { error: 'Instruction is required' },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[Prompt Edit] OPENROUTER_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    console.log('[Prompt Edit] Editing prompt with instruction:', instruction.substring(0, 50));

    // Initialize OpenRouter
    const openrouter = new OpenRouter({
      apiKey: apiKey,
    });

    // Call Gemini 2.5 Flash for prompt editing
    const { text } = await generateText({
      model: openrouter.chat('google/gemini-2.5-flash'),
      messages: [
        {
          role: 'system',
          content: `You are an expert at editing image generation prompts. Your task is to modify the given prompt according to the user's instruction while maintaining the overall quality and structure.

Guidelines:
1. Follow the user's instruction precisely
2. Preserve the prompt's technical quality (details, style, lighting)
3. Maintain coherence and visual consistency
4. Keep all relevant descriptive elements
5. Output ONLY the edited prompt, no explanations

Example:
Original: "A cat sitting on a wall at sunset"
Instruction: "Change the cat to a dog"
Output: "A dog sitting on a wall at sunset"`,
        },
        {
          role: 'user',
          content: `Original prompt: ${prompt.trim()}

Instruction: ${instruction.trim()}

Please edit the prompt according to the instruction:`,
        },
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    console.log('[Prompt Edit] Edited prompt:', text.substring(0, 100));

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        original: prompt,
        instruction: instruction,
        edited: text.trim(),
      },
    });

  } catch (error: any) {
    console.error('[Prompt Edit] Error:', error.message || error);
    return NextResponse.json(
      { 
        error: 'Failed to edit prompt',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
