import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { OpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

export const runtime = 'edge';

// Language mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  zh: 'Chinese (Simplified)',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ar: 'Arabic',
  hi: 'Hindi',
};

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
    const { prompt, targetLanguage } = await request.json();
    
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[Prompt Translate] OPENROUTER_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    console.log('[Prompt Translate] Translating to:', targetLangName);

    // Initialize OpenRouter
    const openrouter = new OpenRouter({
      apiKey: apiKey,
    });

    // Call Gemini 2.5 Flash for translation
    const { text } = await generateText({
      model: openrouter.chat('google/gemini-2.5-flash'),
      messages: [
        {
          role: 'system',
          content: `You are an expert translator specializing in image generation prompts. Your task is to translate prompts while preserving their technical quality and visual description accuracy.

Guidelines:
1. Translate all descriptive elements accurately
2. Keep technical terms in their commonly used form (e.g., "4K", "photorealistic" may stay in English if that's standard)
3. Maintain the prompt's structure and flow
4. Preserve the visual intent and details
5. Output ONLY the translated prompt, no explanations

Example:
Input (English): "A majestic cat sitting on a stone wall at sunset, photorealistic, 4K"
Output (Chinese): "一只威严的猫坐在日落时分的石墙上,照片级真实感,4K分辨率"`,
        },
        {
          role: 'user',
          content: `Please translate the following image generation prompt to ${targetLangName}:

${prompt.trim()}`,
        },
      ],
      temperature: 0.5,
      maxTokens: 500,
    });

    console.log('[Prompt Translate] Translated prompt:', text.substring(0, 100));

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        original: prompt,
        targetLanguage: targetLanguage,
        translated: text.trim(),
      },
    });

  } catch (error: any) {
    console.error('[Prompt Translate] Error:', error.message || error);
    return NextResponse.json(
      { 
        error: 'Failed to translate prompt',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
