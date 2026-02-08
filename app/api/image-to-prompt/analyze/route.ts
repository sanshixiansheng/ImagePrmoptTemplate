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
    const { imageUrl, mode } = await request.json();
    
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate mode
    const validModes = ['describe', 'prompt', 'detailed'];
    const analysisMode = validModes.includes(mode) ? mode : 'prompt';

    // Check API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[Image-to-Prompt] OPENROUTER_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    console.log('[Image-to-Prompt] Analyzing image:', imageUrl.substring(0, 80));
    console.log('[Image-to-Prompt] Mode:', analysisMode);

    // Initialize OpenRouter
    const openrouter = new OpenRouter({
      apiKey: apiKey,
    });

    // Prepare system prompt based on mode
    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisMode) {
      case 'describe':
        systemPrompt = `You are an expert at analyzing and describing images in detail. Provide a comprehensive visual description of what you see in the image.

Include:
- Main subjects and objects
- Colors and lighting
- Composition and layout
- Style and mood
- Background and environment
- Any notable details

Be specific and descriptive.`;
        userPrompt = 'Please describe this image in detail:';
        break;

      case 'prompt':
        systemPrompt = `You are an expert at reverse-engineering image generation prompts. Your task is to analyze an image and generate a concise, high-quality text prompt that could recreate a similar image.

Guidelines:
1. Focus on key visual elements (subject, style, lighting, composition)
2. Use technical terms (photorealistic, 4K, detailed texture)
3. Include artistic style (digital art, oil painting, cinematic)
4. Mention mood and atmosphere
5. Keep it under 100 words
6. Output ONLY the prompt, no explanations

Example output:
"A majestic orange tabby cat with green eyes, sitting on a weathered stone wall, golden hour lighting, photorealistic, 4K resolution, detailed fur texture, shallow depth of field"`;
        userPrompt = 'Generate an image generation prompt based on this image:';
        break;

      case 'detailed':
        systemPrompt = `You are an expert at creating detailed image generation prompts. Analyze this image and generate a comprehensive, detailed prompt that captures every important visual aspect.

Include:
1. Subject description (detailed physical features)
2. Composition and framing
3. Lighting (type, direction, quality, color temperature)
4. Style and artistic approach
5. Technical specifications (quality, resolution)
6. Mood and atmosphere
7. Background and environment
8. Color palette and tone
9. Camera perspective and depth of field
10. Any special effects or textures

Make the prompt detailed enough to recreate the image accurately.`;
        userPrompt = 'Generate a comprehensive, detailed image generation prompt for this image:';
        break;
    }

    // Call Gemini 2.5 Flash with image
    const { text } = await generateText({
      model: openrouter.chat('google/gemini-2.5-flash'),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image',
              image: imageUrl.trim(),
            },
          ],
        },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    console.log('[Image-to-Prompt] Result:', text.substring(0, 100));

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        imageUrl: imageUrl,
        mode: analysisMode,
        result: text.trim(),
      },
    });

  } catch (error: any) {
    console.error('[Image-to-Prompt] Error:', error.message || error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
