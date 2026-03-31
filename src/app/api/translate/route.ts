import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  try {
    const { text, targetLang, context } = await request.json()

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 })
    }

    const langNames: Record<string, string> = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      nl: 'Dutch',
      ru: 'Russian',
    }

    const langName = langNames[targetLang] || targetLang

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in travel and transport content. Translate the following text to ${langName}. Maintain the same tone, SEO keywords, and formatting. Do not translate brand names like "Titan Transfers". ${context ? `Context: ${context}` : ''}`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    const translation = data.choices?.[0]?.message?.content

    return NextResponse.json({ translation })
  } catch (error) {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
