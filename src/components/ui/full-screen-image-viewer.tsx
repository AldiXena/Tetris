'use client';

import Image from 'next/image';
import { X } from 'lucide-react';

type FullScreenImageViewerProps = {
  imageUrl: string;
  onClose: () => void;
};

export function FullScreenImageViewer({ imageUrl, onClose }: FullScreenImageViewerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative w-full h-full max-w-screen-lg max-h-screen p-4">
        <div className="bg-gray-800 border-4 border-black rounded-lg p-2 w-full h-full flex items-center justify-center">
            <Image
              src={imageUrl}
              alt="Full screen image"
              layout="fill"
              objectFit="contain"
              className="rounded"
            />
        </div>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white bg-black bg-opacity-50 rounded-full p-2"
        >
          <X className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
