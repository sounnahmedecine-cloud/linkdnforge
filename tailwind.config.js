/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        iron: {
          950: '#13100C',
          900: '#1C1712',
          850: '#241D15',
          800: '#2D2419',
          700: '#3C3122',
          600: '#564636',
        },
        smoke: {
          100: '#F1ECE2',
          300: '#D6CCB9',
          500: '#A89C87',
        },
        ember: {
          600: '#E0481B',
          500: '#FF5A1F',
          400: '#FF7A45',
          300: '#FFA06E',
        },
        spark: '#FFC15E',
        quench: {
          600: '#275763',
          500: '#3E7C8C',
          400: '#5A98A6',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        strike: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(-28deg)' },
          '30%': { transform: 'rotate(4deg)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(0.85)' },
          '30%': { opacity: '1', transform: 'scale(1.15)' },
          '60%': { opacity: '0', transform: 'scale(1.4)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        strike: 'strike 1.1s ease-in-out infinite',
        glow: 'glow 1.1s ease-in-out infinite',
        rise: 'rise 0.6s ease-out both',
      },
    },
  },
  plugins: [],
}
