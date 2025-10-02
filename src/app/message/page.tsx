'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const fullMessage = "Hey, happy birthday! I hope you have a day that's as amazing as you are. Remember all the good times we've had? From late-night talks to silly adventures, every moment with you is special. This little retro gift is just a small way to say how much you mean to me. I've packed it with some of our memories and favorite things. I can't wait to make many more memories with you. Cheers to another year of being awesome. I love you! <3";

export default function MessagePage() {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isDone, setIsDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let charIndex = 0;
    const intervalId = setInterval(() => {
      setDisplayedMessage(fullMessage.slice(0, charIndex + 1));
      charIndex++;
      if (charIndex > fullMessage.length) {
        clearInterval(intervalId);
        setIsDone(true);
      }
    }, 50); // Typing speed

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedMessage]);

  return (
    <div className="w-full h-full flex flex-col p-2">
      <h2 className="text-2xl font-bold text-center mb-4 border-b-2 pb-2">A MESSAGE FOR YOU</h2>
      <div ref={scrollRef} className="flex-grow text-lg leading-relaxed whitespace-pre-wrap overflow-y-auto">
        <p>{displayedMessage}{!isDone && <span className="animate-ping">_</span>}</p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <Link href="/">
          <Button variant="destructive" className="bg-btn-red text-black">KEMBALI</Button>
        </Link>
        {isDone && (
          <Link href="/gallery">
            <Button className="bg-btn-blue text-black">SELANJUTNYA</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
