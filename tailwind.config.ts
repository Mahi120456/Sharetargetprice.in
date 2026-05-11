import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // optional; you can remove if not using dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        dark: '#0f172a',
        finance: {
          up: '#10b981',
          down: '#ef4444',
          neutral: '#6b7280',
          gold: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'price-up': 'priceUpFlash 0.6s ease-out',
        'price-down': 'priceDownFlash 0.6s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        priceUpFlash: {
          '0%': { backgroundColor: 'rgba(16, 185, 129, 0)' },
          '50%': { backgroundColor: 'rgba(16, 185, 129, 0.3)' },
          '100%': { backgroundColor: 'rgba(16, 185, 129, 0)' },
        },
        priceDownFlash: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0)' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.3)' },
          '100%': { backgroundColor: 'rgba(239, 68, 68, 0)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.05)',
        'elevated': '0 10px 40px -12px rgba(0,0,0,0.15)',
        'card': '0 4px 14px 0 rgba(0,0,0,0.04)',
        'glow': '0 0 40px rgba(249, 115, 22, 0.3)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  // 🔥 IMPORTANT: Removed plugins to avoid build errors
  // You can install and uncomment these later if needed:
  // plugins: [
  //   require('@tailwindcss/typography'),
  //   require('@tailwindcss/forms'),
  //   require('@tailwindcss/aspect-ratio'),
  //   require('@tailwindcss/container-queries'),
  // ],
  plugins: [],   // Empty array makes build work
};

export default config;
