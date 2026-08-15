import { NextResponse } from 'next/server';

export async function GET() {
  const adsTxtContent =
    'google.com, pub-6527944927674692, DIRECT, f08c47fec0942fa0\n' +
    'google.com, pub-1407067486587423, DIRECT, f08c47fec0942fa0\n' +
    'google.com, pub-4887645307853264, DIRECT, f08c47fec0942fa0\n' +
    'google.com, pub-7355910906052882, DIRECT, f08c47fec0942fa0';

  return new NextResponse(adsTxtContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
