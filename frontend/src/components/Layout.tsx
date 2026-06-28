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
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-0 z-50 bg-white/72 backdrop-blur-2xl backdrop-saturate-150"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-[3.25rem] flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group min-w-0"
            aria-label="Guessify home"
          >
            <img
              src="/icons/logo-mark.png"
              alt=""
              className="h-8 w-8 shrink-0 object-contain"
              draggable={false}
            />
            <span className="font-display font-semibold text-[1.05rem] tracking-tight text-ink group-hover:text-accent transition-colors duration-200">
              Guessify
            </span>
          </Link>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-surface-border/80 to-transparent" />
      </motion.header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      {showFooter && (
        <footer className="py-4 mt-auto pointer-events-none select-none">
          <div className="max-w-5xl mx-auto px-4 text-center text-[10px] text-ink-faint/30">
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
