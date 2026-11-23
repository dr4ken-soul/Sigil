export default {
  content: ['./index.html', './src/**/*.{ts,js}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--g2-ink)',
        'ink-72': 'rgba(61,255,143,0.72)',
        'ink-45': 'rgba(61,255,143,0.45)',
        'ink-22': 'rgba(61,255,143,0.22)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
