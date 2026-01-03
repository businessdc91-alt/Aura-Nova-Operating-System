/**
 * GET /api/ai/metrics
 * Returns usage metrics and cost tracking
 */

import { NextResponse } from 'next/server';
import { metricsCollector } from '@/lib/apiMiddleware';

export async function GET() {
  const metrics = metricsCollector.getMetrics();

  return NextResponse.json({
    metrics,
    period: 'current-session',
    warnings: [
      metrics.totalCost > 100 ? 'Monthly cost exceeding $100' : null,
      metrics.byModel['vertex-ai']?.cost > metrics.totalCost * 0.8
        ? 'Heavy use of expensive Vertex AI model'
        : null,
    ].filter(Boolean),
  });
}
