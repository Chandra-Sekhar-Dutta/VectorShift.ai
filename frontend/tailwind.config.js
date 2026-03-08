/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1C2536',
        secondary: '#4a5568',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      boxShadow: {
        node: '0 2px 8px rgba(0,0,0,0.15)',
        'node-hover': '0 4px 12px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}
