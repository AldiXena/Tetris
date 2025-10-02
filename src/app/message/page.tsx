'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const fullMessage = "Hei, selamat ulang tahun! 🎉 Semoga harimu penuh dengan hal-hal indah, sama seperti dirimu. Aku masih inget semua momen lucu dan gila yang pernah kita lewati bareng dari ngobrol sampai larut malam, ketawa nggak jelas, sampai petualangan kecil yang kadang absurd tapi selalu bikin bahagia. Hadiah kecil ini mungkin sederhana, tapi aku bikin dengan banyak kenangan dan hal-hal yang kita suka. Buatku, setiap waktu bersamamu itu berharga banget, dan aku nggak sabar nambahin lebih banyak cerita seru lagi sama kamu. Jadi, cheers untuk tahun baru dalam hidupmu! Semoga makin banyak tawa, cinta, dan hal-hal indah yang kita jalani bareng. Aku sayang kamu ❤️";

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
