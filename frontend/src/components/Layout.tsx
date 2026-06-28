import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogoMark } from './LogoMark';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/70">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="Guessify home"
          >
            <LogoMark className="h-7 w-7 transition-transform duration-300 group-hover:scale-[1.03]" />
            <span className="font-display font-semibold text-[17px] tracking-[-0.02em] text-ink group-hover:text-accent transition-colors duration-300">
              Guessify
            </span>
          </Link>
        </div>
        <div className="h-px bg-black/[0.06]" />
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      {showFooter && (
        <footer className="py-4 mt-auto pointer-events-none select-none">
          <div className="max-w-5xl mx-auto px-4 text-center text-[10px] text-ink-faint/25">
            Built by Shivansh Bagga
          </div>
        </footer>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center mb-8"
    >
      <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2 tracking-tight">{title}</h1>
      {subtitle && <p className="text-ink-muted text-lg">{subtitle}</p>}
    </motion.div>
  );
}
