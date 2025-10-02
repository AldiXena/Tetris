
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const musicDirectory = path.join(process.cwd(), 'public', 'music');
  try {
    const filenames = fs.readdirSync(musicDirectory);
    const mp3Files = filenames
      .filter(file => file.endsWith('.mp3'))
      .map(file => ({
        title: file.replace('.mp3', '').replace(/_/g, ' '),
        artist: 'Unknown Artist', // You might want to parse this from the filename or use a library
        url: `/music/${file}`,
      }));
    return NextResponse.json(mp3Files);
  } catch (error) {
    console.error('Could not read music directory:', error);
    return NextResponse.json([], { status: 500 });
  }
}
