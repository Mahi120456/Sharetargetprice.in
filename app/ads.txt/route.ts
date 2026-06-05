import { NextResponse } from 'next/server';

export async function GET() {
  // Your AdSense publisher ID (without 'ca-' prefix)
  const publisherId = '6527944927674692'; // from ca-pub-6527944927674692

  const content = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
