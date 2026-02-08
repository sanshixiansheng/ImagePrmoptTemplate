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
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[Magic Enhance] OPENROUTER_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    console.log('[Magic Enhance] Processing prompt:', prompt.substring(0, 100));

    // Initialize OpenRouter
    const openrouter = new OpenRouter({
      apiKey: apiKey,
    });

    // Call Gemini 2.5 Flash for prompt enhancement
    const { text } = await generateText({
      model: openrouter.chat('google/gemini-2.5-flash'),
      messages: [
        {
          role: 'system',
          content: `You are an expert at optimizing image generation prompts. Your task is to transform simple or basic prompts into detailed, high-quality prompts that will generate better images.

Guidelines:
1. Add specific visual details (lighting, composition, style, mood)
2. Include technical terms (photorealistic, 4K, detailed texture)
3. Specify artistic style if appropriate (oil painting, digital art, cinematic)
4. Add environmental context and atmosphere
5. Keep the core concept intact
6. Output ONLY the enhanced prompt, no explanations

Example:
Input: "a cat"
Output: "A majestic orange tabby cat with piercing green eyes, sitting elegantly on a weathered stone wall at golden hour, soft warm lighting, photorealistic, 4K resolution, detailed fur texture, shallow depth of field, professional photography"`,
        },
        {
          role: 'user',
          content: prompt.trim(),
        },
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    console.log('[Magic Enhance] Enhanced prompt:', text.substring(0, 100));

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        original: prompt,
        enhanced: text.trim(),
      },
    });

  } catch (error: any) {
    console.error('[Magic Enhance] Error:', error.message || error);
    return NextResponse.json(
      { 
        error: 'Failed to enhance prompt',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
