/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'nexus-blue': '#0066ff',
        'nexus-green': '#00ff66',
        'nexus-purple': '#6600ff',
        'nexus-gold': '#ffcc00',
        'nexus-dark': '#0a0a0a',
        'nexus-gray': '#1a1a1a',
        'quantum': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'particle-flow': 'particle-flow 4s linear infinite'
      },
      keyframes: {
        glow: {
          '0%': { 
            'box-shadow': '0 0 5px #00ff66, 0 0 10px #00ff66, 0 0 15px #00ff66' 
          },
          '100%': { 
            'box-shadow': '0 0 10px #00ff66, 0 0 20px #00ff66, 0 0 30px #00ff66' 
          }
        },
        'particle-flow': {
          '0%': { transform: 'translateX(-100px) translateY(0px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(100px) translateY(-20px)', opacity: '0' }
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
        'tech': ['Orbitron', 'sans-serif']
      },
      backgroundImage: {
        'nexus-gradient': 'linear-gradient(135deg, #0066ff 0%, #6600ff 50%, #00ff66 100%)',
        'quantum-gradient': 'linear-gradient(45deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
