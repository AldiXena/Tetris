import Link from 'next/link';

const menuItems = [
  { label: 'MESSAGE', href: '/message', color: 'bg-btn-purple' },
  { label: 'GALLERY', href: '/gallery', color: 'bg-btn-red' },
  { label: 'MUSIC', href: '/music', color: 'bg-btn-blue' },
  { label: 'TETRIS', href: '/tetris', color: 'bg-btn-yellow' },
];

export function MainMenu() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <div className="flex-grow flex flex-col items-center justify-center gap-4">
        <p className="text-2xl mb-4 p-2 border-2 border-dashed border-primary/50">
          Happy Birthday!
          <br />
          Tekan Start
        </p>
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`w-28 h-16 flex items-center justify-center text-black font-bold text-base ${item.color} rounded-md border-2 border-black shadow-md hover:scale-105 transition-transform`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="text-center text-xs text-primary/70">
        <p>SELECT: OPTIONS</p>
        <p>START: BEGIN</p>
      </div>
    </div>
  );
}
