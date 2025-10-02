'use client';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

const messages = ['> READY!', '> SMILE!', '> LOADING ASSETS...', '> HAPPY BIRTHDAY!'];

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    const messageInterval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <div className="flex-grow flex flex-col items-center justify-center gap-4 animate-pulse">
        <h2 className="text-3xl font-bold">HEYTML-BOY</h2>
        <Progress value={progress} className="w-4/5 h-6 bg-gray-700 border-2 border-primary" />
        <p className="text-lg mt-2">{message}</p>
      </div>
      <p className="text-xs text-muted-foreground self-end">© 2024 HEYTML-BOY Inc.</p>
    </div>
  );
}
