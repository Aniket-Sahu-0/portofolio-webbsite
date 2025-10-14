/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark photography portfolio palette
        primary: '#0a0a0a',      // Deep black - main backgrounds
        secondary: '#1a1a1a',    // Charcoal - sections, cards
        accent: '#8b7355',       // Dark bronze - highlights, buttons
        light: '#f5f5f5',       // Off-white - main text
        muted: '#888888',       // Medium gray - secondary text
        border: '#333333',      // Dark gray - borders, dividers
        white: '#ffffff',       // Pure white - emphasis text
        
        // Extended palette
        'primary-light': '#151515',
        'primary-dark': '#000000',
        'secondary-light': '#252525', 
        'secondary-dark': '#0f0f0f',
        'accent-light': '#9d8066',
        'accent-dark': '#6b5c47',
        'muted-light': '#aaaaaa',
        'muted-dark': '#666666',
      },
      fontFamily: {
        // Elegant typography for photography portfolio
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'], // Clean, minimal
        serif: ['Cormorant Garamond', 'Playfair Display', 'serif'], // Elegant serif
        display: ['Cormorant Garamond', 'serif'], // Sophisticated headings
        body: ['Helvetica Neue', 'Arial', 'sans-serif'], // Clean body text
        accent: ['Italiana', 'Cormorant Garamond', 'serif'], // Cursive accent
        mono: ['JetBrains Mono', 'Courier New', 'monospace'], // Technical text
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
