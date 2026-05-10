import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { subscription, browser, platform } = await request.json();

    // Database mein entry insert karna
    const { error } = await supabase.from('push_subscriptions').insert([
      { 
        subscription_json: subscription, 
        browser: browser, 
        platform: platform 
      }
    ]);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
