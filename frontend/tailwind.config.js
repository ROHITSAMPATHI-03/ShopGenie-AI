/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0906',
        background: '#0B0906',
        ink: '#F5EFE6',
        text: {
          DEFAULT: '#F5EFE6',
          primary: '#F5EFE6',
          secondary: '#A39A8C',
        },
        muted: '#A39A8C',
        amber: {
          DEFAULT: '#FFB020',
          hover: '#FF9E0B',
          glow: 'rgba(255, 150, 30, 0.35)',
        },
        orange: {
          DEFAULT: '#FF7A1A',
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.04)',
          secondary: 'rgba(255, 255, 255, 0.03)',
          solid: '#13110D',
          solidSecondary: '#1A1814',
          dark: '#080705',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.10)',
          hover: 'rgba(255, 176, 32, 0.40)',
        },
        accent: {
          DEFAULT: '#FFB020',
          hover: '#FF7A1A',
          tint: 'rgba(255, 176, 32, 0.12)',
        },
        status: {
          success: '#4ADE80',
          error: '#F87171',
          warning: '#FFB020',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'amber-glow': '0 0 35px -5px rgba(255, 150, 30, 0.35)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'float': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #FFB020, #FF7A1A)',
        'amber-radial': 'radial-gradient(circle at 50% 0%, rgba(255, 150, 30, 0.22) 0%, rgba(11, 9, 6, 0) 70%)',
      },
    },
  },
  plugins: [],
};
