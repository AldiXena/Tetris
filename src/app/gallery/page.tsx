'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';

const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-'));

export default function GalleryPage() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [printed, setPrinted] = useState(false);

  const startPrinting = () => {
    setIsPrinting(true);
    setProgress(0);
    setPrinted(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPrinting(false);
          setPrinted(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="w-full h-full flex flex-col text-center">
      <h2 className="text-2xl font-bold mb-4 border-b-2 pb-2">PHOTOBOOTH</h2>
      
      {!isPrinting && !printed && (
        <div className="flex-grow flex flex-col items-center justify-center">
          <Button onClick={startPrinting} className="bg-btn-blue text-black text-xl h-16 px-8 animate-pulse">
            MULAI CETAK
          </Button>
        </div>
      )}

      {isPrinting && (
        <div className="flex-grow flex flex-col items-center justify-center">
          <p className="text-lg mb-4">PRINTING MEMORIES...</p>
          <Progress value={progress} className="w-4/5 h-4 bg-gray-700 border-2 border-primary" />
        </div>
      )}

      {printed && (
        <div className="flex-grow overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4 p-1">
            {galleryImages.map((image, index) => (
              <div key={image.id} className="bg-gray-100 p-1 pb-4 rounded-sm shadow-md relative">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  width={200}
                  height={200}
                  data-ai-hint={image.imageHint}
                  className="w-full h-auto aspect-square object-cover"
                />
                <p className="absolute bottom-1 left-2 text-black font-bold text-xs">#{index + 1} // {new Date().getFullYear()}</p>
              </div>
            ))}
          </div>

          <div className="p-1">
            <p className="text-lg font-bold my-2">CLIP DUMP</p>
            <div className="bg-gray-800 p-1 rounded-sm shadow-md">
                <video controls className="w-full h-auto rounded-sm">
                  <source src="/videos/memories.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
            </div>
          </div>
        </div>
      )}
       <div className="flex justify-between items-center mt-4 px-1">
          <Link href="/">
            <Button variant="destructive" className="bg-btn-red text-black">BACK</Button>
          </Link>
          <div className="flex gap-2">
            {(isPrinting || printed) && <Button onClick={() => { setIsPrinting(false); setPrinted(false); }} className="bg-btn-yellow text-black">RESTART</Button>}
            {printed && (
              <Link href="/music">
                <Button className="bg-btn-blue text-black">SELANJUTNYA</Button>
              </Link>
            )}
          </div>
      </div>
    </div>
  );
}
