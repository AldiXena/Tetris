'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Power, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { MusicPlayer } from '@/components/MusicPlayer';

const dispatchGameInput = (action: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('game-input', { detail: { action } }));
  }
};

export function GameConsole({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isMusicPage = pathname === '/music';
  const isTetrisPage = pathname === '/tetris';
  const isHomePage = pathname === '/';

  const dPadUpAction = isTetrisPage ? 'hardDrop' : 'noop';
  const dPadDownAction = isTetrisPage ? 'drop' : 'noop';
  const dPadLeftAction = isTetrisPage ? 'moveLeft' : 'noop';
  const dPadRightAction = isTetrisPage ? 'moveRight' : 'noop';
  const aButtonAction = isTetrisPage ? 'rotate' : 'noop';
  const bButtonAction = isTetrisPage ? 'rotate' : 'noop';

  const MainScreenContent = () => {
    if (isMusicPage) {
      return <MusicPlayer />;
    }
    return children;
  };
  
  const pageClass = isClient ? (pathname.split('/').filter(Boolean).pop() || 'home') : '';

  return (
    <div data-page={pageClass} className="game-console-container relative w-full max-w-sm bg-[#1a1a1a] rounded-2xl border-4 border-black shadow-2xl p-4 sm:p-6 flex flex-col font-headline">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[0.6rem] text-gray-500">DOT MATRIX WITH STEREO SOUND</div>
        <div className="flex items-center gap-1 text-red-500">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs">BATTERY</span>
        </div>
      </div>
      
      <div className="screen-wrapper relative bg-gray-800 rounded-lg p-1 border-2 border-black">
        <div className="dot-matrix-screen text-primary border-4 border-gray-700 rounded overflow-hidden flex flex-col">
           {isClient ? <MainScreenContent /> : <div className="w-full h-full bg-background" />}
        </div>
      </div>

      <div className="controls-wrapper">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-blue-400 tracking-wider" style={{ textShadow: '2px 2px #000' }}>FROM-UR-BOY</h1>
        </div>
        
        <div className="grid grid-cols-2 items-center gap-4 h-28">
          {/* D-Pad */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full"></div>
            <button onMouseDown={() => dispatchGameInput(dPadUpAction)} className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-900 rounded-md border-2 border-black focus:bg-gray-700 flex items-center justify-center">
              <ArrowUp className="w-6 h-6 text-gray-400" />
            </button>
            <button onMouseDown={() => dispatchGameInput(dPadDownAction)} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-900 rounded-md border-2 border-black focus:bg-gray-700 flex items-center justify-center">
              <ArrowDown className="w-6 h-6 text-gray-400" />
            </button>
            <button onMouseDown={() => dispatchGameInput(dPadLeftAction)} className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-900 rounded-md border-2 border-black focus:bg-gray-700 flex items-center justify-center">
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
            <button onMouseDown={() => dispatchGameInput(dPadRightAction)} className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-900 rounded-md border-2 border-black focus:bg-gray-700 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          
          {/* A and B Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button onMouseDown={() => dispatchGameInput(bButtonAction)} className="flex items-center justify-center w-14 h-14 bg-btn-red rounded-full border-2 border-black transform -rotate-12 shadow-inner focus:bg-red-400">
              <span className="font-bold text-xl text-black">B</span>
            </button>
            <button onMouseDown={() => dispatchGameInput(aButtonAction)} className="flex items-center justify-center w-14 h-14 bg-btn-blue rounded-full border-2 border-black transform -rotate-12 mt-4 shadow-inner focus:bg-blue-300">
              <span className="font-bold text-xl text-black">A</span>
            </button>
          </div>
        </div>

        {/* Start/Select and Power */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <div className="flex flex-col items-center">
              <button className="w-16 h-6 bg-gray-700 rounded-full border-2 border-black"></button>
              <span className="text-xs text-gray-400 mt-1">SELECT</span>
          </div>

          {isHomePage ? (
            <Link href="/message" className="flex flex-col items-center">
                <button className="w-16 h-6 bg-gray-700 rounded-full border-2 border-black"></button>
                <span className="text-xs text-gray-400 mt-1">START</span>
            </Link>
          ) : (
            <div className="flex flex-col items-center opacity-50">
                <button disabled className="w-16 h-6 bg-gray-700 rounded-full border-2 border-black"></button>
                <span className="text-xs text-gray-400 mt-1">START</span>
            </div>
          )}

          <Link href="/" className="ml-4">
            <Power className="w-8 h-8 text-yellow-400 hover:text-yellow-200 transition-colors"/>
            <span className="sr-only">Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
