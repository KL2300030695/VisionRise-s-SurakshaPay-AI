import { NextResponse } from 'next/server';

export async function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not Found',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Present' : 'Missing',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Present' : 'Missing',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Present' : 'Missing',
  };

  const mongodbStatus = process.env.MONGODB_URI ? 'Present' : 'Missing';
  const geminiStatus = process.env.GEMINI_API_KEY ? 'Present' : 'Missing';

  const isConfigComplete = 
    firebaseConfig.apiKey === 'Present' && 
    firebaseConfig.projectId !== 'Not Found';

  return NextResponse.json({
    status: isConfigComplete ? 'SUCCESS' : 'INCOMPLETE_CONFIG',
    message: isConfigComplete 
      ? 'All essential Firebase variables are loaded on the server.' 
      : 'Some environment variables are missing on the server.',
    diagnostics: {
      firebase: firebaseConfig,
      mongodb: mongodbStatus,
      gemini: geminiStatus,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    action_required: isConfigComplete 
      ? 'If buffering still occurs, check Firestore Rules or Vercel Function Timeouts.' 
      : 'Please add the missing variables to your Vercel Project Settings and trigger a NEW deployment.'
  });
}
