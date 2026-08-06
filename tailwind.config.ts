import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#2563EB',
          teal: '#14B8A6',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #2563EB 0%, #14B8A6 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
