'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const fullMessage = "Hei, selamat ulang tahun! 🎉 Sayang ku Azzahra Salsabillah Rizna, Di harimu yang spesial ini dan dengan bertambahnya umurmu, semoga sehat selalu, panjang umur, rezekinya lancar, langkahnya dimudahin, dan selalu di datangi hal hal yang baik, dan semoga semua mimpi yang kamu kejar pelan-pelan jadi nyata, jangan pernah nyerah dengan apa yang telah kamu mulai, tetap semangat, dan jangan lupa bersyukur dengan segala hal yang telah datang kepadamu, ntah itu baik maupun buruk, kalau baik alhamdulillah kalau buruk yaaa perbanyak aja sabar lagi, hahahahahahahaha, dan aku mau bilang terimakasih atas semua  perjuangan suka maupun duka yang telah kita lalui bersama sama, aku bersyukur kamu telah hadir dalam hidupku dan aku berharap dengan hadirnya aku dalam hidupmu dapat banyak membawa kebaikan untukmu, dan aku juga ingin menjadi bagian dari cerita hidupmu untuk selamanya, sekali lagi terima kasih sayangku,  You are not just my love, you are my safe place, my reason, and my forever  I LOVE YOU ❤️";

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
