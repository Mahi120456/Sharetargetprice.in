import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Use server-side client (anon key works for insert with proper RLS)
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { subscription, browser, platform, location_city } = await request.json();

    // Validate required fields
    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    const supabase = db();

    // Check if subscription already exists (optional: update last_used)
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .single();

    if (existing) {
      // Update existing subscription (reactivate if inactive)
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({
          keys_p256dh: subscription.keys.p256dh,
          keys_auth: subscription.keys.auth,
          browser: browser || null,
          platform: platform || null,
          location_city: location_city || null,
          is_active: true,
          last_used: new Date().toISOString(),
        })
        .eq('endpoint', subscription.endpoint);

      if (updateError) throw updateError;
      return NextResponse.json({ success: true, updated: true });
    }

    // Insert new subscription
    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .insert({
        endpoint: subscription.endpoint,
        keys_p256dh: subscription.keys.p256dh,
        keys_auth: subscription.keys.auth,
        browser: browser || null,
        platform: platform || null,
        location_city: location_city || null,
        is_active: true,
        subscribed_at: new Date().toISOString(),
        last_used: new Date().toISOString(),
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, updated: false });
  } catch (error: any) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
