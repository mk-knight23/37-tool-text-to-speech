/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'audio': {
          'bg': '#0f172a',
          'dark': '#020617',
          'primary': '#06b6d4',
          'secondary': '#8b5cf6',
          'accent': '#f59e0b',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
