import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isMuted, toggleMute } from '../utils/sound';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  const [muted, setMuted] = useState(isMuted());

  return (
    <div className="min-h-screen flex flex-col">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-0 z-50 border-b border-surface-border bg-white/90 backdrop-blur-xl"
      >
        <div className="max-w-5xl mx-auto px-4 h-[4.5rem] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            <motion.img
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              src="/icons/logo-mark.png"
              alt="Guessify"
              className="h-11 w-11 rounded-xl object-cover shadow-sm border border-surface-border shrink-0"
            />
            <div className="min-w-0 leading-tight">
              <div className="font-display font-bold text-lg sm:text-xl tracking-tight text-ink group-hover:text-accent transition-colors truncate">
                Guessify{' '}
                <span className="text-ink-faint font-semibold hidden sm:inline">|</span>{' '}
                <span className="text-ink-muted font-medium text-base sm:text-lg hidden sm:inline">
                  Guess the Number
                </span>
              </div>
              <div className="text-[11px] text-ink-faint font-medium sm:hidden truncate">
                Guess the Number
              </div>
            </div>
          </Link>
          <button
            onClick={() => setMuted(toggleMute())}
            className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors shrink-0"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </motion.header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">{children}</main>

      {showFooter && (
        <footer className="border-t border-surface-border bg-white/50 py-6 mt-auto">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-ink-faint">
            Built by <span className="text-ink font-medium">Shivansh Bagga</span>
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
      className="text-center mb-8"
    >
      <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">{title}</h1>
      {subtitle && <p className="text-ink-muted text-lg">{subtitle}</p>}
    </motion.div>
  );
}
