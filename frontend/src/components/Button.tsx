import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}

const variants = {
  primary:
    'bg-accent hover:bg-accent-dark text-white shadow-glow hover:shadow-[0_6px_28px_rgba(99,102,241,0.28)]',
  secondary:
    'bg-white border border-surface-border hover:border-accent/30 text-ink hover:bg-accent-soft/50 shadow-sm',
  ghost: 'bg-transparent hover:bg-surface-subtle text-ink-muted hover:text-ink',
  danger: 'bg-red-50 border border-red-200 text-danger hover:bg-red-100',
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-2xl font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.99 }}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}
