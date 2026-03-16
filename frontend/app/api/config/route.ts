import { NextResponse } from 'next/server';

// Force dynamic so Next.js reads env vars at runtime, not at build time
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  });
}
