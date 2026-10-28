/** @type {import('tailwindcss').Config} */
export default {
  content: ['./public/**/*.html', './public/**/*.js'],
  theme: { extend: { colors: { ink: '#071426', brand: '#536dff', violet: '#9167ff' }, fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] } } },
  plugins: []
};
