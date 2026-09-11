export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eff6ff',100:'#dbeafe',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',900:'#1e3a8a' },
        navy:  { 800:'#0f172a',900:'#0a0f1e' }
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] }
    }
  },
  plugins: []
};
