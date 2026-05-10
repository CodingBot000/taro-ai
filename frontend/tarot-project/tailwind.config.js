/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mystic: {
          50: '#f5f0ff',
          100: '#ede5ff',
          200: '#daccff',
          300: '#c2a3ff',
          400: '#a56fff',
          500: '#8b3dff',
          600: '#7c1aff',
          700: '#6d0aeb',
          800: '#5b0bc5',
          900: '#4c0da1',
          950: '#2d036e',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4a017',
          600: '#b8860b',
        },
        night: {
          800: '#0f0a1e',
          900: '#0a0614',
          950: '#050210',
        },
      },
      fontFamily: {
        display: ['Cinzel Decorative', 'Cinzel', 'serif'],
        heading: ['Cinzel', 'serif'],
        body: ['Noto Sans KR', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'flip': 'flip 0.8s ease-in-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 61, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 61, 255, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
