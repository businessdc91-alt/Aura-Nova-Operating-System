/**
 * POST /api/sessions/create
 * Creates a new collaborative coding session
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionManager, SessionData } from '@/lib/apiMiddleware';

export async function POST(req: NextRequest) {
  try {
    const { userId, participants } = await req.json();

    if (!userId || !participants) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, participants' },
        { status: 400 }
      );
    }

    const session = sessionManager.createSession(userId, participants);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
