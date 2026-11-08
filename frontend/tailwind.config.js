/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F0F2F5',
          dark: '#12141C',
        },
        text: {
          primary: '#111827',
          secondary: '#667085',
        },
        border: '#E4E7EC',
        accent: {
          DEFAULT: '#6155F5',
          hover: '#5145D8',
          tint: '#EEECFF',
        },
        status: {
          success: '#16794A',
          error: '#C93737',
          warning: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(17, 24, 39, 0.05)',
        'float': '0 10px 30px -5px rgba(17, 24, 39, 0.08)',
        'modal': '0 20px 40px -10px rgba(17, 24, 39, 0.14)',
      },
    },
  },
  plugins: [],
};

