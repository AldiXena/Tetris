'use client';

import { useState, useEffect, type ReactNode, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Power, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';

const dispatchGameInput = (action: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('game-input', { detail: { action } }));
  }
};

type Track = {
  title: string;
  artist: string;
  url: string;
};

function MusicPlayerControls({ onPlayPause, onNext, onPrev, isPlaying, playlistEmpty }: { onPlayPause: () => void, onNext: () => void, onPrev: () => void, isPlaying: boolean, playlistEmpty: boolean }) {
  return (
    <div className="flex justify-center items-center gap-6">
      <Button variant="ghost" size="icon" onClick={onPrev} disabled={playlistEmpty}><SkipBack className="w-8 h-8" /></Button>
      <Button variant="ghost" size="icon" onClick={onPlayPause} disabled={playlistEmpty}>
        {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={onNext} disabled={playlistEmpty}><SkipForward className="w-8 h-8" /></Button>
    </div>
  );
}

function MusicPlaylist({ playlist, currentTrackIndex, onTrackSelect }: { playlist: Track[], currentTrackIndex: number, onTrackSelect: (index: number) => void }) {
  return (
    <div className="h-full overflow-y-auto py-1 text-left">
      {playlist.length > 0 ? playlist.map((track, index) => (
        <button
          key={index}
          onClick={() => onTrackSelect(index)}
          className={`w-full text-left p-1 rounded-sm text-sm ${index === currentTrackIndex ? 'bg-primary/20' : 'hover:bg-primary/10'}`}
        >
          <span className="font-bold">{index + 1}.</span> {track.title}
        </button>
      )) : (
        <div className="text-center text-primary/70 pt-8">
            <p>No music found.</p>
            <p className='text-xs'>Add MP3 files to /public/music</p>
        </div>
      )}
    </div>
  );
}

export function GameConsole({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isMusicPage = pathname === '/music';
  const isTetrisPage = pathname === '/tetris';
  const isHomePage = pathname === '/';

  // Music Player State
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isFetchingMusic, setIsFetchingMusic] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dPadUpAction = isTetrisPage ? 'hardDrop' : 'noop';
  const dPadDownAction = isTetrisPage ? 'drop' : 'noop';
  const dPadLeftAction = isTetrisPage ? 'moveLeft' : 'noop';
  const dPadRightAction = isTetrisPage ? 'moveRight' : 'noop';
  const aButtonAction = isTetrisPage ? 'rotate' : 'noop';
  const bButtonAction = isTetrisPage ? 'rotate' : 'noop';

  useEffect(() => {
    const fetchPlaylist = async () => {
      setIsFetchingMusic(true);
      try {
        const response = await fetch('/api/music');
        const data = await response.json();
        if (data.length > 0) {
          setPlaylist(data);
        }
      } catch (error) {
        console.error("Failed to fetch playlist:", error);
        setPlaylist([]);
      }
      setIsFetchingMusic(false);
    };

    if (isMusicPage) {
        fetchPlaylist();
    }
  }, [isMusicPage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
    }
     const handleAudioEnded = () => handleNextTrack();
    
    const currentAudioRef = audioRef.current;
    currentAudioRef?.addEventListener('ended', handleAudioEnded);

    return () => {
      currentAudioRef?.removeEventListener('ended', handleAudioEnded);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const currentAudio = audioRef.current;
    if (currentAudio) {
      if (isPlaying && playlist.length > 0) {
        currentAudio.play().catch(e => console.error("Audio play failed:", e));
      } else {
        currentAudio.pause();
      }
    }
  }, [isPlaying, playlist.length]);

  useEffect(() => {
    const currentAudio = audioRef.current;
    if (currentAudio && playlist.length > 0) {
      const currentTrack = playlist[currentTrackIndex];
       if (currentTrack && currentAudio.src !== new URL(currentTrack.url, window.location.origin).href) {
        currentAudio.src = currentTrack.url;
        if (isPlaying) {
            currentAudio.play().catch(e => console.error("Audio play failed on new track:", e));
        }
      }
    } else if (currentAudio && playlist.length === 0) {
        currentAudio.pause();
        currentAudio.src = '';
    }
  }, [currentTrackIndex, playlist, isPlaying]);

  const handlePlayPause = () => {
    if (playlist.length > 0) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextTrack = () => {
    if (playlist.length > 0) {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
      setIsPlaying(true);
    }
  };

  const handlePrevTrack = () => {
     if (playlist.length > 0) {
      setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
      setIsPlaying(true);
    }
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }
  
  const currentTrack = playlist[currentTrackIndex] || { title: "No music loaded", artist: "" };

  const MusicPageContent = () => (
    <div className="flex flex-col h-full text-center">
      <h2 className="text-2xl font-bold border-b-2 pb-2 mb-1 p-1">MUSIC PLAYER</h2>
      <div className="flex-grow flex flex-col justify-between p-1">
        <div className="flex-grow h-32 overflow-y-auto">
          {isFetchingMusic ? (
             <Loader2 className="w-8 h-8 animate-spin mx-auto my-12" />
          ) : (
            <MusicPlaylist playlist={playlist} currentTrackIndex={currentTrackIndex} onTrackSelect={handleTrackSelect} />
          )}
        </div>
        <div className='flex flex-col gap-2 mt-2'>
            <div className='min-h-[40px]'>
                <p className="text-base font-bold truncate">{currentTrack.title}</p>
                <p className="text-xs text-primary/80">{currentTrack.artist}</p>
            </div>
            <MusicPlayerControls
                onPlayPause={handlePlayPause}
                onNext={handleNextTrack}
                onPrev={handlePrevTrack}
                isPlaying={isPlaying}
                playlistEmpty={playlist.length === 0}
            />
        </div>
      </div>
      <div className="flex justify-between items-center mt-2 px-1">
        <Link href="/gallery">
          <Button variant="destructive" className="bg-btn-red text-black">BACK</Button>
        </Link>
        <Link href="/tetris">
          <Button className="bg-btn-blue text-black">SELANJUTNYA</Button>
        </Link>
      </div>
    </div>
  );
  
  const MainScreenContent = () => {
    if (isMusicPage) {
      return <MusicPageContent />;
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
          <h1 className="text-3xl font-bold text-blue-400 tracking-wider" style={{ textShadow: '2px 2px #000' }}>HEYTML-BOY</h1>
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
