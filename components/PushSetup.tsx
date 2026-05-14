'use client';
import { useState, useEffect } from 'react';

export default function PushSetup() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('Service Worker Registered');
      });
    }
    // Check existing subscription
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Please allow notifications to get stock updates.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error('VAPID public key missing');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert('Notifications enabled!');
      } else {
        throw new Error('Subscription failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        setIsSubscribed(false);
        alert('Notifications disabled.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isSubscribed ? (
        <button
          onClick={subscribe}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full shadow-lg transition text-sm font-medium"
        >
          {loading ? '...' : '🔔 Get Stock Updates'}
        </button>
      ) : (
        <button
          onClick={unsubscribe}
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-full shadow-lg transition text-xs"
          title="Disable notifications"
        >
          🔕
        </button>
      )}
    </div>
  );
}
