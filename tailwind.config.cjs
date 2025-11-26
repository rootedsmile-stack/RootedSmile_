/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary-teal': '#004F54',
        'terracotta': '#C26A4A',
        'warm-beige': '#E8D9C5',
        'soft-white': '#FCF7F2',
        'charcoal': '#1F2933',
        'soft-gray': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
    },
  },
  plugins: [],
};
