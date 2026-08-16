/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────
// Identical to the `tailwind.config` object that was inlined in
// forno-redesign.html. Do not rename these tokens — every class
// in the markup (bg-ink, text-cream, max-w-shell, font-display…)
// depends on them.
// ─────────────────────────────────────────────────────────────
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0C',
        char: '#17181A',
        stone: '#212529',
        amber: '#FFC107',
        ember: '#E08A00',
        cream: '#F3EDE2',
        muted: '#9A948A',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        ar: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      maxWidth: { shell: '1240px' },
    },
  },
  plugins: [],
};
