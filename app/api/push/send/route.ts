import webpush from 'web-push';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

webpush.setVapidDetails(
  'mailto:mahendramourya881@gmail.com', // Aapka email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  try {
    const { title, message, url, secret } = await request.json();

    // Security Check: Taaki koi aur notification na bhej sake
    if (secret !== process.env.ADMIN_PUSH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Saare subscribed users ko fetch karo
    const { data: subs } = await supabase.from('push_subscriptions').select('subscription_json');

    if (!subs || subs.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 404 });
    }

    // Sabko message bhejo
    const notifications = subs.map((s: any) => 
      webpush.sendNotification(s.subscription_json, JSON.stringify({ 
        title, 
        body: message, 
        url 
      })).catch(e => console.error('Error sending to sub:', e))
    );

    await Promise.all(notifications);

    return NextResponse.json({ success: true, count: subs.length });
  } catch (error) {
    console.error('Push Send Error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
