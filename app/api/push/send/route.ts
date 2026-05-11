import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:admin@sharetargetprice.in', // Your email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Helper to create Supabase client (server-side)
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { title, message, url, secret } = await request.json();

    // Security check
    if (secret !== process.env.ADMIN_PUSH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    // Fetch all active subscriptions
    const supabase = db();
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, keys_p256dh, keys_auth')
      .eq('is_active', true);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No active subscribers found' }, { status: 404 });
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body: message,
      url: url || 'https://sharetargetprice.in',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
    });

    // Send to all subscribers in parallel, with error handling and expired cleanup
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys_p256dh,
              auth: sub.keys_auth,
            },
          };

          await webpush.sendNotification(pushSubscription, payload);
          return { endpoint: sub.endpoint, success: true };
        } catch (err: any) {
          // If subscription is expired (410 Gone), delete it from database
          if (err.statusCode === 410 || (err.message && err.message.includes('expired'))) {
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', sub.id);
            return { endpoint: sub.endpoint, success: false, expired: true };
          }
          return { endpoint: sub.endpoint, success: false, error: err.message };
        }
      })
    );

    const sentCount = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const expiredCount = results.filter(r => r.status === 'fulfilled' && (r.value as any).expired).length;
    const failedCount = results.length - sentCount - expiredCount;

    return NextResponse.json({
      success: true,
      total: subscriptions.length,
      sent: sentCount,
      expired: expiredCount,
      failed: failedCount,
    });
  } catch (error) {
    console.error('Push send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
