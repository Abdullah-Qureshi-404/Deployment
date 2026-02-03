'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ← Correct import for App Router
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('auth_token');

    if (token) {
      router.replace('/dashboard'); // Logged-in → dashboard
    } else {
      router.replace('/login'); // Not logged in → login
    }
  }, [router]);

  return null; // Nothing rendered while redirecting
}