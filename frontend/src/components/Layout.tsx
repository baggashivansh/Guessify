import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-0 z-50 border-b border-surface-border/60 bg-white/85 backdrop-blur-xl"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 group min-w-0 flex-1">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-white border border-surface-border shadow-sm flex items-center justify-center overflow-hidden p-1">
              <img
                src="/icons/logo-mark.png"
                alt="Guessify"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="font-display font-bold text-base sm:text-lg tracking-tight text-ink group-hover:text-accent transition-colors">
                <span className="truncate">Guessify</span>
                <span className="text-ink-faint font-semibold mx-1.5 hidden sm:inline">·</span>
                <span className="text-ink-muted font-medium text-sm sm:text-base hidden sm:inline">
                  Guess the Number
                </span>
              </div>
              <div className="text-[11px] text-ink-faint font-medium sm:hidden">Guess the Number</div>
            </div>
          </Link>

          <Link
            to="/"
            className="shrink-0 text-sm font-semibold text-accent hover:text-accent-dark bg-accent-soft hover:bg-accent/15 px-4 py-2 rounded-xl transition-colors"
          >
            New Game
          </Link>
        </div>
      </motion.header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      {showFooter && (
        <footer className="py-5 mt-auto">
          <div className="max-w-5xl mx-auto px-4 text-center text-xs text-ink-faint/45">
            Built by <span className="text-ink-faint/60">Shivansh Bagga</span>
          </div>
        </footer>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center mb-8"
    >
      <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">{title}</h1>
      {subtitle && <p className="text-ink-muted text-lg">{subtitle}</p>}
    </motion.div>
  );
}
