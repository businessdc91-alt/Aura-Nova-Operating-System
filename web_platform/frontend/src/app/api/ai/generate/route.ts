/**
 * POST /api/ai/generate
 * Main entry point for AI code generation requests
 * Routes to Gemini, Vertex, or Aura based on complexity
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleAIRequest, metricsCollector } from '@/lib/apiMiddleware';

export async function POST(req: NextRequest) {
  try {
    const aiRequest = await req.json();

    // Validate request
    if (!aiRequest.prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    // Process request
    const response = await handleAIRequest(req, aiRequest);
    metricsCollector.recordRequest(response);

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
