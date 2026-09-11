export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eff6ff',100:'#dbeafe',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',900:'#1e3a8a' },
        navy:  { 800:'#0f172a',900:'#0a0f1e' }
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out'
      }
    }
  },
  plugins: []
};