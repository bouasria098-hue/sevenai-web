module.exports = {
  content: [
    './*.html',
    './**/*.html',
    './src/**/*.{js,css}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        handwriting: ['Caveat', 'cursive']
      },
      colors: {
        dark: '#111111',
        muted: '#6e6e73',
        subtle: '#86868b'
      }
    }
  },
  plugins: []
};
