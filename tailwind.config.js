/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode
        background: '#FAFAFA',
        surface: '#FFFFFF',
        'surface-elevated': '#F5F5F5',
        foreground: '#1A1A1A',
        'foreground-secondary': '#6B6B6B',
        'foreground-muted': '#9CA3AF',
        accent: {
          DEFAULT: '#097969',
          secondary: '#065F46',
          light: '#34D399',
        },
        border: '#E5E5E5',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        // Constructivist accent colors
        cream: '#FDF6E3',
        mustard: '#E9C46A',
        // Dark mode
        dark: {
          background: '#0A0A0A',
          surface: '#141414',
          'surface-elevated': '#1F1F1F',
          foreground: '#F5F5F5',
          'foreground-secondary': '#A3A3A3',
          'foreground-muted': '#737373',
          border: '#2A2A2A',
          accent: {
            DEFAULT: '#34D399',
            secondary: '#10B981',
          },
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Satoshi', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        heading: ['Space Grotesk', 'sans-serif'],
        modern: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'diagonal': 'diagonalMove 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        diagonalMove: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
      },
    },
  },
  plugins: [],
}
