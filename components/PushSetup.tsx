'use client';
import { useEffect } from 'react';

export default function PushSetup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('Service Worker Registered');
      });
    }
  }, []);
  return null;
}
