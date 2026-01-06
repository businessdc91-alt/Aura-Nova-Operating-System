/**
 * SECURE GEMINI API ROUTE
 * Server-side only - keeps admin API key secret
 * This proxies requests to Gemini API without exposing the key to clients
 */

import { NextRequest, NextResponse } from 'next/server';

// Admin API key - SERVER SIDE ONLY (never exposed to browser)
const ADMIN_GEMINI_KEY = process.env.GEMINI_API_KEY; // Without NEXT_PUBLIC_ prefix

export async function POST(request: NextRequest) {
  try {
    if (!ADMIN_GEMINI_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, temperature = 0.7, maxTokens = 2048 } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Call Gemini API with admin key (server-side only)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${ADMIN_GEMINI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || 'Gemini API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract response text
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({
      content,
      model: 'gemini-2.0-flash-exp',
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
    });
  } catch (error: any) {
    console.error('[Gemini API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
