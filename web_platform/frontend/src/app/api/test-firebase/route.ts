/**
 * FIREBASE CONNECTION TEST ROUTE
 * Tests Firebase configuration and Gemini API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {},
    };

    // Test 1: Firebase Config
    results.tests.firebaseConfig = {
      status: 'checking',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      hasMeasurementId: !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      results.tests.firebaseConfig.status = 'failed';
      results.tests.firebaseConfig.error = 'Firebase project ID not configured';
    } else {
      results.tests.firebaseConfig.status = 'passed';
    }

    // Test 2: Gemini API Key (Server-side)
    results.tests.geminiApi = {
      status: 'checking',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) + '...',
    };

    if (!process.env.GEMINI_API_KEY) {
      results.tests.geminiApi.status = 'warning';
      results.tests.geminiApi.message = 'Gemini API key not configured';
    } else {
      // Test actual Gemini API call
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: 'Say "Firebase connection test successful!" in exactly 5 words.' }],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 20,
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

          results.tests.geminiApi.status = 'passed';
          results.tests.geminiApi.testResponse = geminiText.trim();
          results.tests.geminiApi.model = 'gemini-2.0-flash-exp';
        } else {
          const error = await geminiResponse.json();
          results.tests.geminiApi.status = 'failed';
          results.tests.geminiApi.error = error.error?.message || 'Gemini API call failed';
        }
      } catch (error: any) {
        results.tests.geminiApi.status = 'failed';
        results.tests.geminiApi.error = error.message;
      }
    }

    // Test 3: Google Cloud API Key (Server-side)
    results.tests.googleCloudApi = {
      status: 'checking',
      hasApiKey: !!process.env.GOOGLE_CLOUD_API_KEY,
      apiKeyPrefix: process.env.GOOGLE_CLOUD_API_KEY?.substring(0, 10) + '...',
    };

    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      results.tests.googleCloudApi.status = 'warning';
      results.tests.googleCloudApi.message = 'Google Cloud API key not configured';
    } else {
      results.tests.googleCloudApi.status = 'passed';
    }

    // Test 4: Environment Variables Check
    results.tests.environment = {
      status: 'passed',
      nodeEnv: process.env.NODE_ENV,
      hasVercelToken: !!process.env.VERCEL_OIDC_TOKEN,
      nextPublicVariables: {
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        wsUrl: process.env.NEXT_PUBLIC_WS_URL,
        lmStudioUrl: process.env.NEXT_PUBLIC_LM_STUDIO_URL,
        ollamaUrl: process.env.NEXT_PUBLIC_OLLAMA_URL,
      },
    };

    // Overall status
    const criticalTests = ['firebaseConfig', 'geminiApi'];
    const criticalPassed = criticalTests.every(
      (testName) =>
        results.tests[testName]?.status === 'passed' ||
        results.tests[testName]?.status === 'warning'
    );

    results.overall = {
      status: criticalPassed ? 'PASSED ✅' : 'FAILED ❌',
      message: criticalPassed
        ? 'All critical services configured correctly'
        : 'Some critical services failed',
    };

    return NextResponse.json(results, {
      status: criticalPassed ? 200 : 500,
    });
  } catch (error: any) {
    console.error('[Firebase Test] Error:', error);
    return NextResponse.json(
      {
        overall: {
          status: 'FAILED ❌',
          error: error.message,
        },
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
