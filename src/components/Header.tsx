export default function Header() {
  return (
    <header className="w-full flex items-center justify-center py-12 md:py-16 bg-transparent z-50">
      <div className="flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="Image Armour Logo" className="w-14 h-14 object-contain rounded-2xl drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
        <span className="text-lg tracking-[0.3em] text-white/80 uppercase font-light">Image Armour</span>
      </div>
    </header>
  );
}
