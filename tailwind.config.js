/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./*.tsx",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'slate-50': '#f8fafc',
        'slate-100': '#f1f5f9',
        'slate-200': '#e2e8f0',
        'slate-300': '#cbd5e1',
        'slate-400': '#94a3b8',
        'slate-500': '#64748b',
        'slate-600': '#475569',
        'slate-700': '#334155',
        'slate-800': '#1e293b',
        'slate-900': '#0f172a',
      },
      fontFamily: {
        mystic: ['Cinzel', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-rose': '0 0 20px rgba(251, 113, 133, 0.5)',
        'glow-rose-sm': '0 0 10px rgba(251, 113, 133, 0.3)',
      }
    }
  },
  plugins: [],
}
