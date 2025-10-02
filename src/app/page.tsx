'use client';

import { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { MainMenu } from '@/components/main-menu';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000); // Simulate a 4-second boot-up

    return () => clearTimeout(timer);
  }, []);

  return loading ? <LoadingScreen /> : <MainMenu />;
}
