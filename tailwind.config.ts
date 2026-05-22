import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          pink: '#FFF7FB',
          purple: '#F7F3FF',
          green: '#F0FFF4',
        },
        brand: {
          primary: '#FF8FB3',
          accent: '#8BD3DD',
          highlight: '#F9C74F',
          success: '#90BE6D',
          pressure: '#B8B8D1',
          text: '#3A3A4A',
        },
      },
      fontFamily: {
        sans: ['ui-rounded', '"Hiragino Maru Gothic ProN"', '"Quicksand"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 16px rgba(255, 143, 179, 0.18)',
        tile: '0 2px 6px rgba(58, 58, 74, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
