/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f7f6f3',
          raised: '#ffffff',
          card: '#ffffff',
          border: '#e8e6e1',
          subtle: '#f0efec',
        },
        ink: {
          DEFAULT: '#1a1a2e',
          muted: '#6b7280',
          faint: '#9ca3af',
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
          soft: '#eef2ff',
          glow: '#c7d2fe',
        },
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 4px 24px rgba(99, 102, 241, 0.18)',
        card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 32px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.06), 0 16px 40px rgba(0, 0, 0, 0.08)',
        input: '0 1px 2px rgba(0, 0, 0, 0.04) inset',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
