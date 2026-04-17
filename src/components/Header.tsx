import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-8 py-6 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-[var(--color-brand-primary)] w-7 h-7" />
        <span className="text-xl font-bold tracking-wide text-white">ImageArmour</span>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-brand-muted)]">
        <Link href="/" className="text-[var(--color-brand-primary)] border-b-2 border-[var(--color-brand-primary)] pb-1">Scanner</Link>
        <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
        <Link href="#about" className="hover:text-white transition-colors">About</Link>
      </nav>
      <div>
        <Link href="/docs" className="px-4 py-2 text-sm font-medium text-white border border-[var(--color-brand-border)] rounded-md hover:bg-[var(--color-brand-card)] transition-colors">
          Documentation
        </Link>
      </div>
    </header>
  );
}
