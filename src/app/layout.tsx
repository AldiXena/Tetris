import type {Metadata} from 'next';
import './globals.css';
import { GameConsole } from '@/components/game-console';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'HEYTML-BOY',
  description: 'A special birthday gift',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-gray-900 flex items-center justify-center min-h-screen p-2 sm:p-4">
        <GameConsole>
          {children}
        </GameConsole>
        <Toaster />
      </body>
    </html>
  );
}
