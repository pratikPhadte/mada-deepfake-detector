/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SpaceX-inspired dark palette
        mada: {
          black: '#000000',
          dark: '#0a0a0a',
          darker: '#050505',
          gray: {
            50: '#18181b',
            100: '#27272a',
            200: '#3f3f46',
            300: '#52525b',
            400: '#71717a',
            500: '#a1a1aa',
            600: '#d4d4d8',
            700: '#e4e4e7',
            800: '#f4f4f5',
            900: '#fafafa',
          },
          red: {
            light: '#fca5a5',
            muted: '#ef4444',
            DEFAULT: '#dc2626',
            dark: '#b91c1c',
          },
          silver: {
            DEFAULT: '#c0c0c0',
            light: '#e5e5e5',
            dark: '#a3a3a3',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.5), 0 10px 20px -2px rgba(0, 0, 0, 0.3)',
        'glow-red': '0 0 30px rgba(220, 38, 38, 0.3)',
        'glow-white': '0 0 20px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to bottom, #0a0a0a 0%, #000000 100%)',
      }
    },
  },
  plugins: [],
}
