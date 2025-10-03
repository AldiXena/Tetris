'use client';

import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ImageMarquee } from '@/components/ui/image-marquee';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

const MusicPlaylist = memo(function MusicPlaylist({ playlist, currentTrackIndex, onTrackSelect }: { playlist: Track[], currentTrackIndex: number, onTrackSelect: (index: number) => void }) {
  return (
    <div className="h-full overflow-y-auto py-1 text-left">
      {playlist.length > 0 ? playlist.map((track, index) => (
        <button
          key={index}
          onClick={() => onTrackSelect(index)} // Use onMouseDown for consistency
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
});
MusicPlaylist.displayName = 'MusicPlaylist';

export function MusicPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isFetchingMusic, setIsFetchingMusic] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showMusicPopup, setShowMusicPopup] = useState(false);

  const formatTime = useCallback((time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('musicPopupSeen');
    if (!hasSeenPopup) {
      setShowMusicPopup(true);
      sessionStorage.setItem('musicPopupSeen', 'true');
    }
  }, []);

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
    fetchPlaylist();
  }, []);

  const handleNextTrack = useCallback(() => {
    if (playlist.length > 0) {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
      setIsPlaying(true);
    }
  }, [playlist.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
    }
    const handleAudioEnded = () => handleNextTrack();
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const currentAudioRef = audioRef.current;
    currentAudioRef?.addEventListener('ended', handleAudioEnded);
    currentAudioRef?.addEventListener('timeupdate', handleTimeUpdate);
    currentAudioRef?.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      currentAudioRef?.removeEventListener('ended', handleAudioEnded);
      currentAudioRef?.removeEventListener('timeupdate', handleTimeUpdate);
      currentAudioRef?.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [handleNextTrack]);

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

  const handlePlayPause = useCallback(() => {
    if (playlist.length > 0) {
      setIsPlaying(prev => !prev);
    }
  }, [playlist.length]);

  const handlePrevTrack = useCallback(() => {
     if (playlist.length > 0) {
      setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
      setIsPlaying(true);
    }
  }, [playlist.length]);

  const handleTrackSelect = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }, []);
  
  const currentTrack = playlist[currentTrackIndex] || { title: "No music loaded", artist: "" };
  
  const marqueeImages = useMemo(() => 
    PlaceHolderImages.filter(img => img.id.startsWith('gallery-')).slice(0, 6).map(img => img.imageUrl)
  , []);

  return (
    <div className="flex flex-col h-full text-center">
      <AlertDialog open={showMusicPopup} onOpenChange={setShowMusicPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sebuah Pesan Untukmu</AlertDialogTitle>
            <AlertDialogDescription>
              Dengarkan setiap melodi hingga akhir, seperti kita menikmati setiap momen bersama.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Mengerti</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <h2 className="text-2xl font-bold border-b-2 pb-2 mb-1 p-1 flex-shrink-0">MUSIC PLAYER</h2>
      <div className="flex-grow p-1 overflow-y-auto">
        <div className="max-h-32">
          {isFetchingMusic ? (
             <Loader2 className="w-8 h-8 animate-spin mx-auto my-12" />
          ) : (
            <MusicPlaylist playlist={playlist} currentTrackIndex={currentTrackIndex} onTrackSelect={handleTrackSelect} />
          )}
        </div>
        <div className='flex flex-col gap-2 mt-2'>
            <ImageMarquee images={marqueeImages} />
            <div className='min-h-[40px] mt-2'>
                <p className="text-base font-bold truncate">{currentTrack.title}</p>
                <p className="text-xs text-primary/80">{currentTrack.artist}</p>
            </div>
            <div className="w-full">
                <Progress value={(currentTime / duration) * 100 || 0} className="h-2 bg-gray-700" />
                <div className="flex justify-between text-xs mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
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
      <div className="flex justify-between items-center mt-2 px-1 flex-shrink-0">
        <Link href="/gallery">
          <Button variant="destructive" className="bg-btn-red text-black">BACK</Button>
        </Link>
        <Link href="/tetris">
          <Button className="bg-btn-blue text-black">SELANJUTNYA</Button>
        </Link>
      </div>
    </div>
  );
}
